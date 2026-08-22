import { NextResponse } from 'next/server';
import { extractSignals } from '@/lib/heuristics';
import { callLLM } from '@/lib/openrouter';
import { getDb } from '@/lib/mongodb';
import { findSimilarDNA } from '@/lib/dna';
import { calculateFinalRisk, calculateFinalConfidence, determineAction } from '@/lib/policy-engine';
import { normalizeTag } from '@/lib/dna';
import { shouldSendAlert, sendWhatsAppAlert } from '@/lib/whatsapp';

// ── Webhook verification (GET) ──────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get('hub.mode');
  const token     = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// ── Incoming message handler (POST) ─────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // WhatsApp Cloud API always expects a 200 quickly
    // We process async so we acknowledge immediately
    const body: unknown = await req.json();

    // Fire-and-forget investigation
    processWebhookEvent(body).catch((err: unknown) => {
      console.error('Webhook processing error:', (err as Error).message);
    });

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch {
    // Even on parse failure, return 200 to prevent Meta from retrying
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }
}

interface WAEntry {
  id: string;
  changes?: Array<{
    value?: {
      messages?: Array<{
        from: string;
        type: string;
        text?: { body: string };
      }>;
    };
  }>;
}

interface WABody {
  object?: string;
  entry?: WAEntry[];
}

async function processWebhookEvent(body: unknown): Promise<void> {
  const wb = body as WABody;
  if (wb.object !== 'whatsapp_business_account') return;

  for (const entry of wb.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? [];
      for (const msg of messages) {
        if (msg.type !== 'text' || !msg.text?.body) continue;

        const content = msg.text.body.trim();
        if (!content) continue;

        await investigateAndAlert(content, msg.from);
      }
    }
  }
}

async function investigateAndAlert(content: string, senderPhone: string): Promise<void> {
  // Enforce content length
  const truncated = content.substring(0, 20000);

  // Run through existing investigation pipeline
  const heuristicData = extractSignals(truncated);
  let llmOutput = null;

  try {
    llmOutput = await callLLM(heuristicData.signals, truncated);
  } catch (e: unknown) {
    console.error('LLM error in webhook:', (e as Error).message);
  }

  if (!llmOutput) {
    llmOutput = {
      risk_score: heuristicData.score,
      confidence_score: 30,
      classification: heuristicData.score > 60 ? 'dangerous' : heuristicData.score > 30 ? 'suspicious' : 'safe',
      attacker_intent: 'uncertain',
      explanation: 'AI reasoning unavailable. Heuristic fallback used.',
      evidence: heuristicData.signals.map((s) => ({
        type: s.type,
        severity: s.severity as 'low' | 'medium' | 'high' | 'critical',
        title: s.title,
        description: s.description,
      })),
      dna_tags: ['UNANALYZED'],
      recommended_action: 'warn',
    };
  }

  const finalRisk = calculateFinalRisk(heuristicData.score, llmOutput.risk_score);
  const finalConfidence = calculateFinalConfidence(
    llmOutput.confidence_score,
    heuristicData.score,
    llmOutput.risk_score,
    llmOutput.attacker_intent,
    heuristicData.signals.length
  );
  const action = determineAction(finalRisk, finalConfidence);
  const uniqueDnaTags = Array.from(new Set(llmOutput.dna_tags.map(normalizeTag)));

  const db = await getDb();
  let dnaOverlap: Array<{ overlapPercent: number; scanId: string; previousIntent: string; sharedTags: string[] }> = [];
  try {
    dnaOverlap = await findSimilarDNA(uniqueDnaTags);
  } catch { /* non-fatal */ }

  const scanDoc = {
    inputType: 'whatsapp',
    inputMetadata: {
      truncatedContent: content.substring(0, 100),
      senderPhone: senderPhone.substring(0, 15), // store only partial number
    },
    riskScore: finalRisk,
    confidenceScore: finalConfidence,
    classification: llmOutput.classification,
    attackerIntent: llmOutput.attacker_intent,
    explanation: llmOutput.explanation,
    evidence: llmOutput.evidence,
    dnaTags: uniqueDnaTags,
    dnaOverlap,
    recommendedAction: action,
    createdAt: new Date(),
  };

  const result = await db.collection('scans').insertOne(scanDoc);

  // Send WhatsApp alert only if policy says so
  if (shouldSendAlert(finalRisk, action)) {
    const topEvidence = llmOutput.evidence
      .slice()
      .sort((a, b) => {
        const order = ['critical', 'high', 'medium', 'low'];
        return order.indexOf(a.severity) - order.indexOf(b.severity);
      })
      .slice(0, 3)
      .map((e) => e.title);

    await sendWhatsAppAlert({
      riskScore: finalRisk,
      confidenceScore: finalConfidence,
      classification: llmOutput.classification,
      attackerIntent: llmOutput.attacker_intent,
      topEvidence,
      recommendedAction: action,
      scanId: result.insertedId.toString(),
    });
  }
}
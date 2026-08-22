import { NextResponse } from 'next/server';
import { extractSignals } from '@/lib/heuristics';
import { callLLM } from '@/lib/openrouter';
import { getDb } from '@/lib/mongodb';
import { findSimilarDNA } from '@/lib/dna';
import { calculateFinalRisk, calculateFinalConfidence, determineAction } from '@/lib/policy-engine';
import { extractFileMetadataAndText, FileHeuristic } from '@/lib/file-analysis';

// Lightweight in-memory rate limiter — not distributed, suitable for hackathon
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 10;
  const record = rateLimitCache.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many investigations submitted. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    const contentType = req.headers.get('content-type') ?? '';
    let type = 'message';
    let content = '';
    let fileMetadata: Record<string, unknown> | null = null;
    let fileHeuristics: FileHeuristic[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      type = (formData.get('type') as string) ?? 'file';
      const file = formData.get('file') as File | null;

      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File exceeds the 10MB analysis limit.' },
            { status: 413 }
          );
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const analysis = await extractFileMetadataAndText(buffer, file.name, file.type);
        fileMetadata = analysis.metadata as Record<string, unknown>;
        fileHeuristics = analysis.heuristics;

        if (!analysis.isSupportedForText) {
          content = `[File type ${analysis.metadata.extension} received. ShieldSense performed metadata-level analysis only. No text was extracted.]`;
        } else {
          content = analysis.text;
          if (analysis.isTruncated) {
            content += '\n\n[File text was truncated to fit the investigation analysis limit.]';
          }
        }
      } else {
        content = (formData.get('content') as string) ?? '';
      }
    } else {
      const body = (await req.json()) as { type?: string; content?: string };
      type = body.type ?? 'message';
      content = body.content ?? '';
    }

    // Input length guards
    if (type === 'url' && content.length > 2000) {
      return NextResponse.json({ error: 'URL exceeds the 2000-character limit.' }, { status: 400 });
    }
    if ((type === 'message') && content.length > 20000) {
      return NextResponse.json({ error: 'Message exceeds the 20000-character limit.' }, { status: 400 });
    }
    if (!content && !fileMetadata) {
      return NextResponse.json({ error: 'Missing content or file to investigate.' }, { status: 400 });
    }

    // Heuristics
    const heuristicData = extractSignals(content);
    const combinedSignals = [...heuristicData.signals, ...fileHeuristics];
    let baseScore = heuristicData.score;
    for (const h of fileHeuristics) {
      if (h.severity === 'high') baseScore += 30;
      if (h.severity === 'medium') baseScore += 15;
    }
    baseScore = Math.min(baseScore, 100);

    // AI Reasoning with safe fallback
    let llmOutput = null;
    try {
      llmOutput = await callLLM(combinedSignals, content);
    } catch (e: unknown) {
      console.error('LLM API Error:', (e as Error).message);
    }

    if (!llmOutput) {
      llmOutput = {
        risk_score: baseScore,
        confidence_score: 30,
        classification: baseScore > 60 ? 'dangerous' : baseScore > 30 ? 'suspicious' : 'safe',
        attacker_intent: 'uncertain',
        explanation:
          "ShieldSense's reasoning service is temporarily unavailable. We used local security signals to provide a conservative assessment.",
        evidence: combinedSignals.map((s) => ({
          type: s.type,
          severity: s.severity as 'low' | 'medium' | 'high' | 'critical',
          title: s.title,
          description: s.description,
        })),
        dna_tags: ['UNANALYZED'],
        recommended_action: 'warn',
      };
    }

    const finalRisk = calculateFinalRisk(baseScore, llmOutput.risk_score);
    const finalConfidence = calculateFinalConfidence(
      llmOutput.confidence_score,
      baseScore,
      llmOutput.risk_score,
      llmOutput.attacker_intent,
      combinedSignals.length
    );
    const action = determineAction(finalRisk, finalConfidence);

    // DNA tagging
    const extendedDnaTags = [...llmOutput.dna_tags, ...fileHeuristics.map((h) => h.type.toUpperCase())];
    const uniqueDnaTags = Array.from(new Set(extendedDnaTags));

    const db = await getDb();
    let dnaOverlap: ReturnType<typeof findSimilarDNA> extends Promise<infer T> ? T : never = [];
    try {
      dnaOverlap = await findSimilarDNA(uniqueDnaTags);
    } catch (e: unknown) {
      console.error('DNA matching failed:', (e as Error).message);
    }

    const scanDoc = {
      inputType: type,
      inputMetadata: fileMetadata ?? { truncatedContent: content.substring(0, 100) },
      riskScore: finalRisk,
      confidenceScore: finalConfidence,
      classification: llmOutput.classification,
      attackerIntent: llmOutput.attacker_intent,
      explanation: llmOutput.explanation,
      evidence: [
        ...fileHeuristics.map((h) => ({
          type: h.type,
          severity: h.severity,
          title: h.title,
          description: h.description,
        })),
        ...llmOutput.evidence,
      ],
      dnaTags: uniqueDnaTags,
      dnaOverlap,
      recommendedAction: action,
      createdAt: new Date(),
    };

    const result = await db.collection('scans').insertOne(scanDoc);

    const dnaMatch =
      dnaOverlap.length > 0
        ? {
            matched: true,
            similarity: dnaOverlap[0].overlapPercent,
            previousScanId: dnaOverlap[0].scanId,
            previousIntent: dnaOverlap[0].previousIntent,
            matchingTags: dnaOverlap[0].sharedTags,
          }
        : { matched: false, similarity: 0 };

    return NextResponse.json({ id: result.insertedId, result: scanDoc, dnaMatch });
  } catch (error: unknown) {
    console.error('Investigation Pipeline Error:', (error as Error).message);
    return NextResponse.json(
      { error: 'An unexpected error occurred during investigation. Please try again.' },
      { status: 500 }
    );
  }
}

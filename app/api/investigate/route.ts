import { NextResponse } from 'next/server';
import { extractSignals } from '@/lib/heuristics';
import { extractUrlFeatures, scoreUrlFeatures } from '@/lib/url-analysis';
import { callLLM } from '@/lib/openrouter';
import { getDb } from '@/lib/mongodb';
import { findSimilarDNA, normalizeTag } from '@/lib/dna';
import {
  calculateFinalRisk,
  calculateFinalConfidence,
  classifyRisk,
  determineAction,
  buildFallbackOutput,
} from '@/lib/policy-engine';
import { extractFileMetadataAndText, FileHeuristic } from '@/lib/file-analysis';

// Lightweight in-memory rate limiter
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;
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
          content = `[File type ${analysis.metadata.extension} received. ShieldSense performed structural analysis only. No text was extracted.]`;
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

    // Determine if input is a URL even if sent under message radio
    const trimmed = content.trim();
    const isExplicitUrl =
      type === 'url' ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed);

    if (isExplicitUrl && type !== 'file') {
      type = 'url';
    }

    // Input length guards
    if (type === 'url' && content.length > 2000) {
      return NextResponse.json({ error: 'URL exceeds the 2000-character limit.' }, { status: 400 });
    }
    if (type === 'message' && content.length > 20000) {
      return NextResponse.json({ error: 'Message exceeds the 20000-character limit.' }, { status: 400 });
    }
    if (!content && !fileMetadata) {
      return NextResponse.json({ error: 'Missing content or file to investigate.' }, { status: 400 });
    }

    // 1. Extract deterministic signals
    let urlFeaturesObj: Record<string, unknown> | undefined = undefined;
    const heuristicData = extractSignals(content, type);
    
    if (type === 'url') {
      const uFeatures = extractUrlFeatures(content);
      if (uFeatures) {
        urlFeaturesObj = uFeatures as unknown as Record<string, unknown>;
        const { score: uScore, signals: uSignals } = scoreUrlFeatures(uFeatures);
        // Ensure all URL signals are represented
        for (const us of uSignals) {
          if (!heuristicData.signals.some((s) => s.type === us.type)) {
            heuristicData.signals.push(us);
          }
        }
        heuristicData.score = Math.max(heuristicData.score, uScore);
      }
    }

    const combinedSignals = [...heuristicData.signals, ...fileHeuristics];
    let baseHeuristicScore = heuristicData.score;
    for (const h of fileHeuristics) {
      if (h.severity === 'critical') baseHeuristicScore += 35;
      else if (h.severity === 'high') baseHeuristicScore += 25;
      else if (h.severity === 'medium') baseHeuristicScore += 15;
    }
    baseHeuristicScore = Math.max(0, Math.min(100, baseHeuristicScore));

    // 2. Structured AI Reasoning
    let analysisStatus: 'complete' | 'fallback' | 'failed' = 'complete';
    let analysisSource: 'heuristic+ai' | 'heuristic_only' | 'failed' = 'heuristic+ai';
    let failureReasonCode: string | null = null;

    const { output: rawLlmOutput, failureCode } = await callLLM(
      combinedSignals,
      content,
      urlFeaturesObj
    );

    let llmOutput = rawLlmOutput;

    if (!llmOutput) {
      analysisStatus = 'fallback';
      analysisSource = 'heuristic_only';
      failureReasonCode = failureCode;
      llmOutput = buildFallbackOutput(baseHeuristicScore, combinedSignals, failureCode);
    }

    // Guarantee: If risk is elevated (>=60), evidence must not be empty
    if (llmOutput.risk_score >= 60 && llmOutput.evidence.length === 0) {
      if (combinedSignals.length > 0) {
        llmOutput.evidence = combinedSignals.map((s) => ({
          type: s.type,
          severity: s.severity,
          title: s.title,
          description: s.description,
        }));
      } else {
        llmOutput.evidence.push({
          type: 'elevated_risk_profile',
          severity: 'medium',
          title: 'Suspicious Behavioral Signature',
          description: 'Structural characteristics indicate anomalous behavior requiring caution.',
        });
      }
    }

    // 3. Calibrate Risk, Confidence, and Classification via Policy Engine
    const finalRisk = calculateFinalRisk(baseHeuristicScore, llmOutput.risk_score);
    const { confidence: finalConfidence, hasDisagreement } = calculateFinalConfidence(
      llmOutput.confidence_score,
      baseHeuristicScore,
      llmOutput.risk_score,
      llmOutput.attacker_intent,
      combinedSignals.length
    );

    const finalClassification = classifyRisk(finalRisk, finalConfidence);
    const finalAction = determineAction(finalRisk, finalConfidence);

    // 4. Threat DNA Tag Extraction (Filtered & Normalized)
    const rawDnaTags = [
      ...llmOutput.dna_tags,
      ...combinedSignals.map((s) => s.type),
    ];
    const normalizedDnaTags = Array.from(
      new Set(
        rawDnaTags
          .map(normalizeTag)
          .filter((t): t is string => Boolean(t))
      )
    );

    // 5. Threat DNA History Comparison (Requires at least 2 meaningful tags)
    let dnaOverlap: Array<{
      scanId: string;
      overlapPercent: number;
      sharedTags: string[];
      previousIntent: string;
    }> = [];

    if (normalizedDnaTags.length >= 2) {
      try {
        dnaOverlap = await findSimilarDNA(normalizedDnaTags);
      } catch (e: unknown) {
        console.error('[ShieldSense/DNA] Match query error:', (e as Error).message);
      }
    }

    // 6. Persist to MongoDB
    const db = await getDb();
    const scanDoc = {
      inputType: type,
      inputMetadata: fileMetadata ?? { truncatedContent: content.substring(0, 150) },
      riskScore: finalRisk,
      confidenceScore: finalConfidence,
      heuristicScore: baseHeuristicScore,
      classification: finalClassification,
      attackerIntent: llmOutput.attacker_intent,
      explanation: llmOutput.explanation,
      analysisStatus,
      analysisSource,
      failureCode: failureReasonCode,
      hasDisagreement,
      evidence: llmOutput.evidence,
      dnaTags: normalizedDnaTags,
      dnaOverlap,
      recommendedAction: finalAction,
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
    console.error('[ShieldSense/API] Investigation Pipeline Error:', (error as Error).message);
    return NextResponse.json(
      { error: 'An unexpected error occurred during investigation. Please try again.' },
      { status: 500 }
    );
  }
}

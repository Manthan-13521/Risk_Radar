import { LLMOutput } from '@/types/investigation';
import { HeuristicSignal } from './heuristics';

/**
 * Calculates the combined final risk score.
 * Default weights: 30% heuristics, 70% LLM reasoning.
 */
export function calculateFinalRisk(
  heuristicScore: number,
  llmRiskScore: number,
  heuristicWeight: number = 0.30,
  llmWeight: number = 0.70
): number {
  const combined = Math.round(heuristicWeight * heuristicScore + llmWeight * llmRiskScore);
  return Math.max(0, Math.min(100, combined));
}

/**
 * Calculates final calibrated confidence.
 * Applies penalties for AI/Heuristic disagreement and ambiguous evidence.
 */
export function calculateFinalConfidence(
  llmConfidence: number,
  heuristicScore: number,
  llmRiskScore: number,
  intent: string,
  signalsCount: number
): { confidence: number; hasDisagreement: boolean } {
  let confidence = llmConfidence;
  let hasDisagreement = false;

  // Significant disagreement penalty
  const delta = Math.abs(heuristicScore - llmRiskScore);
  if (delta > 40) {
    hasDisagreement = true;
    confidence -= 25;
  } else if (delta > 25) {
    confidence -= 10;
  }

  // Insufficient signals for high AI risk
  if (signalsCount === 0 && llmRiskScore > 50) {
    confidence -= 20;
  }

  // Uncertain intent penalty
  if (intent === 'uncertain') {
    confidence -= 10;
  }

  // Bonus for clear aligned safe baseline
  if (heuristicScore === 0 && llmRiskScore < 20 && signalsCount === 0) {
    confidence = Math.max(confidence, 85);
  }

  const finalConfidence = Math.max(10, Math.min(100, confidence));
  return { confidence: finalConfidence, hasDisagreement };
}

/**
 * Classifies risk into deterministic tiers.
 * If confidence is low, downgrades critical/dangerous to review/suspicious.
 */
export function classifyRisk(risk: number, confidence: number): 'safe' | 'suspicious' | 'dangerous' | 'critical' {
  if (risk < 30 && confidence >= 60) {
    return 'safe';
  }
  
  if (risk >= 80) {
    return confidence >= 60 ? 'critical' : 'suspicious';
  }

  if (risk >= 60) {
    return confidence >= 50 ? 'dangerous' : 'suspicious';
  }

  if (risk >= 30) {
    return 'suspicious';
  }

  // Low risk but low confidence
  return 'safe';
}

/**
 * Determines recommended action based on risk & confidence.
 */
export function determineAction(
  risk: number,
  confidence: number
): 'allow' | 'warn' | 'quarantine' | 'block' {
  if (risk < 30 && confidence >= 60) return 'allow';
  if (risk >= 80 && confidence >= 70) return 'block';
  if (risk >= 60 && confidence >= 50) return 'quarantine';
  return 'warn';
}

/**
 * Builds a deterministic fallback output when AI reasoning is unavailable.
 * CRITICAL RULE: NEVER turns AI failure into a fake safe result!
 */
export function buildFallbackOutput(
  heuristicScore: number,
  signals: HeuristicSignal[],
  failureCode: string | null
): LLMOutput {
  let fallbackRisk: number;
  let confidence: number;
  let classification: 'safe' | 'suspicious' | 'dangerous' | 'critical';
  let intent: LLMOutput['attacker_intent'] = 'uncertain';
  let explanation = '';

  const codeMsg = failureCode ? `[${failureCode}] ` : '';

  if (signals.length === 0 || heuristicScore === 0) {
    // No heuristic evidence found — zero signals means no threat evidence was detected.
    // Uncertainty is NOT evidence of malice. Do NOT inflate risk when nothing was found.
    // A clean URL (e.g. google.com/search?q=cybersecurity+threat+intelligence) with no
    // structural anomalies should yield LOW RISK / ALLOW even when AI is unavailable.
    fallbackRisk = 5;
    confidence = 75;
    classification = 'safe';
    explanation = `${codeMsg}No structural or behavioral threat indicators detected. Local heuristic analysis found no evidence of malicious intent. AI verification was unavailable but is not required to establish safety when no signals are present.`;
  } else {
    // Meaningful heuristic signals exist — score reflects actual signal weight
    fallbackRisk = heuristicScore;
    confidence = Math.min(70, 40 + signals.length * 8);
    classification = fallbackRisk >= 80 ? 'critical' : fallbackRisk >= 60 ? 'dangerous' : fallbackRisk >= 30 ? 'suspicious' : 'safe';
    explanation = `${codeMsg}AI reasoning was unavailable. Risk evaluated using deterministic local security heuristics (${signals.length} threat signal(s) detected).`;

    // Infer intent from heuristics
    const types = signals.map((s) => s.type);
    if (types.includes('credential_request') || types.includes('credential_path')) {
      intent = 'credential_theft';
    } else if (types.includes('financial_scam') || types.includes('payment_request') || types.includes('payment_path')) {
      intent = 'payment_fraud';
    } else if (types.includes('lookalike_domain') || types.includes('brand_mismatch')) {
      intent = 'identity_impersonation';
    } else if (types.includes('delivery_scam')) {
      intent = 'payment_fraud';
    }
  }

  // Derive DNA tags from detected signals
  const dna_tags = Array.from(
    new Set(
      signals
        .map((s) => s.type.toUpperCase().replace(/-/g, '_'))
        .filter((t) => t !== 'UNANALYZED' && t !== 'UNKNOWN' && t !== 'ERROR' && t !== 'FALLBACK')
    )
  );

  const evidence = signals.map((s) => ({
    type: s.type,
    severity: s.severity,
    title: s.title,
    description: s.description,
  }));

  if (evidence.length === 0) {
    evidence.push({
      type: 'heuristic_evaluation',
      severity: 'low',
      title: 'Unverified Assessment',
      description: 'Local heuristic scan completed without triggering high-confidence security signatures.',
    });
  }

  const action = determineAction(fallbackRisk, confidence);

  return {
    risk_score: fallbackRisk,
    confidence_score: confidence,
    classification,
    attacker_intent: intent,
    explanation,
    evidence,
    dna_tags,
    recommended_action: action,
  };
}
export interface VoiceInput {
  riskScore: number;
  confidenceScore?: number;
  classification: string;
  attackerIntent?: string;
  explanation?: string;
  evidence?: Array<{ severity: string; title: string }>;
  recommendedAction?: string;
}

/**
 * Concise 1-sentence voice summary.
 */
export function generateVoiceSummary(inv: VoiceInput): string {
  const isRisk = inv.riskScore >= 30 || inv.classification === 'critical' || inv.classification === 'dangerous' || inv.classification === 'suspicious';
  if (isRisk) {
    return `Risk detected. Score is ${inv.riskScore} out of 100. Access restricted.`;
  }
  return `Verified safe. Score is ${inv.riskScore} out of 100. Access allowed.`;
}
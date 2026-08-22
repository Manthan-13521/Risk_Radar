export function calculateFinalRisk(heuristicScore: number, llmRiskScore: number): number {
  return Math.round((0.30 * heuristicScore) + (0.70 * llmRiskScore));
}

export function calculateFinalConfidence(
  llmConfidence: number, 
  heuristicScore: number, 
  llmRiskScore: number, 
  intent: string,
  signalsCount: number
): number {
  let confidence = llmConfidence;
  
  // Disagreement penalty
  if (Math.abs(heuristicScore - llmRiskScore) > 40) {
    confidence -= 20;
  }
  
  // Insufficient evidence penalty
  if (signalsCount === 0 && llmRiskScore > 50) {
    confidence -= 15;
  }
  
  // Uncertain intent penalty
  if (intent === 'uncertain') {
    confidence -= 10;
  }
  
  return Math.max(Math.min(confidence, 100), 0);
}

export function determineAction(risk: number, confidence: number): 'allow' | 'warn' | 'quarantine' | 'block' {
  if (risk < 30 && confidence > 70) return 'allow';
  if (risk >= 80 && confidence >= 80) return 'block';
  if (risk >= 60 && confidence >= 70) return 'quarantine';
  if (confidence < 50) return 'warn';
  return 'warn';
}
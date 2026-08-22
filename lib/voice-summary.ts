export interface VoiceInput {
  riskScore: number;
  confidenceScore: number;
  classification: string;
  attackerIntent: string;
  explanation: string;
  evidence: Array<{ severity: string; title: string }>;
  recommendedAction: string;
  dnaOverlap?: Array<{ overlapPercent: number }>;
}

function humanizeIntent(intent: string): string {
  return intent.replace(/_/g, ' ').toLowerCase();
}

function humanizeAction(action: string): string {
  switch (action) {
    case 'allow':     return 'allow it';
    case 'warn':      return 'review it before proceeding';
    case 'quarantine': return 'quarantine';
    case 'block':     return 'block';
    default:          return 'review it';
  }
}

function confidenceLabel(score: number): string {
  if (score >= 80) return 'high confidence';
  if (score >= 55) return 'moderate confidence';
  return 'low confidence';
}

/**
 * Deterministic voice summary from a structured investigation result.
 * Target: 15–25 seconds of speech (~50–80 words).
 * Does NOT make any AI calls — uses only the already-produced verdict.
 */
export function generateVoiceSummary(inv: VoiceInput): string {
  const intent    = humanizeIntent(inv.attackerIntent);
  const confLabel = confidenceLabel(inv.confidenceScore);
  const action    = humanizeAction(inv.recommendedAction);

  // Pick top 2-3 highest-severity evidence titles
  const priorityOrder = ['critical', 'high', 'medium', 'low'];
  const sorted = [...inv.evidence].sort(
    (a, b) => priorityOrder.indexOf(a.severity) - priorityOrder.indexOf(b.severity)
  );
  const topEvidence = sorted.slice(0, 3).map((e) => e.title.toLowerCase());

  let summary = '';

  // ── Classification sentence ──
  if (inv.riskScore >= 80 || inv.classification === 'critical') {
    summary += `ShieldSense detected a high-risk threat with a risk score of ${inv.riskScore} out of 100 and ${confLabel}. `;
  } else if (inv.classification === 'dangerous' || inv.riskScore >= 60) {
    summary += `ShieldSense flagged this content as dangerous, with a risk score of ${inv.riskScore} and ${confLabel}. `;
  } else if (inv.classification === 'suspicious' || inv.riskScore >= 30) {
    summary += `ShieldSense considers this content suspicious, with a risk score of ${inv.riskScore} and ${confLabel}. `;
  } else {
    summary += `ShieldSense considers this content low risk, with a risk score of ${inv.riskScore} and ${confLabel}. `;
  }

  // ── Intent sentence ──
  if (intent && intent !== 'uncertain') {
    summary += `The likely attacker intent is ${intent}. `;
  }

  // ── Evidence sentence ──
  if (topEvidence.length > 0) {
    if (topEvidence.length === 1) {
      summary += `The main warning sign is ${topEvidence[0]}. `;
    } else if (topEvidence.length === 2) {
      summary += `The main warning signs are ${topEvidence[0]} and ${topEvidence[1]}. `;
    } else {
      summary += `The main warning signs are ${topEvidence[0]}, ${topEvidence[1]}, and ${topEvidence[2]}. `;
    }
  } else {
    summary += 'No significant malicious indicators were found. ';
  }

  // ── DNA match sentence ──
  if (inv.dnaOverlap && inv.dnaOverlap.length > 0 && inv.dnaOverlap[0].overlapPercent >= 50) {
    summary += `This pattern also shows ${inv.dnaOverlap[0].overlapPercent} percent behavioral similarity to a previously detected threat. `;
  }

  // ── Action sentence ──
  summary += `ShieldSense recommends ${action}.`;

  return summary.trim();
}
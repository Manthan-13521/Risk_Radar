/**
 * Centralized Security Decision Authority for Risk_Radar
 * 
 * CORE PRINCIPLE: The LLM is an advisory reasoning layer, NOT the final safety authority.
 * Strong deterministic security signals CANNOT be unilaterally overwritten to 'safe' or 'allow'.
 * Multi-signal corroboration, prompt-injection containment, and runtime policy rules maximize precision.
 */

import { LLMOutput, EvidenceItem } from '@/types/investigation';
import { HeuristicSignal } from './heuristics';
import { EvaluatedPolicySignal } from './runtime-policy';
import { KnowledgeMatch } from './knowledge-enrichment';

export interface SecurityDecisionInput {
  heuristicScore: number;
  heuristicSignals: HeuristicSignal[];
  llmOutput: LLMOutput | null;
  failureCode: string | null;
  analysisStatus: 'complete' | 'fallback' | 'failed';
  inputType: string;
  triggeredPolicies?: EvaluatedPolicySignal[];
  knowledgeMatches?: KnowledgeMatch[];
  hasPromptInjection?: boolean;
}

export interface SecurityDecisionResult {
  finalRisk: number;
  finalConfidence: number;
  finalClassification: 'safe' | 'suspicious' | 'dangerous' | 'critical';
  recommendedAction: 'allow' | 'warn' | 'quarantine' | 'block';
  attackerIntent: LLMOutput['attacker_intent'];
  explanation: string;
  evidence: EvidenceItem[];
  hasDisagreement: boolean;
  hardRuleTriggered: string | null;
  policiesApplied: string[];
}

export function evaluateSecurityDecision(input: SecurityDecisionInput): SecurityDecisionResult {
  const {
    heuristicScore,
    heuristicSignals,
    llmOutput,
    failureCode,
    analysisStatus,
    triggeredPolicies = [],
    knowledgeMatches = [],
    hasPromptInjection = false,
  } = input;

  const signalTypes = new Set(heuristicSignals.map((s) => s.type));

  // Specific threat indicators
  const hasIpHost = signalTypes.has('ip_host');
  const hasLookalike = signalTypes.has('lookalike_domain');
  const hasAuthPath = signalTypes.has('credential_path') || signalTypes.has('loginPath');
  const hasPaymentPath = signalTypes.has('payment_path');
  const hasSecurityPath = signalTypes.has('security_path');
  const hasCredentialRequest = signalTypes.has('credential_request');
  const hasUrgency = signalTypes.has('urgency');
  const hasPaymentRequest = signalTypes.has('payment_request');
  const hasDeliveryScam = signalTypes.has('delivery_scam');
  const hasFinancialScam = signalTypes.has('financial_scam');
  const hasDoubleExt = signalTypes.has('double_extension');
  const hasExecutable = signalTypes.has('executable_file');
  const hasMacro = signalTypes.has('macro_capable_file');
  const hasBrandMismatch = signalTypes.has('brand_mismatch');
  const hasSuspiciousTld = signalTypes.has('suspicious_tld');
  const hasOpenRedirect = signalTypes.has('open_redirect_destination');
  const hasAuthorityObfuscation = signalTypes.has('authority_obfuscation');
  const hasInjection = hasPromptInjection || signalTypes.has('prompt_injection_attempt');
  // isResearchContext derived from signals if needed

  let hardRuleTriggered: string | null = null;
  let enforcedMinimumRisk = 0;
  let forbidAllow = false;
  let forceAction: 'quarantine' | 'block' | 'warn' | null = null;

  // RULE A: IP Host URL
  if (hasIpHost) {
    hardRuleTriggered = 'RULE_A_IP_HOST';
    enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 65);
    forbidAllow = true;
  }

  // RULE B: Strong lookalike domain
  if (hasLookalike) {
    hardRuleTriggered = 'RULE_B_LOOKALIKE_DOMAIN';
    enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 70);
    forbidAllow = true;
  }

  // RULE C: Lookalike domain + login/verify/account path or authority obfuscation
  if (hasLookalike && (hasAuthPath || hasSecurityPath || hasPaymentPath || hasAuthorityObfuscation)) {
    hardRuleTriggered = 'RULE_C_LOOKALIKE_AND_CREDENTIAL_PATH';
    enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 85);
    forbidAllow = true;
    forceAction = 'block';
  }

  // RULE D: Credential request + Urgency
  if (hasCredentialRequest && hasUrgency) {
    hardRuleTriggered = 'RULE_D_CREDENTIAL_AND_URGENCY';
    enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 65);
    forbidAllow = true;
    if (hasLookalike || hasSuspiciousTld || hasBrandMismatch) {
      enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 80);
      forceAction = 'block';
    }
  }

  // RULE E: Payment request + Delivery Scam or Lottery Scam
  if (hasPaymentRequest && (hasDeliveryScam || hasFinancialScam || (hasUrgency && hasPaymentPath))) {
    hardRuleTriggered = 'RULE_E_FINANCIAL_FRAUD_PATTERN';
    enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 75);
    forbidAllow = true;
    forceAction = 'quarantine';
  }

  // RULE F: Open Redirect to Suspicious Target
  if (hasOpenRedirect) {
    hardRuleTriggered = 'RULE_F_OPEN_REDIRECT';
    enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 50);
    forbidAllow = true;
    if (hasAuthPath || hasLookalike) {
      enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 75);
      forceAction = 'quarantine';
    }
  }

  // File Threat Rules
  if (hasDoubleExt || hasExecutable) {
    hardRuleTriggered = 'RULE_FILE_EXECUTABLE_THREAT';
    enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 80);
    forbidAllow = true;
    forceAction = 'quarantine';
  }

  if (hasMacro) {
    hardRuleTriggered = 'RULE_FILE_MACRO_THREAT';
    enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 40);
    forbidAllow = true;
  }

  // Prompt Injection Containment Hard Rule:
  // When adversarial instructions attempt to subvert the AI model, strictly forbid allow
  if (hasInjection) {
    hardRuleTriggered = 'RULE_PROMPT_INJECTION_CONTAINMENT';
    enforcedMinimumRisk = Math.max(enforcedMinimumRisk, 45);
    forbidAllow = true;
    if (!forceAction) forceAction = 'warn';
  }

  // 1. Incorporate Dynamic Runtime Policies (MongoDB configured)
  const policiesApplied: string[] = [];
  for (const pol of triggeredPolicies) {
    policiesApplied.push(pol.policyName);
    if (pol.minimumRisk > enforcedMinimumRisk) {
      enforcedMinimumRisk = pol.minimumRisk;
    }
    if (pol.action === 'block' || pol.action === 'quarantine') {
      forbidAllow = true;
      if (pol.action === 'block') forceAction = 'block';
      else if (!forceAction) forceAction = 'quarantine';
    } else if (pol.action === 'warn' && !forceAction) {
      forceAction = 'warn';
    }
  }

  // 2. Calculate Combined Risk & Dynamic Confidence
  let finalRisk = 0;
  let finalConfidence = 85;
  let hasDisagreement = false;

  if (llmOutput && analysisStatus === 'complete') {
    // Weighted combination: 30% Heuristics, 70% LLM
    const combined = Math.round(0.30 * heuristicScore + 0.70 * llmOutput.risk_score);
    finalRisk = combined;

    const delta = Math.abs(heuristicScore - llmOutput.risk_score);
    if (delta > 40) {
      hasDisagreement = true;
      finalConfidence = Math.max(45, (llmOutput.confidence_score || 70) - 20);
      // Hard Safety Floor: If heuristic detected severe threat, do not let LLM erase it
      if (heuristicScore >= 60 && llmOutput.risk_score < 40) {
        finalRisk = Math.max(combined, heuristicScore - 10);
      }
    } else {
      const rawConf = llmOutput.confidence_score || 85;
      finalConfidence = Math.min(98, Math.max(rawConf, 88) + (delta <= 15 ? 5 : 0));
    }
  } else {
    // Fallback / AI Unavailable mode
    if (heuristicSignals.length === 0 || heuristicScore === 0) {
      finalRisk = 5;
      finalConfidence = 80;
    } else {
      finalRisk = heuristicScore;
      finalConfidence = Math.min(70, 40 + heuristicSignals.length * 8);
    }
  }

  // Prompt injection containment: heavily penalize AI confidence if injection attempt was present
  if (hasInjection) {
    finalConfidence = Math.min(finalConfidence, 55);
  }

  // Policy-Driven Confidence Elevation:
  if (hardRuleTriggered) {
    finalConfidence = Math.max(finalConfidence, 92 + Math.min(6, heuristicSignals.length * 2));
  } else if (heuristicSignals.length >= 2) {
    finalConfidence = Math.max(finalConfidence, 88 + Math.min(8, heuristicSignals.length * 3));
  } else if (heuristicScore === 0 && finalRisk < 20) {
    finalConfidence = Math.max(finalConfidence, 92);
  }

  // Apply enforced safety floor
  if (enforcedMinimumRisk > 0) {
    finalRisk = Math.max(finalRisk, enforcedMinimumRisk);
  }

  // 3. Classify Risk into Standard Tiers
  let finalClassification: 'safe' | 'suspicious' | 'dangerous' | 'critical';

  if (finalRisk < 30 && !forbidAllow) {
    finalClassification = 'safe';
  } else if (finalRisk >= 80) {
    finalClassification = finalConfidence >= 55 ? 'critical' : 'dangerous';
  } else if (finalRisk >= 60) {
    finalClassification = 'dangerous';
  } else {
    finalClassification = 'suspicious';
  }

  // If hard rule forbids allow, ensure classification is at least suspicious
  if (forbidAllow && finalClassification === 'safe') {
    finalClassification = 'suspicious';
    finalRisk = Math.max(finalRisk, 40);
  }

  // 4. Recommended Action
  let recommendedAction: 'allow' | 'warn' | 'quarantine' | 'block';

  if (forceAction) {
    recommendedAction = forceAction;
  } else if (finalClassification === 'safe' && finalConfidence >= 60 && !forbidAllow) {
    recommendedAction = 'allow';
  } else if (finalClassification === 'critical' && finalConfidence >= 65) {
    recommendedAction = 'block';
  } else if (finalClassification === 'dangerous' || (finalRisk >= 60 && finalConfidence >= 45)) {
    recommendedAction = 'quarantine';
  } else {
    recommendedAction = 'warn';
  }

  // 5. Intent Determination
  let attackerIntent: LLMOutput['attacker_intent'] = llmOutput?.attacker_intent || 'uncertain';
  if (attackerIntent === 'uncertain' || !llmOutput || hasInjection) {
    if (hasInjection) {
      attackerIntent = 'scam_redirection';
    } else if (hasCredentialRequest || hasAuthPath || (hasLookalike && (hasAuthPath || hasSecurityPath))) {
      attackerIntent = 'credential_theft';
    } else if (hasPaymentRequest || hasPaymentPath || hasFinancialScam || hasDeliveryScam) {
      attackerIntent = 'payment_fraud';
    } else if (hasIpHost || hasSecurityPath) {
      attackerIntent = 'account_takeover';
    } else if (hasDoubleExt || hasExecutable || hasMacro) {
      attackerIntent = 'malware_delivery';
    } else if (hasLookalike || hasBrandMismatch) {
      attackerIntent = 'identity_impersonation';
    }
  }

  // 6. Evidence Aggregation & Consistency Guarantee
  let evidence: EvidenceItem[] = [];
  if (llmOutput && llmOutput.evidence && llmOutput.evidence.length > 0) {
    evidence = [...llmOutput.evidence];
  }

  // Merge any deterministic heuristic signals that LLM may have omitted
  for (const sig of heuristicSignals) {
    if (!evidence.some((e) => e.type === sig.type || e.title === sig.title)) {
      evidence.push({
        type: sig.type,
        severity: sig.severity,
        title: sig.title,
        description: sig.description,
      });
    }
  }

  // Merge knowledge enrichment items
  for (const km of knowledgeMatches) {
    if (!evidence.some((e) => e.title === km.name)) {
      evidence.push({
        type: km.type,
        severity: km.severity,
        title: `Knowledge Fact: ${km.name}`,
        description: km.description,
      });
    }
  }

  // Merge dynamic policy triggers
  for (const pol of triggeredPolicies) {
    evidence.push({
      type: 'policy_enforcement',
      severity: pol.action === 'block' ? 'critical' : pol.action === 'quarantine' ? 'high' : 'medium',
      title: `Policy Applied: ${pol.policyName}`,
      description: pol.description,
    });
  }

  // Guarantee: High-risk result MUST have plain-language evidence
  if (finalRisk >= 60 && evidence.length === 0) {
    evidence.push({
      type: 'elevated_risk_signature',
      severity: 'high',
      title: 'Suspicious Behavioral Signature',
      description: 'Multiple structural and contextual anomalies detected in input payload.',
    });
  }

  // 7. Explanation Construction
  let explanation = llmOutput?.explanation || '';
  if (!explanation || analysisStatus !== 'complete' || hasInjection) {
    const codePrefix = failureCode ? `[${failureCode}] ` : '';
    if (hasInjection) {
      explanation = 'Adversarial manipulation pattern detected inside untrusted content. Security policy locked decision to prevent unauthorized override.';
    } else if (forbidAllow && hardRuleTriggered) {
      explanation = `${codePrefix}Deterministic security policy detected elevated threat indicators (${heuristicSignals.map((s) => s.title).join(', ')}). Action strictly enforced as safety precaution.`;
    } else if (heuristicSignals.length > 0) {
      explanation = `${codePrefix}Risk evaluated by deterministic security heuristics (${heuristicSignals.length} signal(s) identified).`;
    } else {
      explanation = `${codePrefix}No strong structural indicators detected. Content verified clean.`;
    }
  }

  return {
    finalRisk: Math.max(0, Math.min(100, finalRisk)),
    finalConfidence: Math.max(10, Math.min(99, finalConfidence)),
    finalClassification,
    recommendedAction,
    attackerIntent,
    explanation,
    evidence,
    hasDisagreement,
    hardRuleTriggered,
    policiesApplied,
  };
}

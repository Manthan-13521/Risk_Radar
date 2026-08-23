import { getPolicies } from './policy-service';
import { HeuristicSignal } from './heuristics';

export interface EvaluatedPolicySignal {
  policyId: string;
  policyName: string;
  action: 'allow' | 'warn' | 'quarantine' | 'block';
  minimumRisk: number;
  minimumConfidence?: number;
  description: string;
  matchedConditions: string[];
}

export interface RuntimePolicyEvaluationResult {
  triggeredPolicies: EvaluatedPolicySignal[];
  enforcedMinimumRisk: number;
  enforcedMinimumConfidence: number;
  recommendedPolicyAction: 'allow' | 'warn' | 'quarantine' | 'block' | null;
  policyForbidsAllow: boolean;
}

/**
 * Safely evaluates active MongoDB policies against normalized signals & features.
 * Priority: Highest priority (lowest priority integer) applies first.
 * Crucial constraint: A custom policy CANNOT force 'allow' if a core hard safety rule forbade it.
 */
export async function evaluateRuntimePolicies(
  inputType: string,
  signals: HeuristicSignal[],
  features: {
    hostname?: string;
    hasLookalike?: boolean;
    hasCredentialRequest?: boolean;
    hasPaymentRequest?: boolean;
    hasUrgency?: boolean;
    hasBrandMismatch?: boolean;
    hasExecutableFile?: boolean;
    hasDoubleExtension?: boolean;
    hasPromptInjection?: boolean;
    hasDeliveryScam?: boolean;
    hasFinancialScam?: boolean;
    hasIpHost?: boolean;
    heuristicScore?: number;
  } = {}
): Promise<RuntimePolicyEvaluationResult> {
  const result: RuntimePolicyEvaluationResult = {
    triggeredPolicies: [],
    enforcedMinimumRisk: 0,
    enforcedMinimumConfidence: 0,
    recommendedPolicyAction: null,
    policyForbidsAllow: false,
  };

  const signalTypes = new Set(signals.map((s) => s.type));

  try {
    const policies = await getPolicies();
    const activePolicies = policies
      .filter((p) => p.enabled)
      .sort((a, b) => (a.priority || 99) - (b.priority || 99));

    for (const policy of activePolicies) {
      if (policy.inputType !== 'any' && policy.inputType !== inputType) {
        continue;
      }

      let allConditionsMet = policy.conditions && policy.conditions.length > 0;
      const matchedDescriptions: string[] = [];

      for (const cond of policy.conditions || []) {
        const signalKey = cond.signal.toLowerCase();
        let actualValue: boolean | number | string = false;

        if (signalKey === 'lookalike_domain') {
          actualValue = Boolean(features.hasLookalike || signalTypes.has('lookalike_domain'));
        } else if (signalKey === 'credential_request') {
          actualValue = Boolean(features.hasCredentialRequest || signalTypes.has('credential_request'));
        } else if (signalKey === 'payment_request') {
          actualValue = Boolean(features.hasPaymentRequest || signalTypes.has('payment_request'));
        } else if (signalKey === 'urgency') {
          actualValue = Boolean(features.hasUrgency || signalTypes.has('urgency'));
        } else if (signalKey === 'brand_mismatch') {
          actualValue = Boolean(features.hasBrandMismatch || signalTypes.has('brand_mismatch'));
        } else if (signalKey === 'executable_file') {
          actualValue = Boolean(features.hasExecutableFile || signalTypes.has('executable_file'));
        } else if (signalKey === 'double_extension') {
          actualValue = Boolean(features.hasDoubleExtension || signalTypes.has('double_extension'));
        } else if (signalKey === 'prompt_injection') {
          actualValue = Boolean(features.hasPromptInjection || signalTypes.has('prompt_injection_attempt'));
        } else if (signalKey === 'ip_host') {
          actualValue = Boolean(features.hasIpHost || signalTypes.has('ip_host'));
        } else if (signalKey === 'credential_path') {
          actualValue = signalTypes.has('credential_path');
        } else if (signalKey === 'delivery_scam') {
          actualValue = Boolean(features.hasDeliveryScam || signalTypes.has('delivery_scam'));
        } else if (signalKey === 'financial_scam') {
          actualValue = Boolean(features.hasFinancialScam || signalTypes.has('financial_scam'));
        } else {
          // Check generic signal map
          actualValue = signalTypes.has(signalKey);
        }

        // Compare based on operator
        let condPassed = false;
        if (cond.operator === 'equals') {
          condPassed = actualValue === cond.value;
        } else if (cond.operator === 'contains') {
          condPassed = String(actualValue).toLowerCase().includes(String(cond.value).toLowerCase());
        } else if (cond.operator === 'gte' && typeof actualValue === 'number' && typeof cond.value === 'number') {
          condPassed = actualValue >= cond.value;
        } else if (cond.operator === 'lte' && typeof actualValue === 'number' && typeof cond.value === 'number') {
          condPassed = actualValue <= cond.value;
        }

        if (!condPassed) {
          allConditionsMet = false;
          break;
        } else {
          matchedDescriptions.push(`${cond.signal} ${cond.operator} ${cond.value}`);
        }
      }

      if (allConditionsMet) {
        const policySignal: EvaluatedPolicySignal = {
          policyId: policy._id?.toString() || policy.name,
          policyName: policy.name,
          action: policy.action,
          minimumRisk: policy.minimumRisk || 0,
          minimumConfidence: policy.minimumConfidence || 0,
          description: policy.description,
          matchedConditions: matchedDescriptions,
        };

        result.triggeredPolicies.push(policySignal);

        if (policySignal.minimumRisk > result.enforcedMinimumRisk) {
          result.enforcedMinimumRisk = policySignal.minimumRisk;
        }
        if ((policySignal.minimumConfidence || 0) > result.enforcedMinimumConfidence) {
          result.enforcedMinimumConfidence = policySignal.minimumConfidence || 0;
        }

        if (policy.action === 'block' || policy.action === 'quarantine') {
          result.policyForbidsAllow = true;
          if (!result.recommendedPolicyAction || policy.action === 'block') {
            result.recommendedPolicyAction = policy.action;
          }
        } else if (policy.action === 'warn' && !result.recommendedPolicyAction) {
          result.recommendedPolicyAction = 'warn';
        }
      }
    }
  } catch (e: unknown) {
    console.warn('[RuntimePolicy] Policy evaluation fallback:', (e as Error).message);
  }

  return result;
}

import { extractUrlFeatures, scoreUrlFeatures, KNOWN_BRANDS, UrlFeatures } from './url-analysis';
import { getTrustedDomainScore } from './trusted-domains';

export interface HeuristicSignal {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  matches?: string[];
}

/**
 * Conservative detection of cybersecurity research & educational contexts.
 */
export function detectResearchContext(text: string): { isResearch: boolean; signal: HeuristicSignal | null } {
  const lower = text.toLowerCase();

  const researchIndicators = [
    'cve-',
    'owasp',
    'mitre attack',
    'mitre att&ck',
    'nist',
    'cisa',
    'security research',
    'vulnerability analysis',
    'malware analysis',
    'reverse engineering',
    'how ransomware works',
    'how phishing works',
    'how to protect against',
    'phishing prevention guide',
    'security checklist',
    'cyber hygiene',
    'security training',
    'cheat sheet',
    'educational',
    'patch documentation',
    'whitepaper',
    'advisory summary',
  ];

  const matches = researchIndicators.filter((term) => lower.includes(term));
  if (matches.length === 0) {
    return { isResearch: false, signal: null };
  }

  return {
    isResearch: true,
    signal: {
      type: 'security_research_context',
      severity: 'low',
      title: 'Security Research & Educational Context',
      description: 'Content discusses cybersecurity concepts, defensive hygiene, or vulnerability research in an informative capacity.',
      matches,
    },
  };
}

/**
 * Contextual & Negation-Aware Credential Analysis.
 */
export function detectCredentials(text: string): {
  intent: 'credential_advice' | 'credential_mention' | 'credential_request';
  detected: boolean;
  signal: HeuristicSignal | null;
} {
  const lower = text.toLowerCase();

  // 1. Check for defensive advice / negation phrases
  const advicePatterns = [
    /never\s+share\s+your\s+(otp|password|pin|cvv|credentials)/i,
    /do\s+not\s+(share|provide|send|give)\s+your\s+(otp|password|pin|cvv|credentials)/i,
    /will\s+never\s+ask\s+for\s+your\s+(password|otp|pin)/i,
    /no\s+legitimate\s+(bank|employee|staff)\s+will\s+ever\s+ask/i,
    /security\s+training\s+teaches\s+employees\s+not\s+to/i,
    /how\s+to\s+create\s+strong\s+passwords/i,
    /ensure\s+your\s+2fa\s+backup\s+codes\s+are\s+stored/i,
    /password\s+will\s+expire\s+in\s+\d+\s+days/i,
    /recommend\s+enabling\s+(google\s+authenticator|mfa|2fa)/i,
  ];

  for (const pattern of advicePatterns) {
    if (pattern.test(lower)) {
      return {
        intent: 'credential_advice',
        detected: false,
        signal: null,
      };
    }
  }

  // 2. Active Credential Request & Harvesting Patterns
  const requestPatterns = [
    /(send|reply\s+with|forward|submit|enter|provide|verify)\s+(us\s+)?(your\s+)?(\d+-digit\s+)?(otp|password|pin|cvv|security\s+code|secret\s+code|ssn)/i,
    /(verify|confirm)\s+your\s+(identity|password|otp|credentials|account\s+credentials)/i,
    /click\s+here\s+to\s+verify\s+your\s+(kyc|credentials|account)/i,
    /(password|otp|pin|cvv)\s+immediately/i,
    /enter\s+your\s+current\s+password\s+and\s+new\s+password/i,
    /forward\s+the\s+sms\s+code/i,
    /unlock\s+your\s+debit\s+card/i,
    /send\s+password\s+to/i,
  ];

  const matchedRequests = requestPatterns.filter((p) => p.test(lower));
  if (matchedRequests.length > 0) {
    return {
      intent: 'credential_request',
      detected: true,
      signal: {
        type: 'credential_request',
        severity: 'high',
        title: 'Active Credential Harvesting Demand',
        description: 'The message explicitly instructs the user to provide or enter sensitive credentials, OTP tokens, or authentication secrets.',
      },
    };
  }

  // 3. Passive Credential Mentions
  const credWords = ['password', 'otp', 'pin', 'login', 'sign in', 'ssn', 'bank account', 'credit card', 'debit card', 'cvv', 'credentials', 'security question'];
  const matchedWords = credWords.filter((w) => lower.includes(w));

  if (matchedWords.length > 0) {
    return {
      intent: 'credential_mention',
      detected: true,
      signal: {
        type: 'credential_mention',
        severity: 'low',
        title: 'Authentication Reference',
        description: 'The content mentions authentication terms in a standard informational context.',
        matches: matchedWords,
      },
    };
  }

  return { intent: 'credential_mention', detected: false, signal: null };
}

/**
 * Contextual & Negation-Aware Urgency Analysis.
 */
export function detectUrgency(text: string): {
  intent: 'urgency_lure' | 'urgency_mention';
  detected: boolean;
  signal: HeuristicSignal | null;
} {
  const lower = text.toLowerCase();

  const urgentLurePatterns = [
    /account\s+will\s+be\s+(suspended|blocked|disabled|terminated|closed)/i,
    /(urgent|immediately|act\s+now|final\s+warning|last\s+chance)/i,
    /within\s+\d+\s+(hours|minutes|mins)/i,
    /action\s+required\s+immediately/i,
    /failure\s+to\s+respond.*will\s+result\s+in/i,
  ];

  const matchedLures = urgentLurePatterns.filter((p) => p.test(lower));
  if (matchedLures.length > 0) {
    return {
      intent: 'urgency_lure',
      detected: true,
      signal: {
        type: 'urgency',
        severity: 'high',
        title: 'Coercive Urgency Pressure',
        description: 'The message imposes a short artificial deadline or threat of service loss to pressure immediate action.',
      },
    };
  }

  const mildWords = ['action requested', 'expires today', 'respond when convenient', 'reminder'];
  const matchedMild = mildWords.filter((w) => lower.includes(w));
  if (matchedMild.length > 0 && !lower.includes('when convenient')) {
    return {
      intent: 'urgency_mention',
      detected: true,
      signal: {
        type: 'urgency',
        severity: 'low',
        title: 'Notice / Follow-up Request',
        description: 'Standard operational request with mild deadline context.',
        matches: matchedMild,
      },
    };
  }

  return { intent: 'urgency_mention', detected: false, signal: null };
}

/**
 * Contextual Payment & Fee Demand Detection.
 */
export function detectPayment(text: string): {
  intent: 'payment_request' | 'payment_mention';
  detected: boolean;
  signal: HeuristicSignal | null;
} {
  const lower = text.toLowerCase();

  // Exclude benign transaction receipts, confirmations, and statements
  if (
    /thank\s+you\s+for\s+your\s+payment/i.test(lower) ||
    /receipt\s*:\s*thank\s+you/i.test(lower) ||
    /payment\s+confirmation/i.test(lower) ||
    /subscription\s+payment\s+of/i.test(lower) ||
    /bank\s+statement\s+for\s+account/i.test(lower)
  ) {
    return { intent: 'payment_mention', detected: false, signal: null };
  }

  const demandPatterns = [
    /(pay|transfer|send)\s+(\$|₹|eur|usd|\d+(\.\d+)?)\s+(immediately|now|processing\s+fee|redelivery\s+fee|registration\s+fee)/i,
    /(send|transfer)\s+(\d+(\.\d+)?\s+)?(btc|bitcoin|usdt|crypto)\s+to/i,
    /unlock\s+your\s+encrypted\s+(personal\s+)?files/i,
    /(bitcoin|btc|usdt|crypto\s+wallet|western\s+union|moneygram|gift\s+card)/i,
    /guaranteed\s+\d+%\s+returns/i,
    /transfer\s+usdt/i,
    /unpaid\s+invoice.*pay\s+immediately/i,
    /overdue\s+payment.*warrant/i,
  ];

  for (const p of demandPatterns) {
    if (p.test(lower)) {
      return {
        intent: 'payment_request',
        detected: true,
        signal: {
          type: 'payment_request',
          severity: 'high',
          title: 'Unconventional or Pressured Payment Demand',
          description: 'Demands upfront payment through cryptocurrency, wire transfer, gift cards, or urgent fees.',
        },
      };
    }
  }

  const routineBillingWords = ['invoice', 'billing', 'subscription', 'monthly bill', 'receipt', 'payment confirmation'];
  const matchedRoutine = routineBillingWords.filter((w) => lower.includes(w));
  if (matchedRoutine.length > 0) {
    return {
      intent: 'payment_mention',
      detected: true,
      signal: {
        type: 'payment_mention',
        severity: 'low',
        title: 'Billing / Invoice Context',
        description: 'The message references standard accounting, subscription, or billing statements.',
        matches: matchedRoutine,
      },
    };
  }

  return { intent: 'payment_mention', detected: false, signal: null };
}

/**
 * Fake Delivery Notification / Redelivery Fee Fraud.
 */
export function detectDeliveryScam(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const deliveryWords = ['package', 'parcel', 'shipment', 'delivery', 'fedex', 'dhl', 'ups', 'indiapost', 'postal', 'courier', 'customs fee', 'redelivery'];
  const actionWords = ['pay', 'fee', 'schedule', 'track', 'update address', 'confirm address', 'claim', 'held at depot', 'terminal'];
  const lower = text.toLowerCase();

  const foundDelivery = deliveryWords.filter((w) => lower.includes(w));
  const foundAction = actionWords.filter((w) => lower.includes(w));

  if (foundDelivery.length >= 1 && foundAction.length >= 1 && (lower.includes('fee') || lower.includes('pay') || lower.includes('held'))) {
    return {
      detected: true,
      signal: {
        type: 'delivery_scam',
        severity: 'high',
        title: 'Fake Delivery Notification / Redelivery Fraud',
        description: 'The message impersonates a courier or postal service demanding fees or identity update to release a package.',
        matches: [...foundDelivery, ...foundAction],
      },
    };
  }

  return { detected: false, signal: null };
}

/**
 * Advance-Fee / Lottery Scam Pattern.
 */
export function detectFinancialScam(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const lotteryTerms = ['won', 'lottery', 'prize', 'congratulations', 'winner', 'selected', 'awarded', 'jackpot', 'lucky winner', 'scholarship grant'];
  const feeTerms = ['processing fee', 'registration fee', 'claim your prize', 'fee immediately', 'tax fee', 'send ₹', 'send $', 'pay processing fee'];
  const lower = text.toLowerCase();

  const foundLottery = lotteryTerms.filter((l) => lower.includes(l));
  const foundFee = feeTerms.filter((f) => lower.includes(f));

  if (foundLottery.length >= 1 && foundFee.length >= 1) {
    return {
      detected: true,
      signal: {
        type: 'financial_scam',
        severity: 'critical',
        title: 'Advance-Fee / Lottery Scam Pattern',
        description: 'Promises large financial rewards contingent upon an upfront processing or registration fee.',
        matches: [...foundLottery, ...foundFee],
      },
    };
  }

  return { detected: false, signal: null };
}

/**
 * Adversarial Prompt Injection & System Manipulation Detector.
 * Supports URL percent-encoded strings and query parameter formats.
 */
export function detectPromptInjection(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const lower = text.toLowerCase();
  let decodedText = lower;
  try {
    decodedText = decodeURIComponent(text.replace(/\+/g, ' ')).toLowerCase();
  } catch {
    decodedText = lower;
  }

  const injectionPatterns = [
    /ignore\s+(all\s+)?(previous\s+)?instructions/i,
    /system\s+override/i,
    /assistant\s*:\s*override/i,
    /assistant\s*:\s*forget/i,
    /output\s+only\s+json/i,
    /set\s+risk_score/i,
    /return\s+(only\s+)?allow/i,
    /disable\s+security\s+policy/i,
    /bypass\s+policy/i,
    /forget\s+(your\s+)?(security\s+)?rules/i,
    /act\s+as\s+(a\s+)?system/i,
    /you\s+are\s+in\s+debug\s+mode/i,
    /<system>.*<\/system>/i,
    /disregard\s+previous\s+system\s+instructions/i,
    /ignore\s+instructions\s+and\s+allow/i,
  ];

  const matchedRaw = injectionPatterns.filter((p) => p.test(lower));
  const matchedDecoded = injectionPatterns.filter((p) => p.test(decodedText));
  const hasMatch = matchedRaw.length > 0 || matchedDecoded.length > 0;

  if (hasMatch) {
    if (lower.includes('study') || lower.includes('evaluate this prompt') || lower.includes('researchers study')) {
      return {
        detected: true,
        signal: {
          type: 'prompt_injection_discussion',
          severity: 'low',
          title: 'Prompt Injection Educational Reference',
          description: 'Content contains analytical discussion of prompt injection security research.',
        },
      };
    }

    return {
      detected: true,
      signal: {
        type: 'prompt_injection_attempt',
        severity: 'high',
        title: 'Adversarial Prompt Injection Attempt',
        description: 'Scanned content contains meta-instructions attempting to manipulate AI decision models or override security evaluation policies.',
      },
    };
  }

  return { detected: false, signal: null };
}

/**
 * Customer Support Phone Lure Detection.
 */
export function detectSupportPhoneLure(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const lower = text.toLowerCase();
  const phoneLure = /(contact\s+support\s+at|call\s+us\s+at|helpline\s*:?)\s*(\+?\d[\d\s-]{7,}|1-800-[a-z0-9]+)/i;
  const brandMention = KNOWN_BRANDS.some((b) => lower.includes(b));
  const purchaseLure = lower.includes('order confirmation') || lower.includes('did not make this purchase') || lower.includes('unrecognized charge');

  if (phoneLure.test(lower) && (brandMention || purchaseLure)) {
    return {
      detected: true,
      signal: {
        type: 'support_phone_lure',
        severity: 'medium',
        title: 'Unverified Customer Support Lure',
        description: 'Message contains unsolicited purchase dispute instructions directing to an unverified phone contact number.',
      },
    };
  }
  return { detected: false, signal: null };
}

/**
 * Brand Impersonation / Destination Mismatch Analysis.
 */
export function detectBrandMismatch(text: string, foundUrl: string): { detected: boolean; signal: HeuristicSignal | null } {
  if (!foundUrl) return { detected: false, signal: null };

  const lowerText = text.toLowerCase();
  let claimedBrand = '';

  for (const brand of KNOWN_BRANDS) {
    if (lowerText.includes(brand)) {
      claimedBrand = brand;
      break;
    }
  }

  if (claimedBrand) {
    try {
      const parsed = new URL(foundUrl.includes('://') ? foundUrl : 'https://' + foundUrl);
      const host = parsed.hostname.toLowerCase();
      const isOfficial =
        host === `${claimedBrand}.com` ||
        host.endsWith(`.${claimedBrand}.com`) ||
        host === `${claimedBrand}.org` ||
        host.endsWith(`.${claimedBrand}.org`) ||
        host === `${claimedBrand}.net` ||
        host.endsWith(`.${claimedBrand}.net`) ||
        host.endsWith(`.${claimedBrand}.co.in`);
      if (!isOfficial) {
        return {
          detected: true,
          signal: {
            type: 'brand_mismatch',
            severity: 'high',
            title: 'Brand Impersonation / Destination Mismatch',
            description: `The message references '${claimedBrand.toUpperCase()}', but the link directs to '${host}'.`,
          },
        };
      }
    } catch {
      // ignore
    }
  }

  return { detected: false, signal: null };
}

export function extractAllUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches.map((u) => u.trim())));
}

export function extractSignals(
  content: string,
  type: string = 'message'
): {
  signals: HeuristicSignal[];
  score: number;
  urlFeatures: UrlFeatures | null;
  allUrlFeatures: UrlFeatures[];
  hasPromptInjection: boolean;
  isResearchContext: boolean;
} {
  const signals: HeuristicSignal[] = [];
  let score = 0;

  const trimmed = content.trim();
  const isPureUrl = type === 'url' || trimmed.startsWith('http://') || trimmed.startsWith('https://');

  let extractedUrls: string[] = [];
  let messageText = content;

  if (isPureUrl) {
    extractedUrls = [trimmed];
    messageText = '';
  } else {
    extractedUrls = extractAllUrls(content);
    messageText = content;
    for (const u of extractedUrls) {
      messageText = messageText.replace(u, ' ');
    }
  }

  // 1. Analyze ALL extracted URLs independently
  const allUrlFeatures: UrlFeatures[] = [];
  let primaryUrlFeatures: UrlFeatures | null = null;

  for (const rawUrl of extractedUrls) {
    const features = extractUrlFeatures(rawUrl);
    if (features) {
      allUrlFeatures.push(features);
      if (!primaryUrlFeatures) primaryUrlFeatures = features;
      const { score: urlScore, signals: urlSignals } = scoreUrlFeatures(features);
      score += urlScore;
      signals.push(...urlSignals);
    }
  }

  // 2. Message / Social Engineering Heuristics
  const research = detectResearchContext(content);
  const isResearchContext = research.isResearch;
  if (research.signal) {
    signals.push(research.signal);
  }

  // Prompt injection check across entire payload (including URL query strings and encoded parameters)
  const promptInj = detectPromptInjection(content);
  const hasPromptInjection = promptInj.detected && promptInj.signal?.type === 'prompt_injection_attempt';
  if (promptInj.detected && promptInj.signal) {
    if (hasPromptInjection) {
      score += 45;
    }
    signals.push(promptInj.signal);
  }

  if (messageText.trim().length > 0) {
    const urgency = detectUrgency(messageText);
    if (urgency.detected && urgency.signal) {
      score += urgency.signal.severity === 'high' ? 35 : 15;
      signals.push(urgency.signal);
    }

    const credentials = detectCredentials(messageText);
    if (credentials.detected && credentials.signal) {
      score += credentials.signal.severity === 'high' ? 35 : 10;
      signals.push(credentials.signal);
    }

    const payment = detectPayment(messageText);
    if (payment.detected && payment.signal) {
      score += payment.signal.severity === 'high' ? 35 : 15;
      signals.push(payment.signal);
    }

    const delivery = detectDeliveryScam(messageText);
    if (delivery.detected && delivery.signal) {
      score += 25;
      signals.push(delivery.signal);
    }

    const financial = detectFinancialScam(messageText);
    if (financial.detected && financial.signal) {
      score += 40;
      signals.push(financial.signal);
    }

    const supportPhone = detectSupportPhoneLure(messageText);
    if (supportPhone.detected && supportPhone.signal) {
      score += 20;
      signals.push(supportPhone.signal);
    }

    if (primaryUrlFeatures) {
      const brandMismatch = detectBrandMismatch(messageText, primaryUrlFeatures.url);
      if (brandMismatch.detected && brandMismatch.signal) {
        score += 25;
        signals.push(brandMismatch.signal);
      }
    }
  }

  // 3. Educational Context discount
  if (isResearchContext && !hasPromptInjection) {
    const hasActiveThreat = signals.some(
      (s) =>
        s.type === 'credential_request' ||
        s.type === 'lookalike_domain' ||
        s.type === 'financial_scam' ||
        s.type === 'delivery_scam' ||
        s.type === 'open_redirect_destination'
    );
    if (!hasActiveThreat) {
      score = Math.max(0, score - 25);
    }
  }

  // 4. Trusted domain score modifier
  if (
    primaryUrlFeatures &&
    primaryUrlFeatures.isTrustedDomain &&
    !primaryUrlFeatures.lookalikeBrand &&
    !primaryUrlFeatures.isIpHost &&
    !primaryUrlFeatures.nestedRedirectTarget?.isExternal
  ) {
    const benignScore = getTrustedDomainScore(primaryUrlFeatures.hostname);
    score = Math.max(0, score + benignScore);
  }

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    signals,
    score: finalScore,
    urlFeatures: primaryUrlFeatures,
    allUrlFeatures,
    hasPromptInjection,
    isResearchContext,
  };
}

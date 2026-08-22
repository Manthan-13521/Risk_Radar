import { extractUrlFeatures, scoreUrlFeatures, KNOWN_BRANDS } from './url-analysis';
import { getTrustedDomainScore } from './trusted-domains';

export interface HeuristicSignal {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  matches?: string[];
}

export function detectUrgency(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const urgencyWords = [
    'urgent',
    'immediately',
    'act now',
    'final warning',
    'account suspended',
    'account blocked',
    'within 2 hours',
    'expires today',
    'last chance',
    'respond immediately',
    'verify now',
    'suspended',
    'disabled',
    'limited access',
    'restricted',
    'reactivate',
    'action requested',
  ];
  const lower = text.toLowerCase();
  const matches = urgencyWords.filter((w) => lower.includes(w));
  if (matches.length === 0) {
    return { detected: false, signal: null };
  }

  const isCritical = matches.some((m) =>
    ['urgent', 'final warning', 'suspended', 'disabled', 'within 2 hours', 'immediately'].includes(m)
  );

  return {
    detected: true,
    signal: {
      type: 'urgency',
      severity: isCritical ? 'high' : 'medium',
      title: 'Artificial urgency',
      description: 'The message creates a short deadline or threat of service loss to pressure immediate action.',
      matches,
    },
  };
}

export function detectCredentials(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const credWords = [
    'password',
    'otp',
    'pin',
    'login',
    'sign in',
    'sign-in',
    'verify account',
    'kyc',
    'username',
    'security code',
    'authentication',
    'credentials',
    'secret code',
    'passcode',
    'new device',
  ];
  const lower = text.toLowerCase();

  // Context check: If it says "never share", it's safe educational guidance
  if (lower.includes('never share') || lower.includes('do not share') || lower.includes('will never ask')) {
    return { detected: false, signal: null };
  }

  const matches = credWords.filter((w) => lower.includes(w));
  if (matches.length === 0) {
    return { detected: false, signal: null };
  }

  const isSensitive = matches.some((m) =>
    ['password', 'otp', 'pin', 'security code', 'kyc', 'credentials', 'passcode'].includes(m)
  );

  return {
    detected: true,
    signal: {
      type: 'credential_request',
      severity: isSensitive ? 'high' : 'medium',
      title: isSensitive ? 'Sensitive Credential Request' : 'Authentication Notice',
      description: 'The message asks for or discusses passwords, OTPs, or authentication credentials.',
      matches,
    },
  };
}

export function detectPayment(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const severeWords = [
    'processing fee',
    'refund fee',
    'claim your prize',
    'pay now',
    'send money',
    'upi pin',
    'transfer fee',
    'release fee',
    'customs fee',
  ];
  const generalPayWords = ['payment', 'pay', 'fee', 'upi', 'transfer', 'deposit', 'invoice', 'billing', 'subscription', 'renew'];
  const lower = text.toLowerCase();

  const strongMatches = severeWords.filter((w) => lower.includes(w));
  const generalMatches = generalPayWords.filter((w) => lower.includes(w));

  if (strongMatches.length > 0) {
    return {
      detected: true,
      signal: {
        type: 'payment_request',
        severity: 'high',
        title: 'Fee / Payment Demand',
        description: 'The message demands advance fees or payments to release funds or packages.',
        matches: strongMatches,
      },
    };
  }

  if (generalMatches.length > 0) {
    return {
      detected: true,
      signal: {
        type: 'payment_request',
        severity: 'medium',
        title: 'Financial Context',
        description: 'The message mentions payments, transfers, invoices, or subscriptions.',
        matches: generalMatches,
      },
    };
  }

  return { detected: false, signal: null };
}

export function detectDeliveryScam(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const deliveryTerms = ['parcel', 'package', 'delivery', 'redelivery', 'courier', 'dispatch', 'shipment', 'postal'];
  const actionTerms = ['fee', 'pay', 'cancel', 'prevent cancellation', 'reschedule', 'address confirmation', 'waiting'];
  const lower = text.toLowerCase();

  const foundDelivery = deliveryTerms.filter((d) => lower.includes(d));
  const foundAction = actionTerms.filter((a) => lower.includes(a));

  if (foundDelivery.length > 0 && foundAction.length > 0) {
    return {
      detected: true,
      signal: {
        type: 'delivery_scam',
        severity: 'high',
        title: 'Delivery / Redelivery Lure',
        description: 'The message pairs parcel delivery language with urgency or payment requests.',
        matches: [...foundDelivery, ...foundAction],
      },
    };
  }

  return { detected: false, signal: null };
}

export function detectFinancialScam(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const lotteryTerms = ['won', 'lottery', 'prize', 'congratulations', 'winner', 'selected', 'awarded', 'jackpot', '₹', '$'];
  const feeTerms = ['processing fee', 'claim', 'tax fee', 'registration fee', 'pay', 'fee immediately', 'claim your prize'];
  const lower = text.toLowerCase();

  const foundLottery = lotteryTerms.filter((l) => lower.includes(l));
  const foundFee = feeTerms.filter((f) => lower.includes(f));

  if (foundLottery.length >= 2 && foundFee.length >= 1) {
    return {
      detected: true,
      signal: {
        type: 'financial_scam',
        severity: 'critical',
        title: 'Advance-Fee / Lottery Scam',
        description: 'The message promises large financial rewards contingent upon an upfront processing fee.',
        matches: [...foundLottery, ...foundFee],
      },
    };
  }

  return { detected: false, signal: null };
}

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
      const isOfficial = host === `${claimedBrand}.com` || 
                         host.endsWith(`.${claimedBrand}.com`) || 
                         host === `${claimedBrand}.org` ||
                         host.endsWith(`.${claimedBrand}.org`);
      if (!isOfficial) {
        return {
          detected: true,
          signal: {
            type: 'brand_mismatch',
            severity: 'high',
            title: 'Brand Impersonation / Destination Mismatch',
            description: `The message mentions '${claimedBrand.toUpperCase()}', but the link directs to '${host}'.`,
          },
        };
      }
    } catch {
      // ignore
    }
  }

  return { detected: false, signal: null };
}

export function extractSignals(content: string, type: string = 'message') {
  const signals: HeuristicSignal[] = [];
  let score = 0;

  let targetUrl = '';
  if (type === 'url' || content.trim().startsWith('http://') || content.trim().startsWith('https://')) {
    targetUrl = content.trim();
  } else {
    const urlMatch = content.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      targetUrl = urlMatch[0];
    }
  }

  // 1. URL Analysis
  let urlFeatures = null;
  if (targetUrl) {
    urlFeatures = extractUrlFeatures(targetUrl);
    if (urlFeatures) {
      const { score: urlScore, signals: urlSignals } = scoreUrlFeatures(urlFeatures);
      score += urlScore;
      signals.push(...urlSignals);
    }
  }

  // 2. Message Heuristics
  const urgency = detectUrgency(content);
  if (urgency.detected && urgency.signal) {
    score += urgency.signal.severity === 'high' ? 35 : 20;
    signals.push(urgency.signal);
  }

  const credentials = detectCredentials(content);
  if (credentials.detected && credentials.signal) {
    score += credentials.signal.severity === 'high' ? 35 : 20;
    signals.push(credentials.signal);
  }

  const payment = detectPayment(content);
  if (payment.detected && payment.signal) {
    score += payment.signal.severity === 'high' ? 30 : 20;
    signals.push(payment.signal);
  }

  const delivery = detectDeliveryScam(content);
  if (delivery.detected && delivery.signal) {
    score += 25;
    signals.push(delivery.signal);
  }

  const financial = detectFinancialScam(content);
  if (financial.detected && financial.signal) {
    score += 40;
    signals.push(financial.signal);
  }

  if (targetUrl) {
    const brandMismatch = detectBrandMismatch(content, targetUrl);
    if (brandMismatch.detected && brandMismatch.signal) {
      score += 25;
      signals.push(brandMismatch.signal);
    }
  }

  // Safe domain credit if no strong attack signals exist
  if (urlFeatures && urlFeatures.isTrustedDomain && !urlFeatures.lookalikeBrand && !urlFeatures.isIpHost) {
    const benignScore = getTrustedDomainScore(urlFeatures.hostname);
    score = Math.max(0, score + benignScore);
  }

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    signals,
    score: finalScore,
    urlFeatures,
  };
}
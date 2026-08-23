import { extractUrlFeatures, scoreUrlFeatures, KNOWN_BRANDS, UrlFeatures } from './url-analysis';
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
    'ssn',
    'bank account',
    'credit card',
    'debit card',
    'cvv',
    'credentials',
    'secret code',
    'verify identity',
    'security question',
  ];
  const lower = text.toLowerCase();
  const matches = credWords.filter((w) => lower.includes(w));
  if (matches.length === 0) {
    return { detected: false, signal: null };
  }

  const isCritical = matches.some((m) => ['password', 'otp', 'pin', 'cvv'].includes(m));

  return {
    detected: true,
    signal: {
      type: 'credential_request',
      severity: isCritical ? 'high' : 'medium',
      title: 'Credential or sensitive data request',
      description: 'The message requests sensitive credentials, financial tokens, or authentication factors.',
      matches,
    },
  };
}

export function detectPayment(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const payWords = [
    'bitcoin',
    'btc',
    'crypto',
    'usdt',
    'gift card',
    'western union',
    'moneygram',
    'wire transfer',
    'pay immediately',
    'payment required',
    'unpaid invoice',
    'overdue payment',
    'transfer funds',
    'send money',
    'processing fee',
    'redelivery fee',
  ];
  const lower = text.toLowerCase();
  const matches = payWords.filter((w) => lower.includes(w));
  if (matches.length === 0) {
    return { detected: false, signal: null };
  }

  const isCritical = matches.some((m) =>
    ['bitcoin', 'btc', 'gift card', 'western union', 'crypto'].includes(m)
  );

  return {
    detected: true,
    signal: {
      type: 'payment_request',
      severity: isCritical ? 'high' : 'medium',
      title: 'Payment or fund transfer demand',
      description: 'The message demands payment through wire transfer, cryptocurrency, or unconventional payment methods.',
      matches,
    },
  };
}

export function detectDeliveryScam(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const deliveryWords = ['package', 'parcel', 'shipment', 'delivery', 'fedex', 'dhl', 'ups', 'indiapost', 'postal', 'courier', 'customs fee', 'redelivery'];
  const actionWords = ['pay', 'fee', 'schedule', 'track', 'update address', 'confirm address', 'claim'];
  const lower = text.toLowerCase();

  const foundDelivery = deliveryWords.filter((w) => lower.includes(w));
  const foundAction = actionWords.filter((w) => lower.includes(w));

  if (foundDelivery.length >= 1 && foundAction.length >= 1) {
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

export function detectFinancialScam(text: string): { detected: boolean; signal: HeuristicSignal | null } {
  const lotteryTerms = ['won', 'lottery', 'prize', 'congratulations', 'winner', 'selected', 'awarded', 'jackpot'];
  const feeTerms = ['processing fee', 'claim', 'tax fee', 'registration fee', 'fee immediately', 'claim your prize'];
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
                         host.endsWith(`.${claimedBrand}.org`) ||
                         host === `${claimedBrand}.net` ||
                         host.endsWith(`.${claimedBrand}.net`);
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

export function extractSignals(content: string, type: string = 'message'): {
  signals: HeuristicSignal[];
  score: number;
  urlFeatures: UrlFeatures | null;
} {
  const signals: HeuristicSignal[] = [];
  let score = 0;

  const trimmed = content.trim();
  const isPureUrl = type === 'url' || trimmed.startsWith('http://') || trimmed.startsWith('https://');

  let targetUrl = '';
  let messageText = content;

  if (isPureUrl) {
    targetUrl = trimmed;
    messageText = ''; // Pure URL does not contain human message body
  } else {
    const urlMatch = content.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      targetUrl = urlMatch[0];
      // Remove URL from message text so URL query strings don't trigger false message heuristics
      messageText = content.replace(urlMatch[0], ' ');
    }
  }

  // 1. URL Structural & Domain Security Analysis
  let urlFeatures: UrlFeatures | null = null;
  if (targetUrl) {
    urlFeatures = extractUrlFeatures(targetUrl);
    if (urlFeatures) {
      const { score: urlScore, signals: urlSignals } = scoreUrlFeatures(urlFeatures);
      score += urlScore;
      signals.push(...urlSignals);
    }
  }

  // 2. Message / Social Engineering Heuristics (ONLY on non-empty message bodies)
  if (messageText.trim().length > 0) {
    const urgency = detectUrgency(messageText);
    if (urgency.detected && urgency.signal) {
      score += urgency.signal.severity === 'high' ? 35 : 20;
      signals.push(urgency.signal);
    }

    const credentials = detectCredentials(messageText);
    if (credentials.detected && credentials.signal) {
      score += credentials.signal.severity === 'high' ? 35 : 20;
      signals.push(credentials.signal);
    }

    const payment = detectPayment(messageText);
    if (payment.detected && payment.signal) {
      score += payment.signal.severity === 'high' ? 30 : 20;
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

    if (targetUrl) {
      const brandMismatch = detectBrandMismatch(messageText, targetUrl);
      if (brandMismatch.detected && brandMismatch.signal) {
        score += 25;
        signals.push(brandMismatch.signal);
      }
    }
  }

  // 3. Trusted domain score modifier (applies if no attack signals are present)
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
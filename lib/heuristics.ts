import { analyzeUrl, detectLookalike } from './url-analysis';

const KNOWN_BRANDS = ['paypal', 'amazon', 'google', 'microsoft', 'apple', 'netflix', 'sbi', 'hdfc', 'icici', 'axis', 'bankofindia'];

export function detectUrgency(text: string) {
  const urgencyWords = ['urgent', 'immediately', 'act now', 'final warning', 'account suspended', 'account blocked', 'within 2 hours', 'expires today', 'last chance', 'respond immediately'];
  const matches = urgencyWords.filter(w => text.toLowerCase().includes(w));
  return { 
    detected: matches.length > 0,
    type: 'urgency',
    severity: matches.length > 1 ? 'high' : (matches.length === 1 ? 'medium' : 'low'),
    title: 'Artificial urgency',
    description: 'The message creates a short deadline to pressure the recipient into acting.',
    matches 
  };
}

export function detectCredentials(text: string) {
  const credWords = ['password', 'otp', 'pin', 'login', 'sign in', 'verify account', 'kyc', 'username', 'security code', 'authentication', 'credentials'];
  const lowerText = text.toLowerCase();
  
  // Context check: If it says "never share", it's likely safe context
  if (lowerText.includes('never share') || lowerText.includes('do not share')) {
    return { detected: false, type: 'credential_request', severity: 'low', title: '', description: '', matches: [] };
  }

  const matches = credWords.filter(w => lowerText.includes(w));
  return { 
    detected: matches.length > 0, 
    type: 'credential_request',
    severity: matches.length > 0 ? 'high' : 'low',
    title: 'Credential request',
    description: 'The message asks for sensitive authentication information.',
    matches 
  };
}

export function detectPayment(text: string) {
  const payWords = ['payment', 'pay', 'fee', 'processing fee', 'upi', 'transfer', 'bank transfer', 'card', 'deposit', 'invoice', 'refund fee'];
  const lowerText = text.toLowerCase();
  const matches = payWords.filter(w => lowerText.includes(w));
  
  return { 
    detected: matches.length > 0, 
    type: 'payment_request',
    severity: matches.length > 0 ? 'medium' : 'low',
    title: 'Payment request',
    description: 'The message mentions payments, fees, or transfers.',
    matches 
  };
}

export function detectBrandMismatch(text: string, url: string) {
  const lowerText = text.toLowerCase();
  let claimedBrand = '';
  
  for (const brand of KNOWN_BRANDS) {
    if (lowerText.includes(brand)) {
      claimedBrand = brand;
      break;
    }
  }

  if (claimedBrand && url) {
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes(claimedBrand)) {
        return {
          detected: true,
          type: 'brand_mismatch',
          severity: 'high',
          title: 'Brand Mismatch',
          description: `The message claims to be from ${claimedBrand.toUpperCase()} but the URL goes to an unrelated domain.`,
          claimedBrand,
          actualDomain: parsed.hostname
        };
      }
    } catch {}
  }

  return { detected: false, type: 'brand_mismatch', severity: 'low', title: '', description: '' };
}

export function extractSignals(content: string) {
  // Simple regex to find a URL in the text for heuristics
  const urlMatch = content.match(/https?:\/\/[^\s]+/);
  const foundUrl = urlMatch ? urlMatch[0] : '';

  const urgency = detectUrgency(content);
  const credentials = detectCredentials(content);
  const payment = detectPayment(content);
  const urlSignal = foundUrl ? analyzeUrl(foundUrl) : { detected: false, type: 'suspicious_url', severity: 'low', title: '', description: '' };
  const lookalike = foundUrl ? detectLookalike(foundUrl, KNOWN_BRANDS) : { detected: false, type: 'lookalike_domain', severity: 'low', title: '', description: '' };
  const brandMismatch = foundUrl ? detectBrandMismatch(content, foundUrl) : { detected: false, type: 'brand_mismatch', severity: 'low', title: '', description: '' };

  const signals = [urgency, credentials, payment, urlSignal, lookalike, brandMismatch].filter(s => s.detected);
  
  // Calculate heuristic score (cap at 100)
  let score = 0;
  if (urgency.detected) score += 10;
  if (credentials.detected) score += 20;
  if (payment.detected) score += 20;
  if (urlSignal.detected) score += 20;
  if (lookalike.detected) score += 20;
  if (brandMismatch.detected) score += 20;
  
  return {
    signals,
    score: Math.min(score, 100)
  };
}
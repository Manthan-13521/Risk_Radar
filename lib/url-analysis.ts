import { isTrustedDomain, getTrustedDomainScore } from './trusted-domains';

export const KNOWN_BRANDS = [
  'paypal',
  'amazon',
  'google',
  'microsoft',
  'apple',
  'netflix',
  'sbi',
  'hdfc',
  'icici',
  'axis',
  'bankofindia',
  'bank',
];

export interface UrlFeatures {
  url: string;
  protocol: string;
  hostname: string;
  registrableDomain: string;
  publicSuffix: string;
  path: string;
  query: string;
  fragment: string;
  isIpHost: boolean;
  isLocalhost: boolean;
  hasPunycode: boolean;
  hasPercentEncoding: boolean;
  hasCredentialsInUrl: boolean;
  urlLength: number;
  hostnameLength: number;
  pathLength: number;
  pathDepth: number;
  queryCount: number;
  excessiveSubdomains: boolean;
  suspiciousTld: boolean;
  suspiciousKeywordsInPath: string[];
  loginPath: boolean;
  verifyPath: boolean;
  accountPath: boolean;
  securityPath: boolean;
  paymentPath: boolean;
  isTrustedDomain: boolean;
  lookalikeBrand: string | null;
  lookalikeCertainty: 'substitutions' | 'non_official_name' | null;
}

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.gq', '.tk', '.ml', '.cc', '.buzz', '.work', '.rest', '.fit', '.cf', '.ga', '.invalid'];

export function extractUrlFeatures(rawUrl: string): UrlFeatures | null {
  try {
    let normalized = rawUrl.trim();
    if (!normalized.includes('://')) {
      normalized = 'https://' + normalized;
    }

    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || /^\[?[a-fA-F0-9:]+\]?$/.test(hostname);
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
    const hasPunycode = hostname.startsWith('xn--') || hostname.includes('.xn--');
    const hasPercentEncoding = rawUrl.includes('%');
    const hasCredentialsInUrl = Boolean(parsed.username || parsed.password);

    const parts = hostname.split('.');
    const subdomainsCount = parts.length > 2 ? parts.length - 2 : 0;
    const excessiveSubdomains = subdomainsCount > 2;

    const suspiciousTld = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));

    const path = parsed.pathname.toLowerCase();
    const pathSegments = path.split('/').filter(Boolean);
    const pathDepth = pathSegments.length;

    const keywords = ['login', 'signin', 'sign-in', 'verify', 'verification', 'account', 'security', 'secure', 'payment', 'pay', 'confirm', 'kyc', 'wallet', 'update', 'recover', 'recovery', 'authenticate', 'banking'];
    const suspiciousKeywordsInPath = keywords.filter(kw => path.includes(kw));

    const loginPath = path.includes('login') || path.includes('signin') || path.includes('sign-in') || path.includes('auth');
    const verifyPath = path.includes('verify') || path.includes('verification') || path.includes('kyc');
    const accountPath = path.includes('account') || path.includes('profile') || path.includes('recovery') || path.includes('update');
    const securityPath = path.includes('security') || path.includes('secure') || path.includes('authenticate');
    const paymentPath = path.includes('payment') || path.includes('pay') || path.includes('checkout') || path.includes('invoice') || path.includes('confirm');

    // Registrable domain approximation
    const registrableDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
    const publicSuffix = parts.length >= 1 ? parts[parts.length - 1] : '';

    // Lookalike brand detection & impersonation
    let lookalikeBrand: string | null = null;
    let lookalikeCertainty: 'substitutions' | 'non_official_name' | null = null;

    for (const brand of KNOWN_BRANDS) {
      // 1. Homoglyphs & character substitutions (e.g. paypa1, g00gle)
      const homoglyphs = brand
        .replace(/o/g, '0')
        .replace(/l/g, '1')
        .replace(/i/g, '1')
        .replace(/e/g, '3');

      if (homoglyphs !== brand && hostname.includes(homoglyphs)) {
        lookalikeBrand = brand;
        lookalikeCertainty = 'substitutions';
        break;
      }

      // Also direct letter substitutions in reverse (e.g. g00gle)
      if (hostname.includes('g00gle') || hostname.includes('paypa1') || hostname.includes('micros0ft') || hostname.includes('app1e')) {
        lookalikeBrand = brand;
        lookalikeCertainty = 'substitutions';
        break;
      }

      // 2. Unofficial domain containing brand or banking keywords
      if (hostname.includes(brand)) {
        const isOfficial = hostname === `${brand}.com` || 
                           hostname.endsWith(`.${brand}.com`) || 
                           hostname === `${brand}.org` || 
                           hostname.endsWith(`.${brand}.org`) || 
                           hostname === `${brand}.net` ||
                           hostname.endsWith(`.${brand}.net`);
        if (!isOfficial) {
          lookalikeBrand = brand;
          lookalikeCertainty = 'non_official_name';
          break;
        }
      }
    }

    // Keyword based domain impersonation (e.g. secure-bank-verification)
    if (!lookalikeBrand) {
      if (hostname.includes('bank') || hostname.includes('secure') || hostname.includes('verification') || hostname.includes('account')) {
        lookalikeBrand = 'financial_institution';
        lookalikeCertainty = 'non_official_name';
      }
    }

    const trusted = isTrustedDomain(hostname);

    return {
      url: normalized,
      protocol: parsed.protocol,
      hostname,
      registrableDomain,
      publicSuffix,
      path,
      query: parsed.search,
      fragment: parsed.hash,
      isIpHost,
      isLocalhost,
      hasPunycode,
      hasPercentEncoding,
      hasCredentialsInUrl,
      urlLength: normalized.length,
      hostnameLength: hostname.length,
      pathLength: path.length,
      pathDepth,
      queryCount: Array.from(parsed.searchParams.keys()).length,
      excessiveSubdomains,
      suspiciousTld,
      suspiciousKeywordsInPath,
      loginPath,
      verifyPath,
      accountPath,
      securityPath,
      paymentPath,
      isTrustedDomain: trusted,
      lookalikeBrand,
      lookalikeCertainty,
    };
  } catch {
    return null;
  }
}

export function scoreUrlFeatures(features: UrlFeatures | null): { score: number; signals: Array<{ type: string; severity: 'low' | 'medium' | 'high' | 'critical'; title: string; description: string }> } {
  if (!features) {
    return { score: 0, signals: [] };
  }

  let score = 0;
  const signals: Array<{ type: string; severity: 'low' | 'medium' | 'high' | 'critical'; title: string; description: string }> = [];

  // 1. IP Host
  if (features.isIpHost) {
    score += 30;
    signals.push({
      type: 'ip_host',
      severity: 'high',
      title: 'Direct IP Host',
      description: `URL uses a raw IP address (${features.hostname}) instead of a trusted domain name.`
    });
  }

  // 2. Lookalike / Brand Impersonation
  if (features.lookalikeBrand) {
    if (features.lookalikeCertainty === 'substitutions') {
      score += 45;
      signals.push({
        type: 'lookalike_domain',
        severity: 'critical',
        title: 'Brand Impersonation (Homoglyph Substitution)',
        description: `Domain mimics '${features.lookalikeBrand}' using character substitutions/homoglyphs.`
      });
    } else {
      score += 30;
      signals.push({
        type: 'lookalike_domain',
        severity: 'high',
        title: 'Brand Impersonation / Fake Institution',
        description: `Domain contains '${features.lookalikeBrand}' keywords on an unverified destination.`
      });
    }
  }

  // 3. Sensitive Paths (Additive)
  if (features.loginPath) {
    score += 20;
    signals.push({
      type: 'credential_path',
      severity: 'high',
      title: 'Login / Sign-In Endpoint',
      description: 'Destination targets a credential entry path.'
    });
  }

  if (features.verifyPath) {
    score += 20;
    signals.push({
      type: 'credential_path',
      severity: 'high',
      title: 'Identity Verification / KYC Endpoint',
      description: 'Destination targets account verification or KYC workflow.'
    });
  }

  if (features.paymentPath) {
    score += 20;
    signals.push({
      type: 'payment_path',
      severity: 'medium',
      title: 'Payment / Checkout Path',
      description: 'URL target path contains financial payment or checkout endpoints.'
    });
  }

  if (features.accountPath || features.securityPath) {
    score += 15;
    signals.push({
      type: 'security_path',
      severity: 'medium',
      title: 'Account Maintenance / Security Endpoint',
      description: 'URL references sensitive account recovery or security configuration.'
    });
  }

  // 4. Suspicious TLD
  if (features.suspiciousTld) {
    score += 20;
    signals.push({
      type: 'suspicious_tld',
      severity: 'high',
      title: 'Suspicious Top-Level Domain',
      description: `Domain uses a suspicious or synthetic TLD (.${features.publicSuffix}).`
    });
  }

  // 5. Excessive Subdomains
  if (features.excessiveSubdomains) {
    score += 15;
    signals.push({
      type: 'excessive_subdomains',
      severity: 'medium',
      title: 'Excessive Subdomains',
      description: 'URL contains deeply nested subdomains used to obscure the true domain.'
    });
  }

  // 6. Insecure HTTP Protocol
  if (features.protocol === 'http:') {
    score += 10;
    signals.push({
      type: 'insecure_http',
      severity: 'low',
      title: 'Insecure HTTP Protocol',
      description: 'Destination does not use TLS/HTTPS encryption.'
    });
  }

  // 7. Percent-encoded URL
  if (features.hasPercentEncoding) {
    score += 10;
    signals.push({
      type: 'encoded_url',
      severity: 'medium',
      title: 'Heavily Encoded URL',
      description: 'URL contains percent-encoding which may conceal deceptive payloads.'
    });
  }

  // 8. Credentials in URL
  if (features.hasCredentialsInUrl) {
    score += 25;
    signals.push({
      type: 'embedded_credentials',
      severity: 'high',
      title: 'Embedded Credentials in URL',
      description: 'URL embeds username or password strings in the authority component.'
    });
  }

  // 9. Trusted domain baseline reduction
  if (features.isTrustedDomain && !features.lookalikeBrand && !features.isIpHost) {
    score += getTrustedDomainScore(features.hostname);
  }

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    signals,
  };
}

export function analyzeUrl(url: string) {
  const features = extractUrlFeatures(url);
  if (!features) {
    return { detected: false, type: 'suspicious_url', severity: 'low', title: 'Invalid URL', description: 'Could not parse URL.' };
  }

  const { score, signals } = scoreUrlFeatures(features);
  if (signals.length > 0) {
    const primary = signals[0];
    return {
      detected: score > 0,
      type: primary.type,
      severity: primary.severity,
      title: primary.title,
      description: primary.description,
      details: features,
    };
  }

  return {
    detected: false,
    type: 'suspicious_url',
    severity: 'low',
    title: 'URL Verified Clean',
    description: 'No structural or heuristic anomalies detected.',
    details: features,
  };
}

export function detectLookalike(url: string, brands: string[] = KNOWN_BRANDS) {
  const features = extractUrlFeatures(url);
  if (!features || !features.lookalikeBrand || !brands.includes(features.lookalikeBrand)) {
    return { detected: false, type: 'lookalike_domain', severity: 'low', title: '', description: '' };
  }

  return {
    detected: true,
    type: 'lookalike_domain',
    severity: features.lookalikeCertainty === 'substitutions' ? 'critical' : 'high',
    title: 'Lookalike Domain',
    description: features.lookalikeCertainty === 'substitutions' 
      ? `The domain uses character substitution to mimic ${features.lookalikeBrand}.`
      : `The domain mimics ${features.lookalikeBrand} but is not the official domain.`,
    brand: features.lookalikeBrand,
  };
}
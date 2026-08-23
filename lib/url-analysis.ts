import { isTrustedDomain, getTrustedDomainScore, isSearchEngineUrl } from './trusted-domains';

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
  'github',
  'openai',
  'bank',
];

export interface NestedUrlTarget {
  parameter: string;
  targetUrl: string;
  targetHostname: string;
  isExternal: boolean;
}

export interface UrlFeatures {
  url: string;
  protocol: string;
  hostname: string;
  decodedHostname: string;
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
  isSearchEngine: boolean;
  lookalikeBrand: string | null;
  lookalikeCertainty: 'substitutions' | 'non_official_name' | null;
  nestedRedirectTarget: NestedUrlTarget | null;
  unusualPort: number | null;
  hasAuthorityAtSymbol: boolean;
}

const SUSPICIOUS_TLDS = [
  '.xyz',
  '.top',
  '.click',
  '.gq',
  '.tk',
  '.ml',
  '.cc',
  '.buzz',
  '.work',
  '.rest',
  '.fit',
  '.cf',
  '.ga',
  '.invalid',
  '.info',
];

const REDIRECT_PARAM_KEYS = [
  'url',
  'target',
  'redirect',
  'redirect_url',
  'redirecturl',
  'next',
  'continue',
  'dest',
  'destination',
  'return',
  'returnurl',
  'r',
  'out',
];

// Multi-level public suffixes commonly encountered
const MULTI_PART_SUFFIXES = [
  '.co.uk',
  '.gov.uk',
  '.ac.uk',
  '.org.uk',
  '.co.in',
  '.gov.in',
  '.nic.in',
  '.ac.in',
  '.com.au',
  '.net.au',
  '.org.au',
  '.co.jp',
  '.com.br',
];

/**
 * Robust registrable domain extractor handling standard and multi-part TLDs.
 */
function extractRegistrableDomain(hostname: string): { registrableDomain: string; publicSuffix: string } {
  const clean = hostname.toLowerCase();
  for (const multi of MULTI_PART_SUFFIXES) {
    if (clean.endsWith(multi)) {
      const remainder = clean.substring(0, clean.length - multi.length);
      const parts = remainder.split('.').filter(Boolean);
      const sld = parts.length > 0 ? parts[parts.length - 1] : '';
      return {
        registrableDomain: sld ? `${sld}${multi}` : clean,
        publicSuffix: multi.substring(1),
      };
    }
  }

  const parts = clean.split('.').filter(Boolean);
  if (parts.length >= 2) {
    return {
      registrableDomain: parts.slice(-2).join('.'),
      publicSuffix: parts[parts.length - 1],
    };
  }

  return {
    registrableDomain: clean,
    publicSuffix: parts[parts.length - 1] || '',
  };
}

/**
 * Decode Punycode ACE prefix (xn--) to unicode representation if possible.
 */
function decodePunycodeHost(hostname: string): string {
  try {
    if (hostname.includes('xn--')) {
      // Use built-in URL decoding or simple conversion
      const parsed = new URL(`http://${hostname}`);
      // Hostname in standard URL might remain punycode, but we can decode parts safely
      return decodeURIComponent(parsed.hostname);
    }
  } catch {
    // Ignore error
  }
  return hostname;
}

export function extractUrlFeatures(rawUrl: string): UrlFeatures | null {
  try {
    let normalized = rawUrl.trim();
    if (!normalized.includes('://')) {
      normalized = 'https://' + normalized;
    }

    const hasAuthorityAtSymbol = rawUrl.includes('@');
    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || /^\[?[a-fA-F0-9:]+\]?$/.test(hostname);
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
    const hasPunycode = hostname.startsWith('xn--') || hostname.includes('.xn--');
    const hasPercentEncoding = rawUrl.includes('%');
    const hasCredentialsInUrl = Boolean(parsed.username || parsed.password);

    const decodedHostname = hasPunycode ? decodePunycodeHost(hostname) : hostname;

    const { registrableDomain, publicSuffix } = extractRegistrableDomain(hostname);
    const parts = hostname.split('.').filter(Boolean);
    const subdomainsCount = parts.length > 2 ? parts.length - 2 : 0;
    const excessiveSubdomains = subdomainsCount > 2;

    const suspiciousTld = SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld));

    const path = parsed.pathname.toLowerCase();
    const pathSegments = path.split('/').filter(Boolean);
    const pathDepth = pathSegments.length;

    const isSearchEngine = isSearchEngineUrl(parsed);
    const isTrusted = isTrustedDomain(hostname);

    let unusualPort: number | null = null;
    if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
      const portNum = parseInt(parsed.port, 10);
      if (!isNaN(portNum)) unusualPort = portNum;
    }

    // Inspect nested redirect query parameters (e.g. ?url=https%3A%2F%2Fevil.com%2Flogin)
    let nestedRedirectTarget: NestedUrlTarget | null = null;
    const searchEntries = Array.from(parsed.searchParams.entries());
    for (const [paramKey, paramVal] of searchEntries) {
      const lowerKey = paramKey.toLowerCase();
      if (REDIRECT_PARAM_KEYS.includes(lowerKey)) {
        let candidate = paramVal.trim();
        if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.startsWith('//')) {
          if (candidate.startsWith('//')) candidate = 'https:' + candidate;
          try {
            const nestedParsed = new URL(candidate);
            const nestedHost = nestedParsed.hostname.toLowerCase();
            const isExternal = nestedHost !== hostname && !nestedHost.endsWith('.' + registrableDomain);
            nestedRedirectTarget = {
              parameter: paramKey,
              targetUrl: candidate,
              targetHostname: nestedHost,
              isExternal,
            };
            break;
          } catch {
            // Non-URL redirect string
          }
        }
      }
    }

    // Analyze path keywords (NOT query string words, which belong to user search content)
    const keywords = [
      'login',
      'signin',
      'sign-in',
      'verify',
      'verification',
      'account',
      'security',
      'secure',
      'payment',
      'pay',
      'confirm',
      'kyc',
      'wallet',
      'update',
      'recover',
      'recovery',
      'authenticate',
      'banking',
    ];
    const suspiciousKeywordsInPath = !isSearchEngine ? keywords.filter((kw) => path.includes(kw)) : [];

    // Path indicators (ignore search queries like /search?q=...)
    const loginPath = !isSearchEngine && (path.includes('login') || path.includes('signin') || path.includes('sign-in') || path.includes('auth'));
    const verifyPath = !isSearchEngine && (path.includes('verify') || path.includes('verification') || path.includes('kyc'));
    const accountPath = !isSearchEngine && (path.includes('account') || path.includes('profile') || path.includes('recovery') || path.includes('update'));
    const securityPath = !isSearchEngine && (path.includes('security') || path.includes('secure') || path.includes('authenticate'));
    const paymentPath = !isSearchEngine && (path.includes('payment') || path.includes('pay') || path.includes('checkout') || path.includes('invoice') || path.includes('confirm'));

    // Lookalike brand detection & impersonation
    let lookalikeBrand: string | null = null;
    let lookalikeCertainty: 'substitutions' | 'non_official_name' | null = null;

    if (!isTrusted) {
      const candidateHost = decodedHostname;
      for (const brand of KNOWN_BRANDS) {
        // 1. Homoglyphs & character substitutions (e.g. paypa1, g00gle)
        const homoglyphs = brand
          .replace(/o/g, '0')
          .replace(/l/g, '1')
          .replace(/i/g, '1')
          .replace(/e/g, '3');

        if (homoglyphs !== brand && candidateHost.includes(homoglyphs)) {
          lookalikeBrand = brand;
          lookalikeCertainty = 'substitutions';
          break;
        }

        // Direct letter substitutions in reverse (e.g. g00gle, paypa1)
        if (
          candidateHost.includes('g00gle') ||
          candidateHost.includes('paypa1') ||
          candidateHost.includes('micros0ft') ||
          candidateHost.includes('app1e') ||
          candidateHost.includes('amaz0n')
        ) {
          lookalikeBrand = brand;
          lookalikeCertainty = 'substitutions';
          break;
        }

        // 2. Unofficial domain containing brand or banking keywords
        if (candidateHost.includes(brand)) {
          const isOfficial =
            candidateHost === `${brand}.com` ||
            candidateHost.endsWith(`.${brand}.com`) ||
            candidateHost === `${brand}.org` ||
            candidateHost.endsWith(`.${brand}.org`) ||
            candidateHost === `${brand}.net` ||
            candidateHost.endsWith(`.${brand}.net`) ||
            candidateHost.endsWith(`.${brand}.co.in`);
          if (!isOfficial) {
            lookalikeBrand = brand;
            lookalikeCertainty = 'non_official_name';
            break;
          }
        }
      }

      // Keyword based domain impersonation on untrusted hostnames (e.g. secure-bank-verification)
      if (!lookalikeBrand) {
        if (
          (candidateHost.includes('bank') ||
            candidateHost.includes('secure') ||
            candidateHost.includes('verification')) &&
          !isTrusted
        ) {
          lookalikeBrand = 'financial_institution';
          lookalikeCertainty = 'non_official_name';
        }
      }
    }

    return {
      url: normalized,
      protocol: parsed.protocol,
      hostname,
      decodedHostname,
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
      isTrustedDomain: isTrusted,
      isSearchEngine,
      lookalikeBrand,
      lookalikeCertainty,
      nestedRedirectTarget,
      unusualPort,
      hasAuthorityAtSymbol,
    };
  } catch {
    return null;
  }
}

export function scoreUrlFeatures(features: UrlFeatures | null): {
  score: number;
  signals: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
  }>;
} {
  if (!features) {
    return { score: 0, signals: [] };
  }

  let score = 0;
  const signals: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
  }> = [];

  // Special handling: Legitimate Search Engine query URLs (e.g. google.com/search?q=threat+intelligence)
  if (features.isSearchEngine && features.isTrustedDomain) {
    if (
      !features.hasCredentialsInUrl &&
      !features.isIpHost &&
      !features.lookalikeBrand &&
      !features.nestedRedirectTarget
    ) {
      return { score: 0, signals: [] };
    }
  }

  // 1. IP Host
  if (features.isIpHost) {
    score += 30;
    signals.push({
      type: 'ip_host',
      severity: 'high',
      title: 'Direct IP Host',
      description: `URL uses a raw IP address (${features.hostname}) instead of a trusted domain name.`,
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
        description: `Domain mimics '${features.lookalikeBrand}' using character substitutions or homoglyphs.`,
      });
    } else {
      score += 30;
      signals.push({
        type: 'lookalike_domain',
        severity: 'high',
        title: 'Brand Impersonation / Fake Institution',
        description: `Domain contains '${features.lookalikeBrand}' keywords on an unverified destination.`,
      });
    }
  }

  // 3. Sensitive Paths (Additive on non-search endpoints)
  if (features.loginPath) {
    score += 20;
    signals.push({
      type: 'credential_path',
      severity: 'high',
      title: 'Login / Sign-In Endpoint',
      description: 'Destination targets a credential entry path.',
    });
  }

  if (features.verifyPath) {
    score += 20;
    signals.push({
      type: 'credential_path',
      severity: 'high',
      title: 'Identity Verification / KYC Endpoint',
      description: 'Destination targets account verification or KYC workflow.',
    });
  }

  if (features.paymentPath) {
    score += 20;
    signals.push({
      type: 'payment_path',
      severity: 'medium',
      title: 'Payment / Checkout Path',
      description: 'URL target path contains financial payment or checkout endpoints.',
    });
  }

  if (features.accountPath || features.securityPath) {
    score += 15;
    signals.push({
      type: 'security_path',
      severity: 'medium',
      title: 'Account Maintenance / Security Endpoint',
      description: 'URL references sensitive account recovery or security configuration.',
    });
  }

  // 4. Suspicious TLD
  if (features.suspiciousTld) {
    score += 20;
    signals.push({
      type: 'suspicious_tld',
      severity: 'high',
      title: 'Suspicious Top-Level Domain',
      description: `Domain uses a suspicious or synthetic TLD (.${features.publicSuffix}).`,
    });
  }

  // 5. Excessive Subdomains
  if (features.excessiveSubdomains) {
    score += 15;
    signals.push({
      type: 'excessive_subdomains',
      severity: 'medium',
      title: 'Excessive Subdomains',
      description: 'URL contains deeply nested subdomains used to obscure the true domain.',
    });
  }

  // 6. Insecure HTTP Protocol
  if (features.protocol === 'http:') {
    score += 10;
    signals.push({
      type: 'insecure_http',
      severity: 'low',
      title: 'Insecure HTTP Protocol',
      description: 'Destination does not use TLS/HTTPS encryption.',
    });
  }

  // 7. Percent-encoded URL on untrusted domain
  if (features.hasPercentEncoding && !features.isTrustedDomain) {
    score += 10;
    signals.push({
      type: 'encoded_url',
      severity: 'medium',
      title: 'Heavily Encoded URL',
      description: 'URL contains percent-encoding which may conceal deceptive payloads.',
    });
  }

  // 8. Credentials in URL
  if (features.hasCredentialsInUrl) {
    score += 25;
    signals.push({
      type: 'embedded_credentials',
      severity: 'high',
      title: 'Embedded Credentials in URL',
      description: 'URL embeds username or password strings in the authority component.',
    });
  }

  // 9. Nested Redirect Target / Open Redirect
  if (features.nestedRedirectTarget && features.nestedRedirectTarget.isExternal) {
    score += 30;
    signals.push({
      type: 'open_redirect_destination',
      severity: 'high',
      title: 'External Redirect Destination Parameter',
      description: `URL contains an embedded forwarding parameter directing to external host '${features.nestedRedirectTarget.targetHostname}'.`,
    });
  }

  // 10. Unusual Port
  if (features.unusualPort && !features.isTrustedDomain) {
    score += 10;
    signals.push({
      type: 'unusual_port',
      severity: 'low',
      title: 'Unusual Port Destination',
      description: `URL targets a non-standard port (${features.unusualPort}).`,
    });
  }

  // 11. Authority '@' Syntax Obfuscation
  if (features.hasAuthorityAtSymbol && !features.isTrustedDomain) {
    score += 25;
    signals.push({
      type: 'authority_obfuscation',
      severity: 'high',
      title: 'Authority Header Obfuscation (@ syntax)',
      description: 'URL utilizes @ syntax in the authority component to obscure the actual destination hostname.',
    });
  }

  // 12. Trusted domain baseline reduction (only if no active attack indicators exist)
  if (
    features.isTrustedDomain &&
    !features.lookalikeBrand &&
    !features.isIpHost &&
    !features.nestedRedirectTarget?.isExternal
  ) {
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
    return {
      detected: false,
      type: 'suspicious_url',
      severity: 'low',
      title: 'Invalid URL',
      description: 'Could not parse URL.',
    };
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
    description:
      features.lookalikeCertainty === 'substitutions'
        ? `The domain uses character substitution to mimic ${features.lookalikeBrand}.`
        : `The domain mimics ${features.lookalikeBrand} but is not the official domain.`,
    brand: features.lookalikeBrand,
  };
}

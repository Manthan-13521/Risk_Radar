const fs = require('fs');
const path = require('path');

const TRUSTED_DOMAINS = new Set([
  'google.com',
  'googleusercontent.com',
  'gstatic.com',
  'youtube.com',
  'microsoft.com',
  'live.com',
  'office.com',
  'bing.com',
  'github.com',
  'github.io',
  'apple.com',
  'icloud.com',
  'amazon.com',
  'aws.amazon.com',
  'paypal.com',
  'wikipedia.org',
  'wikimedia.org',
  'openai.com',
  'duckduckgo.com',
  'yahoo.com',
  'csrc.nist.gov',
  'nist.gov',
  'owasp.org',
  'cisa.gov',
  'mitre.org',
  'attack.mitre.org',
  'krebsonsecurity.com',
  'virustotal.com',
  'cloudflare.com',
  'mozilla.org',
  'example.com',
  'example.org',
  'example.net',
]);

const SEARCH_ENGINE_HOSTS = new Set([
  'google.com',
  'www.google.com',
  'bing.com',
  'www.bing.com',
  'duckduckgo.com',
  'www.duckduckgo.com',
  'search.yahoo.com',
  'yahoo.com',
  'www.yahoo.com',
  'ecosia.org',
  'www.ecosia.org',
  'baidu.com',
  'www.baidu.com',
  'github.com',
  'www.github.com',
]);

function isTrustedDomain(hostname) {
  if (!hostname) return false;
  const cleanHost = hostname.toLowerCase().trim();
  if (TRUSTED_DOMAINS.has(cleanHost)) return true;
  const list = Array.from(TRUSTED_DOMAINS);
  for (let i = 0; i < list.length; i++) {
    if (cleanHost.endsWith('.' + list[i])) return true;
  }
  return false;
}

function isSearchEngineUrl(parsedUrl) {
  const host = parsedUrl.hostname.toLowerCase().trim();
  const isSearchHost = SEARCH_ENGINE_HOSTS.has(host) ||
    Array.from(SEARCH_ENGINE_HOSTS).some(sh => host === sh || host.endsWith('.' + sh));
  if (!isSearchHost) return false;
  const path = parsedUrl.pathname.toLowerCase();
  const isSearchPath = path === '/search' || path === '/' || path === '/web' || path === '/s';
  const hasSearchParam = parsedUrl.searchParams.has('q') || parsedUrl.searchParams.has('p') ||
    parsedUrl.searchParams.has('query') || parsedUrl.searchParams.has('wd');
  return isSearchPath && hasSearchParam;
}

const KNOWN_BRANDS = [
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

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.gq', '.tk', '.ml', '.cc', '.buzz', '.work', '.rest', '.fit', '.cf', '.ga', '.invalid', '.info'];
const REDIRECT_PARAM_KEYS = ['url', 'target', 'redirect', 'redirect_url', 'redirecturl', 'next', 'continue', 'dest', 'destination', 'return', 'returnurl', 'r', 'out'];

function extractUrlFeatures(rawUrl) {
  try {
    let normalized = rawUrl.trim();
    if (!normalized.includes('://')) {
      normalized = 'https://' + normalized;
    }

    const hasAuthorityAtSymbol = rawUrl.includes('@');
    const parsed = new URL(normalized);
    const hostname = parsed.hostname.toLowerCase();
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || /^\[?[a-fA-F0-9:]+\]?$/.test(hostname);
    const hasPunycode = hostname.startsWith('xn--') || hostname.includes('.xn--');
    const hasPercentEncoding = rawUrl.includes('%');
    const hasCredentialsInUrl = Boolean(parsed.username || parsed.password);

    const parts = hostname.split('.').filter(Boolean);
    const excessiveSubdomains = parts.length > 3;
    const suspiciousTld = SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld));

    const pathStr = parsed.pathname.toLowerCase();
    const trusted = isTrustedDomain(hostname);
    const isSearchEngine = isSearchEngineUrl(parsed);

    let nestedRedirectTarget = null;
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
            const isExternal = nestedHost !== hostname;
            nestedRedirectTarget = { parameter: paramKey, targetUrl: candidate, targetHostname: nestedHost, isExternal };
            break;
          } catch {}
        }
      }
    }

    const loginPath = !isSearchEngine && (pathStr.includes('login') || pathStr.includes('signin') || pathStr.includes('sign-in') || pathStr.includes('auth'));
    const verifyPath = !isSearchEngine && (pathStr.includes('verify') || pathStr.includes('verification') || pathStr.includes('kyc'));
    const accountPath = !isSearchEngine && (pathStr.includes('account') || pathStr.includes('profile') || pathStr.includes('recovery') || pathStr.includes('update'));
    const securityPath = !isSearchEngine && (pathStr.includes('security') || pathStr.includes('secure') || pathStr.includes('authenticate'));
    const paymentPath = !isSearchEngine && (pathStr.includes('payment') || pathStr.includes('pay') || pathStr.includes('checkout') || pathStr.includes('invoice') || pathStr.includes('confirm'));

    let lookalikeBrand = null;
    let lookalikeCertainty = null;

    if (!trusted) {
      for (const brand of KNOWN_BRANDS) {
        const homoglyphs = brand.replace(/o/g, '0').replace(/l/g, '1').replace(/i/g, '1').replace(/e/g, '3');
        if (homoglyphs !== brand && hostname.includes(homoglyphs)) {
          lookalikeBrand = brand;
          lookalikeCertainty = 'substitutions';
          break;
        }
        if (hostname.includes('g00gle') || hostname.includes('paypa1') || hostname.includes('micros0ft') || hostname.includes('app1e') || hostname.includes('amaz0n')) {
          lookalikeBrand = brand;
          lookalikeCertainty = 'substitutions';
          break;
        }
        if (hostname.includes(brand)) {
          const isOfficial = hostname === `${brand}.com` ||
                             hostname.endsWith(`.${brand}.com`) ||
                             hostname === `${brand}.org` ||
                             hostname.endsWith(`.${brand}.org`) ||
                             hostname === `${brand}.net` ||
                             hostname.endsWith(`.${brand}.net`) ||
                             hostname.endsWith(`.${brand}.co.in`);
          if (!isOfficial) {
            lookalikeBrand = brand;
            lookalikeCertainty = 'non_official_name';
            break;
          }
        }
      }

      if (!lookalikeBrand) {
        if (hostname.includes('bank') || hostname.includes('secure') || hostname.includes('verification') || hostname.includes('account')) {
          lookalikeBrand = 'financial_institution';
          lookalikeCertainty = 'non_official_name';
        }
      }
    }

    return {
      url: normalized,
      protocol: parsed.protocol,
      hostname,
      path: pathStr,
      isIpHost,
      hasPunycode,
      hasPercentEncoding,
      hasCredentialsInUrl,
      excessiveSubdomains,
      suspiciousTld,
      loginPath,
      verifyPath,
      accountPath,
      securityPath,
      paymentPath,
      isSearchEngine,
      isTrustedDomain: trusted,
      lookalikeBrand,
      lookalikeCertainty,
      nestedRedirectTarget,
      hasAuthorityAtSymbol,
    };
  } catch {
    return null;
  }
}

function scoreUrlFeatures(features) {
  if (!features) return { score: 0, signals: [] };
  let score = 0;
  const signals = [];

  if (features.isSearchEngine && features.isTrustedDomain) {
    if (!features.hasCredentialsInUrl && !features.isIpHost && !features.lookalikeBrand && !features.nestedRedirectTarget) {
      return { score: 0, signals: [] };
    }
  }

  if (features.isIpHost) {
    score += 30;
    signals.push({ type: 'ip_host', severity: 'high', title: 'Direct IP Host', description: 'Raw IP address' });
  }

  if (features.lookalikeBrand) {
    if (features.lookalikeCertainty === 'substitutions') {
      score += 45;
      signals.push({ type: 'lookalike_domain', severity: 'critical', title: 'Brand Homoglyph Lookalike', description: 'Homoglyph substitution' });
    } else {
      score += 30;
      signals.push({ type: 'lookalike_domain', severity: 'high', title: 'Brand Impersonation', description: 'Unofficial brand domain' });
    }
  }

  if (features.loginPath) {
    score += 20;
    signals.push({ type: 'credential_path', severity: 'high', title: 'Login Path', description: 'Sensitive login path' });
  }

  if (features.verifyPath) {
    score += 20;
    signals.push({ type: 'credential_path', severity: 'high', title: 'Verification Path', description: 'KYC path' });
  }

  if (features.paymentPath) {
    score += 20;
    signals.push({ type: 'payment_path', severity: 'medium', title: 'Payment Path', description: 'Financial path' });
  }

  if (features.accountPath || features.securityPath) {
    score += 15;
    signals.push({ type: 'security_path', severity: 'medium', title: 'Account / Security Endpoint', description: 'Account endpoint' });
  }

  if (features.suspiciousTld) {
    score += 20;
    signals.push({ type: 'suspicious_tld', severity: 'high', title: 'Suspicious TLD', description: 'Abused TLD' });
  }

  if (features.excessiveSubdomains) {
    score += 15;
    signals.push({ type: 'excessive_subdomains', severity: 'medium', title: 'Excessive Subdomains', description: 'Deeply nested subdomains' });
  }

  if (features.protocol === 'http:') {
    score += 10;
    signals.push({ type: 'insecure_http', severity: 'low', title: 'Insecure HTTP', description: 'No TLS' });
  }

  if (features.hasPercentEncoding && !features.isTrustedDomain) {
    score += 10;
    signals.push({ type: 'encoded_url', severity: 'medium', title: 'Heavily Encoded URL', description: 'Percent encoding' });
  }

  if (features.hasCredentialsInUrl) {
    score += 25;
    signals.push({ type: 'embedded_credentials', severity: 'high', title: 'Embedded Credentials in URL', description: 'Embedded credentials' });
  }

  if (features.nestedRedirectTarget && features.nestedRedirectTarget.isExternal) {
    score += 30;
    signals.push({ type: 'open_redirect_destination', severity: 'high', title: 'Open Redirect Destination', description: 'External forwarding parameter' });
  }

  if (features.hasAuthorityAtSymbol && !features.isTrustedDomain) {
    score += 25;
    signals.push({ type: 'authority_obfuscation', severity: 'high', title: 'Authority Obfuscation', description: '@ syntax' });
  }

  if (features.isTrustedDomain && !features.lookalikeBrand && !features.isIpHost && !features.nestedRedirectTarget?.isExternal) {
    score -= 30;
  }

  const finalScore = Math.max(0, Math.min(100, score));
  return { score: finalScore, signals };
}

function extractSignals(content, type = 'message') {
  const signals = [];
  let score = 0;

  if (type === 'file') {
    const filename = content.toLowerCase();
    const parts = filename.split('.');
    if (parts.length > 2) {
      const ext2 = '.' + parts[parts.length - 1];
      const executables = ['.exe', '.app', '.dmg', '.bat', '.cmd', '.sh', '.ps1', '.js', '.vbs', '.jar', '.msi', '.scr'];
      if (executables.includes(ext2)) {
        score += 35;
        signals.push({ type: 'double_extension', severity: 'high', title: 'Double Extension', description: 'Disguised executable extension' });
      }
    }
    const executables = ['.exe', '.scr', '.bat', '.ps1', '.msi', '.vbs'];
    if (executables.some(ext => filename.endsWith(ext))) {
      score += 45;
      signals.push({ type: 'executable_file', severity: 'critical', title: 'Executable File', description: 'Executable file format' });
    }
    const macros = ['.docm', '.xlsm', '.pptm'];
    if (macros.some(ext => filename.endsWith(ext))) {
      score += 30;
      signals.push({ type: 'macro_capable_file', severity: 'medium', title: 'Macro Capable File', description: 'Macro-enabled document' });
    }
    return { signals, score: Math.max(0, Math.min(100, score)), urlFeatures: null, hasPromptInjection: false, isResearchContext: false };
  }

  const urlRegex = /https?:\/\/[^\s]+/gi;
  const extractedUrls = content.match(urlRegex) || [];
  let messageText = content;

  let primaryUrlFeatures = null;
  if (type === 'url' || content.trim().startsWith('http://') || content.trim().startsWith('https://')) {
    primaryUrlFeatures = extractUrlFeatures(content.trim());
    if (primaryUrlFeatures) {
      const { score: urlScore, signals: urlSignals } = scoreUrlFeatures(primaryUrlFeatures);
      score += urlScore;
      signals.push(...urlSignals);
    }
    messageText = '';
  } else {
    for (const rawU of extractedUrls) {
      messageText = messageText.replace(rawU, ' ');
      const uf = extractUrlFeatures(rawU);
      if (uf) {
        if (!primaryUrlFeatures) primaryUrlFeatures = uf;
        const { score: urlScore, signals: urlSignals } = scoreUrlFeatures(uf);
        score += urlScore;
        signals.push(...urlSignals);
      }
    }
  }

  const lower = content.toLowerCase();
  let decodedText = lower;
  try {
    decodedText = decodeURIComponent(content.replace(/\+/g, ' ')).toLowerCase();
  } catch {
    decodedText = lower;
  }

  // Research Context
  const researchTerms = ['cve-', 'owasp', 'mitre attack', 'mitre att&ck', 'nist', 'cisa', 'security research', 'vulnerability analysis', 'malware analysis', 'reverse engineering', 'phishing prevention', 'security checklist', 'cyber hygiene', 'security training', 'whitepaper', 'cheat sheet'];
  const isResearch = researchTerms.some(t => lower.includes(t));
  if (isResearch) {
    signals.push({ type: 'security_research_context', severity: 'low', title: 'Security Research Context', description: 'Educational discussion' });
  }

  // Prompt Injection across full payload (raw and decoded query strings)
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

  const matchedRaw = injectionPatterns.filter(p => p.test(lower));
  const matchedDecoded = injectionPatterns.filter(p => p.test(decodedText));
  const isDiscussion = lower.includes('study') || lower.includes('evaluate this prompt') || lower.includes('researchers study');

  let hasInjection = false;
  if ((matchedRaw.length > 0 || matchedDecoded.length > 0) && !isDiscussion) {
    hasInjection = true;
    score += 45;
    signals.push({ type: 'prompt_injection_attempt', severity: 'high', title: 'Prompt Injection Attempt', description: 'Meta-instruction override' });
  } else if (isDiscussion) {
    signals.push({ type: 'prompt_injection_discussion', severity: 'low', title: 'Prompt Injection Educational Reference', description: 'Educational discussion' });
  }

  if (messageText.trim().length > 0) {
    // Negation-aware Credential Check
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
    const isAdvice = advicePatterns.some(p => p.test(lower));

    if (!isAdvice) {
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
      if (requestPatterns.some(p => p.test(lower))) {
        score += 35;
        signals.push({ type: 'credential_request', severity: 'high', title: 'Credential Request', description: 'Credentials demanded' });
      }
    }

    // Urgency Check
    const urgentLurePatterns = [
      /account\s+will\s+be\s+(suspended|blocked|disabled|terminated|closed)/i,
      /(urgent|immediately|act\s+now|final\s+warning|last\s+chance)/i,
      /within\s+\d+\s+(hours|minutes|mins)/i,
      /action\s+required\s+immediately/i,
      /failure\s+to\s+respond.*will\s+result\s+in/i,
    ];
    if (urgentLurePatterns.some(p => p.test(lower))) {
      score += 35;
      signals.push({ type: 'urgency', severity: 'high', title: 'Urgency Pressure', description: 'Coercive deadline' });
    }

    // Payment Demands
    const isReceipt =
      /thank\s+you\s+for\s+your\s+payment/i.test(lower) ||
      /receipt\s*:\s*thank\s+you/i.test(lower) ||
      /payment\s+confirmation/i.test(lower) ||
      /subscription\s+payment\s+of/i.test(lower) ||
      /bank\s+statement\s+for\s+account/i.test(lower);

    if (!isReceipt) {
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
      if (demandPatterns.some(p => p.test(lower))) {
        score += 35;
        signals.push({ type: 'payment_request', severity: 'high', title: 'Payment Demand', description: 'Fee demanded' });
      }
    }

    // Delivery Scam
    const deliveryTerms = ['parcel', 'package', 'delivery', 'redelivery', 'courier'];
    const actionTerms = ['fee', 'pay', 'cancel', 'prevent cancellation', 'waiting', 'depot'];
    if (deliveryTerms.some(d => lower.includes(d)) && actionTerms.some(a => lower.includes(a)) && (lower.includes('fee') || lower.includes('pay'))) {
      score += 25;
      signals.push({ type: 'delivery_scam', severity: 'high', title: 'Delivery Scam', description: 'Delivery fee demanded' });
    }

    // Lottery Scam
    const lotteryTerms = ['won', 'lottery', 'prize', 'congratulations', '₹', '$', 'lucky winner', 'scholarship grant'];
    const feeTerms = ['processing fee', 'registration fee', 'claim', 'pay', 'fee immediately', 'claim your prize', 'pay processing fee'];
    if (lotteryTerms.filter(l => lower.includes(l)).length >= 1 && feeTerms.some(f => lower.includes(f))) {
      score += 40;
      signals.push({ type: 'financial_scam', severity: 'critical', title: 'Lottery Scam', description: 'Advance fee demanded' });
    }

    // Customer support phone lure
    const phoneLure = /(contact\s+support\s+at|call\s+us\s+at|helpline\s*:?)\s*(\+?\d[\d\s-]{7,}|1-800-[a-z0-9]+)/i;
    if (phoneLure.test(lower)) {
      score += 20;
      signals.push({ type: 'support_phone_lure', severity: 'medium', title: 'Support Phone Lure', description: 'Phone dispute lure' });
    }
  }

  // Research context discount if no active attacks
  if (isResearch && !hasInjection) {
    const hasActiveThreat = signals.some(s => ['credential_request', 'lookalike_domain', 'financial_scam', 'delivery_scam', 'open_redirect_destination'].includes(s.type));
    if (!hasActiveThreat) {
      score = Math.max(0, score - 25);
    }
  }

  if (primaryUrlFeatures && primaryUrlFeatures.isTrustedDomain && !primaryUrlFeatures.lookalikeBrand && !primaryUrlFeatures.isIpHost && !primaryUrlFeatures.nestedRedirectTarget?.isExternal) {
    score = Math.max(0, score - 30);
  }

  return {
    signals,
    score: Math.max(0, Math.min(100, score)),
    urlFeatures: primaryUrlFeatures,
    hasPromptInjection: hasInjection,
    isResearchContext: isResearch,
  };
}

function evaluateDecision(heuristicScore, signals, hasPromptInjection = false) {
  const signalTypes = new Set(signals.map(s => s.type));

  const hasIpHost = signalTypes.has('ip_host');
  const hasLookalike = signalTypes.has('lookalike_domain');
  const hasAuthPath = signalTypes.has('credential_path');
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
  const hasSuspiciousTld = signalTypes.has('suspicious_tld');
  const hasOpenRedirect = signalTypes.has('open_redirect_destination');
  const hasAuthorityObf = signalTypes.has('authority_obfuscation');
  const hasInjection = hasPromptInjection || signalTypes.has('prompt_injection_attempt');

  let finalRisk = heuristicScore;
  let forbidAllow = false;
  let forceAction = null;

  if (hasIpHost) {
    finalRisk = Math.max(finalRisk, 65);
    forbidAllow = true;
  }
  if (hasLookalike) {
    finalRisk = Math.max(finalRisk, 70);
    forbidAllow = true;
  }
  if (hasLookalike && (hasAuthPath || hasSecurityPath || hasPaymentPath || hasAuthorityObf)) {
    finalRisk = Math.max(finalRisk, 85);
    forbidAllow = true;
    forceAction = 'block';
  }
  if (hasCredentialRequest) {
    finalRisk = Math.max(finalRisk, 65);
    forbidAllow = true;
    if (hasUrgency || hasLookalike || hasSuspiciousTld) {
      finalRisk = Math.max(finalRisk, 80);
      forceAction = 'quarantine';
    }
  }
  if (hasPaymentRequest && (hasDeliveryScam || hasFinancialScam || (hasUrgency && hasPaymentPath))) {
    finalRisk = Math.max(finalRisk, 75);
    forbidAllow = true;
    forceAction = 'quarantine';
  }
  if (hasPaymentRequest) {
    finalRisk = Math.max(finalRisk, 65);
    forbidAllow = true;
    forceAction = 'quarantine';
  }
  if (hasOpenRedirect) {
    finalRisk = Math.max(finalRisk, 50);
    forbidAllow = true;
    if (hasAuthPath || hasLookalike) {
      finalRisk = Math.max(finalRisk, 75);
      forceAction = 'quarantine';
    }
  }
  if (hasDoubleExt || hasExecutable) {
    finalRisk = Math.max(finalRisk, 80);
    forbidAllow = true;
    forceAction = 'quarantine';
  }
  if (hasMacro) {
    finalRisk = Math.max(finalRisk, 40);
    forbidAllow = true;
  }
  if (hasInjection) {
    finalRisk = Math.max(finalRisk, 45);
    forbidAllow = true;
    if (!forceAction) forceAction = 'warn';
  }

  let finalClassification = 'safe';
  if (finalRisk < 30 && !forbidAllow) {
    finalClassification = 'safe';
  } else if (finalRisk >= 80) {
    finalClassification = 'critical';
  } else if (finalRisk >= 60) {
    finalClassification = 'dangerous';
  } else {
    finalClassification = 'suspicious';
  }

  let action = 'allow';
  if (forceAction) {
    action = forceAction;
  } else if (finalClassification === 'safe' && !forbidAllow) {
    action = 'allow';
  } else if (finalClassification === 'critical') {
    action = 'block';
  } else if (finalClassification === 'dangerous') {
    action = 'quarantine';
  } else {
    action = 'warn';
  }

  let intent = 'uncertain';
  if (hasInjection) {
    intent = 'scam_redirection';
  } else if (hasCredentialRequest || hasAuthPath || (hasLookalike && (hasAuthPath || hasSecurityPath))) {
    intent = 'credential_theft';
  } else if (hasPaymentRequest || hasPaymentPath || hasFinancialScam || hasDeliveryScam) {
    intent = 'payment_fraud';
  } else if (hasIpHost || hasSecurityPath) {
    intent = 'account_takeover';
  } else if (hasDoubleExt || hasExecutable || hasMacro) {
    intent = 'malware_delivery';
  } else if (hasLookalike) {
    intent = 'identity_impersonation';
  }

  return {
    finalRisk: Math.max(0, Math.min(100, finalRisk)),
    finalClassification,
    action,
    intent,
    forbidAllow,
  };
}

function runEvaluation() {
  console.log('============================================================');
  console.log(' RISK RADAR — ADVERSARIAL CALIBRATION BENCHMARK');
  console.log(' 105+ Full Precision Test Suite');
  console.log('============================================================\n');

  const corpusPath = path.join(__dirname, '../tests/fixtures/security-cases.json');
  const rawData = fs.readFileSync(corpusPath, 'utf8');
  const testCases = JSON.parse(rawData);

  let passed = 0;
  let failed = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let falseAllowCount = 0;
  let safeCorrect = 0;
  let totalSafe = 0;
  let totalHighRisk = 0;
  let highRiskCorrect = 0;
  let promptInjectionContained = 0;
  let totalPromptInjections = 0;
  let evidenceMatchedCount = 0;

  console.log(`Evaluating ${testCases.length} golden adversarial cases...\n`);

  for (const tc of testCases) {
    const heuristicData = extractSignals(tc.content, tc.type);
    const decision = evaluateDecision(heuristicData.score, heuristicData.signals, heuristicData.hasPromptInjection);

    let testPassed = true;

    if (tc.riskRange) {
      if (decision.finalRisk < tc.riskRange[0] || decision.finalRisk > tc.riskRange[1]) {
        testPassed = false;
      }
    }

    if (tc.forbiddenAction && decision.action === tc.forbiddenAction) {
      testPassed = false;
    }

    const isExpectedSafe = tc.expectedClassification === 'safe';
    const isExpectedHighRisk = tc.expectedClassification === 'dangerous' || tc.expectedClassification === 'critical';

    if (isExpectedSafe) {
      totalSafe++;
      if (decision.action === 'allow' && decision.finalRisk < 30) {
        safeCorrect++;
      } else {
        falsePositives++;
        testPassed = false;
      }
    }

    if (isExpectedHighRisk) {
      totalHighRisk++;
      if (decision.action === 'allow') {
        falseAllowCount++;
        testPassed = false;
      }
      if (decision.finalRisk >= 60) {
        highRiskCorrect++;
      } else {
        falseNegatives++;
        testPassed = false;
      }
    }

    // Prompt injection containment metric:
    // For active injection attacks, verify the attack is neutralized (cannot force allow, locked by safety rule)
    // For benign security research discussions, verify legitimate discussion is safely allowed without false positive.
    if (tc.category === 'prompt_injection') {
      totalPromptInjections++;
      const isBenignResearch = tc.expectedClassification === 'safe';
      if (isBenignResearch) {
        if (decision.action === 'allow' && decision.finalRisk < 30) {
          promptInjectionContained++;
        }
      } else {
        if (decision.action !== 'allow' && decision.forbidAllow) {
          promptInjectionContained++;
        }
      }
    }

    const detectedTypes = new Set(heuristicData.signals.map(s => s.type));
    let allRequiredEvidencePresent = true;
    for (const req of (tc.requiredEvidence || [])) {
      if (!detectedTypes.has(req)) {
        allRequiredEvidencePresent = false;
        break;
      }
    }
    if (allRequiredEvidencePresent) evidenceMatchedCount++;

    if (testPassed) {
      passed++;
      console.log(`[PASS] ${tc.id.padEnd(12)} | ${tc.category.padEnd(24)} | Risk: ${String(decision.finalRisk).padStart(3)}/100 | Class: ${decision.finalClassification.padEnd(10)} | Action: ${decision.action.padEnd(10)} | ${tc.description}`);
    } else {
      failed++;
      console.log(`[FAIL] ${tc.id.padEnd(12)} | ${tc.category.padEnd(24)} | Risk: ${String(decision.finalRisk).padStart(3)} (Range: ${tc.riskRange ? tc.riskRange.join('-') : 'N/A'}) | Action: ${decision.action} (Forbidden: ${tc.forbiddenAction || 'none'}) | ${tc.description}`);
    }
  }

  const safeAccuracy = totalSafe > 0 ? Math.round((safeCorrect / totalSafe) * 100) : 100;
  const riskDetectionRate = totalHighRisk > 0 ? Math.round((highRiskCorrect / totalHighRisk) * 100) : 100;
  const injectionContainmentRate = totalPromptInjections > 0 ? Math.round((promptInjectionContained / totalPromptInjections) * 100) : 100;
  const evidenceCoverageRate = Math.round((evidenceMatchedCount / testCases.length) * 100);

  console.log('\n============================================================');
  console.log(' FINAL ADVERSARIAL EVALUATION SUMMARY');
  console.log('============================================================');
  console.log(`Total Adversarial Cases:    ${testCases.length}`);
  console.log(`Passed:                     ${passed} / ${testCases.length} (${Math.round((passed / testCases.length) * 100)}%)`);
  console.log(`Failed:                     ${failed}`);
  console.log(`False Positives:            ${falsePositives}`);
  console.log(`False Negatives:            ${falseNegatives}`);
  console.log(`FALSE ALLOW COUNT:          ${falseAllowCount} (Strict Target: 0)`);
  console.log(`Safe Accuracy:              ${safeAccuracy}%`);
  console.log(`High-Risk Detection Rate:   ${riskDetectionRate}%`);
  console.log(`Prompt Injection Contained: ${injectionContainmentRate}% (${promptInjectionContained}/${totalPromptInjections})`);
  console.log(`Evidence Rule Coverage:     ${evidenceCoverageRate}%`);
  console.log('============================================================\n');

  if (failed > 0 || falseAllowCount > 0) {
    process.exit(1);
  }
}

runEvaluation();

const fs = require('fs');
const path = require('path');

// Standalone evaluator implementing identical logic to lib/heuristics.ts, lib/url-analysis.ts, lib/security-decision.ts

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
  'apple.com',
  'icloud.com',
  'amazon.com',
  'paypal.com',
  'wikipedia.org',
  'openai.com',
  'duckduckgo.com',
  'yahoo.com',
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

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.click', '.gq', '.tk', '.ml', '.cc', '.buzz', '.work', '.rest', '.fit', '.cf', '.ga', '.invalid'];

function extractUrlFeatures(rawUrl) {
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
    const suspiciousTld = SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld));

    const pathStr = parsed.pathname.toLowerCase();
    const trusted = isTrustedDomain(hostname);
    const isSearchEngine = isSearchEngineUrl(parsed);

    // Suppress path-based signals for legitimate search engine URLs (path = /search, user content in ?q=...)
    const loginPath = !isSearchEngine && (pathStr.includes('login') || pathStr.includes('signin') || pathStr.includes('sign-in') || pathStr.includes('auth'));
    const verifyPath = !isSearchEngine && (pathStr.includes('verify') || pathStr.includes('verification') || pathStr.includes('kyc'));
    const accountPath = !isSearchEngine && (pathStr.includes('account') || pathStr.includes('profile') || pathStr.includes('recovery') || pathStr.includes('update'));
    const securityPath = !isSearchEngine && (pathStr.includes('security') || pathStr.includes('secure') || pathStr.includes('authenticate'));
    const paymentPath = !isSearchEngine && (pathStr.includes('payment') || pathStr.includes('pay') || pathStr.includes('checkout') || pathStr.includes('invoice') || pathStr.includes('confirm'));

    const registrableDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
    const publicSuffix = parts.length >= 1 ? parts[parts.length - 1] : '';

    let lookalikeBrand = null;
    let lookalikeCertainty = null;

    // Only perform lookalike detection on untrusted domains
    if (!trusted) {
      for (const brand of KNOWN_BRANDS) {
        const homoglyphs = brand.replace(/o/g, '0').replace(/l/g, '1').replace(/i/g, '1').replace(/e/g, '3');
        if (homoglyphs !== brand && hostname.includes(homoglyphs)) {
          lookalikeBrand = brand;
          lookalikeCertainty = 'substitutions';
          break;
        }
        if (hostname.includes('g00gle') || hostname.includes('paypa1') || hostname.includes('micros0ft') || hostname.includes('app1e')) {
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
                             hostname.endsWith(`.${brand}.net`);
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
      registrableDomain,
      publicSuffix,
      path: pathStr,
      isIpHost,
      isLocalhost,
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
    };
  } catch {
    return null;
  }
}

function scoreUrlFeatures(features) {
  if (!features) return { score: 0, signals: [] };
  let score = 0;
  const signals = [];

  // Early-return: trusted search engine with clean structure → zero risk
  // (google.com/search?q=cybersecurity+threat+intelligence must NOT be suspicious)
  if (features.isSearchEngine && features.isTrustedDomain) {
    if (!features.hasCredentialsInUrl && !features.isIpHost && !features.lookalikeBrand) {
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

  // Trusted domain reduction: -30 points (matches trusted-domains.ts getTrustedDomainScore)
  if (features.isTrustedDomain && !features.lookalikeBrand && !features.isIpHost) {
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
    return { signals, score: Math.max(0, Math.min(100, score)), urlFeatures: null };
  }

  let targetUrl = '';
  if (type === 'url' || content.trim().startsWith('http://') || content.trim().startsWith('https://')) {
    targetUrl = content.trim();
  } else {
    const urlMatch = content.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) targetUrl = urlMatch[0];
  }

  let urlFeatures = null;
  if (targetUrl) {
    urlFeatures = extractUrlFeatures(targetUrl);
    if (urlFeatures) {
      const { score: urlScore, signals: urlSignals } = scoreUrlFeatures(urlFeatures);
      score += urlScore;
      signals.push(...urlSignals);
    }
  }

  const lower = content.toLowerCase();
  const urgencyWords = ['urgent', 'immediately', 'act now', 'final warning', 'account suspended', 'account blocked', 'within 2 hours', 'verify now', 'suspended', 'disabled', 'action requested'];
  const urgencyMatches = urgencyWords.filter((w) => lower.includes(w));
  if (urgencyMatches.length > 0) {
    const isHigh = urgencyMatches.some((m) => ['urgent', 'final warning', 'suspended', 'disabled', 'within 2 hours', 'immediately'].includes(m));
    score += isHigh ? 35 : 20;
    signals.push({ type: 'urgency', severity: isHigh ? 'high' : 'medium', title: 'Urgency', description: 'Urgency detected' });
  }

  const credWords = ['password', 'otp', 'pin', 'login', 'sign in', 'verify account', 'kyc', 'security code', 'new device'];
  if (!lower.includes('never share') && !lower.includes('do not share')) {
    const credMatches = credWords.filter((w) => lower.includes(w));
    if (credMatches.length > 0) {
      const isHigh = credMatches.some((m) => ['password', 'otp', 'pin', 'security code', 'kyc'].includes(m));
      score += isHigh ? 35 : 20;
      signals.push({ type: 'credential_request', severity: isHigh ? 'high' : 'medium', title: 'Credential Request', description: 'Credentials demanded' });
    }
  }

  const payWords = ['processing fee', 'claim your prize', 'pay now', 'upi pin', 'transfer fee'];
  const generalPayWords = ['payment', 'pay', 'fee', 'upi', 'invoice', 'billing', 'subscription', 'renew'];
  if (payWords.some((w) => lower.includes(w))) {
    score += 30;
    signals.push({ type: 'payment_request', severity: 'high', title: 'Payment Demand', description: 'Fee demanded' });
  } else if (generalPayWords.some((w) => lower.includes(w))) {
    score += 20;
    signals.push({ type: 'payment_request', severity: 'medium', title: 'Payment Mention', description: 'Payment mentioned' });
  }

  const deliveryTerms = ['parcel', 'package', 'delivery', 'redelivery', 'courier'];
  const actionTerms = ['fee', 'pay', 'cancel', 'prevent cancellation', 'waiting'];
  if (deliveryTerms.some((d) => lower.includes(d)) && actionTerms.some((a) => lower.includes(a))) {
    score += 25;
    signals.push({ type: 'delivery_scam', severity: 'high', title: 'Delivery Scam', description: 'Delivery fee demanded' });
  }

  const lotteryTerms = ['won', 'lottery', 'prize', 'congratulations', '₹', '$'];
  const feeTerms = ['processing fee', 'claim', 'pay', 'fee immediately', 'claim your prize'];
  if (lotteryTerms.filter((l) => lower.includes(l)).length >= 2 && feeTerms.some((f) => lower.includes(f))) {
    score += 40;
    signals.push({ type: 'financial_scam', severity: 'critical', title: 'Lottery Scam', description: 'Advance fee demanded' });
  }

  if (urlFeatures && urlFeatures.isTrustedDomain && !urlFeatures.lookalikeBrand && !urlFeatures.isIpHost) {
    score = Math.max(0, score - 30);
  }

  return {
    signals,
    score: Math.max(0, Math.min(100, score)),
    urlFeatures,
  };
}

// Evaluate decision with Hard Safety Rules
function evaluateDecision(heuristicScore, signals, inputType) {
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
  if (hasLookalike && (hasAuthPath || hasSecurityPath || hasPaymentPath)) {
    finalRisk = Math.max(finalRisk, 85);
    forbidAllow = true;
    forceAction = 'block';
  }
  if (hasCredentialRequest && hasUrgency) {
    finalRisk = Math.max(finalRisk, 65);
    forbidAllow = true;
    if (hasLookalike || hasSuspiciousTld) {
      finalRisk = Math.max(finalRisk, 80);
      forceAction = 'block';
    }
  }
  if (hasPaymentRequest && (hasDeliveryScam || hasFinancialScam || (hasUrgency && hasPaymentPath))) {
    finalRisk = Math.max(finalRisk, 75);
    forbidAllow = true;
    forceAction = 'quarantine';
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
  if (hasCredentialRequest || hasAuthPath || (hasLookalike && (hasAuthPath || hasSecurityPath))) {
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
  console.log(' SHIELDSENSE — FINAL REGRESSION EVALUATION');
  console.log(' Deterministic Security Decision Engine Benchmark');
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

  console.log(`Evaluating ${testCases.length} golden test cases...\n`);

  for (const tc of testCases) {
    const heuristicData = extractSignals(tc.content, tc.type);

    if (tc.type === 'url') {
      const uFeatures = extractUrlFeatures(tc.content);
      if (uFeatures) {
        const { score: uScore, signals: uSignals } = scoreUrlFeatures(uFeatures);
        for (const us of uSignals) {
          if (!heuristicData.signals.some((s) => s.type === us.type)) {
            heuristicData.signals.push(us);
          }
        }
        heuristicData.score = Math.max(heuristicData.score, uScore);
      }
    }

    const decision = evaluateDecision(heuristicData.score, heuristicData.signals, tc.type);

    let testPassed = true;

    if (tc.expectedRiskMax !== undefined && decision.finalRisk > tc.expectedRiskMax) {
      testPassed = false;
    }
    if (tc.expectedRiskMin !== undefined && decision.finalRisk < tc.expectedRiskMin) {
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
      }
    }

    if (testPassed) {
      passed++;
      console.log(`[PASS] ${tc.id.padEnd(14)} | Risk: ${String(decision.finalRisk).padStart(3)}/100 | Class: ${decision.finalClassification.padEnd(10)} | Action: ${decision.action.padEnd(10)} | ${tc.description}`);
    } else {
      failed++;
      console.log(`[FAIL] ${tc.id.padEnd(14)} | Risk: ${String(decision.finalRisk).padStart(3)} (Expected ${tc.expectedRiskMin}-${tc.expectedRiskMax}) | Action: ${decision.action} | ${tc.description}`);
    }
  }

  const safeAccuracy = totalSafe > 0 ? Math.round((safeCorrect / totalSafe) * 100) : 100;
  const riskDetectionRate = totalHighRisk > 0 ? Math.round((highRiskCorrect / totalHighRisk) * 100) : 100;

  console.log('\n============================================================');
  console.log(' FINAL EVALUATION SUMMARY');
  console.log('============================================================');
  console.log(`Total Golden Cases:  ${testCases.length}`);
  console.log(`Passed:              ${passed} / ${testCases.length} (${Math.round((passed / testCases.length) * 100)}%)`);
  console.log(`Failed:              ${failed}`);
  console.log(`False Positives:     ${falsePositives}`);
  console.log(`False Negatives:     ${falseNegatives}`);
  console.log(`FALSE ALLOW COUNT:   ${falseAllowCount} (Target: 0)`);
  console.log(`Safe Accuracy:       ${safeAccuracy}%`);
  console.log(`Risk Detection Rate: ${riskDetectionRate}%`);
  console.log('============================================================\n');

  if (failed > 0 || falseAllowCount > 0) {
    process.exit(1);
  }
}

runEvaluation();

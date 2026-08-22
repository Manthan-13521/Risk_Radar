const fs = require('fs');
const path = require('path');

// Replicate identical logic as lib/ for standalone Node.js evaluation
const TRUSTED_DOMAINS = new Set([
  'google.com',
  'github.com',
  'openai.com',
  'microsoft.com',
  'apple.com',
  'wikipedia.org',
  'example.com',
  'example.org',
  'example.net',
]);

function isTrustedDomain(hostname) {
  if (!hostname) return false;
  const cleanHost = hostname.toLowerCase().trim();
  if (TRUSTED_DOMAINS.has(cleanHost)) return true;
  for (const domain of TRUSTED_DOMAINS) {
    if (cleanHost.endsWith('.' + domain)) return true;
  }
  return false;
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
    const loginPath = pathStr.includes('login') || pathStr.includes('signin') || pathStr.includes('sign-in') || pathStr.includes('auth');
    const verifyPath = pathStr.includes('verify') || pathStr.includes('verification') || pathStr.includes('kyc');
    const accountPath = pathStr.includes('account') || pathStr.includes('profile') || pathStr.includes('recovery') || pathStr.includes('update');
    const securityPath = pathStr.includes('security') || pathStr.includes('secure') || pathStr.includes('authenticate');
    const paymentPath = pathStr.includes('payment') || pathStr.includes('pay') || pathStr.includes('checkout') || pathStr.includes('invoice') || pathStr.includes('confirm');

    const registrableDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
    const publicSuffix = parts.length >= 1 ? parts[parts.length - 1] : '';

    let lookalikeBrand = null;
    let lookalikeCertainty = null;

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

    const trusted = isTrustedDomain(hostname);

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
    signals.push({ type: 'credential_path', severity: 'high', title: 'Login Path', description: 'Sensitive path' });
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

  if (features.isTrustedDomain && !features.lookalikeBrand && !features.isIpHost) {
    score -= 25;
  }

  const finalScore = Math.max(0, Math.min(100, score));
  return { score: finalScore, signals };
}

function extractSignals(content, type = 'message') {
  const signals = [];
  let score = 0;

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
    score = Math.max(0, score - 25);
  }

  return {
    signals,
    score: Math.max(0, Math.min(100, score)),
    urlFeatures,
  };
}

function determineAction(risk, confidence) {
  if (risk < 30 && confidence >= 60) return 'allow';
  if (risk >= 80 && confidence >= 70) return 'block';
  if (risk >= 60 && confidence >= 50) return 'quarantine';
  return 'warn';
}

function runEvaluation() {
  console.log('============================================================');
  console.log(' SHIELDSENSE — HACKATHON REGRESSION EVALUATION');
  console.log(' Deterministic Heuristic & Policy Calibration Benchmark');
  console.log('============================================================\n');

  const corpusPath = path.join(__dirname, '../tests/fixtures/security-cases.json');
  const rawData = fs.readFileSync(corpusPath, 'utf8');
  const testCases = JSON.parse(rawData);

  let passed = 0;
  let failed = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let safeCorrect = 0;
  let totalSafe = 0;
  let riskCorrect = 0;
  let totalRisk = 0;

  console.log(`Evaluating ${testCases.length} synthetic cases...\n`);

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

    const calculatedRisk = heuristicData.score;
    const action = determineAction(calculatedRisk, 85);

    let testPassed = true;

    if (tc.expectedRiskMax !== undefined && calculatedRisk > tc.expectedRiskMax) {
      testPassed = false;
    }
    if (tc.expectedRiskMin !== undefined && calculatedRisk < tc.expectedRiskMin) {
      testPassed = false;
    }

    const isExpectedSafe = tc.expectedClassification === 'safe';
    const isCalculatedSafe = calculatedRisk < 30;

    if (isExpectedSafe) {
      totalSafe++;
      if (isCalculatedSafe) safeCorrect++;
      else falsePositives++;
    } else if (tc.expectedClassification === 'dangerous' || tc.expectedClassification === 'critical') {
      totalRisk++;
      if (calculatedRisk >= 50) riskCorrect++;
      else falseNegatives++;
    }

    if (testPassed) {
      passed++;
      console.log(`[PASS] ${tc.id.padEnd(14)} | Score: ${String(calculatedRisk).padStart(3)} | Action: ${action.padEnd(10)} | ${tc.description}`);
    } else {
      failed++;
      console.log(`[FAIL] ${tc.id.padEnd(14)} | Score: ${String(calculatedRisk).padStart(3)} (Expected: ${tc.expectedRiskMin ?? 0}-${tc.expectedRiskMax ?? 100}) | ${tc.description}`);
    }
  }

  const safeAccuracy = totalSafe > 0 ? Math.round((safeCorrect / totalSafe) * 100) : 100;
  const riskDetectionRate = totalRisk > 0 ? Math.round((riskCorrect / totalRisk) * 100) : 100;

  console.log('\n============================================================');
  console.log(' EVALUATION SUMMARY (Hackathon Regression Evaluation)');
  console.log('============================================================');
  console.log(`Total Cases:        ${testCases.length}`);
  console.log(`Passed:             ${passed} / ${testCases.length} (${Math.round((passed / testCases.length) * 100)}%)`);
  console.log(`Failed:             ${failed}`);
  console.log(`False Positives:    ${falsePositives}`);
  console.log(`False Negatives:    ${falseNegatives}`);
  console.log(`Safe Accuracy:      ${safeAccuracy}%`);
  console.log(`Risk Detection Rate:${riskDetectionRate}%`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runEvaluation();

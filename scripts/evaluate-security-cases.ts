import fs from 'fs';
import path from 'path';
import { extractSignals } from '../lib/heuristics';
import { extractUrlFeatures, scoreUrlFeatures } from '../lib/url-analysis';
import { classifyRisk, determineAction } from '../lib/policy-engine';

interface TestCase {
  id: string;
  type: string;
  content: string;
  expectedClassification: string;
  expectedRiskMin?: number;
  expectedRiskMax?: number;
  description: string;
}

function runEvaluation() {
  console.log('============================================================');
  console.log(' RISK RADAR — HACKATHON REGRESSION EVALUATION');
  console.log(' Deterministic Heuristic & Policy Calibration Benchmark');
  console.log('============================================================\n');

  const corpusPath = path.join(__dirname, '../tests/fixtures/security-cases.json');
  const rawData = fs.readFileSync(corpusPath, 'utf8');
  const testCases: TestCase[] = JSON.parse(rawData);

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
    // Assume high confidence for deterministic evaluation baseline
    const classification = classifyRisk(calculatedRisk, 85);
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

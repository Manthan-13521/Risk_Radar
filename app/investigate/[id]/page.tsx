export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { generateVoiceSummary } from '@/lib/voice-summary';
import VoiceVerdict from '@/components/VoiceVerdict';
import ThreatModal from '@/components/ThreatModal';
import SuspiciousCard from '@/components/SuspiciousCard';
import Link from 'next/link';

export default async function InvestigationResult({ params }: { params: { id: string } }) {
  if (!ObjectId.isValid(params.id)) {
    return <div className="p-12 text-white text-center">Invalid investigation ID.</div>;
  }

  const db = await getDb();
  const scan = await db.collection('scans').findOne({ _id: new ObjectId(params.id) });

  if (!scan) return <div className="p-12 text-white text-center">Investigation not found.</div>;

  const voiceText = generateVoiceSummary({
    riskScore: scan.riskScore,
    confidenceScore: scan.confidenceScore,
    classification: scan.classification,
    attackerIntent: scan.attackerIntent ?? 'uncertain',
    explanation: scan.explanation ?? '',
    evidence: (scan.evidence ?? []) as Array<{ severity: string; title: string }>,
    recommendedAction: scan.recommendedAction,
    dnaOverlap: scan.dnaOverlap as Array<{ overlapPercent: number }> | undefined,
  });

  const formattedIntent = (scan.attackerIntent as string || 'uncertain')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const isSafeAndConfident = scan.riskScore < 30 && scan.confidenceScore >= 60;
  const isHighRisk = scan.riskScore >= 60 && scan.confidenceScore >= 45;
  const isSuspicious = scan.riskScore >= 30 && scan.riskScore < 60;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Threat Pop-up Modal for high-risk attacks */}
      {isHighRisk && (
        <ThreatModal
          riskScore={scan.riskScore}
          confidenceScore={scan.confidenceScore}
          classification={scan.classification}
          attackerIntent={scan.attackerIntent}
          evidence={scan.evidence ?? []}
          recommendedAction={scan.recommendedAction}
          scanId={params.id}
          actionTaken={scan.actionTaken}
        />
      )}

      {/* Breadcrumb / Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/history"
          className="text-xs text-zinc-400 hover:text-teal-300 transition flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Back to Scan Telemetry</span>
        </Link>
        <span className="text-[11px] font-mono text-zinc-500">
          ID: {params.id}
        </span>
      </div>

      {/* Safe State Banner */}
      {isSafeAndConfident && (
        <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-5 flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🟢</span>
            <div>
              <h3 className="font-bold text-emerald-300 text-sm">NO MALICIOUS SIGNALS DETECTED</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Structural heuristics and AI contextual analysis confirmed this artifact is benign.
              </p>
            </div>
          </div>
          <span className="text-xs bg-emerald-900/80 text-emerald-300 font-mono font-bold px-3 py-1 rounded-md border border-emerald-700/60">
            VERIFIED CLEAN
          </span>
        </div>
      )}

      {/* Suspicious Warning */}
      {isSuspicious && (
        <SuspiciousCard
          riskScore={scan.riskScore}
          confidenceScore={scan.confidenceScore}
          explanation={scan.explanation}
        />
      )}

      {/* Header Verdict Card */}
      <div
        className={`p-6 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
          scan.riskScore >= 80
            ? 'bg-red-950/30 border-red-900/60 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
            : scan.riskScore >= 50
            ? 'bg-orange-950/30 border-orange-900/60 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
            : 'bg-emerald-950/30 border-emerald-900/60 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
        }`}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
            {scan.classification === 'safe' && '🟢 LOW RISK'}
            {scan.classification === 'suspicious' && '🟡 SUSPICIOUS'}
            {scan.classification === 'dangerous' && '🟠 DANGEROUS'}
            {scan.classification === 'critical' && '🔴 CRITICAL THREAT'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-400 font-mono">
            <span>{new Date(scan.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span className="uppercase text-zinc-300 font-bold">{scan.inputType}</span>
            <span>•</span>
            {scan.analysisStatus === 'complete' ? (
              <span className="text-emerald-400">✓ AI reasoning verified</span>
            ) : (
              <span className="text-yellow-400">⚠ Deterministic policy engine</span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="text-center bg-[#070b12] px-4 py-2.5 rounded-lg border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Risk Score</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {scan.riskScore} <span className="text-xs text-zinc-500">/100</span>
            </div>
          </div>
          <div className="text-center bg-[#070b12] px-4 py-2.5 rounded-lg border border-zinc-800">
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Confidence</div>
            <div className="text-2xl font-bold font-mono text-teal-400 mt-0.5">
              {scan.confidenceScore} <span className="text-xs text-zinc-500">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Verdict Briefing */}
      <VoiceVerdict investigationId={params.id} voiceText={voiceText} />

      {/* Recommended Action Panel */}
      <div className="bg-[#0b101b] border border-zinc-800/80 p-5 md:p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h2 className="text-xs text-zinc-400 uppercase font-semibold tracking-wider mb-1">
            Enforced Security Policy Action
          </h2>
          <div
            className={`text-2xl md:text-3xl font-bold font-mono uppercase ${
              scan.recommendedAction === 'allow'
                ? 'text-teal-400'
                : scan.recommendedAction === 'warn'
                ? 'text-yellow-400'
                : 'text-red-500'
            }`}
          >
            {scan.recommendedAction === 'allow' ? '✅' : scan.recommendedAction === 'warn' ? '⚠️' : '🔒'}{' '}
            {scan.recommendedAction}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Simulated policy action executed in protected sandbox</p>
        </div>

        {scan.actionTaken ? (
          <div className="bg-zinc-800/80 px-5 py-2.5 rounded-lg font-semibold text-zinc-200 text-xs border border-zinc-700 flex items-center gap-2">
            <span>✓</span> Simulated {scan.actionTaken} applied
          </div>
        ) : (
          <form action={`/api/scans/${scan._id}/action`} method="POST" className="flex gap-2">
            <button
              type="submit"
              name="action"
              value={scan.recommendedAction}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-lg ${
                scan.recommendedAction === 'allow'
                  ? 'bg-teal-600 hover:bg-teal-500 text-white'
                  : scan.recommendedAction === 'warn'
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-black'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              Approve simulated {scan.recommendedAction}
            </button>
          </form>
        )}
      </div>

      {/* Attacker Intent & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#0b101b] p-5 rounded-xl border border-zinc-800/80">
          <h3 className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mb-2">
            Attacker Intent
          </h3>
          <p className="text-lg font-bold text-teal-300">{formattedIntent}</p>
        </div>
        <div className="md:col-span-2 bg-[#0b101b] p-5 rounded-xl border border-zinc-800/80">
          <h3 className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mb-2">
            AI Investigation Analysis
          </h3>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">{scan.explanation}</p>
        </div>
      </div>

      {/* Corroborating Evidence Signals */}
      <div className="bg-[#0b101b] border border-zinc-800/80 p-5 md:p-6 rounded-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <span>🔍</span> Corroborating Evidence Signals
        </h2>
        {(!scan.evidence || (scan.evidence as unknown[]).length === 0) ? (
          <div className="text-zinc-500 text-xs p-4 bg-[#070b12] rounded-lg">
            No malicious signals identified.
          </div>
        ) : (
          <div className="space-y-2.5">
            {(scan.evidence as Array<Record<string, string>>).map((e, i: number) => (
              <div
                key={i}
                className="bg-[#0e1422] border border-zinc-800/80 p-4 rounded-lg flex flex-col md:flex-row gap-3 items-start"
              >
                <span
                  className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                    e.severity === 'critical' || e.severity === 'high'
                      ? 'bg-red-950 text-red-400 border border-red-900/60'
                      : e.severity === 'medium'
                      ? 'bg-amber-950 text-amber-400 border border-orange-900/60'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {e.severity}
                </span>
                <div>
                  <h4 className="font-semibold text-sm text-white">{e.title}</h4>
                  <p className="text-zinc-400 text-xs mt-0.5">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Threat DNA Signatures */}
      <div className="bg-[#0b101b] border border-zinc-800/80 p-5 md:p-6 rounded-xl space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <span>🧬</span> Threat DNA Behavioral Characteristics
        </h2>
        <div className="flex flex-wrap gap-2 pt-1">
          {scan.dnaTags && (scan.dnaTags as string[]).length > 0 ? (
            (scan.dnaTags as string[]).map((tag: string, i: number) => (
              <span
                key={i}
                className="bg-[#0e1422] text-teal-300 border border-zinc-800 text-xs px-3 py-1 rounded-md font-mono"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-zinc-500 text-xs italic">No DNA signatures assigned.</span>
          )}
        </div>
      </div>
    </div>
  );
}
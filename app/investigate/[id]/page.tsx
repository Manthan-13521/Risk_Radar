export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { generateVoiceSummary } from '@/lib/voice-summary';
import VoiceVerdict from '@/components/VoiceVerdict';
import ThreatModal from '@/components/ThreatModal';
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
    classification: scan.classification,
  });

  const formattedIntent = (scan.attackerIntent as string || 'uncertain')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const isHighRisk = scan.riskScore >= 60;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1250px] mx-auto bg-black text-white">
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

      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-4">
        <Link
          href="/scanner"
          className="text-xs text-zinc-400 hover:text-teal-300 transition flex items-center gap-1.5 font-semibold"
        >
          <span>←</span>
          <span>New Investigation</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/history"
            className="text-xs text-zinc-400 hover:text-white transition"
          >
            Telemetry History
          </Link>
          <span className="text-[11px] font-mono text-zinc-600">ID: {params.id.substring(0, 8)}...</span>
        </div>
      </div>

      {/* 1. HERO VERDICT & RISK METRICS */}
      <div
        className={`p-6 md:p-8 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl ${
          scan.riskScore >= 80
            ? 'bg-[#140606] border-red-900/80 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
            : scan.riskScore >= 40
            ? 'bg-[#140d05] border-amber-900/80 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
            : 'bg-[#04120a] border-emerald-900/80 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {scan.classification === 'safe' && '🟢'}
              {scan.classification === 'suspicious' && '🟡'}
              {scan.classification === 'dangerous' && '🟠'}
              {scan.classification === 'critical' && '🔴'}
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight font-mono">
                {scan.classification === 'safe' && 'SAFE VERDICT'}
                {scan.classification === 'suspicious' && 'SUSPICIOUS RISK'}
                {scan.classification === 'dangerous' && 'DANGEROUS THREAT'}
                {scan.classification === 'critical' && 'CRITICAL ATTACK'}
              </h1>
              <div className="text-xs text-zinc-400 font-mono mt-0.5 capitalize">
                Payload Type: <strong className="text-zinc-200">{scan.inputType}</strong> • Intent: <strong className="text-teal-300">{formattedIntent}</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-400 font-mono">
            <span>{new Date(scan.createdAt).toLocaleString()}</span>
            <span>•</span>
            {scan.analysisStatus === 'complete' ? (
              <span className="text-emerald-400 font-semibold">✓ Dual-Engine Verified (Heuristics + AI)</span>
            ) : (
              <span className="text-amber-400 font-semibold">⚠ Local Deterministic Policy Guard Active</span>
            )}
          </div>
        </div>

        {/* Big Bold Metric Gauges */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <div className="flex-1 sm:flex-initial text-center bg-black/60 px-6 py-4 rounded-xl border border-zinc-800 shadow-inner">
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Risk Score</div>
            <div className={`text-3xl sm:text-4xl font-extrabold font-mono mt-1 ${
              scan.riskScore >= 60 ? 'text-red-400' : scan.riskScore >= 30 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {scan.riskScore}<span className="text-xs text-zinc-500 font-normal">/100</span>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial text-center bg-black/60 px-6 py-4 rounded-xl border border-zinc-800 shadow-inner">
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Confidence</div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-teal-400 mt-1">
              {scan.confidenceScore}<span className="text-xs text-zinc-500 font-normal">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AUTOMATIC VOICE VERDICT BRIEFING */}
      <VoiceVerdict
        investigationId={params.id}
        voiceText={voiceText}
        riskScore={scan.riskScore}
        classification={scan.classification}
        attackerIntent={scan.attackerIntent ?? 'uncertain'}
        recommendedAction={scan.recommendedAction}
      />

      {/* 3. POLICY ENFORCEMENT & HUMAN-GATED ACTION */}
      <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-1 font-mono">
            Authoritative Security Policy Decision
          </div>
          <div
            className={`text-2xl md:text-3xl font-extrabold font-mono uppercase ${
              scan.recommendedAction === 'allow'
                ? 'text-teal-400'
                : scan.recommendedAction === 'warn'
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {scan.recommendedAction === 'allow' ? '✅' : scan.recommendedAction === 'warn' ? '⚠️' : '🔒'}{' '}
            {scan.recommendedAction}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {scan.recommendedAction === 'allow'
              ? 'Artifact cleared — safe to interact.'
              : scan.recommendedAction === 'warn'
              ? 'Suspicious indicators detected — user review recommended.'
              : 'High-risk malicious finding — protected quarantine or block enforced.'}
          </p>
        </div>

        {scan.actionTaken ? (
          <div className="bg-[#141414] px-5 py-3 rounded-xl font-bold text-zinc-200 text-xs border border-zinc-700 flex items-center gap-2 shadow-inner">
            <span className="text-emerald-400">✓</span> Simulated {scan.actionTaken} applied
          </div>
        ) : (
          <form action={`/api/scans/${scan._id}/action`} method="POST" className="flex gap-2">
            <button
              type="submit"
              name="action"
              value={scan.recommendedAction}
              className={`px-6 py-3 rounded-xl text-xs font-extrabold transition shadow-lg flex items-center gap-2 ${
                scan.recommendedAction === 'allow'
                  ? 'bg-teal-500 hover:bg-teal-400 text-black shadow-teal-950/60'
                  : scan.recommendedAction === 'warn'
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-950/60'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/60'
              }`}
            >
              <span>🔒</span>
              <span>Approve Simulated {scan.recommendedAction.toUpperCase()}</span>
            </button>
          </form>
        )}
      </div>

      {/* 4. WHY SHIELDSENSE FLAGGED THIS — CORROBORATING EVIDENCE */}
      <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 md:p-8 rounded-2xl space-y-4 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 font-mono">
          <span>🔍</span>
          <span>Why ShieldSense Flagged This</span>
        </h2>
        <p className="text-xs text-zinc-400">
          Structural heuristic findings and contextual analysis explaining the threat verdict:
        </p>

        {(!scan.evidence || (scan.evidence as unknown[]).length === 0) ? (
          <div className="text-zinc-500 text-xs p-4 bg-[#111111] rounded-xl border border-[#222222]">
            No malicious structural signals identified. Artifact verified clean.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {(scan.evidence as Array<Record<string, string>>).map((e, i: number) => (
              <div
                key={i}
                className="bg-[#111111] border border-[#222222] p-4 rounded-xl flex items-start gap-3 shadow-inner"
              >
                <span
                  className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                    e.severity === 'critical' || e.severity === 'high'
                      ? 'bg-red-950 text-red-400 border border-red-900/60'
                      : e.severity === 'medium'
                      ? 'bg-amber-950 text-amber-400 border border-orange-900/60'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {e.severity}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-white truncate">{e.title}</h4>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. THREAT DNA — BEHAVIORAL MEMORY */}
      <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 md:p-8 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🧬</span>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Threat DNA Behavioral Memory
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Clustered attack traits extracted from structural markers:
              </p>
            </div>
          </div>
          <Link href="/threat-dna" className="text-xs text-teal-400 hover:underline">
            DNA Explorer →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {scan.dnaTags && (scan.dnaTags as string[]).length > 0 ? (
            (scan.dnaTags as string[]).map((tag: string, i: number) => (
              <span
                key={i}
                className="bg-[#111111] text-teal-300 border border-[#262626] text-xs px-3 py-1.5 rounded-lg font-mono flex items-center gap-1.5"
              >
                <span>🏷</span>
                <span>{tag}</span>
              </span>
            ))
          ) : (
            <span className="text-zinc-500 text-xs italic">No attack signatures assigned.</span>
          )}
        </div>

        {scan.dnaOverlap && (scan.dnaOverlap as Array<Record<string, unknown>>).length > 0 && (
          <div className="p-4 bg-[#0e1422] border border-teal-900/50 rounded-xl mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <div>
                <div className="text-xs font-bold text-teal-300">
                  {Number((scan.dnaOverlap as Array<Record<string, unknown>>)[0].overlapPercent)}% Behavioral Pattern Match
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Matches previously observed attack vector with shared behavioral DNA traits.
                </div>
              </div>
            </div>
            <Link
              href="/threat-dna"
              className="px-3 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-lg text-xs font-bold hover:bg-teal-500/30 transition"
            >
              Compare →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
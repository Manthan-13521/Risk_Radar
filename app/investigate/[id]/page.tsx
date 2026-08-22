export const dynamic = 'force-dynamic';

import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { generateVoiceSummary } from '@/lib/voice-summary';
import VoiceVerdict from '@/components/VoiceVerdict';
import ThreatModal from '@/components/ThreatModal';
import Link from 'next/link';

function formatIntent(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

const VERDICT_CONFIG = {
  safe:      { label: 'NO SIGNIFICANT THREAT',  accent: '#176B52', bg: 'rgba(23,107,82,0.06)',  border: 'rgba(23,107,82,0.25)' },
  suspicious:{ label: 'SUSPICIOUS ACTIVITY',    accent: '#B86A00', bg: 'rgba(184,106,0,0.06)', border: 'rgba(184,106,0,0.25)' },
  dangerous: { label: 'THREAT DETECTED',         accent: '#990011', bg: 'rgba(153,0,17,0.06)',  border: 'rgba(153,0,17,0.25)' },
  critical:  { label: 'CRITICAL THREAT',         accent: '#76000D', bg: 'rgba(118,0,13,0.08)',  border: 'rgba(118,0,13,0.4)' },
};

export default async function InvestigationResult({ params }: { params: { id: string } }) {
  if (!ObjectId.isValid(params.id)) {
    return <div className="p-12 text-center" style={{ color: '#111111' }}>Invalid investigation ID.</div>;
  }

  const db = await getDb();
  const scan = await db.collection('scans').findOne({ _id: new ObjectId(params.id) });
  if (!scan) {
    return <div className="p-12 text-center" style={{ color: '#111111' }}>Investigation not found.</div>;
  }

  const voiceText = generateVoiceSummary({ riskScore: scan.riskScore, classification: scan.classification });
  const isHighRisk = scan.riskScore >= 60;
  const cls = String(scan.classification) as keyof typeof VERDICT_CONFIG;
  const v = VERDICT_CONFIG[cls] || VERDICT_CONFIG.suspicious;

  return (
    <div className="p-6 md:p-10 max-w-[1100px] mx-auto space-y-8" style={{ background: '#FCF6F5' }}>
      {/* Threat Modal for high-risk */}
      {isHighRisk && (
        <ThreatModal
          riskScore={scan.riskScore} confidenceScore={scan.confidenceScore}
          classification={scan.classification} attackerIntent={scan.attackerIntent ?? 'unknown'}
          evidence={scan.evidence ?? []} recommendedAction={scan.recommendedAction}
          scanId={params.id} actionTaken={scan.actionTaken}
        />
      )}

      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/scanner" className="text-xs font-bold" style={{ color: '#990011' }}>← New Investigation</Link>
        <span className="text-[11px] font-mono" style={{ color: '#6F6664' }}>ID: {params.id.substring(0, 8)}…</span>
      </div>

      {/* HERO VERDICT */}
      <div className="rounded-2xl border p-8" style={{ background: v.bg, borderColor: v.border }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: v.accent }}>Risk_Radar Verdict</div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight" style={{ color: '#111111' }}>{v.label}</h1>
            <div className="text-sm" style={{ color: '#6F6664' }}>
              <span className="font-mono capitalize">{cls} classification</span>
              {' · '}
              <span className="capitalize">{formatIntent(String(scan.attackerIntent || 'uncertain'))} intent</span>
            </div>
            <div className="text-xs font-mono" style={{ color: '#6F6664' }}>
              {scan.analysisStatus === 'complete'
                ? '✓ Dual-Engine Verified (Heuristics + AI)'
                : '⚠ Deterministic Policy Guard Active'}
            </div>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="text-center px-6 py-4 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#6F6664' }}>RISK</div>
              <div className="text-4xl font-extrabold font-mono" style={{ color: v.accent }}>{Number(scan.riskScore)}</div>
              <div className="text-xs" style={{ color: '#6F6664' }}>/100</div>
              <div className="text-[10px] mt-1" style={{ color: '#6F6664' }}>How dangerous this behavior appears.</div>
            </div>
            <div className="text-center px-6 py-4 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#6F6664' }}>CONFIDENCE</div>
              <div className="text-4xl font-extrabold font-mono" style={{ color: '#111111' }}>{Number(scan.confidenceScore)}</div>
              <div className="text-xs" style={{ color: '#6F6664' }}>%</div>
              <div className="text-[10px] mt-1" style={{ color: '#6F6664' }}>How strong the evidence is.</div>
            </div>
          </div>
        </div>
      </div>

      {/* VOICE VERDICT */}
      <VoiceVerdict
        investigationId={params.id} voiceText={voiceText}
        riskScore={scan.riskScore} classification={scan.classification}
        attackerIntent={scan.attackerIntent ?? 'uncertain'} recommendedAction={scan.recommendedAction}
      />

      {/* ATTACKER INTENT */}
      <div className="rounded-2xl border p-6" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#6F6664' }}>Attacker Intent</div>
        <div className="text-2xl md:text-3xl font-extrabold uppercase" style={{ color: '#111111' }}>
          {formatIntent(String(scan.attackerIntent || 'uncertain')).toUpperCase()}
        </div>
        <p className="text-sm mt-2" style={{ color: '#6F6664' }}>
          Likely objective based on behavioral heuristics and AI reasoning analysis.
        </p>
      </div>

      {/* POLICY DECISION */}
      <div className="rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-5" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#6F6664' }}>Recommended Action</div>
          <div className="text-3xl font-extrabold uppercase" style={{ color: cls === 'safe' ? '#176B52' : cls === 'suspicious' ? '#B86A00' : '#990011' }}>
            {String(scan.recommendedAction).toUpperCase()}
          </div>
          <p className="text-sm mt-1" style={{ color: '#6F6664' }}>
            {scan.recommendedAction === 'allow' ? 'Artifact cleared — safe to interact.'
              : scan.recommendedAction === 'warn' ? 'Suspicious indicators detected — user review recommended.'
              : 'High-risk finding — quarantine or block enforced.'}
          </p>
        </div>
        {scan.actionTaken ? (
          <div className="px-5 py-3 rounded-xl border text-sm font-bold" style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#176B52' }}>
            ✓ Simulated {String(scan.actionTaken)} applied
          </div>
        ) : (
          <form action={`/api/scans/${scan._id}/action`} method="POST">
            <button
              type="submit" name="action" value={String(scan.recommendedAction)}
              className="px-6 py-3 rounded-xl text-sm font-extrabold text-white transition hover:opacity-90"
              style={{ background: cls === 'safe' ? '#176B52' : cls === 'suspicious' ? '#B86A00' : '#990011' }}
            >
              APPROVE SIMULATED {String(scan.recommendedAction).toUpperCase()}
            </button>
          </form>
        )}
      </div>

      {/* WHY FLAGGED — EVIDENCE */}
      <div id="evidence-section" className="rounded-2xl border" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: '#D5C8C5' }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#111111' }}>WHY THIS WAS FLAGGED</div>
        </div>
        <div className="p-6">
          {(!scan.evidence || (scan.evidence as unknown[]).length === 0) ? (
            <div className="text-sm" style={{ color: '#6F6664' }}>No malicious signals identified. Artifact verified clean.</div>
          ) : (
            <div className="space-y-5">
              {(scan.evidence as Array<Record<string, string>>).map((e, i) => {
                const sevColor = e.severity === 'critical' || e.severity === 'high' ? '#990011' : e.severity === 'medium' ? '#B86A00' : '#6F6664';
                const sevBg = e.severity === 'critical' || e.severity === 'high'
                  ? 'rgba(153,0,17,0.08)' : e.severity === 'medium' ? 'rgba(184,106,0,0.08)' : 'rgba(111,102,100,0.08)';
                return (
                  <div key={i} className="flex gap-4">
                    <div className="mt-0.5 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ background: sevBg, color: sevColor }}>{e.severity}</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm" style={{ color: '#111111' }}>{e.title}</div>
                      <div className="text-sm mt-0.5" style={{ color: '#6F6664' }}>{e.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* THREAT DNA */}
      <div className="rounded-2xl border" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#D5C8C5' }}>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#111111' }}>THREAT DNA</div>
            <div className="text-xs" style={{ color: '#6F6664' }}>Behavioral memory</div>
          </div>
          <Link href="/threat-dna" className="text-xs font-bold" style={{ color: '#990011' }}>Explorer →</Link>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {scan.dnaTags && (scan.dnaTags as string[]).length > 0 ? (
              (scan.dnaTags as string[]).map((tag, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg border text-xs font-mono" style={{ background: '#E7DEDC', borderColor: '#D5C8C5', color: '#111111' }}>{tag}</span>
              ))
            ) : (
              <span className="text-xs italic" style={{ color: '#6F6664' }}>No attack signatures assigned.</span>
            )}
          </div>
          {scan.dnaOverlap && (scan.dnaOverlap as Array<Record<string, unknown>>).length > 0 && (
            <div className="rounded-xl border p-4 flex items-center justify-between" style={{ background: 'rgba(153,0,17,0.05)', borderColor: 'rgba(153,0,17,0.2)' }}>
              <div>
                <div className="text-sm font-bold" style={{ color: '#990011' }}>
                  {Number((scan.dnaOverlap as Array<Record<string, unknown>>)[0].overlapPercent)}% BEHAVIORAL SIMILARITY
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#6F6664' }}>Matches previously observed attack vector.</div>
              </div>
              <Link href="/threat-dna" className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#990011' }}>Compare →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
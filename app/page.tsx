export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDashboardStats } from '@/lib/dashboard';
import { getIncidents } from '@/lib/incident-service';
import InvestigateForm from '@/components/InvestigateForm';
import { IncidentListWithDrawer } from '@/components/IncidentListWithDrawer';
import { IncidentItem } from '@/components/IncidentDrawer';
import DemoVideoPlayer from '@/components/DemoVideoPlayer';
import FakeClickDemo from '@/components/FakeClickDemo';

function clsStyle(cls: string): { bg: string; color: string } {
  if (cls === 'critical') return { bg: '#76000D', color: '#fff' };
  if (cls === 'dangerous') return { bg: '#990011', color: '#fff' };
  if (cls === 'suspicious') return { bg: '#B86A00', color: '#fff' };
  return { bg: '#176B52', color: '#fff' };
}

function formatIntent(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default async function DashboardPage() {
  const [stats, rawIncidents] = await Promise.all([getDashboardStats(), getIncidents(6)]);
  const total = stats.totalScans || 0;
  const threats = stats.threatsDetected || 0;
  const safe = stats.safeCount || 0;
  const activeIncidents = rawIncidents.filter(i => i.status !== 'resolved').length;
  const recent = (stats.recentScans || []).slice(0, 5);

  const serializedIncidents: IncidentItem[] = rawIncidents.slice(0, 4).map(inc => ({
    _id: inc._id ? String(inc._id) : undefined,
    incidentId: inc.incidentId,
    severity: inc.severity,
    status: inc.status,
    riskScore: Number(inc.riskScore),
    confidenceScore: Number(inc.confidenceScore),
    attackerIntent: String(inc.attackerIntent || 'unknown'),
    summary: String(inc.summary || ''),
    evidence: (inc.evidence as Array<{ title?: string; description?: string; severity?: string }>) || [],
    dnaTags: (inc.dnaTags as string[]) || [],
    recommendedAction: String(inc.recommendedAction || ''),
    actionTaken: inc.actionTaken ? String(inc.actionTaken) : undefined,
    scanId: inc.scanId ? String(inc.scanId) : undefined,
    createdAt: inc.createdAt,
  }));

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-12" style={{ background: '#ECE6E2' }}>

      {/* ═══ HERO ═══ */}
      <div className="space-y-5 pb-10 border-b" style={{ borderColor: '#C4B5B0' }}>
        <div className="space-y-2">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: '#990011' }}>
            Risk_Radar · Digital Immune System
          </div>
          <h1 className="text-4xl md:text-[62px] font-extrabold leading-[0.95] tracking-tight" style={{ color: '#111111' }}>
            INVESTIGATE<br />BEFORE YOU<br />INTERACT.
          </h1>
          <p className="text-base mt-3 max-w-lg font-medium" style={{ color: '#554B49' }}>
            Analyze suspicious links, messages and files before they become incidents.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-extrabold text-white tracking-wide transition hover:opacity-90 shadow-md"
            style={{ background: '#990011' }}
          >
            INVESTIGATE AN ARTIFACT →
          </Link>
          <Link
            href="/incidents"
            className="inline-flex items-center px-5 py-3.5 rounded-xl text-sm font-bold border transition hover:bg-white/40"
            style={{ borderColor: '#C4B5B0', color: '#111111', background: '#E0D8D4' }}
          >
            View Incidents ({activeIncidents})
          </Link>
        </div>
      </div>

      {/* ═══ SECURITY PULSE METRICS ═══ */}
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-widest mb-4" style={{ color: '#554B49' }}>Security Pulse</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'INVESTIGATIONS', value: total, sub: `${stats.todayScans ?? 0} today`, color: '#111111' },
            { label: 'THREATS', value: threats, sub: `${stats.criticalCount ?? 0} critical`, color: '#990011' },
            { label: 'INCIDENTS', value: activeIncidents, sub: 'requiring review', color: '#B86A00' },
            { label: 'SAFE', value: safe, sub: 'zero false allows', color: '#176B52' },
          ].map(m => (
            <div key={m.label} className="rounded-xl border p-5 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
              <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: '#554B49' }}>{m.label}</div>
              <div className="text-3xl font-extrabold font-mono" style={{ color: m.color }}>{m.value}</div>
              <div className="text-xs mt-1 font-medium" style={{ color: '#554B49' }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ PRIMARY INVESTIGATION INTERFACE ═══ */}
      <div id="investigate-form-card" className="rounded-2xl border p-6 md:p-8 space-y-5 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
        <div className="pb-4 border-b" style={{ borderColor: '#C4B5B0' }}>
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Primary Investigation Interface</div>
          <h2 className="text-xl font-extrabold" style={{ color: '#111111' }}>INVESTIGATE AN ARTIFACT</h2>
          <p className="text-sm mt-0.5" style={{ color: '#554B49' }}>Paste a URL, message, email or suspicious content for immediate multi-engine analysis.</p>
        </div>
        <InvestigateForm showDemos={true} />
      </div>

      {/* ═══ DEMO VIDEO SECTION ═══ */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#990011' }}>
              Product Demo · 40 Seconds
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight" style={{ color: '#111111' }}>
              See Risk_Radar in Action
            </h2>
            <p className="text-sm mt-1.5 max-w-lg font-medium" style={{ color: '#554B49' }}>
              One suspicious click. One investigation. One decision before it&apos;s too late.
            </p>
          </div>
          <div
            className="shrink-0 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-2 rounded-xl border self-start sm:self-auto"
            style={{ background: 'rgba(153,0,17,0.07)', borderColor: 'rgba(153,0,17,0.2)', color: '#990011' }}
          >
            Watch how Risk_Radar investigates a suspicious banking URL.
          </div>
        </div>

        {/* Video Player */}
        <DemoVideoPlayer />

        <p className="text-xs font-medium text-center" style={{ color: '#554B49' }}>
          40 sec · Product Demo · No external links · All analysis runs on your own backend
        </p>
      </div>

      {/* ═══ FAKE CLICK PHISHING DEMO ═══ */}
      <FakeClickDemo />

      {/* ═══ ACTIVE INCIDENT REPORTS ═══ */}
      {serializedIncidents.length > 0 && (
        <div className="rounded-2xl border p-6 md:p-8 space-y-4 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: '#C4B5B0' }}>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: '#990011' }}>
                Executive Incident Reports
              </div>
              <h3 className="text-lg font-extrabold" style={{ color: '#111111' }}>
                ACTIVE SECURITY INCIDENTS (TOP 3-LINE SUMMARY)
              </h3>
              <p className="text-xs mt-0.5" style={{ color: '#554B49' }}>
                Click any report card to pop up the side drawer with the full threat breakdown.
              </p>
            </div>
            <Link href="/incidents" className="text-xs font-bold shrink-0" style={{ color: '#990011' }}>
              All Incidents ({activeIncidents}) →
            </Link>
          </div>
          <IncidentListWithDrawer incidents={serializedIncidents} compact={true} />
        </div>
      )}

      {/* ═══ RECENT + THREAT DNA ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Investigations */}
        <div className="rounded-xl border shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#C4B5B0' }}>
            <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#111111' }}>Recent Investigations</div>
            <Link href="/history" className="text-xs font-bold" style={{ color: '#990011' }}>View All ({total}) →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="text-lg font-extrabold" style={{ color: '#111111' }}>NO INVESTIGATIONS YET</div>
              <p className="text-xs" style={{ color: '#554B49' }}>Risk_Radar has not analyzed any artifacts yet.</p>
              <Link href="/scanner" className="inline-flex px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: '#990011' }}>SCAN SOMETHING →</Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#C4B5B0' }}>
              {recent.map(s => {
                const isThreat = s.classification === 'critical' || s.classification === 'dangerous';
                const isSusp = s.classification === 'suspicious';
                const accentColor = isThreat ? '#990011' : isSusp ? '#B86A00' : '#176B52';
                const { bg, color } = clsStyle(String(s.classification));
                return (
                  <Link key={String(s._id)} href={`/investigate/${String(s._id)}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/40">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-xs" style={{ background: bg, color }}>
                          {String(s.classification)}
                        </span>
                        <span className="text-xs font-bold truncate" style={{ color: '#111111' }}>
                          {s.inputType === 'file'
                            ? (s.inputMetadata as Record<string, unknown>)?.filename as string
                            : (s.inputMetadata as Record<string, unknown>)?.truncatedContent as string}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono capitalize" style={{ color: '#554B49' }}>
                        {String(s.inputType)} · {formatIntent(String(s.attackerIntent || 'unknown'))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold font-mono" style={{ color: accentColor }}>{Number(s.riskScore)}</div>
                      <div className="text-[10px] font-bold" style={{ color: '#554B49' }}>risk</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Threat DNA */}
        <div className="rounded-xl border shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#C4B5B0' }}>
            <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#111111' }}>Threat DNA Activity</div>
            <Link href="/threat-dna" className="text-xs font-bold" style={{ color: '#990011' }}>Explorer →</Link>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs leading-relaxed" style={{ color: '#554B49' }}>
              Risk_Radar clusters attacker behavior using Jaccard vector similarity — recognizing attacks even when URLs or messages are rewritten.
            </p>
            <div className="flex flex-wrap gap-2">
              {stats.topDnaTags && stats.topDnaTags.length > 0 ? (
                stats.topDnaTags.slice(0, 8).map((tag: { tag: string; count: number }) => (
                  <span key={tag.tag} className="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold" style={{ background: '#D3C9C5', borderColor: '#C4B5B0', color: '#111111' }}>
                    {tag.tag.replace(/_/g, ' ')} <span style={{ color: '#554B49' }}>({tag.count})</span>
                  </span>
                ))
              ) : (
                <span className="text-xs" style={{ color: '#554B49' }}>No behavioral clusters detected yet.</span>
              )}
            </div>
            <div className="rounded-xl border p-3.5 flex items-center justify-between" style={{ background: 'rgba(153,0,17,0.06)', borderColor: 'rgba(153,0,17,0.2)' }}>
              <div className="text-xs font-bold" style={{ color: '#111111' }}>Authoritative Policy Engine Active</div>
              <Link href="/policies" className="text-xs font-bold" style={{ color: '#990011' }}>View Rules →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

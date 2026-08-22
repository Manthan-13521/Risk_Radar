'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IncidentQuickDrawer, IncidentItem } from './IncidentDrawer';

export function IncidentListWithDrawer({
  incidents,
  compact = false,
}: {
  incidents: IncidentItem[];
  compact?: boolean;
}) {
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = (inc: IncidentItem) => {
    setSelectedIncident(inc);
    setDrawerOpen(true);
  };

  function sevBadge(sev: string) {
    if (sev === 'critical') return { bg: 'rgba(118,0,13,0.1)', color: '#76000D', border: '#76000D' };
    if (sev === 'high') return { bg: 'rgba(153,0,17,0.1)', color: '#990011', border: '#990011' };
    if (sev === 'medium') return { bg: 'rgba(184,106,0,0.1)', color: '#B86A00', border: '#B86A00' };
    return { bg: 'rgba(111,102,100,0.1)', color: '#6F6664', border: '#D5C8C5' };
  }

  function statusColor(status: string) {
    if (status === 'resolved') return '#176B52';
    if (status === 'triage') return '#990011';
    if (status === 'investigating') return '#B86A00';
    return '#6F6664';
  }

  if (incidents.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
        <div className="text-xl font-extrabold mb-2" style={{ color: '#111111' }}>NO INCIDENTS RECORDED</div>
        <p className="text-sm mb-4" style={{ color: '#6F6664' }}>Investigations scoring Risk ≥ 60 automatically generate incident records.</p>
        <Link href="/scanner" className="inline-flex px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: '#990011' }}>
          SCAN SOMETHING →
        </Link>
      </div>
    );
  }

  return (
    <>
      <IncidentQuickDrawer
        incident={selectedIncident}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <div className="space-y-3">
        {incidents.map((inc) => {
          const badge = sevBadge(inc.severity);
          const topLines = [
            inc.summary || 'Elevated behavioral anomaly flagged by deterministic heuristics.',
            `Intent: ${inc.attackerIntent.replace(/_/g, ' ').toUpperCase()} · Policy: ${String(inc.recommendedAction || 'quarantine').toUpperCase()}`,
            inc.evidence && inc.evidence[0]?.title ? `Indicator: ${inc.evidence[0].title}` : `Created ${new Date(inc.createdAt).toLocaleDateString()}`,
          ];

          if (compact) {
            return (
              <div
                key={String(inc._id || inc.incidentId)}
                onClick={() => handleOpenDrawer(inc)}
                className="rounded-xl border p-4 cursor-pointer transition hover:bg-white/50 space-y-2 group"
                style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-xs font-mono font-bold" style={{ color: '#111111' }}>
                      {inc.incidentId}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold font-mono" style={{ color: '#990011' }}>
                    {inc.riskScore}/100
                  </span>
                </div>

                {/* Top 3 lines preview */}
                <div className="space-y-0.5 text-xs">
                  <p className="font-semibold line-clamp-1 group-hover:text-[#990011] transition" style={{ color: '#111111' }}>
                    1. {topLines[0]}
                  </p>
                  <p className="text-[11px] line-clamp-1 font-mono" style={{ color: '#6F6664' }}>
                    2. {topLines[1]}
                  </p>
                  <p className="text-[11px] line-clamp-1" style={{ color: '#6F6664' }}>
                    3. {topLines[2]}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t" style={{ borderColor: '#D5C8C5' }}>
                  <span className="capitalize font-mono font-bold uppercase text-[10px]" style={{ color: statusColor(inc.status) }}>
                    ● {inc.status}
                  </span>
                  <span className="font-bold flex items-center gap-1" style={{ color: '#990011' }}>
                    Quick Preview ⤢
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div
              key={String(inc._id || inc.incidentId)}
              className="rounded-xl border p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:bg-white/40 cursor-pointer group"
              style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}
              onClick={() => handleOpenDrawer(inc)}
            >
              {/* Left Column: Top 3 Lines Highlight */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <span
                  className="px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5"
                  style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                >
                  {inc.severity}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold" style={{ color: '#6F6664' }}>
                      {inc.incidentId}
                    </span>
                    <h3 className="text-sm font-bold truncate group-hover:text-[#990011] transition" style={{ color: '#111111' }}>
                      {inc.summary || 'Elevated threat detected by security engine'}
                    </h3>
                  </div>

                  {/* 3 lines preview */}
                  <div className="space-y-0.5 text-xs">
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: '#111111' }}>
                      <span className="font-bold" style={{ color: '#990011' }}>Line 1:</span>
                      <span className="truncate">{topLines[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-mono" style={{ color: '#6F6664' }}>
                      <span className="font-bold" style={{ color: '#990011' }}>Line 2:</span>
                      <span className="truncate">{topLines[1]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: '#6F6664' }}>
                      <span className="font-bold" style={{ color: '#990011' }}>Line 3:</span>
                      <span className="truncate">{topLines[2]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Gauges + Pop-up Trigger + Full Detail Link */}
              <div className="flex items-center gap-4 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono" style={{ color: inc.riskScore >= 80 ? '#990011' : inc.riskScore >= 50 ? '#B86A00' : '#111111' }}>
                    {inc.riskScore}/100
                  </div>
                  <div className="text-[10px]" style={{ color: '#6F6664' }}>risk</div>
                </div>
                <span
                  className="px-2.5 py-1 rounded text-[10px] font-bold uppercase"
                  style={{ background: 'rgba(153,0,17,0.06)', color: statusColor(inc.status) }}
                >
                  {inc.status}
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenDrawer(inc)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border transition hover:bg-white"
                  style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}
                  title="Open Slide-over Unit Preview"
                >
                  Side Preview ⤢
                </button>

                <Link
                  href={`/incidents/${String(inc._id || inc.incidentId)}`}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                  style={{ background: '#990011' }}
                >
                  Full Detail →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

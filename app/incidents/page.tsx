export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getIncidents } from '@/lib/incident-service';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const allIncidents = await getIncidents(100);
  const filter = searchParams?.filter?.toLowerCase() || 'all';

  const filtered = allIncidents.filter((inc) => {
    if (filter === 'all') return true;
    if (['critical', 'high', 'medium', 'low'].includes(filter)) {
      return inc.severity === filter;
    }
    if (['triage', 'investigating', 'contained', 'resolved'].includes(filter)) {
      return inc.status === filter;
    }
    return true;
  });

  const openCount = allIncidents.filter((i) => i.status !== 'resolved').length;
  const criticalCount = allIncidents.filter((i) => i.severity === 'critical').length;
  const slaBreachedCount = allIncidents.filter((i) => i.severity === 'critical' || i.severity === 'high').length;
  const avgRisk =
    allIncidents.length > 0
      ? Math.round(allIncidents.reduce((sum, i) => sum + i.riskScore, 0) / allIncidents.length)
      : 0;

  const filters = [
    { label: 'ALL', key: 'all' },
    { label: 'CRITICAL', key: 'critical' },
    { label: 'HIGH', key: 'high' },
    { label: 'MEDIUM', key: 'medium' },
    { label: 'LOW', key: 'low' },
    { label: 'TRIAGE', key: 'triage' },
    { label: 'INVESTIGATING', key: 'investigating' },
    { label: 'CONTAINED', key: 'contained' },
    { label: 'RESOLVED', key: 'resolved' },
  ];

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-[1500px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Incident Response Center</h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Enterprise-grade incident management — severity, owners, SLA timers, evidence, and Threat DNA mapping.
          </p>
        </div>

        {/* Top Header Count Pills (matching screenshot) */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-2.5 py-1 bg-red-950/80 border border-red-800/60 rounded-md text-[11px] font-mono font-bold text-red-300">
            {openCount} OPEN
          </div>
          <div className="px-2.5 py-1 bg-amber-950/80 border border-amber-800/60 rounded-md text-[11px] font-mono font-bold text-amber-300">
            {criticalCount} CRITICAL
          </div>
        </div>
      </div>

      {/* Top 4 Metric Cards (exact layout from screenshot) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Incidents */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span className="text-red-400">💥</span>
            <span>OPEN INCIDENTS</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold font-mono text-red-500 mt-2">
            {openCount}
          </div>
        </div>

        {/* Critical Severity */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span className="text-amber-400">⚠️</span>
            <span>CRITICAL SEVERITY</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold font-mono text-amber-500 mt-2">
            {criticalCount}
          </div>
        </div>

        {/* SLA Breached */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span className="text-yellow-400">⏱</span>
            <span>SLA BREACHED</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold font-mono text-yellow-500 mt-2">
            {slaBreachedCount}
          </div>
        </div>

        {/* Avg Risk */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span className="text-teal-400">🛡</span>
            <span>AVG RISK</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold font-mono text-teal-400 mt-2">
            {avgRisk}
            <span className="text-lg text-zinc-500 font-normal">/100</span>
          </div>
        </div>
      </div>

      {/* Filter Bar (matching screenshot pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[11px] mr-1">Filter:</span>
        {filters.map((f) => {
          const isActive = filter === f.key;
          return (
            <Link
              key={f.key}
              href={`/incidents?filter=${f.key}`}
              className={`px-3 py-1 rounded-md uppercase font-mono font-medium transition ${
                isActive
                  ? 'bg-zinc-700 text-white font-bold border border-zinc-600'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800/80'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Incident List Rows (Sleek horizontal card format matching the screenshot!) */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🛡"
          title="No Matching Incidents"
          description="Investigations scoring Risk ≥ 60 automatically generate incident triage records."
          action={
            <Link
              href="/investigate"
              className="mt-3 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition"
            >
              Run an Investigation
            </Link>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((inc) => {
            const isCritical = inc.severity === 'critical';
            const isHigh = inc.severity === 'high';
            const isMedium = inc.severity === 'medium';

            const severityBadgeClass = isCritical
              ? 'bg-red-950/80 text-red-400 border-red-800/60'
              : isHigh
              ? 'bg-orange-950/80 text-amber-400 border-orange-800/60'
              : isMedium
              ? 'bg-yellow-950/80 text-yellow-400 border-yellow-800/60'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700';

            return (
              <div
                key={String(inc._id)}
                className="bg-[#0e131f] hover:bg-[#121827] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-3.5 md:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition shadow-lg group"
              >
                {/* Left Section: Severity Pill + ID + Title + Metadata */}
                <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1">
                  {/* Severity Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase border shrink-0 flex items-center gap-1.5 ${severityBadgeClass}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isCritical
                          ? 'bg-red-400 animate-ping'
                          : isHigh
                          ? 'bg-amber-400'
                          : isMedium
                          ? 'bg-yellow-400'
                          : 'bg-zinc-400'
                      }`}
                    />
                    {inc.severity}
                  </span>

                  {/* Incident Title & Meta */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-zinc-500 font-medium">
                        {inc.incidentId}
                      </span>
                      <h3 className="text-sm font-semibold text-white group-hover:text-teal-300 transition truncate">
                        {inc.summary || 'Elevated threat detected by security engine'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
                      <span>Unknown</span>
                      <span>•</span>
                      <span>
                        {new Date(inc.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <span>👤</span> Unassigned
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section: SLA Indicator + Risk Gauge + Status + Button */}
                <div className="flex flex-wrap items-center gap-3 md:gap-5 self-end md:self-center shrink-0">
                  {/* SLA Timer Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-xs">⏱</span>
                    <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                      SLA BREACHED
                    </span>
                    <div className="w-16 bg-zinc-800 rounded-full h-1.5 hidden sm:block">
                      <div className="bg-red-500 h-1.5 rounded-full w-full" />
                    </div>
                  </div>

                  {/* Risk Badge */}
                  <div className="flex items-center gap-1 text-xs font-mono">
                    <span className="text-zinc-500">🛡</span>
                    <span
                      className={`font-bold ${
                        inc.riskScore >= 80
                          ? 'text-red-400'
                          : inc.riskScore >= 50
                          ? 'text-amber-400'
                          : 'text-zinc-300'
                      }`}
                    >
                      {inc.riskScore}
                    </span>
                  </div>

                  {/* Triage / Status Pill */}
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-950/60 text-red-400 border border-red-800/50">
                    {inc.status}
                  </span>

                  {/* Investigate Action Button */}
                  <Link
                    href={`/incidents/${String(inc._id)}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-teal-950/60 hover:bg-teal-900 border border-teal-700/50 text-teal-300 rounded-lg text-xs font-semibold transition"
                  >
                    <span>Investigate</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getIncidents } from '@/lib/incident-service';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

function IncidentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    triage: { bg: 'bg-zinc-800 border-zinc-700', text: 'text-zinc-300' },
    investigating: { bg: 'bg-blue-950 border-blue-800', text: 'text-blue-300' },
    contained: { bg: 'bg-amber-950 border-amber-800', text: 'text-amber-300' },
    resolved: { bg: 'bg-emerald-950 border-emerald-800', text: 'text-emerald-300' },
  };

  const cfg = map[status] || map.triage;

  return (
    <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded border ${cfg.bg} ${cfg.text}`}>
      {status}
    </span>
  );
}

export default async function IncidentsPage() {
  const incidents = await getIncidents(100);

  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const triageCount = incidents.filter((i) => i.status === 'triage').length;
  const containedCount = incidents.filter((i) => i.status === 'contained').length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Incident Response Center"
        subtitle="Active threats flagged for analyst triage, containment, and root-cause resolution."
        badge={
          <span className="text-xs bg-red-950/80 border border-red-800/60 text-red-300 px-2.5 py-0.5 rounded font-mono">
            {incidents.length} TOTAL
          </span>
        }
      />

      {/* Triage Status Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Active Triage</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{triageCount}</div>
          </div>
          <span className="text-2xl">⏳</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Critical Severity</div>
            <div className="text-2xl font-bold font-mono text-red-400 mt-1">{criticalCount}</div>
          </div>
          <span className="text-2xl">🚨</span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Contained</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{containedCount}</div>
          </div>
          <span className="text-2xl">🛡</span>
        </div>
      </div>

      {/* Incidents Table */}
      {incidents.length === 0 ? (
        <EmptyState
          icon="🛡"
          title="No Security Incidents"
          description="Investigations with a risk score ≥ 60 will automatically generate an incident record here for triage."
          action={
            <Link
              href="/investigate"
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
            >
              Start an Investigation
            </Link>
          }
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="p-4">Incident ID</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Risk</th>
                  <th className="p-4">Attacker Intent</th>
                  <th className="p-4">Summary</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {incidents.map((inc) => (
                  <tr key={String(inc._id)} className="hover:bg-zinc-800/40 transition">
                    <td className="p-4 text-blue-400 font-bold">
                      <Link href={`/incidents/${String(inc._id)}`} className="hover:underline">
                        {inc.incidentId}
                      </Link>
                    </td>
                    <td className="p-4">
                      <StatusBadge classification={inc.severity} />
                    </td>
                    <td className="p-4">
                      <IncidentStatusBadge status={inc.status} />
                    </td>
                    <td className="p-4">
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
                      <span className="text-zinc-600">/100</span>
                    </td>
                    <td className="p-4 capitalize font-sans text-zinc-300">
                      {inc.attackerIntent.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4 font-sans text-zinc-400 max-w-xs truncate">{inc.summary}</td>
                    <td className="p-4 text-zinc-500 font-sans">
                      {new Date(inc.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-sans">
                      <Link
                        href={`/incidents/${String(inc._id)}`}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs transition"
                      >
                        View Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

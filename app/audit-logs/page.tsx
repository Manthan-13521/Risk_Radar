export const dynamic = 'force-dynamic';

import { getAuditLogs } from '@/lib/audit-service';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function AuditLogsPage() {
  const logs = await getAuditLogs(100);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Immutable Audit Logs"
        subtitle="Cryptographic-grade telemetry logging every investigation, policy change, and threat action."
        badge={
          <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded font-mono">
            {logs.length} AUDIT EVENTS
          </span>
        }
      />

      {logs.length === 0 ? (
        <EmptyState
          icon="📜"
          title="No Audit Logs"
          description="Security events such as investigations, policy toggles, and incident resolutions will be recorded here automatically."
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Outcome</th>
                  <th className="p-4">Target / ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/40 transition">
                    <td className="p-4 whitespace-nowrap text-zinc-400 font-sans">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 text-blue-300 font-bold uppercase">
                      {log.eventType.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4 text-zinc-300 font-sans">{log.actor}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          log.severity === 'critical'
                            ? 'bg-red-950 text-red-300'
                            : log.severity === 'warning'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          log.result === 'success' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400 truncate max-w-xs">{log.objectId || 'N/A'}</td>
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

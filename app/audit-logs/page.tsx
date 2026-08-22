export const dynamic = 'force-dynamic';

import { getAuditLogs } from '@/lib/audit-service';

export default async function AuditLogsPage() {
  const logs = await getAuditLogs(100);

  function sevColor(sev: string) {
    if (sev === 'critical') return { bg: 'rgba(153,0,17,0.12)', color: '#990011' };
    if (sev === 'warning') return { bg: 'rgba(184,106,0,0.12)', color: '#B86A00' };
    return { bg: 'rgba(111,102,100,0.12)', color: '#554B49' };
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Security Governance</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>IMMUTABLE SECURITY LOG</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>
          Cryptographic-grade telemetry logging every investigation, policy change, and threat action.
        </p>
        <div className="mt-3 inline-flex px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-xs" style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#554B49' }}>
          {logs.length} AUDIT EVENTS
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="text-lg font-extrabold mb-2" style={{ color: '#111111' }}>NO AUDIT EVENTS YET</div>
          <p className="text-sm font-medium" style={{ color: '#554B49' }}>Security events such as investigations, policy toggles, and incident resolutions will be recorded here automatically.</p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b" style={{ borderColor: '#C4B5B0', background: '#D3C9C5' }}>
                <tr>
                  {['Timestamp', 'Event Type', 'Actor', 'Severity', 'Outcome', 'Target / ID'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y font-mono" style={{ borderColor: '#C4B5B0' }}>
                {logs.map((log, idx) => {
                  const { bg, color } = sevColor(log.severity);
                  return (
                    <tr key={idx} className="transition hover:bg-white/40">
                      <td className="px-4 py-3 whitespace-nowrap font-sans font-medium" style={{ color: '#554B49' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-bold uppercase" style={{ color: '#990011' }}>
                        {log.eventType.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 font-sans font-semibold" style={{ color: '#111111' }}>{log.actor}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold shadow-xs" style={{ background: bg, color }}>{log.severity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-extrabold uppercase" style={{ color: log.result === 'success' ? '#176B52' : '#990011' }}>
                          {log.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 truncate max-w-xs" style={{ color: '#554B49' }}>{log.objectId || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

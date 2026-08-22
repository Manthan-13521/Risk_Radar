export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getIncidents } from '@/lib/incident-service';

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const allIncidents = await getIncidents(100);
  const filter = searchParams?.filter?.toLowerCase() || 'all';

  const filtered = allIncidents.filter((inc) => {
    if (filter === 'all') return true;
    if (['critical', 'high', 'medium', 'low'].includes(filter)) return inc.severity === filter;
    if (['triage', 'investigating', 'contained', 'resolved'].includes(filter)) return inc.status === filter;
    return true;
  });

  const openCount = allIncidents.filter(i => i.status !== 'resolved').length;
  const criticalCount = allIncidents.filter(i => i.severity === 'critical').length;
  const slaBreachedCount = allIncidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
  const avgRisk = allIncidents.length > 0
    ? Math.round(allIncidents.reduce((sum, i) => sum + i.riskScore, 0) / allIncidents.length)
    : 0;

  const FILTERS = [
    { label: 'ALL', key: 'all' },
    { label: 'CRITICAL', key: 'critical' },
    { label: 'HIGH', key: 'high' },
    { label: 'MEDIUM', key: 'medium' },
    { label: 'TRIAGE', key: 'triage' },
    { label: 'INVESTIGATING', key: 'investigating' },
    { label: 'RESOLVED', key: 'resolved' },
  ];

  function sevColor(sev: string) {
    if (sev === 'critical') return '#990011';
    if (sev === 'high') return '#B86A00';
    if (sev === 'medium') return '#6F6664';
    return '#6F6664';
  }

  function statusColor(status: string) {
    if (status === 'resolved') return '#176B52';
    if (status === 'triage') return '#990011';
    if (status === 'investigating') return '#B86A00';
    return '#6F6664';
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#FCF6F5' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#D5C8C5' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Security Operations</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>INCIDENT RESPONSE</h1>
        <p className="text-sm mt-1" style={{ color: '#6F6664' }}>Monitor, investigate and resolve security events.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'OPEN INCIDENTS', value: openCount, color: '#990011' },
          { label: 'CRITICAL SEVERITY', value: criticalCount, color: '#76000D' },
          { label: 'SLA BREACHED', value: slaBreachedCount, color: '#B86A00' },
          { label: 'AVG RISK', value: avgRisk, suffix: '/100', color: '#111111' },
        ].map(m => (
          <div key={m.label} className="rounded-xl border p-5" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#6F6664' }}>{m.label}</div>
            <div className="text-3xl font-extrabold font-mono" style={{ color: m.color }}>
              {m.value}
              {m.suffix && <span className="text-base font-normal" style={{ color: '#6F6664' }}>{m.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest shrink-0 mr-1" style={{ color: '#6F6664' }}>Filter:</span>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <Link
              key={f.key}
              href={`/incidents?filter=${f.key}`}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0"
              style={{
                background: active ? '#990011' : '#F0E8E6',
                color: active ? '#fff' : '#6F6664',
                border: `1px solid ${active ? '#990011' : '#D5C8C5'}`,
              }}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Incident list */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
          <div className="text-xl font-extrabold mb-2" style={{ color: '#111111' }}>NO INCIDENTS YET</div>
          <p className="text-sm mb-4" style={{ color: '#6F6664' }}>Investigations scoring Risk ≥ 60 automatically generate incident records.</p>
          <Link href="/scanner" className="inline-flex px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: '#990011' }}>
            SCAN SOMETHING →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(inc => (
            <div
              key={String(inc._id)}
              className="rounded-xl border p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition hover:bg-white/30"
              style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}
            >
              {/* Left */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <span
                  className="px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0"
                  style={{ background: `rgba(${inc.severity === 'critical' ? '153,0,17' : inc.severity === 'high' ? '184,106,0' : '111,102,100'},0.1)`, color: sevColor(inc.severity) }}
                >
                  {inc.severity}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono" style={{ color: '#6F6664' }}>{inc.incidentId}</span>
                    <h3 className="text-sm font-bold truncate" style={{ color: '#111111' }}>
                      {inc.summary || 'Elevated threat detected by security engine'}
                    </h3>
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: '#6F6664' }}>
                    {new Date(inc.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold font-mono" style={{ color: inc.riskScore >= 80 ? '#990011' : inc.riskScore >= 50 ? '#B86A00' : '#111111' }}>
                    {inc.riskScore}/100
                  </div>
                  <div className="text-[10px]" style={{ color: '#6F6664' }}>risk</div>
                </div>
                <span
                  className="px-2.5 py-1 rounded text-[10px] font-bold uppercase"
                  style={{ background: `rgba(${inc.status === 'resolved' ? '23,107,82' : '153,0,17'},0.1)`, color: statusColor(inc.status) }}
                >
                  {inc.status}
                </span>
                <Link
                  href={`/incidents/${String(inc._id)}`}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                  style={{ background: '#990011' }}
                >
                  Investigate →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

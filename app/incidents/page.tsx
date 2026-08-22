export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getIncidents } from '@/lib/incident-service';
import { IncidentListWithDrawer } from '@/components/IncidentListWithDrawer';
import { IncidentItem } from '@/components/IncidentDrawer';

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams?: { filter?: string };
}) {
  const rawIncidents = await getIncidents(100);
  const filter = searchParams?.filter?.toLowerCase() || 'all';

  const filtered = rawIncidents.filter((inc) => {
    if (filter === 'all') return true;
    if (['critical', 'high', 'medium', 'low'].includes(filter)) return inc.severity === filter;
    if (['triage', 'investigating', 'contained', 'resolved'].includes(filter)) return inc.status === filter;
    return true;
  });

  const openCount = rawIncidents.filter(i => i.status !== 'resolved').length;
  const criticalCount = rawIncidents.filter(i => i.severity === 'critical').length;
  const slaBreachedCount = rawIncidents.filter(i => i.severity === 'critical' || i.severity === 'high').length;
  const avgRisk = rawIncidents.length > 0
    ? Math.round(rawIncidents.reduce((sum, i) => sum + i.riskScore, 0) / rawIncidents.length)
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

  // Cast for client drawer
  const serializedIncidents: IncidentItem[] = filtered.map(inc => ({
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
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#FCF6F5' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#D5C8C5' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Security Operations</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>INCIDENT RESPONSE</h1>
        <p className="text-sm mt-1" style={{ color: '#6F6664' }}>
          Monitor, investigate and resolve security events. Click any incident to open the 3-line breakdown side popup unit.
        </p>
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

      {/* Interactive Incident List with Side Drawer */}
      <IncidentListWithDrawer incidents={serializedIncidents} />
    </div>
  );
}

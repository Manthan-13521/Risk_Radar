export const dynamic = 'force-dynamic';

import { getAllServiceHealth } from '@/lib/health-service';

export default async function AIHealthPage() {
  const services = await getAllServiceHealth();
  const aiService = services.find(s => s.name === 'OpenRouter AI');

  function statusColor(status: string) {
    if (status === 'healthy') return '#176B52';
    if (status === 'degraded') return '#B86A00';
    return '#990011';
  }

  function statusBg(status: string) {
    if (status === 'healthy') return 'rgba(23,107,82,0.08)';
    if (status === 'degraded') return 'rgba(184,106,0,0.08)';
    return 'rgba(153,0,17,0.08)';
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#FCF6F5' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#D5C8C5' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>AI System</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>AI SYSTEM HEALTH</h1>
        <p className="text-sm mt-1" style={{ color: '#6F6664' }}>Live telemetry for the reasoning engine, fallback subsystems, and external integrations.</p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold"
          style={{ background: aiService?.status === 'healthy' ? 'rgba(23,107,82,0.08)' : 'rgba(153,0,17,0.08)', borderColor: aiService?.status === 'healthy' ? 'rgba(23,107,82,0.2)' : 'rgba(153,0,17,0.2)', color: aiService?.status === 'healthy' ? '#176B52' : '#990011' }}>
          <span className="w-2 h-2 rounded-full bg-current" />
          {aiService?.status === 'healthy' ? 'REASONING ONLINE' : 'FALLBACK ACTIVE'}
        </div>
      </div>

      {/* Service cards */}
      <div className="space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>Core Subsystems Status</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map(svc => (
            <div
              key={svc.name}
              className="rounded-xl border p-5"
              style={{ background: statusBg(svc.status), borderColor: `rgba(${svc.status === 'healthy' ? '23,107,82' : '153,0,17'},0.2)` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-sm" style={{ color: '#111111' }}>{svc.name}</div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: statusColor(svc.status) }}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {svc.status}
                </div>
              </div>
              {svc.detail && <div className="text-xs" style={{ color: '#6F6664' }}>{svc.detail}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Architecture */}
      <div className="rounded-xl border p-6 space-y-4" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#111111' }}>Fail-Safe Policy Enforcement Guarantee</div>
        <p className="text-sm" style={{ color: '#6F6664' }}>
          Risk_Radar uses a dual-engine architecture. If the LLM reasoning provider experiences latency or failure, the <strong style={{ color: '#111111' }}>Deterministic Policy Layer</strong> automatically engages without failing user investigations.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Primary Engine', value: 'OpenRouter Structured LLM', sub: 'Zod Schema Validated Reasoning', color: '#111111' },
            { title: 'Fallback Engine', value: 'Deterministic Heuristics', sub: '20+ Local Heuristic Rules', color: '#B86A00' },
            { title: 'Authoritative Guard', value: 'Hard Safety Rules (A–G)', sub: 'Prevents False Allow Verdicts', color: '#176B52' },
          ].map(c => (
            <div key={c.title} className="rounded-lg border p-4" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <div className="text-[10px] font-bold uppercase" style={{ color: '#6F6664' }}>{c.title}</div>
              <div className="text-sm font-bold mt-1" style={{ color: c.color }}>{c.value}</div>
              <div className="text-[11px] mt-1" style={{ color: '#6F6664' }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

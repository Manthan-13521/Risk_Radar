export const dynamic = 'force-dynamic';

import { getAllServiceHealth } from '@/lib/health-service';

export default async function SystemHealthPage() {
  const services = await getAllServiceHealth();

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#FCF6F5' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#D5C8C5' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Infrastructure</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>SYSTEM HEALTH</h1>
        <p className="text-sm mt-1" style={{ color: '#6F6664' }}>
          Infrastructure uptime, database connection pools, and real-time operational status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => {
          const isHealthy = svc.status === 'healthy';
          return (
            <div
              key={svc.name}
              className="rounded-xl border p-5"
              style={{
                background: isHealthy ? 'rgba(23,107,82,0.06)' : 'rgba(153,0,17,0.06)',
                borderColor: isHealthy ? 'rgba(23,107,82,0.2)' : 'rgba(153,0,17,0.2)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-sm" style={{ color: '#111111' }}>{svc.name}</div>
                <div
                  className="flex items-center gap-1.5 text-xs font-bold uppercase"
                  style={{ color: isHealthy ? '#176B52' : '#990011' }}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  {svc.status}
                </div>
              </div>
              {svc.detail && <div className="text-xs" style={{ color: '#6F6664' }}>{svc.detail}</div>}
            </div>
          );
        })}
      </div>

      {/* Lightweight Uptime Monitor Info */}
      <div className="rounded-2xl border p-6 space-y-3" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#111111' }}>
          Uptime Keep-Alive Endpoint
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#6F6664' }}>
          For deployment environments with idle spin-down policies (such as Render Web Services), an external ping to the low-overhead health check keeps the instance warm:
        </p>
        <div className="p-3 rounded-xl font-mono text-xs border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#990011' }}>
          GET /api/health → &#123; status: &quot;ok&quot;, service: &quot;Risk_Radar&quot; &#125;
        </div>
      </div>
    </div>
  );
}

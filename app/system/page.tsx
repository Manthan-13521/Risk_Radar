export const dynamic = 'force-dynamic';

import { getAllServiceHealth } from '@/lib/health-service';
import { PageHeader } from '@/components/ui/PageHeader';
import { HealthIndicator } from '@/components/ui/HealthIndicator';

export default async function SystemHealthPage() {
  const services = await getAllServiceHealth();

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <PageHeader
        title="System Health & Infrastructure"
        subtitle="Infrastructure uptime, database connection pools, and real-time operational status."
        badge={
          <span className="text-xs bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-2.5 py-0.5 rounded font-mono">
            HOST: RENDER / PRODUCTION
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => (
          <HealthIndicator
            key={svc.name}
            label={svc.name}
            status={svc.status}
            detail={svc.detail}
          />
        ))}
      </div>

      {/* Lightweight Uptime Monitor Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Uptime Keep-Alive Endpoint
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          For deployment environments with idle spin-down policies (such as Render Web Services), an external ping to the low-overhead health check keeps the instance warm:
        </p>
        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-xs text-zinc-300">
          GET /api/health → &#123; status: &quot;ok&quot;, service: &quot;ShieldSense&quot; &#125;
        </div>
      </div>
    </div>
  );
}

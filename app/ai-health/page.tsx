export const dynamic = 'force-dynamic';

import { getAllServiceHealth } from '@/lib/health-service';
import { PageHeader } from '@/components/ui/PageHeader';
import { HealthIndicator } from '@/components/ui/HealthIndicator';

export default async function AIHealthPage() {
  const services = await getAllServiceHealth();
  const aiService = services.find((s) => s.name === 'OpenRouter AI');

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <PageHeader
        title="AI System Health & Diagnostics"
        subtitle="Live telemetry for the reasoning engine, fallback subsystems, and external integration health."
        badge={
          <span className="text-xs bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-2.5 py-0.5 rounded font-mono">
            {aiService?.status === 'healthy' ? 'REASONING ONLINE' : 'FALLBACK ACTIVE'}
          </span>
        }
      />

      {/* Subsystem Health Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Core Subsystems Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map((svc) => (
            <HealthIndicator
              key={svc.name}
              label={svc.name}
              status={svc.status}
              detail={svc.detail}
            />
          ))}
        </div>
      </div>

      {/* Pipeline Architecture Verification */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
          🛡 Fail-Safe Policy Enforcement Guarantee
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          ShieldSense uses a dual-engine architecture. If the LLM reasoning provider experiences latency, rate limiting, or connection failure, the <strong className="text-zinc-200">Deterministic Policy Layer</strong> automatically engages without failing user investigations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase font-semibold">Primary Engine</div>
            <div className="text-sm font-bold text-blue-300 mt-1">OpenRouter Structured LLM</div>
            <div className="text-[11px] text-zinc-500 mt-1">Zod Schema Validated Reasoning</div>
          </div>
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase font-semibold">Fallback Engine</div>
            <div className="text-sm font-bold text-amber-300 mt-1">Deterministic Heuristics</div>
            <div className="text-[11px] text-zinc-500 mt-1">20+ Local Heuristic Rules</div>
          </div>
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase font-semibold">Authoritative Guard</div>
            <div className="text-sm font-bold text-emerald-300 mt-1">Hard Safety Rules (A-G)</div>
            <div className="text-[11px] text-zinc-500 mt-1">Prevents False Allow Verdicts</div>
          </div>
        </div>
      </div>
    </div>
  );
}

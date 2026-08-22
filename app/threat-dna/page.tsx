export const dynamic = 'force-dynamic';

import { getPatternStats } from '@/lib/dna';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function ThreatDNAPage() {
  const stats = await getPatternStats();

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Threat DNA Explorer"
        subtitle="Unsupervised clustering and correlation of adversarial tactics across investigation telemetry."
        badge={
          <span className="text-xs bg-purple-950/80 border border-purple-800/60 text-purple-300 px-2.5 py-0.5 rounded font-mono">
            {stats.distinctPatterns} UNIQUE SIGNATURES
          </span>
        }
      />

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Scans Analyzed"
          value={stats.totalScans}
          subLabel="Ingested investigations"
          icon="📊"
        />
        <MetricCard
          label="Threats Correlated"
          value={stats.threatsFound}
          subLabel="Elevated risk detections"
          color="text-red-400"
          icon="🚨"
        />
        <MetricCard
          label="Distinct DNA Signatures"
          value={stats.distinctPatterns}
          subLabel="Aggregated behavioral clusters"
          color="text-blue-300"
          icon="🧬"
        />
      </div>

      {/* Pattern Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Discovered Adversarial Signatures
        </h2>

        {stats.patterns.length === 0 ? (
          <EmptyState
            icon="🧬"
            title="No Threat DNA Clusters"
            description="As multi-signal investigations are submitted with shared traits, behavioral clusters will automatically populate here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.patterns.map((pattern, idx) => (
              <div
                key={idx}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-sm font-bold font-mono text-zinc-200">
                      DNA-SIG #{idx + 1}
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded">
                      {pattern.count} {pattern.count === 1 ? 'MATCH' : 'MATCHES'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {pattern.tags.map((t) => (
                      <span
                        key={t}
                        className="bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 text-[11px] px-2 py-0.5 rounded font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 pt-3 border-t border-zinc-800 flex justify-between items-center">
                  <span>Last Seen:</span>
                  <span className="font-mono text-zinc-400">
                    {pattern.lastDetected ? new Date(pattern.lastDetected).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
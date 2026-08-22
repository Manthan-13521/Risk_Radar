export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import { PageHeader } from '@/components/ui/PageHeader';
import { HealthIndicator } from '@/components/ui/HealthIndicator';

export default async function VoicePage() {
  const db = await getDb();
  const recentScan = await db.collection('scans').findOne({ riskScore: { $gte: 50 } }, { sort: { createdAt: -1 } });
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <PageHeader
        title="Voice Assistant Subsystem"
        subtitle="Audio verdicts and voice summaries synthesized for hands-free SOC threat briefings."
        badge={
          <span className="text-xs bg-purple-950/80 border border-purple-800/60 text-purple-300 px-2.5 py-0.5 rounded font-mono">
            {hasOpenAi ? 'TTS ONLINE' : 'NOT CONFIGURED'}
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service State */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            TTS Synthesis Engine
          </h2>
          <HealthIndicator
            label="OpenAI TTS-1 Provider"
            status={hasOpenAi ? 'healthy' : 'not_configured'}
            detail={hasOpenAi ? 'Voice: alloy (HD Audio)' : 'OPENAI_API_KEY not set'}
          />

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-xs space-y-3">
            <h3 className="font-semibold text-zinc-200">How Voice Verdicts Work</h3>
            <p className="text-zinc-400 leading-relaxed">
              When an investigation concludes, ShieldSense server-side generates a crisp, deterministic audio briefing explaining the primary threat indicators, confidence level, and recommended protective actions.
            </p>
          </div>
        </div>

        {/* Demo / Sample Briefing */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Recent Audio Briefing
            </h2>
            {recentScan ? (
              <div className="space-y-2">
                <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded text-xs text-zinc-300">
                  <div className="font-bold text-amber-400 mb-1 capitalize">
                    {recentScan.classification} Risk Detected ({recentScan.riskScore}/100)
                  </div>
                  <p className="text-zinc-400 line-clamp-3">{recentScan.explanation}</p>
                </div>
                <Link
                  href={`/investigate/${recentScan._id}`}
                  className="inline-block text-xs text-blue-400 hover:underline pt-1"
                >
                  Listen on Investigation Record →
                </Link>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No elevated risk investigations to preview.</p>
            )}
          </div>

          <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded text-[11px] text-zinc-500">
            Voice briefings are available directly on all investigation result pages.
          </div>
        </div>
      </div>
    </div>
  );
}

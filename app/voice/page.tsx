export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/mongodb';

export default async function VoicePage() {
  const db = await getDb();
  const recentScan = await db.collection('scans').findOne({ riskScore: { $gte: 50 } }, { sort: { createdAt: -1 } });
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Voice Engine</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>VOICE ASSISTANT</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>
          Audio verdicts and voice summaries synthesized for hands-free SOC threat briefings.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-xs"
          style={{ background: hasOpenAi ? 'rgba(23,107,82,0.1)' : 'rgba(111,102,100,0.1)', borderColor: hasOpenAi ? 'rgba(23,107,82,0.25)' : '#C4B5B0', color: hasOpenAi ? '#176B52' : '#554B49' }}>
          <span className="w-2 h-2 rounded-full bg-current" />
          {hasOpenAi ? 'TTS ONLINE' : 'BROWSER WEB SPEECH READY'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service State */}
        <div className="space-y-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>
            Synthesis Engine Status
          </div>
          <div className="rounded-2xl border p-5 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm" style={{ color: '#111111' }}>Browser Web Speech API</div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase" style={{ color: '#176B52' }}>
                <span className="w-2 h-2 rounded-full bg-current" />
                Active
              </div>
            </div>
            <div className="text-xs font-medium" style={{ color: '#554B49' }}>1-line instant verdict speech engine (zero latency)</div>
          </div>

          <div className="rounded-2xl border p-5 text-xs space-y-3 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="font-extrabold text-sm" style={{ color: '#111111' }}>How Voice Verdicts Work</div>
            <p className="leading-relaxed font-medium" style={{ color: '#554B49' }}>
              When an investigation concludes, Risk_Radar generates a crisp, deterministic audio briefing explaining the primary threat indicators, confidence level, and recommended protective actions.
            </p>
          </div>
        </div>

        {/* Demo / Sample Briefing */}
        <div className="rounded-2xl border p-6 flex flex-col justify-between space-y-4 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: '#111111' }}>
              Recent Audio Briefing
            </div>
            {recentScan ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border text-xs shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
                  <div className="font-bold mb-1 capitalize" style={{ color: '#990011' }}>
                    {recentScan.classification} Risk Detected ({recentScan.riskScore}/100)
                  </div>
                  <p className="line-clamp-3 leading-relaxed font-medium" style={{ color: '#554B49' }}>{recentScan.explanation}</p>
                </div>
                <Link
                  href={`/investigate/${recentScan._id}`}
                  className="inline-block text-xs font-bold"
                  style={{ color: '#990011' }}
                >
                  Listen on Investigation Record →
                </Link>
              </div>
            ) : (
              <p className="text-xs font-medium" style={{ color: '#554B49' }}>No elevated risk investigations to preview.</p>
            )}
          </div>

          <div className="p-3 rounded-xl border text-[11px] font-medium" style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#554B49' }}>
            Voice briefings are available directly on all investigation result pages.
          </div>
        </div>
      </div>
    </div>
  );
}

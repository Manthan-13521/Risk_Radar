export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import InvestigateForm from '@/components/InvestigateForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';

const DEMO_CASES = [
  {
    title: 'Bank Phishing Attack',
    type: 'url',
    content: 'https://paypa1-security.example.invalid/login',
    classification: 'critical',
    desc: 'Lookalike PayPal domain with credential harvesting login path',
  },
  {
    title: 'Package Delivery Scam',
    type: 'message',
    content: 'Your package could not be delivered. Pay a ₹49 redelivery fee immediately using the link: https://deliv-pay.top/track',
    classification: 'dangerous',
    desc: 'Financial fee lure with urgent delivery call-to-action',
  },
  {
    title: 'Account Suspension Urgency',
    type: 'message',
    content: 'FINAL WARNING: Verify your HDFC banking account today or access may be disabled. Complete identity verification immediately.',
    classification: 'dangerous',
    desc: 'Coercive urgency and credential request signature',
  },
  {
    title: 'Legitimate Calendar Invite',
    type: 'message',
    content: 'Hi, the team sync has been moved to 4 PM today. Please join using the usual internal calendar invite.',
    classification: 'safe',
    desc: 'Standard team communication without suspicious markers',
  },
  {
    title: 'Official Google Search',
    type: 'url',
    content: 'https://www.google.com/search?q=cybersecurity+threat+intelligence',
    classification: 'safe',
    desc: 'Verified trusted search engine domain',
  },
];

export default async function InvestigatePage() {
  const db = await getDb();
  const recentScans = await db
    .collection('scans')
    .find({})
    .sort({ createdAt: -1 })
    .limit(6)
    .toArray();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto">
      <PageHeader
        title="Scanner & Artifact Investigation"
        subtitle="Submit URLs, raw messages, or files for deep behavioral heuristic extraction, Threat DNA mapping, and AI reasoning."
        badge={
          <span className="text-xs bg-teal-950/80 border border-teal-800/60 text-teal-300 px-2.5 py-0.5 rounded font-mono">
            SANDBOX v2.4 ONLINE
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Input & Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-5 md:p-6 shadow-xl">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-4 flex items-center gap-2">
              <span className="text-teal-400">🎯</span>
              <span>Submit Artifact for Multi-Stage Inspection</span>
            </h2>
            <InvestigateForm />
          </div>

          {/* Demo Scenario Quick-Picks */}
          <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-5 md:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-2">
              <span className="text-amber-400">⚡</span>
              <span>Pre-Configured Test Scenarios</span>
            </h2>
            <p className="text-xs text-zinc-500 mb-4">
              Click any scenario to load it directly into the sandbox investigation engine:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_CASES.map((demo) => (
                <Link
                  key={demo.title}
                  href={`/investigate?type=${demo.type}&content=${encodeURIComponent(demo.content)}`}
                  className="p-3.5 bg-[#0e1422] hover:bg-[#141d30] border border-zinc-800/80 hover:border-teal-500/40 rounded-lg transition flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-teal-300 transition">
                      {demo.title}
                    </span>
                    <StatusBadge classification={demo.classification} />
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{demo.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pipeline Stages & Recent Scans */}
        <div className="space-y-6">
          {/* Analysis Pipeline Stages */}
          <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <span>🛡</span>
              <span>Defense-in-Depth Pipeline</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-300 p-2 bg-[#0e1422] rounded border border-zinc-800/60">
                <span className="w-5 h-5 rounded bg-blue-950 border border-blue-800/60 text-blue-400 flex items-center justify-center font-mono text-[10px] font-bold">
                  1
                </span>
                <span>Deterministic Heuristic Extractor</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300 p-2 bg-[#0e1422] rounded border border-zinc-800/60">
                <span className="w-5 h-5 rounded bg-purple-950 border border-purple-800/60 text-purple-400 flex items-center justify-center font-mono text-[10px] font-bold">
                  2
                </span>
                <span>Contextual AI Reasoning Layer</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300 p-2 bg-[#0e1422] rounded border border-zinc-800/60">
                <span className="w-5 h-5 rounded bg-teal-950 border border-teal-800/60 text-teal-400 flex items-center justify-center font-mono text-[10px] font-bold">
                  3
                </span>
                <span>Authoritative Hard Policy Safety Layer</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300 p-2 bg-[#0e1422] rounded border border-zinc-800/60">
                <span className="w-5 h-5 rounded bg-amber-950 border border-amber-800/60 text-amber-400 flex items-center justify-center font-mono text-[10px] font-bold">
                  4
                </span>
                <span>Threat DNA Historical Clustering</span>
              </div>
            </div>
          </div>

          {/* Recent Investigations */}
          <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Recent Scans
              </h3>
              <Link href="/history" className="text-xs text-teal-400 hover:underline">
                View All →
              </Link>
            </div>
            {recentScans.length === 0 ? (
              <p className="text-xs text-zinc-600 py-4 text-center">No scans recorded yet</p>
            ) : (
              <div className="space-y-2">
                {recentScans.map((s) => (
                  <Link
                    key={String(s._id)}
                    href={`/investigate/${String(s._id)}`}
                    className="flex items-center justify-between p-2.5 bg-[#0e1422] hover:bg-[#141d30] rounded-lg border border-zinc-800/60 transition text-xs group"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-mono text-zinc-200 group-hover:text-teal-300 transition truncate">
                        {s.inputType === 'file'
                          ? (s.inputMetadata as Record<string, unknown>)?.filename as string
                          : (s.inputMetadata as Record<string, unknown>)?.truncatedContent as string}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 capitalize">
                        {s.inputType} • {s.attackerIntent?.replace(/_/g, ' ') || 'unknown'}
                      </div>
                    </div>
                    <StatusBadge classification={s.classification} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

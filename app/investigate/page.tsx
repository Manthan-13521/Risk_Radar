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
    <div className="p-6 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Investigation Center"
        subtitle="Analyze URLs, messages, and files with multi-stage deterministic heuristics and structured AI reasoning."
        badge={
          <span className="text-xs bg-blue-950/60 border border-blue-800/40 text-blue-300 px-2.5 py-0.5 rounded font-mono">
            SANDBOX v2.0
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Input & Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
              <span>🎯</span> Submit Artifact for Analysis
            </h2>
            <InvestigateForm />
          </div>

          {/* Demo Scenario Quick-Picks */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <span>⚡</span> Pre-Configured Test Scenarios
            </h2>
            <p className="text-xs text-zinc-500 mb-4">
              Click any scenario to load it directly into the investigation engine:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEMO_CASES.map((demo) => (
                <Link
                  key={demo.title}
                  href={`/investigate?type=${demo.type}&content=${encodeURIComponent(demo.content)}`}
                  className="p-3.5 bg-zinc-950/60 hover:bg-zinc-800/50 border border-zinc-800 rounded-lg transition flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-blue-300 transition">
                      {demo.title}
                    </span>
                    <StatusBadge classification={demo.classification} />
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">{demo.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Engine Architecture & Recent Scans */}
        <div className="space-y-6">
          {/* Analysis Pipeline Overview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              🛡 Defense-in-Depth Pipeline
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <span className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center font-mono text-[10px] font-bold">
                  1
                </span>
                <span>Deterministic Heuristic Feature Extractor</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <span className="w-5 h-5 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center font-mono text-[10px] font-bold">
                  2
                </span>
                <span>Contextual AI Reasoning & DNA Tagging</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <span className="w-5 h-5 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-mono text-[10px] font-bold">
                  3
                </span>
                <span>Authoritative Hard Policy Safety Layer</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <span className="w-5 h-5 rounded-full bg-amber-900/60 text-amber-300 flex items-center justify-center font-mono text-[10px] font-bold">
                  4
                </span>
                <span>Threat DNA Historical Correlation</span>
              </div>
            </div>
          </div>

          {/* Recent Investigations Quick Access */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Recent Scans
              </h3>
              <Link href="/history" className="text-xs text-blue-400 hover:underline">
                View All
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
                    className="flex items-center justify-between p-2.5 bg-zinc-950/40 hover:bg-zinc-800/40 rounded border border-zinc-800/40 transition text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-mono text-zinc-300 truncate">
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

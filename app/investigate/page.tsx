export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import InvestigateForm from '@/components/InvestigateForm';

const DEMO_CASES = [
  {
    title: 'Bank Phishing Attack',
    type: 'url',
    content: 'https://paypa1-security.example.invalid/login',
    classification: 'critical',
    desc: 'Homoglyph lookalike PayPal domain with credential harvesting login path',
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
    desc: 'Coercive urgency and credential demand signature',
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

export default async function ScannerPage() {
  const db = await getDb();
  const recentScans = await db
    .collection('scans')
    .find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1250px] mx-auto bg-black text-white">
      {/* Header */}
      <div className="border-b border-[#181818] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔍</span>
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
              Investigation Workspace
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-teal-950/80 text-teal-400 border border-teal-800/60">
              SANDBOX v2.4
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Deep multi-stage inspection of suspicious URLs, emails, SMS text, and multi-format files.
          </p>
        </div>

        <Link
          href="/history"
          className="text-xs text-zinc-400 hover:text-teal-300 transition flex items-center gap-1 self-start sm:self-auto font-mono"
        >
          <span>View Telemetry History →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Input Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0a0a0a] border border-[#222222] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <span>🎯</span>
                <span>Submit Artifact for Sandbox Analysis</span>
              </h2>
              <span className="text-[11px] font-mono text-zinc-500">Heuristics + AI + Policies</span>
            </div>
            <InvestigateForm />
          </div>

          {/* Quick Demo Scenarios */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-6 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2 font-mono">
              <span>⚡</span>
              <span>1-Click Pre-Configured Test Scenarios</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {DEMO_CASES.map((demo) => (
                <Link
                  key={demo.title}
                  href={`/scanner?type=${demo.type}&content=${encodeURIComponent(demo.content)}`}
                  className="p-3.5 bg-[#111111] hover:bg-[#181818] border border-[#222222] hover:border-teal-500/40 rounded-xl transition flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-teal-300 transition">
                      {demo.title}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      demo.classification === 'critical'
                        ? 'bg-red-950 text-red-400'
                        : demo.classification === 'dangerous'
                        ? 'bg-amber-950 text-amber-400'
                        : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {demo.classification}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{demo.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pipeline Stages & Recent Scans */}
        <div className="space-y-6">
          {/* Defense in Depth Pipeline */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 font-mono">
              <span>🛡</span>
              <span>Investigation Pipeline</span>
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-[#111111] border border-[#222222] rounded-lg flex items-center gap-2.5 text-zinc-300">
                <span className="w-5 h-5 rounded bg-blue-950 text-blue-400 flex items-center justify-center font-bold text-[10px]">1</span>
                <span>Signal Detection & Extraction</span>
              </div>
              <div className="p-2.5 bg-[#111111] border border-[#222222] rounded-lg flex items-center gap-2.5 text-zinc-300">
                <span className="w-5 h-5 rounded bg-purple-950 text-purple-400 flex items-center justify-center font-bold text-[10px]">2</span>
                <span>URL / File Structural Analysis</span>
              </div>
              <div className="p-2.5 bg-[#111111] border border-[#222222] rounded-lg flex items-center gap-2.5 text-zinc-300">
                <span className="w-5 h-5 rounded bg-teal-950 text-teal-400 flex items-center justify-center font-bold text-[10px]">3</span>
                <span>Contextual AI Reasoning Layer</span>
              </div>
              <div className="p-2.5 bg-[#111111] border border-[#222222] rounded-lg flex items-center gap-2.5 text-zinc-300">
                <span className="w-5 h-5 rounded bg-amber-950 text-amber-400 flex items-center justify-center font-bold text-[10px]">4</span>
                <span>Threat DNA Memory Clustering</span>
              </div>
              <div className="p-2.5 bg-[#111111] border border-[#222222] rounded-lg flex items-center gap-2.5 text-zinc-300">
                <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-[10px]">5</span>
                <span>Authoritative Policy Guard</span>
              </div>
            </div>
          </div>

          {/* Recent Scans Mini Feed */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Recent Scans
              </h3>
              <Link href="/history" className="text-xs text-teal-400 hover:underline font-mono">
                All →
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
                    className="p-2.5 bg-[#111111] hover:bg-[#181818] border border-[#222222] rounded-lg flex items-center justify-between text-xs transition group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-mono text-zinc-200 group-hover:text-teal-300 truncate">
                        {s.inputType === 'file'
                          ? (s.inputMetadata as Record<string, unknown>)?.filename as string
                          : (s.inputMetadata as Record<string, unknown>)?.truncatedContent as string}
                      </div>
                      <div className="text-[10px] text-zinc-500 capitalize font-mono mt-0.5">
                        {s.inputType} • {s.attackerIntent?.replace(/_/g, ' ') || 'unknown'}
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      s.classification === 'critical' || s.classification === 'dangerous'
                        ? 'bg-red-950 text-red-400'
                        : s.classification === 'suspicious'
                        ? 'bg-amber-950 text-amber-400'
                        : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {s.riskScore}/100
                    </span>
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

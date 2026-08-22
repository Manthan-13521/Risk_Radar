export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getPatternStats } from '@/lib/dna';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function IntelligencePage() {
  const dnaStats = await getPatternStats();

  const externalFeeds = [
    { name: 'VirusTotal API', type: 'Reputation & Multi-Scanner', status: 'not_connected', desc: 'File hash and domain reputation queries' },
    { name: 'OpenPhish Live Feed', type: 'Phishing URLs', status: 'not_connected', desc: 'Zero-day targeted phishing URL stream' },
    { name: 'Google Safe Browsing', type: 'Web Threat API', status: 'not_connected', desc: 'Malware and unwanted software feeds' },
    { name: 'MISP Community Feed', type: 'Adversary Intelligence', status: 'not_connected', desc: 'Open source threat sharing platform' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Threat Intelligence Center"
        subtitle="Global threat feeds, external intelligence integrations, and local Threat DNA correlation."
        badge={
          <span className="text-xs bg-blue-950/80 border border-blue-800/60 text-blue-300 px-2.5 py-0.5 rounded font-mono">
            COMMUNITY & LOCAL FEEDS
          </span>
        }
      />

      {/* External Threat Feeds Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          External Threat Feed Integrations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {externalFeeds.map((feed) => (
            <div
              key={feed.name}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-zinc-200">{feed.name}</h3>
                  <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded border border-zinc-700">
                    NOT CONNECTED
                  </span>
                </div>
                <div className="text-xs font-mono text-zinc-500 mb-2">{feed.type}</div>
                <p className="text-xs text-zinc-400">{feed.desc}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-xs">
                <span className="text-zinc-600">Requires external API key</span>
                <button
                  disabled
                  className="px-2.5 py-1 bg-zinc-800/60 text-zinc-500 rounded text-[11px] cursor-not-allowed"
                >
                  Configure Feed
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Threat DNA Intelligence */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Local Threat DNA Correlation Engine
          </h2>
          <Link href="/threat-dna" className="text-xs text-blue-400 hover:underline">
            Open DNA Explorer →
          </Link>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          ShieldSense clusters investigated attacks by structural DNA tags, detecting coordinated campaigns and brand impersonation waves even without external feed connectivity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase font-semibold">Active Signatures</div>
            <div className="text-2xl font-bold font-mono text-blue-300 mt-1">{dnaStats.distinctPatterns}</div>
          </div>
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase font-semibold">Total Scans Correlated</div>
            <div className="text-2xl font-bold font-mono text-zinc-200 mt-1">{dnaStats.totalScans}</div>
          </div>
          <div className="p-4 bg-zinc-950/60 border border-zinc-800 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase font-semibold">Threat Correlation Rate</div>
            <div className="text-2xl font-bold font-mono text-red-400 mt-1">
              {dnaStats.totalScans > 0
                ? `${Math.round((dnaStats.threatsFound / dnaStats.totalScans) * 100)}%`
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

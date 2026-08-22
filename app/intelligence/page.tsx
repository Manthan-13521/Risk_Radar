export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getPatternStats } from '@/lib/dna';

export default async function IntelligencePage() {
  const dnaStats = await getPatternStats();

  const externalFeeds = [
    { name: 'VirusTotal API', type: 'Reputation & Multi-Scanner', status: 'not_connected', desc: 'File hash and domain reputation queries' },
    { name: 'OpenPhish Live Feed', type: 'Phishing URLs', status: 'not_connected', desc: 'Zero-day targeted phishing URL stream' },
    { name: 'Google Safe Browsing', type: 'Web Threat API', status: 'not_connected', desc: 'Malware and unwanted software feeds' },
    { name: 'MISP Community Feed', type: 'Adversary Intelligence', status: 'not_connected', desc: 'Open source threat sharing platform' },
  ];

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Threat Intelligence</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>INTELLIGENCE CENTER</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>
          Global threat feeds, external intelligence integrations, and local Threat DNA correlation.
        </p>
      </div>

      {/* External Feeds */}
      <div className="space-y-4">
        <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>
          External Threat Feed Integrations
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {externalFeeds.map((feed) => (
            <div
              key={feed.name}
              className="rounded-xl border p-5 flex flex-col justify-between space-y-4 shadow-sm"
              style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-bold" style={{ color: '#111111' }}>{feed.name}</h3>
                  <span
                    className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold"
                    style={{ background: '#D3C9C5', borderColor: '#C4B5B0', color: '#554B49' }}
                  >
                    NOT CONNECTED
                  </span>
                </div>
                <div className="text-xs font-mono mb-2 font-medium" style={{ color: '#554B49' }}>{feed.type}</div>
                <p className="text-xs font-medium" style={{ color: '#554B49' }}>{feed.desc}</p>
              </div>

              <div className="pt-3 border-t flex justify-between items-center text-xs" style={{ borderColor: '#C4B5B0' }}>
                <span className="font-medium" style={{ color: '#554B49' }}>Requires external API key</span>
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-not-allowed border"
                  style={{ background: '#D3C9C5', borderColor: '#C4B5B0', color: '#554B49' }}
                >
                  Configure Feed
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Threat DNA */}
      <div className="rounded-2xl border p-6 md:p-8 space-y-4 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
        <div className="flex items-center justify-between">
          <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#111111' }}>
            Local Threat DNA Correlation Engine
          </div>
          <Link href="/threat-dna" className="text-xs font-bold" style={{ color: '#990011' }}>
            Open DNA Explorer →
          </Link>
        </div>

        <p className="text-xs leading-relaxed font-medium" style={{ color: '#554B49' }}>
          Risk_Radar clusters investigated attacks by structural DNA tags, detecting coordinated campaigns and brand impersonation waves even without external feed connectivity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
            <div className="text-[10px] font-extrabold uppercase" style={{ color: '#554B49' }}>Active Signatures</div>
            <div className="text-2xl font-extrabold font-mono mt-1" style={{ color: '#111111' }}>{dnaStats.distinctPatterns}</div>
          </div>
          <div className="p-4 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
            <div className="text-[10px] font-extrabold uppercase" style={{ color: '#554B49' }}>Total Scans Correlated</div>
            <div className="text-2xl font-extrabold font-mono mt-1" style={{ color: '#111111' }}>{dnaStats.totalScans}</div>
          </div>
          <div className="p-4 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
            <div className="text-[10px] font-extrabold uppercase" style={{ color: '#554B49' }}>Threat Correlation Rate</div>
            <div className="text-2xl font-extrabold font-mono mt-1" style={{ color: '#990011' }}>
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

export const dynamic = 'force-dynamic';

import { getPatternStats } from '@/lib/dna';

export default async function ThreatDNAPage() {
  const stats = await getPatternStats();

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#FCF6F5' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#D5C8C5' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Intelligence</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>THREAT DNA</h1>
        <p className="text-sm mt-1" style={{ color: '#6F6664' }}>Remember the behavior, not the address.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Scans Analyzed', value: stats.totalScans, sub: 'Ingested investigations', color: '#111111' },
          { label: 'Threats Correlated', value: stats.threatsFound, sub: 'Elevated risk detections', color: '#990011' },
          { label: 'Distinct DNA Signatures', value: stats.distinctPatterns, sub: 'Behavioral clusters', color: '#111111' },
        ].map(m => (
          <div key={m.label} className="rounded-xl border p-5" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#6F6664' }}>{m.label}</div>
            <div className="text-3xl font-extrabold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs mt-1" style={{ color: '#6F6664' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Pattern cards */}
      <div className="space-y-3">
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>Discovered Adversarial Signatures</div>

        {stats.patterns.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
            <div className="text-lg font-extrabold mb-2" style={{ color: '#111111' }}>NO THREAT DNA CLUSTERS YET</div>
            <p className="text-sm" style={{ color: '#6F6664' }}>
              As multi-signal investigations are submitted with shared traits, behavioral clusters will automatically populate here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.patterns.map((pattern, idx) => (
              <div
                key={idx}
                className="rounded-xl border p-5 flex flex-col justify-between transition hover:bg-white/30"
                style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-sm font-extrabold font-mono" style={{ color: '#111111' }}>DNA-SIG #{idx + 1}</h3>
                    <span
                      className="text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase"
                      style={{ background: 'rgba(153,0,17,0.1)', color: '#990011', border: '1px solid rgba(153,0,17,0.2)' }}
                    >
                      {pattern.count} {pattern.count === 1 ? 'MATCH' : 'MATCHES'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pattern.tags.map(t => (
                      <span
                        key={t}
                        className="text-[11px] px-2.5 py-1 rounded-lg font-mono border"
                        style={{ background: '#E7DEDC', borderColor: '#D5C8C5', color: '#111111' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] pt-3 mt-3 border-t flex justify-between" style={{ borderColor: '#D5C8C5', color: '#6F6664' }}>
                  <span>Last Seen:</span>
                  <span className="font-mono">
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
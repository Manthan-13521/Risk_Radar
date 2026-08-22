export const dynamic = 'force-dynamic';

import { getPatternStats } from '@/lib/dna';

export default async function ThreatDNAPage() {
  const stats = await getPatternStats();

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Threat DNA Explorer</h1>
        <p className="text-zinc-400">Behavioral patterns observed in your investigation history.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold">{stats.totalScans}</div>
            <div className="text-sm text-zinc-400 mt-2 uppercase tracking-wide">Total Scans</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-red-400">{stats.threatsFound}</div>
            <div className="text-sm text-zinc-400 mt-2 uppercase tracking-wide">Threats Found</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg text-center">
            <div className="text-4xl font-bold text-blue-400">{stats.distinctPatterns}</div>
            <div className="text-sm text-zinc-400 mt-2 uppercase tracking-wide">Distinct Patterns</div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-10 mb-4">Behavioral Patterns</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.patterns.length === 0 && (
             <div className="col-span-2 text-center p-12 bg-zinc-900 rounded-lg text-zinc-500">
               No behavioral patterns detected yet.
             </div>
          )}
          {stats.patterns.map((pattern, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex flex-col gap-4">
               <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold">Pattern #{idx + 1}</h3>
                  <div className="bg-zinc-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {pattern.count} Occurrences
                  </div>
               </div>
               
               <div className="flex flex-wrap gap-2">
                 {pattern.tags.map(t => (
                   <span key={t} className="bg-blue-900/40 text-blue-300 border border-blue-900/50 text-xs px-2 py-1 rounded font-mono">
                     {t}
                   </span>
                 ))}
               </div>
               
               <div className="text-xs text-zinc-500 mt-auto pt-4 border-t border-zinc-800/50">
                 Last detected: {pattern.lastDetected ? new Date(pattern.lastDetected).toLocaleDateString() : 'N/A'}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
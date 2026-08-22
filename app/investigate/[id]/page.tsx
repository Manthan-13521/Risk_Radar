
export const dynamic = 'force-dynamic';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function InvestigationResult({ params }: { params: { id: string } }) {
  const db = await getDb();
  const scan = await db.collection('scans').findOne({ _id: new ObjectId(params.id) });
  
  if (!scan) return <div className="p-8 text-white text-center">Investigation not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className={`p-6 rounded-lg border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
          scan.riskScore >= 80 ? 'bg-red-950/20 border-red-900/50' : 
          scan.riskScore >= 50 ? 'bg-orange-950/20 border-orange-900/50' : 
          'bg-green-950/20 border-green-900/50'
        }`}>
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight flex items-center gap-3">
              {scan.classification === 'safe' && '🟢 LOW RISK'}
              {scan.classification === 'suspicious' && '🟡 SUSPICIOUS'}
              {scan.classification === 'dangerous' && '🟠 DANGEROUS'}
              {scan.classification === 'critical' && '🔴 CRITICAL THREAT'}
            </h1>
            <p className="text-sm text-zinc-400 mt-2 uppercase tracking-widest">{new Date(scan.createdAt).toLocaleString()} • {scan.inputType}</p>
          </div>
          <div className="flex gap-4">
             <div className="text-center bg-zinc-950/50 px-4 py-2 rounded border border-zinc-800">
               <div className="text-xs text-zinc-500 uppercase font-semibold">Risk</div>
               <div className="text-2xl font-bold">{scan.riskScore} <span className="text-sm text-zinc-500">/ 100</span></div>
             </div>
             <div className="text-center bg-zinc-950/50 px-4 py-2 rounded border border-zinc-800">
               <div className="text-xs text-zinc-500 uppercase font-semibold">Confidence</div>
               <div className="text-2xl font-bold">{scan.confidenceScore} <span className="text-sm text-zinc-500">/ 100</span></div>
             </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
           <div>
             <h2 className="text-xs text-zinc-400 uppercase font-semibold tracking-wider mb-1">Recommended Action</h2>
             <div className={`text-3xl font-bold capitalize ${
               scan.recommendedAction === 'allow' ? 'text-green-400' :
               scan.recommendedAction === 'warn' ? 'text-yellow-400' :
               'text-red-500'
             }`}>
               {scan.recommendedAction === 'allow' ? '✅' : scan.recommendedAction === 'warn' ? '⚠️' : '🔒'} {scan.recommendedAction}
             </div>
           </div>
           
           {scan.actionTaken ? (
             <div className="bg-zinc-800 px-6 py-3 rounded-md font-semibold text-zinc-300 flex items-center gap-2">
               Action Executed: <span className="capitalize text-white">{scan.actionTaken}</span>
             </div>
           ) : (
             <form action={`/api/scans/${scan._id}/action`} method="POST" className="flex gap-2">
               <button 
                  type="submit" 
                  name="action" 
                  value={scan.recommendedAction}
                  className={`px-6 py-3 rounded-md font-semibold transition ${
                    scan.recommendedAction === 'allow' ? 'bg-green-700 hover:bg-green-600' :
                    scan.recommendedAction === 'warn' ? 'bg-yellow-700 hover:bg-yellow-600 text-black' :
                    'bg-red-600 hover:bg-red-500 text-white'
                  }`}>
                 Approve {scan.recommendedAction}
               </button>
             </form>
           )}
        </div>

        {/* File Analysis Section (if file) */}
        {scan.inputType === 'file' && scan.inputMetadata && scan.inputMetadata.filename && (
           <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg space-y-3 shadow-md">
             <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">📄 File Analysis</h2>
             <div className="text-lg font-mono text-zinc-200 bg-zinc-950 p-3 rounded border border-zinc-800 break-all">
               {scan.inputMetadata.filename}
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="text-xs text-zinc-500 uppercase">Extension</div>
                  <div className="font-semibold">{scan.inputMetadata.extension || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase">Size</div>
                  <div className="font-semibold">{Math.round(scan.inputMetadata.size / 1024)} KB</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-zinc-500 uppercase">SHA-256 Hash</div>
                  <div className="font-mono text-sm truncate text-zinc-400 group relative">
                    {scan.inputMetadata.sha256 ? scan.inputMetadata.sha256.substring(0, 16) + '...' : 'N/A'}
                    {scan.inputMetadata.sha256 && (
                      <span className="absolute z-10 hidden group-hover:block bg-zinc-800 text-white text-xs p-2 rounded -top-8 left-0">
                        {scan.inputMetadata.sha256}
                      </span>
                    )}
                  </div>
                </div>
             </div>
           </div>
        )}

        {/* Intent & Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="col-span-1 bg-zinc-900 p-5 rounded-lg border border-zinc-800">
              <h3 className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mb-2">Attacker Intent</h3>
              <p className="text-xl font-medium capitalize text-blue-200">{scan.attackerIntent.replace(/_/g, ' ')}</p>
           </div>
           <div className="col-span-2 bg-zinc-900 p-5 rounded-lg border border-zinc-800">
              <h3 className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mb-2">Why?</h3>
              <p className="text-zinc-300 leading-relaxed">{scan.explanation}</p>
           </div>
        </div>

        {/* DNA Match */}
        {scan.dnaOverlap && scan.dnaOverlap.length > 0 && scan.dnaOverlap[0].overlapPercent >= 50 ? (
          <div className="bg-blue-950/30 border border-blue-900/50 p-6 rounded-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
             <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
               🧬 Similar Attack Pattern Detected
             </h2>
             <p className="text-blue-300 font-medium mb-4">
               {scan.dnaOverlap[0].overlapPercent}% behavioral similarity with a previously detected threat.
             </p>
             <div className="flex flex-col gap-2 bg-zinc-950/50 p-4 rounded border border-blue-900/30">
                <div className="text-sm">
                  <span className="text-zinc-400">Previous Intent:</span> <span className="capitalize font-medium">{scan.dnaOverlap[0].previousIntent.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-sm text-zinc-400 mb-1">Shared Behavioral Signals:</div>
                <div className="flex flex-wrap gap-2">
                  {scan.dnaOverlap[0].sharedTags.map((tag: string, i: number) => (
                    <span key={i} className="bg-blue-900 text-blue-100 text-xs px-2 py-1 rounded font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg text-center">
             <h2 className="text-lg font-bold text-zinc-300 mb-1">New Behavioral Pattern</h2>
             <p className="text-sm text-zinc-500">No similar attack pattern was found in your recent investigations.</p>
          </div>
        )}

        {/* Evidence */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Evidence</h2>
          {scan.evidence && scan.evidence.length === 0 && (
             <div className="text-zinc-500 p-4 bg-zinc-900 rounded">No distinct evidence found.</div>
          )}
          {scan.evidence && scan.evidence.map((e: Record<string, string>, i: number) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex flex-col md:flex-row gap-4">
              <div className={`font-bold text-xs uppercase px-2 py-1 h-fit rounded w-fit whitespace-nowrap ${
                e.severity === 'critical' || e.severity === 'high' ? 'bg-red-950 text-red-400 border border-red-900/50' : 
                e.severity === 'medium' ? 'bg-orange-950 text-orange-400 border border-orange-900/50' : 
                'bg-zinc-800 text-zinc-300'
              }`}>
                {e.severity}
              </div>
              <div>
                <h4 className="font-semibold text-lg">{e.title}</h4>
                <p className="text-zinc-400 text-sm mt-1">{e.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Threat DNA Full List */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Threat DNA</h2>
            <p className="text-sm text-zinc-500 mt-1">Behavioral characteristics identified in this scan.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {scan.dnaTags && scan.dnaTags.length > 0 ? scan.dnaTags.map((tag: string, i: number) => (
              <span key={i} className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs px-3 py-1.5 rounded font-mono shadow-sm">
                {tag}
              </span>
            )) : (
              <span className="text-zinc-500 italic text-sm">No behavioral tags identified.</span>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

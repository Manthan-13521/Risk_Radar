export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/mongodb';

export default async function HistoryPage({ searchParams }: { searchParams: { type?: string; classification?: string } }) {
  const db = await getDb();
  
  const query: Record<string, string> = {};
  if (searchParams.type && searchParams.type !== 'all') {
    query.inputType = searchParams.type;
  }
  if (searchParams.classification && searchParams.classification !== 'all') {
    query.classification = searchParams.classification;
  }
  
  const scans = await db.collection('scans').find(query).sort({ createdAt: -1 }).limit(50).toArray();

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Scan History</h1>
          <div className="flex gap-4">
             <Link href="/history?classification=all" className="text-sm px-3 py-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800">All</Link>
             <Link href="/history?classification=safe" className="text-sm px-3 py-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800">Safe</Link>
             <Link href="/history?classification=suspicious" className="text-sm px-3 py-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800">Suspicious</Link>
             <Link href="/history?classification=dangerous" className="text-sm px-3 py-1 bg-zinc-900 border border-zinc-800 rounded hover:bg-zinc-800">Dangerous</Link>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/50 uppercase text-xs text-zinc-400">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Type</th>
                <th className="p-4">Classification</th>
                <th className="p-4">Risk</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Intent</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-zinc-500">No investigations found.</td></tr>
              )}
              {scans.map(scan => (
                <tr key={scan._id.toString()} className="border-t border-zinc-800 hover:bg-zinc-800/50 transition">
                  <td className="p-4 whitespace-nowrap"><Link href={`/investigate/${scan._id}`}>{new Date(scan.createdAt).toLocaleTimeString()}</Link></td>
                  <td className="p-4 capitalize">{scan.inputType}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${scan.classification === 'safe' ? 'bg-green-950 text-green-300' : scan.classification === 'suspicious' ? 'bg-yellow-950 text-yellow-300' : 'bg-red-950 text-red-300'}`}>
                      {scan.classification.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">{scan.riskScore}</td>
                  <td className="p-4">{scan.confidenceScore}</td>
                  <td className="p-4">{scan.attackerIntent}</td>
                  <td className="p-4 capitalize text-zinc-300">{scan.actionTaken || scan.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { type?: string; classification?: string };
}) {
  const db = await getDb();

  const query: Record<string, string> = {};
  if (searchParams.type && searchParams.type !== 'all') {
    query.inputType = searchParams.type;
  }
  if (searchParams.classification && searchParams.classification !== 'all') {
    query.classification = searchParams.classification;
  }

  const scans = await db
    .collection('scans')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const activeClass = searchParams.classification || 'all';
  const activeType = searchParams.type || 'all';

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Scan History"
        subtitle="Complete immutable telemetry and audit record of all processed investigations."
        badge={
          <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded font-mono">
            {scans.length} RECORDS
          </span>
        }
      />

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mr-2">Severity:</span>
          {['all', 'safe', 'suspicious', 'dangerous', 'critical'].map((c) => (
            <Link
              key={c}
              href={`/history?classification=${c}&type=${activeType}`}
              className={`text-xs px-3 py-1 rounded-md capitalize transition ${
                activeClass === c
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mr-2">Type:</span>
          {['all', 'url', 'message', 'file'].map((t) => (
            <Link
              key={t}
              href={`/history?classification=${activeClass}&type=${t}`}
              className={`text-xs px-3 py-1 rounded-md capitalize transition ${
                activeType === t
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      {/* Scans Table */}
      {scans.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No Investigation Logs Found"
          description="There are no investigations matching your selected filter criteria."
          action={
            <Link
              href="/history"
              className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
            >
              Clear Filters
            </Link>
          }
        />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Target / Summary</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Risk</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Attacker Intent</th>
                  <th className="p-4">Action</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {scans.map((scan) => (
                  <tr key={scan._id.toString()} className="hover:bg-zinc-800/40 transition">
                    <td className="p-4 whitespace-nowrap text-zinc-400 font-sans">
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 capitalize text-zinc-300 font-sans">{scan.inputType}</td>
                    <td className="p-4 font-sans text-zinc-400 max-w-xs truncate">
                      {scan.inputType === 'file'
                        ? (scan.inputMetadata as Record<string, unknown>)?.filename as string
                        : (scan.inputMetadata as Record<string, unknown>)?.truncatedContent as string}
                    </td>
                    <td className="p-4">
                      <StatusBadge classification={scan.classification} />
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          scan.riskScore >= 80
                            ? 'text-red-400'
                            : scan.riskScore >= 50
                            ? 'text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      >
                        {scan.riskScore}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400">{scan.confidenceScore}</td>
                    <td className="p-4 capitalize font-sans text-zinc-300">
                      {scan.attackerIntent?.replace(/_/g, ' ') || 'unknown'}
                    </td>
                    <td className="p-4 capitalize font-mono text-zinc-300">
                      {scan.actionTaken || scan.recommendedAction}
                    </td>
                    <td className="p-4 text-right font-sans">
                      <Link
                        href={`/investigate/${scan._id}`}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] transition"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
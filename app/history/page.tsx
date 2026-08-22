export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/mongodb';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { type?: string; classification?: string };
}) {
  const db = await getDb();
  const query: Record<string, string> = {};
  if (searchParams.type && searchParams.type !== 'all') query.inputType = searchParams.type;
  if (searchParams.classification && searchParams.classification !== 'all') query.classification = searchParams.classification;

  const scans = await db.collection('scans').find(query).sort({ createdAt: -1 }).limit(100).toArray();
  const activeClass = searchParams.classification || 'all';
  const activeType = searchParams.type || 'all';

  function clsColor(cls: string) {
    if (cls === 'critical') return { bg: '#76000D', color: '#fff' };
    if (cls === 'dangerous') return { bg: '#990011', color: '#fff' };
    if (cls === 'suspicious') return { bg: '#B86A00', color: '#fff' };
    return { bg: '#176B52', color: '#fff' };
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Telemetry</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>SCAN HISTORY</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>Complete immutable telemetry and audit record of all processed investigations.</p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border p-4 space-y-3 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest mr-2" style={{ color: '#554B49' }}>Severity:</span>
          {['all', 'safe', 'suspicious', 'dangerous', 'critical'].map(c => (
            <Link
              key={c}
              href={`/history?classification=${c}&type=${activeType}`}
              className="text-xs px-3.5 py-1.5 rounded-xl capitalize transition font-bold shadow-xs"
              style={{
                background: activeClass === c ? '#990011' : '#ECE6E2',
                color: activeClass === c ? '#fff' : '#554B49',
                border: `1px solid ${activeClass === c ? '#990011' : '#C4B5B0'}`,
              }}
            >
              {c}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest mr-2" style={{ color: '#554B49' }}>Type:</span>
          {['all', 'url', 'message', 'file'].map(t => (
            <Link
              key={t}
              href={`/history?classification=${activeClass}&type=${t}`}
              className="text-xs px-3.5 py-1.5 rounded-xl capitalize transition font-bold shadow-xs"
              style={{
                background: activeType === t ? '#990011' : '#ECE6E2',
                color: activeType === t ? '#fff' : '#554B49',
                border: `1px solid ${activeType === t ? '#990011' : '#C4B5B0'}`,
              }}
            >
              {t}
            </Link>
          ))}
        </div>
        <div className="text-xs font-bold font-mono" style={{ color: '#554B49' }}>{scans.length} records</div>
      </div>

      {/* Table */}
      {scans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="text-lg font-extrabold mb-2" style={{ color: '#111111' }}>NO RECORDS FOUND</div>
          <p className="text-sm mb-4 font-medium" style={{ color: '#554B49' }}>No investigations match the selected filters.</p>
          <Link href="/history" className="inline-flex px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm" style={{ background: '#990011' }}>Clear Filters</Link>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b" style={{ borderColor: '#C4B5B0', background: '#D3C9C5' }}>
                <tr>
                  {['Timestamp', 'Type', 'Target / Summary', 'Classification', 'Risk', 'Confidence', 'Intent', 'Action', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#C4B5B0' }}>
                {scans.map(scan => {
                  const { bg, color } = clsColor(String(scan.classification));
                  const riskColor = scan.riskScore >= 80 ? '#990011' : scan.riskScore >= 50 ? '#B86A00' : '#111111';
                  return (
                    <tr key={scan._id.toString()} className="transition hover:bg-white/40">
                      <td className="px-4 py-3 whitespace-nowrap font-medium" style={{ color: '#554B49' }}>
                        {new Date(scan.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 capitalize font-bold" style={{ color: '#111111' }}>{scan.inputType}</td>
                      <td className="px-4 py-3 max-w-xs truncate font-mono text-[11px]" style={{ color: '#554B49' }}>
                        {scan.inputType === 'file'
                          ? (scan.inputMetadata as Record<string, unknown>)?.filename as string
                          : (scan.inputMetadata as Record<string, unknown>)?.truncatedContent as string}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase shadow-xs" style={{ background: bg, color }}>{String(scan.classification)}</span>
                      </td>
                      <td className="px-4 py-3 font-extrabold font-mono" style={{ color: riskColor }}>{scan.riskScore}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#554B49' }}>{scan.confidenceScore}%</td>
                      <td className="px-4 py-3 capitalize font-semibold" style={{ color: '#111111' }}>
                        {String(scan.attackerIntent || 'unknown').replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 capitalize font-mono font-medium" style={{ color: '#554B49' }}>
                        {String(scan.actionTaken || scan.recommendedAction || '—')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/investigate/${scan._id}`}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition hover:bg-white shadow-xs"
                          style={{ background: '#ECE6E2', color: '#990011', border: '1px solid #C4B5B0' }}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
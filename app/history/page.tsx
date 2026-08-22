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
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#FCF6F5' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#D5C8C5' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Telemetry</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>SCAN HISTORY</h1>
        <p className="text-sm mt-1" style={{ color: '#6F6664' }}>Complete immutable telemetry and audit record of all processed investigations.</p>
      </div>

      {/* Filters */}
      <div className="rounded-xl border p-4 space-y-3" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest mr-2" style={{ color: '#6F6664' }}>Severity:</span>
          {['all', 'safe', 'suspicious', 'dangerous', 'critical'].map(c => (
            <Link
              key={c}
              href={`/history?classification=${c}&type=${activeType}`}
              className="text-xs px-3 py-1.5 rounded-lg capitalize transition font-bold"
              style={{
                background: activeClass === c ? '#990011' : '#FCF6F5',
                color: activeClass === c ? '#fff' : '#6F6664',
                border: `1px solid ${activeClass === c ? '#990011' : '#D5C8C5'}`,
              }}
            >
              {c}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest mr-2" style={{ color: '#6F6664' }}>Type:</span>
          {['all', 'url', 'message', 'file'].map(t => (
            <Link
              key={t}
              href={`/history?classification=${activeClass}&type=${t}`}
              className="text-xs px-3 py-1.5 rounded-lg capitalize transition font-bold"
              style={{
                background: activeType === t ? '#990011' : '#FCF6F5',
                color: activeType === t ? '#fff' : '#6F6664',
                border: `1px solid ${activeType === t ? '#990011' : '#D5C8C5'}`,
              }}
            >
              {t}
            </Link>
          ))}
        </div>
        <div className="text-xs font-bold" style={{ color: '#6F6664' }}>{scans.length} records</div>
      </div>

      {/* Table */}
      {scans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
          <div className="text-lg font-extrabold mb-2" style={{ color: '#111111' }}>NO RECORDS FOUND</div>
          <p className="text-sm mb-4" style={{ color: '#6F6664' }}>No investigations match the selected filters.</p>
          <Link href="/history" className="inline-flex px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: '#990011' }}>Clear Filters</Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b" style={{ borderColor: '#D5C8C5', background: '#E7DEDC' }}>
                <tr>
                  {['Timestamp', 'Type', 'Target / Summary', 'Classification', 'Risk', 'Confidence', 'Intent', 'Action', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#D5C8C5' }}>
                {scans.map(scan => {
                  const { bg, color } = clsColor(String(scan.classification));
                  const riskColor = scan.riskScore >= 80 ? '#990011' : scan.riskScore >= 50 ? '#B86A00' : '#111111';
                  return (
                    <tr key={scan._id.toString()} className="transition hover:bg-white/30">
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#6F6664' }}>
                        {new Date(scan.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 capitalize" style={{ color: '#111111' }}>{scan.inputType}</td>
                      <td className="px-4 py-3 max-w-xs truncate font-mono text-[11px]" style={{ color: '#6F6664' }}>
                        {scan.inputType === 'file'
                          ? (scan.inputMetadata as Record<string, unknown>)?.filename as string
                          : (scan.inputMetadata as Record<string, unknown>)?.truncatedContent as string}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: bg, color }}>{String(scan.classification)}</span>
                      </td>
                      <td className="px-4 py-3 font-bold font-mono" style={{ color: riskColor }}>{scan.riskScore}</td>
                      <td className="px-4 py-3" style={{ color: '#6F6664' }}>{scan.confidenceScore}%</td>
                      <td className="px-4 py-3 capitalize" style={{ color: '#111111' }}>
                        {String(scan.attackerIntent || 'unknown').replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 capitalize font-mono" style={{ color: '#6F6664' }}>
                        {String(scan.actionTaken || scan.recommendedAction || '—')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/investigate/${scan._id}`}
                          className="px-2.5 py-1 rounded text-[11px] font-bold transition hover:opacity-80"
                          style={{ background: '#E7DEDC', color: '#990011', border: '1px solid #D5C8C5' }}
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
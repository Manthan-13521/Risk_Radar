export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getIncidentById } from '@/lib/incident-service';
import { IncidentActions } from '@/components/IncidentActions';

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const incident = await getIncidentById(params.id);

  if (!incident) {
    return (
      <div className="p-12 text-center" style={{ color: '#111111' }}>
        <h2 className="text-xl font-extrabold mb-2">INCIDENT NOT FOUND</h2>
        <p className="text-sm mb-4" style={{ color: '#554B49' }}>The requested incident ID does not exist in the database.</p>
        <Link href="/incidents" className="text-xs font-bold" style={{ color: '#990011' }}>
          ← Back to Incident Response
        </Link>
      </div>
    );
  }

  const formattedIntent = incident.attackerIntent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const sev = incident.severity;
  const sevColor = sev === 'critical' ? '#76000D' : sev === 'high' ? '#990011' : sev === 'medium' ? '#B86A00' : '#554B49';

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Security Incident</div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>INCIDENT: {incident.incidentId}</h1>
          <p className="text-xs mt-1 font-mono font-medium" style={{ color: '#554B49' }}>
            Flagged on {new Date(incident.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded text-xs font-extrabold uppercase shadow-xs"
            style={{ background: `rgba(153,0,17,0.1)`, color: sevColor, border: `1.5px solid ${sevColor}` }}
          >
            {incident.severity}
          </span>
          <Link
            href="/incidents"
            className="px-4 py-2 rounded-xl text-xs font-bold border transition hover:bg-white/40 shadow-xs"
            style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#111111' }}
          >
            ← Back to List
          </Link>
        </div>
      </div>

      {/* Triage Action Ribbon */}
      <div
        className="rounded-2xl border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
        style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}
      >
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>Incident Lifecycle</div>
          <div className="text-sm font-bold mt-0.5" style={{ color: '#111111' }}>
            Status: <span className="uppercase font-mono font-extrabold" style={{ color: '#990011' }}>{incident.status}</span>
          </div>
          {incident.actionTaken && (
            <p className="text-xs mt-1 font-medium" style={{ color: '#554B49' }}>Latest action: {incident.actionTaken}</p>
          )}
        </div>
        <IncidentActions incidentId={params.id} currentStatus={incident.status} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="rounded-2xl border p-6 space-y-6 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#554B49' }}>Risk Score</div>
            <div className="text-4xl font-extrabold font-mono" style={{ color: '#990011' }}>
              {incident.riskScore} <span className="text-xs font-normal" style={{ color: '#554B49' }}>/100</span>
            </div>
            <div className="w-full rounded-full h-2 mt-2 overflow-hidden" style={{ background: '#C4B5B0' }}>
              <div
                className="h-2 rounded-full"
                style={{ width: `${incident.riskScore}%`, background: '#990011' }}
              />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#554B49' }}>AI Confidence</div>
            <div className="text-3xl font-extrabold font-mono" style={{ color: '#111111' }}>
              {incident.confidenceScore}%
            </div>
            <div className="w-full rounded-full h-1.5 mt-2 overflow-hidden" style={{ background: '#C4B5B0' }}>
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${incident.confidenceScore}%`, background: '#111111' }}
              />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#554B49' }}>Recommended Action</div>
            <div className="text-lg font-extrabold font-mono uppercase" style={{ color: '#990011' }}>
              {incident.recommendedAction}
            </div>
          </div>

          {incident.scanId && (
            <div className="pt-4 border-t" style={{ borderColor: '#C4B5B0' }}>
              <Link
                href={`/investigate/${incident.scanId}`}
                className="text-xs font-bold flex items-center gap-1.5"
                style={{ color: '#990011' }}
              >
                <span>🔍</span> View Full Investigation Record →
              </Link>
            </div>
          )}
        </div>

        {/* Right 2 Columns */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border p-6 space-y-4 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>
              Threat Intelligence Context
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold" style={{ color: '#554B49' }}>Attacker Intent</span>
              <div className="text-xl font-extrabold uppercase mt-0.5" style={{ color: '#111111' }}>{formattedIntent}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold" style={{ color: '#554B49' }}>Incident Summary</span>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: '#111111' }}>{incident.summary}</p>
            </div>
          </div>

          {/* Behavioral DNA Tags */}
          <div className="rounded-2xl border p-6 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: '#554B49' }}>
              Behavioral DNA Signatures
            </div>
            {incident.dnaTags.length === 0 ? (
              <p className="text-xs" style={{ color: '#554B49' }}>No DNA tags recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {incident.dnaTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold"
                    style={{ background: '#D3C9C5', borderColor: '#C4B5B0', color: '#111111' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Evidence List */}
          <div className="rounded-2xl border p-6 space-y-3 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>
              Corroborating Evidence
            </div>
            {incident.evidence.length === 0 ? (
              <p className="text-xs" style={{ color: '#554B49' }}>No specific evidence records attached.</p>
            ) : (
              <div className="space-y-2">
                {incident.evidence.map((ev: unknown, i: number) => {
                  const evRecord = ev as Record<string, string>;
                  const evSev = evRecord.severity || 'info';
                  const isHigh = evSev === 'critical' || evSev === 'high';
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border text-xs space-y-1"
                      style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold" style={{ color: '#111111' }}>{evRecord.title || 'Evidence Signal'}</span>
                        <span
                          className="text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold"
                          style={{
                            background: isHigh ? 'rgba(153,0,17,0.1)' : 'rgba(111,102,100,0.1)',
                            color: isHigh ? '#990011' : '#554B49',
                          }}
                        >
                          {evSev}
                        </span>
                      </div>
                      {evRecord.description && (
                        <p className="leading-relaxed" style={{ color: '#554B49' }}>{evRecord.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

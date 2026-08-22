export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getIncidentById } from '@/lib/incident-service';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { IncidentActions } from '@/components/IncidentActions';

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const incident = await getIncidentById(params.id);

  if (!incident) {
    return (
      <div className="p-12 text-center text-zinc-400">
        <h2 className="text-lg font-bold text-white mb-2">Incident Not Found</h2>
        <p className="text-xs text-zinc-500 mb-4">The requested incident ID does not exist in the database.</p>
        <Link href="/incidents" className="text-xs text-blue-400 hover:underline">
          ← Back to Incident Response
        </Link>
      </div>
    );
  }

  const formattedIntent = incident.attackerIntent.replace(/_/g, ' ');

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <PageHeader
        title={`Incident: ${incident.incidentId}`}
        subtitle={`Flagged on ${new Date(incident.createdAt).toLocaleString()}`}
        badge={<StatusBadge classification={incident.severity} />}
        actions={
          <Link
            href="/incidents"
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded transition"
          >
            ← Back to List
          </Link>
        }
      />

      {/* Triage Action Ribbon */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Incident Lifecycle</div>
          <div className="text-sm font-semibold text-zinc-200 mt-0.5">
            Current Status: <span className="uppercase text-blue-400 font-mono">{incident.status}</span>
          </div>
          {incident.actionTaken && (
            <p className="text-xs text-zinc-400 mt-1">Latest action: {incident.actionTaken}</p>
          )}
        </div>
        <IncidentActions incidentId={params.id} currentStatus={incident.status} />
      </div>

      {/* Main Grid: Details & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Risk & Confidence */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Risk Score</div>
            <div className="text-4xl font-bold font-mono text-red-400">
              {incident.riskScore} <span className="text-sm text-zinc-600">/100</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
              <div
                className="h-2 rounded-full bg-red-500"
                style={{ width: `${incident.riskScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">AI Confidence</div>
            <div className="text-2xl font-bold font-mono text-blue-300">
              {incident.confidenceScore} <span className="text-sm text-zinc-600">/100</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
              <div
                className="h-1.5 rounded-full bg-blue-500"
                style={{ width: `${incident.confidenceScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Recommended Action</div>
            <div className="text-sm font-bold font-mono uppercase text-amber-300">
              {incident.recommendedAction}
            </div>
          </div>

          {incident.scanId && (
            <div className="pt-2 border-t border-zinc-800">
              <Link
                href={`/investigate/${incident.scanId}`}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>🔍</span> View Full Investigation Record →
              </Link>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Threat Details & Evidence */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Threat Intelligence Context
            </h3>
            <div>
              <span className="text-xs text-zinc-500 block">Attacker Intent</span>
              <span className="text-base font-bold capitalize text-zinc-200">{formattedIntent}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block">Incident Summary</span>
              <p className="text-sm text-zinc-300 mt-1">{incident.summary}</p>
            </div>
          </div>

          {/* Behavioral DNA Tags */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Behavioral DNA Signatures
            </h3>
            {incident.dnaTags.length === 0 ? (
              <p className="text-xs text-zinc-600">No DNA tags recorded.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {incident.dnaTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-zinc-800 text-blue-300 border border-zinc-700 text-xs font-mono rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Evidence List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Corroborating Evidence
            </h3>
            {incident.evidence.length === 0 ? (
              <p className="text-xs text-zinc-600">No specific evidence records attached.</p>
            ) : (
              <div className="space-y-2">
                {incident.evidence.map((ev, i) => (
                  <div key={i} className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200">{String(ev.title || 'Evidence Signal')}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                        {String(ev.severity || 'info')}
                      </span>
                    </div>
                    {ev.description ? <p className="text-zinc-400">{String(ev.description)}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

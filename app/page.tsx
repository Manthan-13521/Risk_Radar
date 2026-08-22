export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDashboardStats, calculateSecurityPosture } from '@/lib/dashboard';
import { getIncidents } from '@/lib/incident-service';
import InvestigateForm from '@/components/InvestigateForm';

function ClassificationBadge({ cls }: { cls: string }) {
  const map: Record<string, string> = {
    safe: 'bg-green-950 text-green-300 border-green-900',
    suspicious: 'bg-yellow-950 text-yellow-300 border-yellow-900',
    dangerous: 'bg-orange-950 text-amber-300 border-orange-900',
    critical: 'bg-red-950 text-red-300 border-red-900',
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${map[cls] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
      {cls}
    </span>
  );
}

function MetricCard({ label, value, sub, color = 'text-white' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      {sub && <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>}
    </div>
  );
}

const DEMO_CASES = [
  { label: '🎯 Bank Phishing URL', type: 'url', content: 'https://paypa1-security.example.invalid/login', badge: 'critical' },
  { label: '📦 Delivery Scam', type: 'message', content: 'Your parcel is waiting. Pay ₹49 now to prevent cancellation of delivery.', badge: 'dangerous' },
  { label: '💳 Credential Theft', type: 'message', content: 'URGENT: Your bank account will be suspended in 2 hours. Verify your password and OTP immediately.', badge: 'dangerous' },
  { label: '✅ Safe URL', type: 'url', content: 'https://www.google.com/', badge: 'safe' },
];

export default async function ExecutiveDashboard() {
  const [stats, rawIncidents] = await Promise.all([
    getDashboardStats(),
    getIncidents(5),
  ]);

  const posture = calculateSecurityPosture(stats);
  const total = stats.totalScans || 0;

  const postureColor =
    posture.status === 'HEALTHY' ? 'text-green-400' :
    posture.status === 'WATCH' ? 'text-amber-400' :
    posture.status === 'DEGRADED' ? 'text-orange-400' : 'text-red-400';

  const postureBarColor =
    posture.status === 'HEALTHY' ? 'bg-green-500' :
    posture.status === 'WATCH' ? 'bg-amber-500' :
    posture.status === 'DEGRADED' ? 'bg-orange-500' : 'bg-red-500';

  // Compute distribution percentages
  const dist = stats.threatDistribution;
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

  // Largest risk in trend for scaling
  const maxRisk = stats.riskTrend.length > 0 ? Math.max(...stats.riskTrend.map(r => r.risk), 1) : 1;

  const incidents = rawIncidents.map(i => ({ ...i, _id: i._id?.toString() ?? '' }));

  return (
    <div className="p-5 space-y-5 max-w-[1400px]">
      {/* Top: Security Posture + Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Security Posture Card */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col gap-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Security Posture</div>
          <div className={`text-5xl font-bold font-mono ${postureColor}`}>{posture.score}</div>
          <div className="text-xs text-zinc-500">out of 100</div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${postureBarColor}`}
              style={{ width: `${posture.score}%` }}
            />
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${postureColor}`}>
            ● {posture.status}
          </span>
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            Calculated from scan history. Higher score = fewer active threats.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard label="Total Investigations" value={total} sub="All time" />
          <MetricCard label="Today" value={stats.todayScans} sub="Since midnight" color="text-blue-300" />
          <MetricCard label="Threats Detected" value={stats.threatsDetected} sub="Suspicious + Dangerous + Critical" color={stats.threatsDetected > 0 ? 'text-red-400' : 'text-green-400'} />
          <MetricCard label="Critical" value={stats.criticalCount} sub="Immediate action" color={stats.criticalCount > 0 ? 'text-red-400' : 'text-zinc-400'} />
          <MetricCard label="Dangerous" value={stats.dangerousCount} sub="High risk" color={stats.dangerousCount > 0 ? 'text-amber-400' : 'text-zinc-400'} />
          <MetricCard label="Safe" value={stats.safeCount} sub="Verified clean" color="text-green-400" />
        </div>
      </div>

      {/* Middle: Trend + Distribution + DNA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Trend */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Risk Trend — Last {stats.riskTrend.length} Investigations</div>
          {stats.riskTrend.length === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-6">No data yet</div>
          ) : (
            <div className="flex items-end gap-1 h-24">
              {[...stats.riskTrend].reverse().map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all ${point.risk >= 60 ? 'bg-red-700' : point.risk >= 30 ? 'bg-amber-600' : 'bg-green-700'}`}
                    style={{ height: `${Math.max(4, (point.risk / maxRisk) * 80)}px` }}
                    title={`Risk: ${point.risk}`}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
            <span>Earliest</span><span>Latest</span>
          </div>
        </div>

        {/* Threat Distribution */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Threat Distribution</div>
          {total === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-6">No data yet</div>
          ) : (
            <div className="space-y-2.5">
              {[
                { label: 'Safe', count: dist.safe, color: 'bg-green-600', text: 'text-green-300' },
                { label: 'Suspicious', count: dist.suspicious, color: 'bg-yellow-600', text: 'text-yellow-300' },
                { label: 'Dangerous', count: dist.dangerous, color: 'bg-orange-600', text: 'text-amber-300' },
                { label: 'Critical', count: dist.critical, color: 'bg-red-600', text: 'text-red-300' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={row.text}>{row.label}</span>
                    <span className="text-zinc-500 font-mono">{row.count} ({pct(row.count)}%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded h-1.5">
                    <div className={`h-1.5 rounded ${row.color}`} style={{ width: `${pct(row.count)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top DNA Tags */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Top Attack Patterns</div>
          {stats.topDnaTags.length === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-6">No behavioral patterns yet</div>
          ) : (
            <div className="space-y-2">
              {stats.topDnaTags.slice(0, 6).map((tag) => (
                <div key={tag.tag} className="flex items-center justify-between">
                  <span className="text-xs font-mono text-blue-300 truncate">{tag.tag}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-500">{tag.count}×</span>
                    <span className={`text-[10px] font-mono ${tag.avgRisk >= 60 ? 'text-red-400' : tag.avgRisk >= 30 ? 'text-amber-400' : 'text-green-400'}`}>
                      ~{tag.avgRisk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/threat-dna" className="block text-center text-[10px] text-blue-400 hover:text-blue-300 mt-3 transition">
            View All Patterns →
          </Link>
        </div>
      </div>

      {/* Bottom: Recent Incidents + Demo + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Incidents */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Recent Incidents</div>
            <Link href="/incidents" className="text-[10px] text-blue-400 hover:text-blue-300 transition">View All →</Link>
          </div>
          {incidents.length === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-6">
              No incidents yet. High-risk scans (risk ≥ 60) automatically create incidents.
            </div>
          ) : (
            <div className="space-y-2">
              {incidents.map((inc) => (
                <Link
                  key={inc._id}
                  href={`/incidents/${inc._id}`}
                  className="flex items-center justify-between p-3 bg-zinc-950/50 hover:bg-zinc-800/50 rounded border border-zinc-800/50 transition group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <ClassificationBadge cls={inc.classification} />
                      <span className="text-xs text-zinc-300 font-mono">{inc.incidentId}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 capitalize">
                      {inc.attackerIntent.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold font-mono ${inc.riskScore >= 80 ? 'text-red-400' : inc.riskScore >= 50 ? 'text-amber-400' : 'text-zinc-300'}`}>
                      {inc.riskScore}
                    </div>
                    <div className="text-[10px] text-zinc-600">risk</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Recent Activity</div>
            <Link href="/history" className="text-[10px] text-blue-400 hover:text-blue-300 transition">View All →</Link>
          </div>
          {stats.recentScans.length === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-6">No investigations yet.</div>
          ) : (
            <div className="space-y-2">
              {stats.recentScans.slice(0, 5).map((scan) => (
                <Link
                  key={String(scan._id)}
                  href={`/investigate/${String(scan._id)}`}
                  className="flex items-center justify-between p-3 bg-zinc-950/50 hover:bg-zinc-800/50 rounded border border-zinc-800/50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ClassificationBadge cls={String(scan.classification)} />
                      <span className="text-xs text-zinc-500 uppercase">{String(scan.inputType)}</span>
                    </div>
                    <div className="text-xs text-zinc-500 truncate mt-1 max-w-xs">
                      {scan.inputType === 'file'
                        ? (scan.inputMetadata as Record<string, unknown>)?.filename as string
                        : (scan.inputMetadata as Record<string, unknown>)?.truncatedContent as string}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-sm font-bold font-mono text-zinc-300">{Number(scan.riskScore)}</div>
                    <div className="text-[10px] text-zinc-600">risk</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Demo Mode Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-400">🎬</span>
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Demo Investigation Scenarios</div>
          <span className="text-[10px] text-zinc-600 ml-1">— Real engine analysis, no hardcoded results</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {DEMO_CASES.map((demo) => (
            <a
              key={demo.label}
              href={`/investigate?type=${demo.type}&content=${encodeURIComponent(demo.content)}`}
              className="flex flex-col gap-1 p-3 bg-zinc-950/50 hover:bg-zinc-800/40 border border-zinc-800 rounded transition group"
            >
              <span className="text-xs text-zinc-300 font-medium group-hover:text-white">{demo.label}</span>
              <ClassificationBadge cls={demo.badge} />
            </a>
          ))}
        </div>
        <div className="border-t border-zinc-800 pt-3">
          <div className="text-xs text-zinc-500 mb-2">Or investigate something custom:</div>
          <InvestigateForm compact />
        </div>
      </div>
    </div>
  );
}

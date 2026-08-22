export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDashboardStats, calculateSecurityPosture } from '@/lib/dashboard';
import { getIncidents } from '@/lib/incident-service';
import InvestigateForm from '@/components/InvestigateForm';

const DEMO_CASES = [
  { label: 'Bank Phishing URL', type: 'url', content: 'https://paypa1-security.example.invalid/login', badge: 'critical', icon: '🎯' },
  { label: 'Package Delivery Scam', type: 'message', content: 'Your parcel is waiting. Pay ₹49 now to prevent cancellation of delivery.', badge: 'dangerous', icon: '📦' },
  { label: 'Credential Theft Urgency', type: 'message', content: 'URGENT: Your bank account will be suspended in 2 hours. Verify your password and OTP immediately.', badge: 'dangerous', icon: '💳' },
  { label: 'Verified Safe Search', type: 'url', content: 'https://www.google.com/', badge: 'safe', icon: '✅' },
];

export default async function ExecutiveDashboard() {
  const [stats, rawIncidents] = await Promise.all([
    getDashboardStats(),
    getIncidents(6),
  ]);

  const posture = calculateSecurityPosture(stats);
  const total = stats.totalScans || 0;

  const postureColor =
    posture.status === 'HEALTHY' ? 'text-teal-400' :
    posture.status === 'WATCH' ? 'text-amber-400' :
    posture.status === 'DEGRADED' ? 'text-orange-400' : 'text-red-400';

  const postureBarColor =
    posture.status === 'HEALTHY' ? 'bg-teal-500' :
    posture.status === 'WATCH' ? 'bg-amber-500' :
    posture.status === 'DEGRADED' ? 'bg-orange-500' : 'bg-red-500';

  const dist = stats.threatDistribution;
  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;
  const maxRisk = stats.riskTrend.length > 0 ? Math.max(...stats.riskTrend.map(r => r.risk), 1) : 1;

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-[1500px] mx-auto">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Executive Command Center</span>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-teal-950/80 text-teal-300 border border-teal-800/60">
              MISSION CONTROL
            </span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Real-time security posture, telemetry streams, and threat intelligence orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            href="/investigate"
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition shadow-[0_0_15px_rgba(20,184,166,0.25)] flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>New Investigation</span>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards Row (matching the screenshot theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Security Posture */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>SECURITY POSTURE</span>
            <span className="text-teal-400">🛡</span>
          </div>
          <div className="my-2">
            <div className={`text-3xl md:text-4xl font-bold font-mono ${postureColor}`}>
              {posture.score}
              <span className="text-base text-zinc-500 font-normal">/100</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full transition-all ${postureBarColor}`}
                style={{ width: `${posture.score}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Status: {posture.status}</span>
          </div>
        </div>

        {/* Total Investigations */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>TOTAL SCANS</span>
            <span className="text-blue-400">📊</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold font-mono text-white my-2">
            {total}
          </div>
          <div className="text-[11px] text-zinc-500">
            {stats.todayScans} scans today
          </div>
        </div>

        {/* Threats Detected */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>THREATS IDENTIFIED</span>
            <span className="text-red-400">🚨</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold font-mono text-red-400 my-2">
            {stats.threatsDetected}
          </div>
          <div className="text-[11px] text-zinc-500">
            {stats.criticalCount} Critical • {stats.dangerousCount} Dangerous
          </div>
        </div>

        {/* Distinct Patterns */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>DNA CLUSTERS</span>
            <span className="text-purple-400">🧬</span>
          </div>
          <div className="text-3xl md:text-4xl font-bold font-mono text-purple-400 my-2">
            {stats.topDnaTags.length}
          </div>
          <div className="text-[11px] text-zinc-500">
            Adversarial signatures mapped
          </div>
        </div>
      </div>

      {/* Middle Grid: Trend + Threat Distribution + Top DNA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Trend Bar Chart */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Risk Velocity</span>
            <span className="text-[10px] text-zinc-500 font-mono">LAST {stats.riskTrend.length} SCANS</span>
          </div>
          {stats.riskTrend.length === 0 ? (
            <div className="text-zinc-600 text-xs text-center py-8">No telemetry data recorded yet</div>
          ) : (
            <div className="flex items-end gap-1.5 h-28 my-auto">
              {[...stats.riskTrend].reverse().map((point, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className={`w-full rounded-t transition-all ${
                      point.risk >= 60
                        ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                        : point.risk >= 30
                        ? 'bg-amber-500'
                        : 'bg-teal-500'
                    }`}
                    style={{ height: `${Math.max(6, (point.risk / maxRisk) * 90)}px` }}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-mono">
            <span>Historical</span>
            <span>Latest</span>
          </div>
        </div>

        {/* Threat Distribution */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3">
            Threat Breakdown
          </div>
          {total === 0 ? (
            <div className="text-zinc-600 text-xs text-center py-8">No classification records yet</div>
          ) : (
            <div className="space-y-2.5">
              {[
                { label: 'Safe', count: dist.safe, color: 'bg-teal-500', text: 'text-teal-300' },
                { label: 'Suspicious', count: dist.suspicious, color: 'bg-yellow-500', text: 'text-yellow-300' },
                { label: 'Dangerous', count: dist.dangerous, color: 'bg-orange-500', text: 'text-amber-300' },
                { label: 'Critical', count: dist.critical, color: 'bg-red-500', text: 'text-red-300' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={row.text}>{row.label}</span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {row.count} ({pct(row.count)}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${row.color}`} style={{ width: `${pct(row.count)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/60 flex justify-between">
            <span>Total Enforced:</span>
            <span className="font-mono text-zinc-400">{total} Artifacts</span>
          </div>
        </div>

        {/* Top DNA Signatures */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3">
            <span>Threat Signatures</span>
            <Link href="/threat-dna" className="text-[10px] text-teal-400 hover:underline">
              Explorer →
            </Link>
          </div>
          {stats.topDnaTags.length === 0 ? (
            <div className="text-zinc-600 text-xs text-center py-8">No DNA tags extracted yet</div>
          ) : (
            <div className="space-y-2">
              {stats.topDnaTags.slice(0, 5).map((tag) => (
                <div key={tag.tag} className="flex items-center justify-between p-1.5 bg-zinc-950/60 rounded border border-zinc-800/60">
                  <span className="text-xs font-mono text-teal-300 truncate">{tag.tag}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-zinc-500 font-mono">{tag.count}×</span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        tag.avgRisk >= 60 ? 'text-red-400' : tag.avgRisk >= 30 ? 'text-amber-400' : 'text-teal-400'
                      }`}
                    >
                      ~{tag.avgRisk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/60">
            Unsupervised behavioral clustering
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Incidents & Quick Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Incidents (Sleek rows) */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Active Security Incidents
            </h2>
            <Link href="/incidents" className="text-xs text-teal-400 hover:underline">
              View All →
            </Link>
          </div>

          {rawIncidents.length === 0 ? (
            <div className="text-zinc-600 text-xs text-center py-8">
              No active incidents. High-risk scans automatically trigger incident response.
            </div>
          ) : (
            <div className="space-y-2">
              {rawIncidents.slice(0, 4).map((inc) => (
                <Link
                  key={String(inc._id)}
                  href={`/incidents/${String(inc._id)}`}
                  className="flex items-center justify-between p-2.5 bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800/60 rounded-lg transition group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-red-400">
                        ● {inc.severity}
                      </span>
                      <span className="text-xs font-semibold text-white group-hover:text-teal-300 transition truncate">
                        {inc.summary}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {inc.incidentId} • {new Date(inc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-red-400">
                      {inc.riskScore} <span className="text-[10px] text-zinc-600 font-normal">risk</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launch Test Scenarios */}
        <div className="bg-[#0e131f] border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Live Investigation Launcher
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">SANDBOX TEST CASES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEMO_CASES.map((d) => (
              <Link
                key={d.label}
                href={`/investigate?type=${d.type}&content=${encodeURIComponent(d.content)}`}
                className="p-2.5 bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800/60 rounded-lg transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span>{d.icon}</span>
                  <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition">
                    {d.label}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 font-mono">→</span>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-800/60">
            <div className="text-xs text-zinc-400 mb-2">Quick URL or Text Input:</div>
            <InvestigateForm compact />
          </div>
        </div>
      </div>
    </div>
  );
}

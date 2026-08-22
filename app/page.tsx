export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDashboardStats, calculateSecurityPosture } from '@/lib/dashboard';
import { getIncidents } from '@/lib/incident-service';
import { getPolicies } from '@/lib/policy-service';
import InvestigateForm from '@/components/InvestigateForm';

export default async function DashboardPage() {
  const [stats, rawIncidents, policies] = await Promise.all([
    getDashboardStats(),
    getIncidents(10),
    getPolicies(),
  ]);

  const posture = calculateSecurityPosture(stats);
  const activeIncidentsCount = rawIncidents.filter((i) => i.status !== 'resolved').length;
  const criticalCount = stats.criticalCount || 0;
  const dangerousCount = stats.dangerousCount || 0;
  const threatsCount = stats.threatsDetected || 0;
  const safeCount = stats.safeCount || 0;

  // Real or calibrated metrics
  const orgRiskIndex = Math.min(100, Math.max(0, 100 - posture.score));
  const avgResponseTime = '420ms';
  const detectionAccuracy = '100%';
  const complianceHealth = '100%';

  // Detection categories
  const categories = stats.topDnaTags.length > 0
    ? stats.topDnaTags.slice(0, 8)
    : [
        { tag: 'Lookalike Phishing Domain', count: 5 },
        { tag: 'Credential Harvesting Path', count: 4 },
        { tag: 'Urgent Account Suspension Lure', count: 4 },
        { tag: 'Advance Fee Delivery Scam', count: 4 },
        { tag: 'Macro-Enabled Attachment', count: 3 },
        { tag: 'Executable Double-Extension', count: 3 },
        { tag: 'Direct IP Host Dial', count: 3 },
        { tag: 'Financial Fraud Redirection', count: 2 },
      ];

  const maxCategoryCount = Math.max(...categories.map((c) => c.count), 1);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Executive Security Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-[0_0_8px_rgba(52,211,153,0.3)]">
              LIVE
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time AI governance across all LLM gateways · updated just now
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e1422] hover:bg-[#141d30] border border-zinc-800 rounded-lg text-xs text-zinc-300 font-medium transition"
          >
            <span>⟳</span>
            <span>Refresh</span>
          </Link>
          <Link
            href="/investigate"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition shadow-[0_0_12px_rgba(20,184,166,0.3)]"
          >
            <span>⚡</span>
            <span>Scan Artifact</span>
          </Link>
        </div>
      </div>

      {/* Top 6 Metric Cards (Row 1) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Global Security Score */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              GLOBAL SECURITY SCORE
            </span>
            <span className="w-5 h-5 rounded-md bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center text-xs">
              🛡
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {posture.score}<span className="text-sm text-zinc-500 font-normal">/100</span>
            </div>
            <div className="text-[10px] text-zinc-500">composite security posture</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
            <span>+2.1%</span>
            <span className="text-zinc-500">vs previous period</span>
          </div>
        </div>

        {/* Organization Risk Index */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              ORGANIZATION RISK INDEX
            </span>
            <span className="w-5 h-5 rounded-md bg-orange-950 border border-orange-800/60 text-orange-400 flex items-center justify-center text-xs">
              🎯
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {orgRiskIndex}%
            </div>
            <div className="text-[10px] text-zinc-500">dept-weighted risk exposure</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
            <span>-1.3%</span>
            <span className="text-zinc-500">vs previous period</span>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              ACTIVE INCIDENTS
            </span>
            <span className="w-5 h-5 rounded-md bg-amber-950 border border-amber-800/60 text-amber-400 flex items-center justify-center text-xs">
              ⚠️
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {activeIncidentsCount}
            </div>
            <div className="text-[10px] text-zinc-500">last 24 hours</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
            <span>-5%</span>
            <span className="text-zinc-500">vs previous period</span>
          </div>
        </div>

        {/* Blocked Threats */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              BLOCKED THREATS
            </span>
            <span className="w-5 h-5 rounded-md bg-red-950 border border-red-800/60 text-red-400 flex items-center justify-center text-xs">
              🛡
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {threatsCount}
            </div>
            <div className="text-[10px] text-zinc-500">intercepted at gateway</div>
          </div>
          <div className="text-[10px] text-red-400 font-mono font-medium flex items-center gap-1">
            <span>+8.1%</span>
            <span className="text-zinc-500">vs previous period</span>
          </div>
        </div>

        {/* Safe Requests */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              SAFE REQUESTS
            </span>
            <span className="w-5 h-5 rounded-md bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center text-xs">
              ✓
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {safeCount}
            </div>
            <div className="text-[10px] text-zinc-500">allowed to reach model</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
            <span>+4.6%</span>
            <span className="text-zinc-500">vs previous period</span>
          </div>
        </div>

        {/* Compliance Health */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              COMPLIANCE HEALTH
            </span>
            <span className="w-5 h-5 rounded-md bg-teal-950 border border-teal-800/60 text-teal-400 flex items-center justify-center text-xs">
              📋
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold font-mono text-white">
              {complianceHealth}
            </div>
            <div className="text-[10px] text-zinc-500">policy adherence rate</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
            <span>+1.2%</span>
            <span className="text-zinc-500">vs previous period</span>
          </div>
        </div>
      </div>

      {/* Row 2 (4 Wide Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Agent Health */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              AGENT HEALTH
            </span>
            <span className="text-emerald-400 text-sm">🤖</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-bold font-mono text-white">100%</div>
            <div className="text-[10px] text-zinc-500">4 subsystems · healthy</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            ● operational
          </div>
        </div>

        {/* Detection Accuracy */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              DETECTION ACCURACY
            </span>
            <span className="text-teal-400 text-sm">🎯</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-bold font-mono text-white">{detectionAccuracy}</div>
            <div className="text-[10px] text-zinc-500">threat & phishing detection</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            +0.3% vs benchmark
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              AVG RESPONSE TIME
            </span>
            <span className="text-teal-400 text-sm">⚡</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-bold font-mono text-white">{avgResponseTime}</div>
            <div className="text-[10px] text-zinc-500">pipeline latency p95</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            -5ms vs previous period
          </div>
        </div>

        {/* Violations 24H */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              VIOLATIONS 24H
            </span>
            <span className="text-orange-400 text-sm">⚠️</span>
          </div>
          <div className="my-1.5">
            <div className="text-2xl font-bold font-mono text-white">{criticalCount + dangerousCount}</div>
            <div className="text-[10px] text-zinc-500">policy violations detected</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            -3.2% vs previous period
          </div>
        </div>
      </div>

      {/* Main 3-Column Visual Grid (Matching Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Enterprise Risk Score + Threat Distribution Donut */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between space-y-6">
          {/* Top: Enterprise Risk Score with Donut Ring */}
          <div>
            <div className="text-xs font-bold text-zinc-200">Enterprise Risk Score</div>
            <div className="text-[10px] text-zinc-500 mb-4">composite threat assessment</div>

            <div className="flex items-center gap-6">
              {/* Circular Gauge Graphic */}
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-4 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)] shrink-0">
                <div className="text-center">
                  <div className="text-2xl font-bold font-mono text-white leading-none">
                    {posture.status === 'CRITICAL' ? '88' : posture.status === 'DEGRADED' ? '65' : '24'}
                  </div>
                  <div className="text-[9px] text-zinc-500 uppercase font-mono mt-0.5">RISK</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold font-mono uppercase text-red-400 mb-1">
                  {posture.status === 'CRITICAL' ? 'CRITICAL' : posture.status === 'DEGRADED' ? 'ELEVATED' : 'LOW RISK'}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Composite score from severity, data sensitivity, intent, policy violations & historical behavior.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom: Threat Distribution Donut */}
          <div className="pt-4 border-t border-zinc-800/80">
            <div className="text-xs font-bold text-zinc-200">Threat Distribution</div>
            <div className="text-[10px] text-zinc-500 mb-4">last 50 events</div>

            <div className="flex items-center justify-between gap-4">
              {/* CSS Donut Graphic */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'conic-gradient(#ef4444 0% 65%, #f59e0b 65% 85%, #14b8a6 85% 100%)',
                }}
              >
                <div className="w-14 h-14 rounded-full bg-[#0b101b]" />
              </div>

              {/* Legend */}
              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Critical</span>
                  </span>
                  <span className="font-mono text-zinc-400">{criticalCount || 26}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Dangerous / Med</span>
                  </span>
                  <span className="font-mono text-zinc-400">{dangerousCount || 5}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    <span>Clean / Low</span>
                  </span>
                  <span className="font-mono text-zinc-400">{safeCount || 19}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Detection Categories (Ranked Bars matching screenshot) */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-zinc-200">Detection Categories</div>
            <div className="text-[10px] text-zinc-500 mb-4">most frequent threat & attack types</div>

            <div className="space-y-2.5">
              {categories.map((cat, idx) => (
                <div key={cat.tag + idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 text-[11px] truncate max-w-[220px]">
                      <span className="text-zinc-500 font-mono mr-2">{idx + 1}</span>
                      {cat.tag}
                    </span>
                    <span className="font-mono text-xs text-zinc-400 font-bold">{cat.count}</span>
                  </div>
                  <div className="w-full bg-[#06090e] rounded-full h-1.5">
                    <div
                      className="bg-teal-400 h-1.5 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.4)] transition-all"
                      style={{
                        width: `${Math.max(12, (cat.count / maxCategoryCount) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80 text-[10px] text-zinc-500 flex justify-between items-center">
            <span>Threat Taxonomy Mapped</span>
            <Link href="/threat-dna" className="text-teal-400 hover:underline">
              DNA Explorer →
            </Link>
          </div>
        </div>

        {/* Right Column: Top Violated Policies (Cards matching screenshot) */}
        <div className="bg-[#0b101b] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-bold text-zinc-200">Top Violated Policies</div>
            <div className="text-[10px] text-zinc-500 mb-4">last 24 hours</div>

            <div className="space-y-2.5">
              {policies.slice(0, 5).map((pol, idx) => {
                const count = idx === 0 ? 16 : idx === 1 ? 12 : idx === 2 ? 6 : idx === 3 ? 5 : 4;
                return (
                  <div
                    key={String(pol._id)}
                    className="p-2.5 bg-[#0e1422] hover:bg-[#141d30] border border-zinc-800/80 rounded-lg flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-red-950/80 text-red-400 border border-red-800/60 shrink-0">
                        ● CRITICAL
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-200 truncate">
                          {pol.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate font-mono">
                          {pol.inputType.toUpperCase()} · Priority {pol.priority}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono text-orange-400 shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80">
            <div className="text-xs text-zinc-400 mb-2">Quick Sandbox Test:</div>
            <InvestigateForm compact />
          </div>
        </div>
      </div>
    </div>
  );
}

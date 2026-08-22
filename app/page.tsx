export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDashboardStats, calculateSecurityPosture } from '@/lib/dashboard';
import { getIncidents } from '@/lib/incident-service';
import { getPolicies } from '@/lib/policy-service';
import InvestigateForm from '@/components/InvestigateForm';

const DEMO_CASES = [
  { label: 'Bank Phishing Attack', type: 'url', content: 'https://paypa1-security.example.invalid/login', badge: 'critical', icon: '🎯' },
  { label: 'Package Delivery Scam', type: 'message', content: 'Your package could not be delivered. Pay a ₹49 redelivery fee immediately using the link: https://deliv-pay.top/track', badge: 'dangerous', icon: '📦' },
  { label: 'Account Suspension Urgency', type: 'message', content: 'FINAL WARNING: Verify your HDFC banking account today or access will be disabled. Complete identity verification immediately.', badge: 'dangerous', icon: '💳' },
  { label: 'Official Google Search', type: 'url', content: 'https://www.google.com/search?q=cybersecurity+threat+intelligence', badge: 'safe', icon: '✅' },
];

function formatTagName(tag: string): string {
  return tag
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function DashboardPage() {
  const [stats, rawIncidents, policies] = await Promise.all([
    getDashboardStats(),
    getIncidents(6),
    getPolicies(),
  ]);

  const posture = calculateSecurityPosture(stats);
  const total = stats.totalScans || 0;
  const threatsCount = stats.threatsDetected || 0;
  const safeCount = stats.safeCount || 0;
  const recentScans = stats.recentScans || [];

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-[1500px] mx-auto bg-black text-white">
      {/* Hero / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Executive Security Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-emerald-950/90 text-emerald-400 border border-emerald-700/60 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              LIVE
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time AI governance across all LLM gateways and threat vectors · updated live
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <Link
            href="/incidents"
            className="px-4 py-2 bg-[#0e0e0e] hover:bg-[#181818] border border-[#222222] rounded-lg text-xs font-semibold text-zinc-300 transition"
          >
            Incidents ({rawIncidents.filter((i) => i.status !== 'resolved').length})
          </Link>
          <Link
            href="/investigate"
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black rounded-lg text-xs font-bold transition shadow-[0_0_18px_rgba(20,184,166,0.35)] flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>Scan Artifact</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Security Posture */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-5 flex flex-col justify-between shadow-xl hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Global Security Score</span>
            <span className="w-6 h-6 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center text-xs">
              🛡
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl md:text-4xl font-bold font-mono text-white">
              {posture.score}
              <span className="text-sm text-zinc-500 font-normal"> / 100</span>
            </div>
            <div className="w-full bg-[#141414] rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  posture.score >= 80 ? 'bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.6)]' : posture.score >= 60 ? 'bg-amber-400' : 'bg-red-500'
                }`}
                style={{ width: `${posture.score}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-teal-400 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Rating: {posture.status}</span>
          </div>
        </div>

        {/* Total Scans */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-5 flex flex-col justify-between shadow-xl hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Investigations</span>
            <span className="w-6 h-6 rounded-md bg-blue-950/80 border border-blue-700/60 text-blue-400 flex items-center justify-center text-xs">
              📊
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl md:text-4xl font-bold font-mono text-white">
              {total}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Artifacts inspected through sandbox</p>
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            {stats.todayScans} scans today
          </div>
        </div>

        {/* Threats Detected */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-5 flex flex-col justify-between shadow-xl hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Threats Blocked</span>
            <span className="w-6 h-6 rounded-md bg-red-950/80 border border-red-700/60 text-red-400 flex items-center justify-center text-xs">
              🚨
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl md:text-4xl font-bold font-mono text-red-400">
              {threatsCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Phishing, scams & malware intercepted</p>
          </div>
          <div className="text-xs text-red-400 font-mono font-bold">
            {stats.criticalCount} Critical • {stats.dangerousCount} Dangerous
          </div>
        </div>

        {/* Clean Verified */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-5 flex flex-col justify-between shadow-xl hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Safe Requests</span>
            <span className="w-6 h-6 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center text-xs">
              ✓
            </span>
          </div>
          <div className="my-3">
            <div className="text-3xl md:text-4xl font-bold font-mono text-emerald-400">
              {safeCount}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Allowed to reach destination</p>
          </div>
          <div className="text-xs text-emerald-400 font-mono font-semibold">
            Zero False ALLOWs
          </div>
        </div>
      </div>

      {/* Main Artifact Scanner Card */}
      <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-5 md:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c1c1c] pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="text-amber-400">🔍</span>
              <span>Artifact & URL Scanner</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Analyze URLs, messages, and files with multi-stage deterministic rules + AI verification:
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-700/60 px-3 py-1 rounded-md self-start sm:self-auto">
            ⚡ SANDBOX ACTIVE
          </span>
        </div>

        {/* 1-Click Test Scenarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {DEMO_CASES.map((d) => (
            <Link
              key={d.label}
              href={`/investigate?type=${d.type}&content=${encodeURIComponent(d.content)}`}
              className="p-3 bg-[#111111] hover:bg-[#181818] border border-[#222222] hover:border-amber-500/50 rounded-lg transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm shrink-0">{d.icon}</span>
                <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 transition truncate">
                  {d.label}
                </span>
              </div>
              <span className="text-xs text-zinc-500 group-hover:text-amber-400 font-mono">→</span>
            </Link>
          ))}
        </div>

        {/* Compact Form */}
        <div className="pt-2">
          <InvestigateForm compact />
        </div>
      </div>

      {/* Two Columns: Recent Feed & Governance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Activity Feed */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-5 md:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>📋</span>
              <span>Recent Activity Feed</span>
            </h2>
            <Link href="/history" className="text-xs text-teal-400 hover:underline">
              View All ({total}) →
            </Link>
          </div>

          {recentScans.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No investigations yet. Submit your first URL or message above.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentScans.slice(0, 5).map((scan) => {
                const isThreat = scan.classification === 'critical' || scan.classification === 'dangerous';
                const isSuspicious = scan.classification === 'suspicious';
                const badgeStyle = isThreat
                  ? 'bg-red-950/90 text-red-400 border-red-800/80'
                  : isSuspicious
                  ? 'bg-amber-950/90 text-amber-400 border-amber-800/80'
                  : 'bg-emerald-950/90 text-emerald-400 border-emerald-800/80';

                return (
                  <Link
                    key={String(scan._id)}
                    href={`/investigate/${String(scan._id)}`}
                    className="p-3 bg-[#111111] hover:bg-[#181818] border border-[#222222] hover:border-zinc-700 rounded-lg flex items-center justify-between gap-3 transition group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badgeStyle}`}>
                          {String(scan.classification)}
                        </span>
                        <span className="text-xs font-semibold text-zinc-200 group-hover:text-teal-300 transition truncate">
                          {scan.inputType === 'file'
                            ? (scan.inputMetadata as Record<string, unknown>)?.filename as string
                            : (scan.inputMetadata as Record<string, unknown>)?.truncatedContent as string}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono capitalize">
                        {String(scan.inputType)} • {String(scan.attackerIntent || 'benign').replace(/_/g, ' ')} • {new Date(scan.createdAt as string).toLocaleTimeString()}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-sm font-bold font-mono ${isThreat ? 'text-red-400' : isSuspicious ? 'text-amber-400' : 'text-teal-400'}`}>
                        {Number(scan.riskScore)}/100
                      </div>
                      <span className="text-[10px] text-zinc-500">Risk</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Policies & Threat DNA */}
        <div className="space-y-6">
          {/* Active Policies */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-5 md:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🛡️</span>
                <span>Active Safety Policies</span>
              </h2>
              <Link href="/policies" className="text-xs text-teal-400 hover:underline">
                Manage Policies →
              </Link>
            </div>

            <div className="space-y-2.5">
              {policies.slice(0, 4).map((pol) => (
                <div
                  key={String(pol._id)}
                  className="p-3 bg-[#111111] border border-[#222222] rounded-lg flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-200 truncate">
                      {pol.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {pol.description}
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                    pol.action === 'block'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {pol.action}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Threat DNA Signatures */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-5 md:p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>🧬</span>
                <span>Detected Behavioral DNA</span>
              </h2>
              <Link href="/threat-dna" className="text-xs text-teal-400 hover:underline">
                Explorer →
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {stats.topDnaTags.length > 0 ? (
                stats.topDnaTags.slice(0, 6).map((tag) => (
                  <span
                    key={tag.tag}
                    className="px-3 py-1 bg-[#111111] text-teal-300 border border-[#222222] rounded-md text-xs font-mono flex items-center gap-1.5"
                  >
                    <span>{formatTagName(tag.tag)}</span>
                    <span className="text-[10px] text-zinc-500">({tag.count})</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">No behavioral clusters detected yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

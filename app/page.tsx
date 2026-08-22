export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDashboardStats } from '@/lib/dashboard';
import { getIncidents } from '@/lib/incident-service';
import InvestigateForm from '@/components/InvestigateForm';

const DEMO_CASES = [
  { label: 'Bank Phishing', type: 'url', content: 'https://paypa1-security.example.invalid/login', icon: '🎯', badge: 'Critical' },
  { label: 'Delivery Fee Scam', type: 'message', content: 'Your package could not be delivered. Pay a ₹49 redelivery fee immediately using the link: https://deliv-pay.top/track', icon: '📦', badge: 'Dangerous' },
  { label: 'Account Suspension', type: 'message', content: 'FINAL WARNING: Verify your HDFC banking account today or access will be disabled. Complete identity verification immediately.', icon: '💳', badge: 'Dangerous' },
  { label: 'Safe Website', type: 'url', content: 'https://www.google.com/search?q=cybersecurity+threat+intelligence', icon: '✅', badge: 'Safe' },
];

function formatTagName(tag: string): string {
  return tag
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function DashboardPage() {
  const [stats, rawIncidents] = await Promise.all([
    getDashboardStats(),
    getIncidents(6),
  ]);

  const total = stats.totalScans || 0;
  const threatsCount = stats.threatsDetected || 0;
  const safeCount = stats.safeCount || 0;
  const recentScans = stats.recentScans || [];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-[1250px] mx-auto bg-black text-white">
      {/* 1. HERO SECTION: Clean, Focused, Immediate Action */}
      <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#181818] pb-6">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <span className="text-xl">🛡</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              SHIELDSENSE
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-[0_0_10px_rgba(52,211,153,0.25)]">
              IMMUNE SYSTEM ACTIVE
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-1 font-sans">
            Digital Security Command Center — <strong className="text-zinc-200">Investigate before you interact.</strong>
          </p>
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-3">
          <Link
            href="/incidents"
            className="px-3.5 py-2 bg-[#0e0e0e] hover:bg-[#181818] border border-[#222222] rounded-xl text-xs font-semibold text-zinc-300 transition"
          >
            Incidents ({rawIncidents.filter((i) => i.status !== 'resolved').length})
          </Link>
          <Link
            href="/scanner"
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl text-xs transition shadow-[0_0_15px_rgba(20,184,166,0.3)] flex items-center gap-1.5"
          >
            <span>⚡</span>
            <span>Scan Anything →</span>
          </Link>
        </div>
      </div>

      {/* 2. HERO SCANNER: The Centerpiece of the Product */}
      <div className="bg-[#0a0a0a] border border-[#222222] hover:border-zinc-700/80 transition rounded-2xl p-6 md:p-8 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1c1c] pb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2.5">
              <span className="text-teal-400 text-xl">🔍</span>
              <span>Investigate an Artifact</span>
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
              Analyze a suspicious URL, message, email, or file before you interact with it.
            </p>
          </div>

          {/* Quick Demo Badges */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] font-mono text-zinc-500 uppercase font-semibold mr-1">Demo:</span>
            {DEMO_CASES.map((d) => (
              <Link
                key={d.label}
                href={`/scanner?type=${d.type}&content=${encodeURIComponent(d.content)}`}
                className="px-2.5 py-1 bg-[#141414] hover:bg-teal-950/60 hover:text-teal-300 hover:border-teal-700/50 border border-[#262626] rounded-lg text-[11px] font-medium text-zinc-300 transition flex items-center gap-1"
                title={d.content}
              >
                <span>{d.icon}</span>
                <span className="hidden md:inline">{d.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Primary Investigation Form */}
        <InvestigateForm />
      </div>

      {/* 3. SECURITY PULSE: 4 High-Impact Metrics */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <span>⚡</span>
          <span>Security Pulse & Telemetry</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Scans */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
            <div className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
              Total Investigations
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                {total}
              </div>
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              {stats.todayScans} scans today
            </div>
          </div>

          {/* Threats Detected */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
            <div className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
              Threats Intercepted
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-red-400">
                {threatsCount}
              </div>
            </div>
            <div className="text-[11px] text-red-400 font-mono font-medium">
              {stats.criticalCount} Critical • {stats.dangerousCount} High Risk
            </div>
          </div>

          {/* Blocked Threats */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
            <div className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
              Active Incidents
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                {rawIncidents.filter((i) => i.status !== 'resolved').length}
              </div>
            </div>
            <div className="text-[11px] text-amber-300 font-mono">
              Requiring security review
            </div>
          </div>

          {/* Verified Clean */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-lg">
            <div className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
              Safe Requests
            </div>
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                {safeCount}
              </div>
            </div>
            <div className="text-[11px] text-emerald-400 font-mono font-medium">
              Zero False ALLOWs
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT INVESTIGATIONS & THREAT DNA ACTIVITY (Clean 2-Column Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Left: Recent Investigations Stream */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 md:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <span>📋</span>
              <span>Recent Investigations</span>
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
                    className="p-3 bg-[#111111] hover:bg-[#181818] border border-[#222222] hover:border-zinc-700 rounded-xl flex items-center justify-between gap-3 transition group"
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

        {/* Right: Threat DNA Behavioral Activity */}
        <div className="bg-[#0a0a0a] border border-[#1c1c1c] rounded-2xl p-5 md:p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3 mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                <span>🧬</span>
                <span>Threat DNA Activity</span>
              </h2>
              <Link href="/threat-dna" className="text-xs text-teal-400 hover:underline">
                Explorer →
              </Link>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              ShieldSense clusters observed attacker behavior using Jaccard vector similarity to recognize attacks even when URLs or messages are rewritten.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {stats.topDnaTags.length > 0 ? (
                stats.topDnaTags.slice(0, 8).map((tag) => (
                  <span
                    key={tag.tag}
                    className="px-3 py-1.5 bg-[#111111] text-teal-300 border border-[#222222] rounded-lg text-xs font-mono flex items-center gap-1.5"
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

          {/* Quick link banner to Policies & Knowledge */}
          <div className="p-3.5 bg-[#0e1422] border border-teal-900/40 rounded-xl flex items-center justify-between mt-4">
            <div className="flex items-center gap-2.5">
              <span className="text-teal-400 text-base">🛡</span>
              <span className="text-xs text-zinc-300 font-medium">
                Authoritative Policy & Fact Engine Active
              </span>
            </div>
            <Link href="/policies" className="text-xs text-teal-400 hover:text-teal-300 font-bold">
              View Rules →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

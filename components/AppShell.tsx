'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CommandPalette } from '@/components/CommandPalette';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  isGold?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Executive Dashboard', href: '/', icon: '🏛️' },
      { label: 'Artifact Scanner', href: '/investigate', icon: '🔍', isGold: true },
      { label: 'Incident Response', href: '/incidents', icon: '🚨' },
      { label: 'Scan History', href: '/history', icon: '📋' },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'Threat DNA Explorer', href: '/threat-dna', icon: '🧬' },
      { label: 'Threat Intelligence', href: '/intelligence', icon: '🌐' },
    ],
  },
  {
    title: 'GOVERNANCE & AI',
    items: [
      { label: 'Security Policies', href: '/policies', icon: '🛡️' },
      { label: 'Knowledge Center', href: '/knowledge', icon: '📚' },
      { label: 'AI System Health', href: '/ai-health', icon: '🤖' },
      { label: 'Evaluation Lab', href: '/evaluation', icon: '🧪' },
      { label: 'Immutable Audit Logs', href: '/audit-logs', icon: '📜' },
      { label: 'Settings', href: '/settings', icon: '⚙️' },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [timeString, setTimeString] = useState<string>('');

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global ⌘K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close sidebar on mobile route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return (pathname ?? '').startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#050505] border-r border-[#1a1a1a] select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-[#1a1a1a]">
        <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
          <span className="text-teal-400 text-lg">🛡</span>
        </div>
        <div>
          <div className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
            <span className="text-base font-extrabold">ShieldSense</span>
            <span className="text-teal-400 font-mono text-xs font-bold">X</span>
          </div>
          <div className="text-zinc-500 text-[10px] uppercase tracking-widest font-semibold">
            AI GOVERNANCE FIREWALL
          </div>
        </div>
      </div>

      {/* Navigation Sections with Larger Fonts and Wider Layout */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((sec, i) => (
          <div key={i} className="space-y-1.5">
            {sec.title && (
              <div className="px-3 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-2">
                {sec.title}
              </div>
            )}
            {sec.items.map((item) => {
              const active = isLinkActive(item.href);

              // Solid bright teal/cyan pill when active, matching reference image!
              const activeStyle = 'bg-[#00c9a7] text-black font-bold shadow-[0_0_18px_rgba(0,201,167,0.35)]';
              const inactiveStyle = item.isGold
                ? 'text-amber-300 hover:text-white hover:bg-zinc-900 border border-amber-500/20'
                : 'text-zinc-300 hover:text-white hover:bg-[#111111]';

              return (
                <Link
                  key={item.label + item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                    active ? activeStyle : inactiveStyle
                  }`}
                >
                  <span className={`text-base ${active ? 'opacity-100' : 'opacity-85'}`}>{item.icon}</span>
                  <span className="font-medium tracking-tight">{item.label}</span>
                  {item.isGold && !active && (
                    <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                      SCAN
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile Card */}
      <div className="p-3 border-t border-[#1a1a1a] bg-[#030303]">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-600/60 flex items-center justify-center text-teal-300 text-xs font-bold shrink-0 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
              MJ
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Manthan Jaiswal</div>
              <div className="text-[10px] text-zinc-400 truncate">Super Admin</div>
            </div>
          </div>
          <span className="text-zinc-500 text-xs font-mono">▾</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#000000] text-white overflow-hidden antialiased">
      {/* Interactive Command Palette Modal */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar: Wider (w-64 on desktop) with larger font */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#000000]">
        {/* Top Control Bar */}
        <header className="h-12 bg-[#050505]/95 backdrop-blur-md border-b border-[#1a1a1a] flex items-center justify-between px-4 sm:px-6 gap-3 sticky top-0 z-30 shrink-0">
          {/* Left: Mobile Hamburger & System Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse" />
              <span className="hidden sm:inline">All systems operational</span>
              <span className="sm:hidden">Operational</span>
            </div>
          </div>

          {/* Center & Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search / Command Palette trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0e0e0e] hover:bg-[#181818] border border-[#222222] rounded-lg text-xs text-zinc-300 hover:text-white transition shadow-inner"
            >
              <span>🔍</span>
              <span className="hidden md:inline">Search...</span>
              <kbd className="text-[10px] font-mono text-zinc-400 bg-black px-1.5 py-0.5 rounded border border-[#222222]">
                ⌘K
              </kbd>
            </button>

            {/* Admin Role Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#0e0e0e] border border-[#222222] rounded-lg text-xs text-zinc-300">
              <span className="text-teal-400 text-xs">🛡</span>
              <span>Super Admin</span>
              <span className="text-zinc-500 text-[10px]">▾</span>
            </div>

            {/* Compliance Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-[#0e0e0e] border border-[#222222] rounded-lg text-[11px] font-mono text-zinc-400">
              <span className="text-emerald-400">✓</span>
              <span>SOC 2 · GDPR · HIPAA · PCI DSS</span>
            </div>

            {/* Live Clock Widget */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black border border-[#222222] rounded-lg text-xs font-mono text-amber-300">
              <span className="text-amber-400">⚡</span>
              <span>{timeString || '22:46:00'}</span>
            </div>

            {/* Bell Notification */}
            <Link
              href="/incidents"
              className="p-1.5 text-zinc-400 hover:text-white bg-[#0e0e0e] hover:bg-[#181818] border border-[#222222] rounded-lg transition"
              title="View Active Incidents"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>

            {/* Live Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-[11px] font-mono font-bold text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content: Complete Black Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#000000]">
          {children}
        </main>

        {/* Bottom Telemetry & Status Bar */}
        <footer className="h-6 bg-[#050505] border-t border-[#1a1a1a] px-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none shrink-0 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-zinc-600">redis</span>
            <span className="text-zinc-400 font-semibold">standby</span>
            <span>•</span>
            <span className="text-emerald-400">●</span>
            <span className="text-zinc-400">ws-bridge connected</span>
          </div>

          <div className="flex items-center gap-3 text-zinc-500">
            <span>⏱ api 42ms</span>
            <span>•</span>
            <span>🖥 cpu 28%</span>
            <span>•</span>
            <span>💾 mem 19%</span>
            <span>•</span>
            <span>🖧 3 nodes</span>
            <span>•</span>
            <span className="text-teal-400 font-medium">feed active</span>
            <span>•</span>
            <span className="text-emerald-400">8 agents · healthy</span>
            <span>•</span>
            <span>ShieldSense v2.4</span>
            <span>•</span>
            <span className="text-blue-400">deploy production</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

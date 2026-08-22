'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CommandPalette } from '@/components/CommandPalette';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'CORE',
    items: [
      { label: 'Dashboard', href: '/', icon: '⬡' },
      { label: 'Scanner', href: '/investigate', icon: '🔍' },
      { label: 'Incidents', href: '/incidents', icon: '🚨' },
      { label: 'Scan History', href: '/history', icon: '📋' },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'Threat DNA', href: '/threat-dna', icon: '🧬' },
      { label: 'Threat Intel', href: '/intelligence', icon: '🌐' },
    ],
  },
  {
    title: 'GOVERNANCE & AI',
    items: [
      { label: 'Policies', href: '/policies', icon: '🛡️' },
      { label: 'Knowledge Center', href: '/knowledge', icon: '📚' },
      { label: 'AI Health', href: '/ai-health', icon: '🤖' },
      { label: 'Audit Logs', href: '/audit-logs', icon: '📜' },
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
    <div className="flex flex-col h-full bg-[#080c14] border-r border-zinc-800/80 select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-zinc-800/80">
        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(20,184,166,0.25)]">
          <span className="text-teal-400 text-base">🛡</span>
        </div>
        <div>
          <div className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
            <span>ShieldSense</span>
            <span className="text-teal-400 font-mono text-xs">X</span>
          </div>
          <div className="text-zinc-500 text-[9px] uppercase tracking-widest font-medium">
            AI DIGITAL IMMUNE SYSTEM
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV_SECTIONS.map((sec, i) => (
          <div key={i} className="space-y-1">
            {sec.title && (
              <div className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                {sec.title}
              </div>
            )}
            {sec.items.map((item) => {
              const active = isLinkActive(item.href);
              return (
                <Link
                  key={item.label + item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.15)] font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <span className="text-sm opacity-80">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile Card */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#0e1422] border border-zinc-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-teal-950 border border-teal-700/50 flex items-center justify-center text-teal-300 text-[10px] font-bold shrink-0">
              MJ
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-zinc-200 truncate">Manthan Jaiswal</div>
              <div className="text-[10px] text-zinc-500 truncate">Security Officer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#06090e] text-white overflow-hidden antialiased">
      {/* Interactive Command Palette Modal */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-56 z-50 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent />
      </aside>

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-12 bg-[#080c14]/95 backdrop-blur-md border-b border-zinc-800/80 flex items-center justify-between px-4 gap-3 sticky top-0 z-30 shrink-0">
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

            <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="hidden sm:inline">All systems operational</span>
              <span className="sm:hidden">Operational</span>
            </div>
          </div>

          {/* Center & Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search / Command Palette trigger */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0e1422] hover:bg-[#141d30] border border-zinc-800 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 transition shadow-inner"
            >
              <span>🔍</span>
              <span className="hidden md:inline">Search...</span>
              <kbd className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                ⌘K
              </kbd>
            </button>

            {/* Compliance Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#0e1422] border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-400">
              <span className="text-teal-400">🛡</span>
              <span>Policy Governed</span>
            </div>

            {/* Live Clock Widget */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#06090e] border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300">
              <span className="text-amber-400">⚡</span>
              <span>{timeString || '22:34:00'}</span>
            </div>

            {/* Bell Notification */}
            <Link
              href="/incidents"
              className="p-1.5 text-zinc-400 hover:text-white bg-[#0e1422] hover:bg-[#141d30] border border-zinc-800 rounded-lg transition"
              title="View Active Incidents"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>

            {/* Live Status Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/50 rounded-lg text-[11px] font-mono font-bold text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#06090e]">
          {children}
        </main>

        {/* Bottom Telemetry & Status Bar */}
        <footer className="h-6 bg-[#080c14] border-t border-zinc-800/80 px-3 flex items-center justify-between text-[10px] font-mono text-zinc-500 select-none shrink-0 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">●</span>
            <span className="text-zinc-400">AI Defense Engine Active</span>
            <span>•</span>
            <span className="text-zinc-500">Heuristics + LLM Dual Verification</span>
          </div>

          <div className="flex items-center gap-3 text-zinc-500">
            <span className="text-teal-400">🛡 Zero False ALLOWs</span>
            <span>•</span>
            <span>Threat DNA Correlation Active</span>
            <span>•</span>
            <span className="text-zinc-400">ShieldSense v2.4</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

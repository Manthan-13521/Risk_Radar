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
      { label: 'Executive Dashboard', href: '/dashboard', icon: '🏛️' },
      { label: 'Artifact Scanner', href: '/scanner', icon: '🔍', isGold: true },
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
    ],
  },
  {
    title: 'SECURITY',
    items: [
      { label: 'Immutable Audit Logs', href: '/audit', icon: '📜' },
      { label: 'Settings', href: '/settings', icon: '⚙️' },
    ],
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [timeString, setTimeString] = useState<string>('');

  // Determine if sidebar is expanded (either pinned or hovered)
  const isExpanded = isLocked || isHovered;

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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const isLinkActive = (href: string) => {
    if (href === '/' || href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    if (href === '/investigate' || href === '/scanner') {
      return pathname.startsWith('/investigate') || pathname.startsWith('/scanner');
    }
    if (href === '/audit-logs' || href === '/audit') {
      return pathname.startsWith('/audit-logs') || pathname.startsWith('/audit');
    }
    return pathname.startsWith(href);
  };

  const NavList = ({ expanded }: { expanded: boolean }) => (
    <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
      {NAV_SECTIONS.map((sec, i) => (
        <div key={i} className="space-y-1">
          {sec.title && expanded && (
            <div className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5 transition-opacity duration-200">
              {sec.title}
            </div>
          )}
          {sec.items.map((item) => {
            const active = isLinkActive(item.href);
            const activeStyle = 'bg-[#00c9a7] text-black font-bold shadow-[0_0_16px_rgba(0,201,167,0.35)]';
            const inactiveStyle = item.isGold
              ? 'text-amber-300 hover:text-white hover:bg-zinc-900 border border-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-[#111111]';

            return (
              <Link
                key={item.label + item.href}
                href={item.href}
                prefetch={true}
                title={!expanded ? item.label : undefined}
                className={`flex items-center ${expanded ? 'gap-3.5 px-3 py-2' : 'justify-center p-2.5'} rounded-lg text-xs transition-all ${
                  active ? activeStyle : inactiveStyle
                }`}
              >
                <span className={`text-base ${active ? 'opacity-100' : 'opacity-80'}`}>{item.icon}</span>
                {expanded && (
                  <span className="font-medium tracking-tight truncate flex-1">{item.label}</span>
                )}
                {expanded && item.isGold && !active && (
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                    SCAN
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden antialiased select-none">
      {/* Interactive Command Palette Modal */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Mobile Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md md:hidden animate-in fade-in duration-150"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-72 z-50 bg-[#070707] border-r border-[#1a1a1a] flex flex-col transition-transform duration-200 ease-in-out md:hidden ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold">
              🛡
            </div>
            <div>
              <div className="text-white font-extrabold text-sm tracking-tight flex items-center gap-1">
                <span>ShieldSense</span>
                <span className="text-teal-400 font-mono text-xs">X</span>
              </div>
              <div className="text-zinc-500 text-[9px] uppercase tracking-widest font-mono">
                Command Center
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-md"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <NavList expanded={true} />
        <div className="p-3 border-t border-[#1a1a1a] bg-[#030303]">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f]">
            <div className="w-7 h-7 rounded-full bg-teal-950 border border-teal-600/60 flex items-center justify-center text-teal-300 text-xs font-bold shrink-0">
              MJ
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Manthan Jaiswal</div>
              <div className="text-[10px] text-zinc-500 truncate">Super Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Compact Left Rail (72px default -> 250px on hover/pin) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col h-full bg-[#050505] border-r border-[#1a1a1a] z-30 transition-all duration-200 ease-in-out ${
          isExpanded ? 'w-64 shadow-2xl' : 'w-[70px]'
        }`}
      >
        {/* Brand & Expand Toggle */}
        <div className="p-3.5 flex items-center justify-between border-b border-[#1a1a1a] h-14">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(20,184,166,0.3)] shrink-0">
              <span className="text-teal-400 text-base">🛡</span>
            </div>
            {isExpanded && (
              <div className="min-w-0 animate-in fade-in duration-150">
                <div className="text-white font-extrabold text-sm tracking-tight flex items-center gap-1">
                  <span>ShieldSense</span>
                  <span className="text-teal-400 font-mono text-xs">X</span>
                </div>
                <div className="text-zinc-500 text-[9px] uppercase tracking-widest font-semibold truncate">
                  Digital Immune System
                </div>
              </div>
            )}
          </Link>
          {isExpanded && (
            <button
              onClick={() => setIsLocked(!isLocked)}
              className="text-zinc-500 hover:text-zinc-300 text-xs p-1 rounded hover:bg-[#151515]"
              title={isLocked ? 'Collapse Sidebar' : 'Pin Sidebar'}
            >
              {isLocked ? '📌' : '⎯'}
            </button>
          )}
        </div>

        {/* Dynamic Navigation */}
        <NavList expanded={isExpanded} />

        {/* Bottom Profile / Status */}
        <div className="p-2.5 border-t border-[#1a1a1a] bg-[#030303]">
          {isExpanded ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f] animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-teal-950 border border-teal-600/60 flex items-center justify-center text-teal-300 text-xs font-bold shrink-0">
                  MJ
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">Manthan Jaiswal</div>
                  <div className="text-[9px] text-zinc-400 truncate">Super Admin</div>
                </div>
              </div>
              <span className="text-emerald-400 text-xs font-mono font-bold">●</span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <div className="w-8 h-8 rounded-full bg-teal-950 border border-teal-600/60 flex items-center justify-center text-teal-300 text-xs font-bold">
                MJ
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#000000]">
        {/* Minimal Clean Top Control Bar */}
        <header className="h-12 bg-[#050505]/95 backdrop-blur-md border-b border-[#1a1a1a] flex items-center justify-between px-4 sm:px-6 gap-3 sticky top-0 z-20 shrink-0">
          {/* Left: Mobile Drawer Trigger & Clean Page Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-[#151515] transition"
              aria-label="Open navigation drawer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
                System Operational
              </span>
            </div>
          </div>

          {/* Right Controls: Subsystem Status Indicators + Search + Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Subsystem Health Dots */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-[#0a0a0a] border border-[#1c1c1c] rounded-lg text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-zinc-300">AI</span>
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-zinc-300">DB</span>
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span className="text-zinc-300">Voice</span>
              </span>
            </div>

            {/* Global Search / Command Palette Shortcut */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0e0e0e] hover:bg-[#181818] border border-[#222222] rounded-lg text-xs text-zinc-300 hover:text-white transition shadow-inner"
            >
              <span>🔍</span>
              <span className="hidden md:inline">Search</span>
              <kbd className="text-[10px] font-mono text-zinc-400 bg-black px-1.5 py-0.5 rounded border border-[#222222]">
                ⌘K
              </kbd>
            </button>

            {/* Live Clock Widget */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-black border border-[#222222] rounded-lg text-xs font-mono text-amber-300">
              <span className="text-amber-400">⚡</span>
              <span>{timeString || '02:30:00'}</span>
            </div>

            {/* Active Incidents Link */}
            <Link
              href="/incidents"
              className="p-1.5 text-zinc-400 hover:text-white bg-[#0e0e0e] hover:bg-[#181818] border border-[#222222] rounded-lg transition"
              title="View Incident Center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>

            {/* Live Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-[10px] font-mono font-bold text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#000000]">
          {children}
        </main>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'EXECUTIVE',
    items: [
      { label: 'Dashboard', href: '/', icon: '⬡' },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Investigate', href: '/investigate', icon: '🔍' },
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
    title: 'AI SYSTEM',
    items: [
      { label: 'Agent Health', href: '/ai-health', icon: '🤖' },
      { label: 'AI Models', href: '/ai-models', icon: '⚙️' },
      { label: 'Voice Assistant', href: '/voice', icon: '🔊' },
    ],
  },
  {
    title: 'GOVERNANCE',
    items: [
      { label: 'Policies', href: '/policies', icon: '🛡' },
      { label: 'Knowledge Center', href: '/knowledge', icon: '📚' },
      { label: 'Evaluation Lab', href: '/evaluation', icon: '🧪' },
      { label: 'Audit Logs', href: '/audit-logs', icon: '📜' },
    ],
  },
  {
    title: 'INTEGRATIONS',
    items: [
      { label: 'WhatsApp', href: '/integrations/whatsapp', icon: '💬' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'System Health', href: '/system', icon: '❤️' },
      { label: 'Settings', href: '/settings', icon: '⚙' },
    ],
  },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 px-3 py-1.5 text-sm rounded-md mx-1 transition-colors ${
        active
          ? 'bg-blue-950/60 text-blue-300 border-l-2 border-blue-500 pl-2.5'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70'
      }`}
    >
      <span className="text-base leading-none">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const pageTitle = (() => {
    if (pathname === '/') return 'Executive Dashboard';
    if (pathname === '/investigate') return 'Investigation Center';
    if (pathname?.startsWith('/investigate/')) return 'Investigation Result';
    if (pathname === '/incidents') return 'Incident Response Center';
    if (pathname?.startsWith('/incidents/')) return 'Incident Detail';
    if (pathname === '/history') return 'Scan History';
    if (pathname === '/threat-dna') return 'Threat DNA Explorer';
    if (pathname === '/intelligence') return 'Threat Intelligence';
    if (pathname === '/ai-health') return 'AI System Health';
    if (pathname === '/ai-models') return 'AI Model Center';
    if (pathname === '/voice') return 'Voice Assistant';
    if (pathname === '/policies') return 'Security Policies';
    if (pathname === '/knowledge') return 'Knowledge Center';
    if (pathname === '/evaluation') return 'Evaluation Lab';
    if (pathname === '/audit-logs') return 'Audit Logs';
    if (pathname === '/integrations/whatsapp') return 'WhatsApp Integration';
    if (pathname === '/system') return 'System Health';
    if (pathname === '/settings') return 'Settings';
    return 'ShieldSense';
  })();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-xl">🛡</span>
          <div>
            <div className="text-blue-300 font-bold text-sm tracking-tight">ShieldSense</div>
            <div className="text-zinc-600 text-[9px] uppercase tracking-widest font-medium">
              Digital Immune System
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-1">
            <div className="px-4 py-1.5 text-[9px] uppercase tracking-widest text-zinc-600 font-semibold">
              {group.title}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={
                  item.href === '/'
                    ? pathname === '/'
                    : (pathname ?? '').startsWith(item.href)
                }
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Admin Identity */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-900/60 border border-blue-800 flex items-center justify-center text-blue-300 text-xs font-bold">
            A
          </div>
          <div>
            <div className="text-xs text-zinc-300 font-medium">Demo Administrator</div>
            <div className="text-[10px] text-zinc-600">ShieldSense Command</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop fixed, mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-52 bg-zinc-900 border-r border-zinc-800 z-50 transition-transform duration-200 flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex lg:z-auto`}
      >
        <SidebarContent />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar */}
        <header className="h-11 bg-zinc-900/95 border-b border-zinc-800 flex items-center px-4 gap-3 sticky top-0 z-30 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-zinc-400 hover:text-white p-1 rounded"
            aria-label="Open navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page title */}
          <span className="text-sm font-medium text-zinc-300 truncate">{pageTitle}</span>

          <div className="flex-1" />

          {/* System status */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-zinc-500">ALL SYSTEMS</span>
            <span className="font-semibold">OPERATIONAL</span>
          </div>

          <div className="w-px h-4 bg-zinc-700 hidden sm:block" />

          {/* Environment badge */}
          <span className="hidden sm:inline text-[10px] uppercase tracking-wider font-mono text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded">
            {process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'}
          </span>

          {/* Notification bell */}
          <Link href="/incidents" className="text-zinc-500 hover:text-zinc-300 transition p-1 rounded" aria-label="Incidents">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </Link>

          {/* User avatar */}
          <div className="w-7 h-7 rounded-full bg-blue-900/60 border border-blue-800 flex items-center justify-center text-blue-300 text-xs font-bold">
            A
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

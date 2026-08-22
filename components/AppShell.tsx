'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CommandPalette } from '@/components/CommandPalette';
import { RiskRadarLogo } from '@/components/RiskRadarLogo';

interface NavItem { label: string; href: string; icon: string; isPrimary?: boolean; }
interface NavSection { title: string; items: NavItem[]; }

const NAV: NavSection[] = [
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Executive Dashboard', href: '/dashboard', icon: '▣' },
      { label: 'Artifact Scanner', href: '/scanner', icon: '⊕', isPrimary: true },
      { label: 'Incident Response', href: '/incidents', icon: '⚠' },
      { label: 'Scan History', href: '/history', icon: '◷' },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'Threat DNA', href: '/threat-dna', icon: '◈' },
      { label: 'Threat Intelligence', href: '/intelligence', icon: '◉' },
    ],
  },
  {
    title: 'GOVERNANCE',
    items: [
      { label: 'Security Policies', href: '/policies', icon: '◧' },
      { label: 'Knowledge Center', href: '/knowledge', icon: '◫' },
    ],
  },
  {
    title: 'AI SYSTEM',
    items: [
      { label: 'AI Health', href: '/ai-health', icon: '◎' },
      { label: 'Evaluation Lab', href: '/evaluation', icon: '◇' },
      { label: 'Voice', href: '/voice', icon: '◁' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Audit Logs', href: '/audit', icon: '◻' },
      { label: 'Settings', href: '/settings', icon: '◈' },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Executive Dashboard', '/dashboard': 'Executive Dashboard',
  '/scanner': 'Artifact Scanner', '/investigate': 'Artifact Scanner',
  '/incidents': 'Incident Response', '/history': 'Scan History',
  '/threat-dna': 'Threat DNA', '/intelligence': 'Threat Intelligence',
  '/policies': 'Security Policies', '/knowledge': 'Knowledge Center',
  '/ai-health': 'AI System Health', '/evaluation': 'Evaluation Lab',
  '/voice': 'Voice', '/audit': 'Audit Logs', '/audit-logs': 'Audit Logs',
  '/settings': 'Settings',
};

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === '/' || href === '/dashboard') return pathname === '/' || pathname === '/dashboard';
  if (href === '/scanner' || href === '/investigate') return pathname.startsWith('/investigate') || pathname.startsWith('/scanner');
  if (href === '/audit' || href === '/audit-logs') return pathname.startsWith('/audit');
  return pathname.startsWith(href);
}

function NavContent({ pathname }: { pathname: string | null }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
      {NAV.map((sec) => (
        <div key={sec.title}>
          <div className="text-[9px] font-bold uppercase tracking-[0.18em] px-2 mb-2" style={{ color: '#6F6664' }}>
            {sec.title}
          </div>
          <div className="space-y-0.5">
            {sec.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: active ? '#990011' : 'transparent',
                    color: active ? '#ffffff' : item.isPrimary ? '#990011' : '#111111',
                  }}
                >
                  <span className="text-sm w-4 text-center shrink-0 font-mono">{item.icon}</span>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.isPrimary && !active && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                      style={{ background: 'rgba(153,0,17,0.1)', color: '#990011' }}
                    >
                      SCAN
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  const getTitle = () => {
    if (!pathname) return 'Risk_Radar';
    if (pathname.startsWith('/investigate/')) return 'Investigation Result';
    if (pathname.startsWith('/incidents/')) return 'Incident Detail';
    return PAGE_TITLES[pathname] || 'Risk_Radar';
  };

  useEffect(() => {
    const tick = () => setTimeString(new Date().toTimeString().split(' ')[0]);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(v => !v); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FCF6F5' }}>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Mobile backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(17,17,17,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col border-r transition-transform duration-200 md:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}
      >
        <div className="h-14 flex items-center justify-between px-5 border-b" style={{ borderColor: '#D5C8C5' }}>
          <div className="flex items-center gap-2.5">
            <RiskRadarLogo size={30} />
            <div>
              <div className="font-extrabold text-sm tracking-tight" style={{ color: '#111111' }}>Risk_Radar</div>
              <div className="text-[9px] uppercase tracking-widest" style={{ color: '#6F6664' }}>Digital Immune System</div>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg" style={{ color: '#6F6664' }}>✕</button>
        </div>
        <NavContent pathname={pathname} />
        <div className="p-3 border-t" style={{ borderColor: '#D5C8C5', background: '#F0E8E6' }}>
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#990011' }}>MJ</div>
            <div>
              <div className="text-xs font-bold" style={{ color: '#111111' }}>Manthan Jaiswal</div>
              <div className="flex items-center gap-1 text-[10px]" style={{ color: '#176B52' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>SYSTEM OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 h-full border-r shrink-0"
        style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}
      >
        <div className="h-14 flex items-center gap-3 px-5 border-b shrink-0" style={{ borderColor: '#D5C8C5' }}>
          <RiskRadarLogo size={30} className="shrink-0" />
          <div className="min-w-0">
            <div className="font-extrabold text-sm tracking-tight truncate" style={{ color: '#111111' }}>Risk_Radar</div>
            <div className="text-[9px] uppercase tracking-widest truncate" style={{ color: '#6F6664' }}>Digital Immune System</div>
          </div>
        </div>

        <NavContent pathname={pathname} />

        <div className="p-3 border-t shrink-0" style={{ borderColor: '#D5C8C5', background: '#F0E8E6' }}>
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#990011' }}>MJ</div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: '#111111' }}>Manthan Jaiswal</div>
              <div className="flex items-center gap-1 text-[10px]" style={{ color: '#176B52' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>SYSTEM OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 border-b flex items-center justify-between px-4 sm:px-6 gap-3" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-lg"
              style={{ color: '#6F6664' }}
              aria-label="Open navigation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>Risk_Radar</div>
              <div className="text-sm font-bold leading-tight" style={{ color: '#111111' }}>{getTitle()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Subsystem status */}
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg border text-[11px] font-mono" style={{ background: '#F0E8E6', borderColor: '#D5C8C5', color: '#6F6664' }}>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#176B52' }} />AI</span>
              <span style={{ color: '#D5C8C5' }}>·</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#176B52' }} />DB</span>
              <span style={{ color: '#D5C8C5' }}>·</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#176B52' }} />Voice</span>
            </div>

            {/* Search */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition"
              style={{ background: '#F0E8E6', borderColor: '#D5C8C5', color: '#6F6664' }}
            >
              <span>⌕</span>
              <span className="hidden sm:inline" style={{ color: '#111111' }}>Search</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ background: '#E7DEDC', borderColor: '#D5C8C5', color: '#6F6664' }}>⌘K</kbd>
            </button>

            {/* Live clock */}
            <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold" style={{ background: '#F0E8E6', borderColor: '#D5C8C5', color: '#990011' }}>
              {timeString}
            </div>

            {/* Incidents bell */}
            <Link
              href="/incidents"
              className="p-2 rounded-lg border transition"
              style={{ background: '#F0E8E6', borderColor: '#D5C8C5', color: '#6F6664' }}
              title="Incidents"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ background: '#FCF6F5' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

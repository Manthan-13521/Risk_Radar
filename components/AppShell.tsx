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
      { label: 'Settings', href: '/settings', icon: '⚙' },
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

function NavContentExpanded({ pathname }: { pathname: string | null }) {
  return (
    <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
      {NAV.map((sec) => (
        <div key={sec.title}>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] px-2.5 mb-2.5" style={{ color: '#554B49' }}>
            {sec.title}
          </div>
          <div className="space-y-1">
            {sec.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-[15px] font-bold tracking-tight transition-all"
                  style={{
                    background: active ? '#990011' : 'transparent',
                    color: active ? '#ffffff' : item.isPrimary ? '#990011' : '#111111',
                  }}
                >
                  <span className="text-base w-5 text-center shrink-0 font-mono font-extrabold">{item.icon}</span>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.isPrimary && !active && (
                    <span
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{ background: 'rgba(153,0,17,0.12)', color: '#990011' }}
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

function NavContentCollapsed({ pathname }: { pathname: string | null }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4 flex flex-col items-center">
      {NAV.map((sec, secIdx) => (
        <div key={sec.title} className="w-full flex flex-col items-center space-y-1">
          {secIdx > 0 && (
            <div className="w-8 h-px my-1" style={{ background: '#C4B5B0' }} />
          )}
          {sec.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                title={item.label}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-mono font-extrabold transition-all group relative"
                style={{
                  background: active ? '#990011' : 'transparent',
                  color: active ? '#ffffff' : item.isPrimary ? '#990011' : '#111111',
                }}
              >
                <span>{item.icon}</span>
                {/* Floating tooltip */}
                <span
                  className="fixed left-20 px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap"
                  style={{ background: '#111111' }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [timeString, setTimeString] = useState('');

  const getTitle = () => {
    if (!pathname) return 'Risk_Radar';
    if (pathname.startsWith('/investigate/')) return 'Investigation Result';
    if (pathname.startsWith('/incidents/')) return 'Incident Detail';
    return PAGE_TITLES[pathname] || 'Risk_Radar';
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rr_sidebar_expanded');
      if (saved !== null) {
        setSidebarExpanded(saved === 'true');
      }
    } catch {
      // ignore in SSR or restricted storage
    }
  }, []);

  useEffect(() => {
    const tick = () => setTimeString(new Date().toTimeString().split(' ')[0]);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(v => !v); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarExpanded(v => {
          const next = !v;
          try { localStorage.setItem('rr_sidebar_expanded', String(next)); } catch {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => { setMobileDrawerOpen(false); }, [pathname]);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileDrawerOpen(v => !v);
    } else {
      setSidebarExpanded(prev => {
        const next = !prev;
        try { localStorage.setItem('rr_sidebar_expanded', String(next)); } catch {}
        return next;
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#ECE6E2' }}>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Mobile backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden transition-opacity duration-200"
          style={{ background: 'rgba(17,17,17,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col border-r transition-transform duration-300 ease-in-out md:hidden ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b shrink-0" style={{ borderColor: '#C4B5B0' }}>
          <div className="flex items-center gap-3">
            <RiskRadarLogo size={32} />
            <div>
              <div className="font-extrabold text-base tracking-tight" style={{ color: '#111111' }}>Risk_Radar</div>
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#554B49' }}>Digital Immune System</div>
            </div>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-2 rounded-xl border font-bold text-xs"
            style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#554B49' }}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>
        <NavContentExpanded pathname={pathname} />
        <div className="p-4 border-t shrink-0" style={{ borderColor: '#C4B5B0', background: '#E0D8D4' }}>
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#990011' }}>MJ</div>
            <div>
              <div className="text-sm font-bold" style={{ color: '#111111' }}>Manthan Jaiswal</div>
              <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: '#176B52' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>SYSTEM OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Responsive Sidebar (Expands to w-72 or Collapses to w-[72px] Icon Rail) */}
      <aside
        className={`hidden md:flex flex-col h-full border-r shrink-0 transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'w-72' : 'w-[72px]'
        }`}
        style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}
      >
        {sidebarExpanded ? (
          /* Full Expanded Header */
          <div className="h-16 flex items-center justify-between px-5 border-b shrink-0" style={{ borderColor: '#C4B5B0' }}>
            <div className="flex items-center gap-3 min-w-0">
              <RiskRadarLogo size={32} className="shrink-0" />
              <div className="min-w-0">
                <div className="font-extrabold text-base tracking-tight truncate" style={{ color: '#111111' }}>Risk_Radar</div>
                <div className="text-[10px] font-bold uppercase tracking-widest truncate" style={{ color: '#554B49' }}>Digital Immune System</div>
              </div>
            </div>
            <button
              onClick={() => {
                setSidebarExpanded(false);
                try { localStorage.setItem('rr_sidebar_expanded', 'false'); } catch {}
              }}
              className="p-1.5 rounded-xl border text-xs font-bold transition hover:bg-white/50 shrink-0"
              style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#554B49' }}
              title="Collapse to Icon Rail (⌘B)"
              aria-label="Collapse to Icon Rail"
            >
              ◀
            </button>
          </div>
        ) : (
          /* Collapsed Icon Rail Header */
          <div className="h-16 flex items-center justify-center border-b shrink-0" style={{ borderColor: '#C4B5B0' }}>
            <button
              onClick={() => {
                setSidebarExpanded(true);
                try { localStorage.setItem('rr_sidebar_expanded', 'true'); } catch {}
              }}
              title="Expand Sidebar (⌘B)"
              className="p-1.5 rounded-xl hover:opacity-85 transition"
            >
              <RiskRadarLogo size={32} />
            </button>
          </div>
        )}

        {/* Nav Body */}
        {sidebarExpanded ? (
          <NavContentExpanded pathname={pathname} />
        ) : (
          <NavContentCollapsed pathname={pathname} />
        )}

        {/* Footer */}
        {sidebarExpanded ? (
          <div className="p-4 border-t shrink-0" style={{ borderColor: '#C4B5B0', background: '#E0D8D4' }}>
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#990011' }}>MJ</div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: '#111111' }}>Manthan Jaiswal</div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#176B52' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>SYSTEM OPERATIONAL</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t shrink-0 flex justify-center" style={{ borderColor: '#C4B5B0', background: '#E0D8D4' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs cursor-pointer"
              style={{ background: '#990011' }}
              title="Manthan Jaiswal · SYSTEM OPERATIONAL"
            >
              MJ
            </div>
          </div>
        )}
      </aside>

      {/* Main workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 shrink-0 border-b flex items-center justify-between px-5 sm:px-8 gap-4" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
          <div className="flex items-center gap-3">
            {/* Top 3-Lines Button (Hamburger / Rail Toggle) */}
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl border transition hover:bg-white/50 flex items-center justify-center shadow-xs"
              style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#111111' }}
              title={sidebarExpanded ? "Collapse Sidebar to Icon Rail (⌘B)" : "Expand Sidebar (⌘B)"}
              aria-label="Toggle navigation sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>Risk_Radar</div>
              <div className="text-base font-extrabold leading-tight" style={{ color: '#111111' }}>{getTitle()}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Subsystem status */}
            <div className="hidden lg:flex items-center gap-3 px-3.5 py-2 rounded-xl border text-xs font-mono font-bold shadow-xs" style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#554B49' }}>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#176B52' }} />AI</span>
              <span style={{ color: '#C4B5B0' }}>·</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#176B52' }} />DB</span>
              <span style={{ color: '#C4B5B0' }}>·</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#176B52' }} />Voice</span>
            </div>

            {/* Search */}
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition hover:bg-white/40 shadow-xs"
              style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#554B49' }}
            >
              <span>⌕</span>
              <span className="hidden sm:inline" style={{ color: '#111111' }}>Search</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border" style={{ background: '#D3C9C5', borderColor: '#C4B5B0', color: '#554B49' }}>⌘K</kbd>
            </button>

            {/* Live clock */}
            <div className="hidden sm:flex items-center px-3 py-2 rounded-xl border text-xs font-mono font-extrabold shadow-xs" style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#990011' }}>
              {timeString}
            </div>

            {/* Incidents bell */}
            <Link
              href="/incidents"
              className="p-2.5 rounded-xl border transition hover:bg-white/40 shadow-xs"
              style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#554B49' }}
              title="Incidents"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ background: '#ECE6E2' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

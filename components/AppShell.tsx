'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  '/': 'Security Command Center',
  '/dashboard': 'Executive Dashboard',
  '/scanner': 'Artifact Scanner',
  '/investigate': 'Artifact Scanner',
  '/incidents': 'Incident Response',
  '/history': 'Scan History',
  '/threat-dna': 'Threat DNA',
  '/intelligence': 'Threat Intelligence',
  '/policies': 'Security Policies',
  '/knowledge': 'Knowledge Center',
  '/ai-health': 'AI System Health',
  '/evaluation': 'Evaluation Lab',
  '/voice': 'Voice',
  '/audit': 'Audit Logs',
  '/audit-logs': 'Audit Logs',
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
  const { data: session, status } = useSession();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [timeString, setTimeString] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || 'Security Operator';
  const userEmail = session?.user?.email || '';
  const userRole = (session?.user as unknown as { role?: string })?.role || 'USER';
  const userInitials = userName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SO';

  const getTitle = () => {
    if (!pathname) return 'ShieldSense';
    if (pathname.startsWith('/investigate/')) return 'Investigation Result';
    if (pathname.startsWith('/incidents/')) return 'Incident Detail';
    return PAGE_TITLES[pathname] || 'ShieldSense';
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rr_sidebar_expanded');
      if (saved !== null) {
        setSidebarExpanded(saved === 'true');
      }
    } catch {
      // ignore
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarExpanded((v) => {
          const next = !v;
          try {
            localStorage.setItem('rr_sidebar_expanded', String(next));
          } catch {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    setMobileDrawerOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileDrawerOpen((v) => !v);
    } else {
      setSidebarExpanded((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('rr_sidebar_expanded', String(next));
        } catch {}
        return next;
      });
    }
  };

  // Dedicated full-screen layout for authentication pages
  if (pathname === '/login' || pathname === '/signup') {
    return <main className="min-h-screen overflow-y-auto" style={{ background: '#ECE6E2' }}>{children}</main>;
  }

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
              <div className="font-extrabold text-base tracking-tight" style={{ color: '#111111' }}>ShieldSense</div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 px-1 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#990011' }}>
                {userInitials}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: '#111111' }}>{userName}</div>
                <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: '#176B52' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{userRole}</span>
                </div>
              </div>
            </div>
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-[10px] font-bold px-2 py-1 rounded border"
                style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#990011' }}
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-[10px] font-bold px-2.5 py-1 rounded text-white"
                style={{ background: '#990011' }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Desktop Responsive Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-full border-r shrink-0 transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'w-72' : 'w-[72px]'
        }`}
        style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}
      >
        {sidebarExpanded ? (
          <div className="h-16 flex items-center justify-between px-5 border-b shrink-0" style={{ borderColor: '#C4B5B0' }}>
            <div className="flex items-center gap-3 min-w-0">
              <RiskRadarLogo size={32} className="shrink-0" />
              <div className="min-w-0">
                <div className="font-extrabold text-base tracking-tight truncate" style={{ color: '#111111' }}>ShieldSense</div>
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

        {sidebarExpanded ? (
          <NavContentExpanded pathname={pathname} />
        ) : (
          <NavContentCollapsed pathname={pathname} />
        )}

        {/* Sidebar Footer */}
        {sidebarExpanded ? (
          <div className="p-4 border-t shrink-0" style={{ borderColor: '#C4B5B0', background: '#E0D8D4' }}>
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#990011' }}>
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: '#111111' }}>{userName}</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#176B52' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{userRole === 'ADMIN' ? 'ADMINISTRATOR' : 'OPERATOR'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t shrink-0 flex justify-center" style={{ borderColor: '#C4B5B0', background: '#E0D8D4' }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs cursor-pointer"
              style={{ background: '#990011' }}
              title={`${userName} · ${userRole}`}
            >
              {userInitials}
            </div>
          </div>
        )}
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 shrink-0 border-b flex items-center justify-between px-5 sm:px-8 gap-4" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl border transition hover:bg-white/50 flex items-center justify-center shadow-xs"
              style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#111111' }}
              title={sidebarExpanded ? 'Collapse Sidebar (⌘B)' : 'Expand Sidebar (⌘B)'}
              aria-label="Toggle navigation sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>ShieldSense</div>
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
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: '#176B52' }} />Auth</span>
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

            {/* User Profile Dropdown Menu (Requirement 18 & 19) */}
            {session ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition hover:bg-white/40 shadow-xs"
                  style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}
                  aria-label="User Profile Menu"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#990011' }}>
                    {userInitials}
                  </div>
                  <span className="hidden md:inline text-xs font-bold max-w-[120px] truncate" style={{ color: '#111111' }}>
                    {userName}
                  </span>
                  <svg className="w-3.5 h-3.5 hidden sm:inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#554B49' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: '#C4B5B0' }}>
                      <div className="text-sm font-extrabold truncate" style={{ color: '#111111' }}>{userName}</div>
                      <div className="text-xs font-medium truncate mt-0.5" style={{ color: '#554B49' }}>{userEmail}</div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mt-2" style={{ background: 'rgba(23,107,82,0.1)', color: '#176B52' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>ROLE: {userRole}</span>
                      </div>
                    </div>

                    <div className="p-1 space-y-0.5 text-xs font-bold">
                      <Link
                        href="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition hover:bg-white/50"
                        style={{ color: '#111111' }}
                      >
                        <span>👤</span>
                        <span>Profile & Organization</span>
                      </Link>

                      <Link
                        href="/policies"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition hover:bg-white/50"
                        style={{ color: '#111111' }}
                      >
                        <span>🛡</span>
                        <span>Security Policies</span>
                      </Link>

                      <Link
                        href="/audit"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition hover:bg-white/50"
                        style={{ color: '#111111' }}
                      >
                        <span>📜</span>
                        <span>Audit Telemetry</span>
                      </Link>
                    </div>

                    <div className="p-1.5 border-t mt-1" style={{ borderColor: '#C4B5B0' }}>
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-extrabold transition hover:bg-red-500/10"
                        style={{ color: '#990011' }}
                      >
                        <span>Sign Out</span>
                        <span>🚪</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : status !== 'loading' ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border transition hover:bg-white/40 shadow-xs"
                  style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#111111' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-2 rounded-xl text-xs font-extrabold text-white transition hover:opacity-90 shadow-sm"
                  style={{ background: '#990011' }}
                >
                  Get Started
                </Link>
              </div>
            ) : null}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ background: '#ECE6E2' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

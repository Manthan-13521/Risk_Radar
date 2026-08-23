export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import InvestigateForm from '@/components/InvestigateForm';

const DEMO_CASES = [
  { title: 'Bank Phishing', type: 'url', content: 'https://paypa1-security.example.invalid/login', cls: 'critical', desc: 'Homoglyph PayPal lookalike with credential harvesting path' },
  { title: 'Package Delivery Scam', type: 'message', content: 'Your package could not be delivered. Pay a ₹49 redelivery fee immediately using the link: https://deliv-pay.top/track', cls: 'dangerous', desc: 'Financial fee lure with urgent delivery call-to-action' },
  { title: 'Account Suspension', type: 'message', content: 'FINAL WARNING: Verify your HDFC banking account today or access will be disabled. Complete identity verification immediately.', cls: 'dangerous', desc: 'Coercive urgency and credential demand signature' },
  { title: 'Legitimate Calendar Invite', type: 'message', content: 'Hi, the team sync has been moved to 4 PM today. Please join using the usual internal calendar invite.', cls: 'safe', desc: 'Standard team communication, no suspicious markers' },
  { title: 'Official Google Search', type: 'url', content: 'https://www.google.com/search?q=cybersecurity+threat+intelligence', cls: 'safe', desc: 'Verified trusted search engine domain' },
];

function clsStyle(cls: string): { bg: string; color: string } {
  if (cls === 'critical') return { bg: '#76000D', color: '#fff' };
  if (cls === 'dangerous') return { bg: '#990011', color: '#fff' };
  if (cls === 'suspicious') return { bg: '#B86A00', color: '#fff' };
  return { bg: '#176B52', color: '#fff' };
}

const PIPELINE = [
  { n: '01', label: 'Signal Detection & Extraction' },
  { n: '02', label: 'URL / File Structural Analysis' },
  { n: '03', label: 'Contextual AI Reasoning' },
  { n: '04', label: 'Threat DNA Memory Clustering' },
  { n: '05', label: 'Authoritative Policy Guard' },
];

import { getServerAuthSession } from '@/lib/auth/auth-options';

export default async function ScannerPage() {
  const session = await getServerAuthSession();
  const userId = session?.user?.id;
  const isAdmin = session?.user?.role === 'ADMIN';

  const db = await getDb();
  const query: Record<string, unknown> = {};
  if (userId && !isAdmin) {
    query.$or = [{ userId }, { isDemo: true }, { userId: { $exists: false } }];
  }

  const recentScans = await db.collection('scans').find(query).sort({ createdAt: -1 }).limit(5).toArray();

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Artifact Investigation Workspace</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>INVESTIGATION WORKSPACE</h1>
        <p className="text-sm mt-1" style={{ color: '#554B49' }}>Submit suspicious URLs, emails, SMS messages or files for multi-stage security analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border p-6 md:p-8 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="text-[10px] font-extrabold uppercase tracking-widest mb-5" style={{ color: '#990011' }}>Submit Artifact for Sandbox Analysis</div>
            <InvestigateForm />
          </div>

          {/* Demo scenarios */}
          <div className="rounded-2xl border p-5 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="text-[10px] font-extrabold uppercase tracking-widest mb-3" style={{ color: '#554B49' }}>Demo Scenarios</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_CASES.map(d => {
                const { bg, color } = clsStyle(d.cls);
                return (
                  <Link
                    key={d.title}
                    href={`/scanner?type=${d.type}&content=${encodeURIComponent(d.content)}`}
                    className="p-3.5 rounded-xl border transition hover:bg-white/40 shadow-xs"
                    style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-xs font-bold" style={{ color: '#111111' }}>{d.title}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0" style={{ background: bg, color }}>{d.cls}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: '#554B49' }}>{d.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Pipeline + Recent Scans */}
        <div className="space-y-5">
          <div className="rounded-2xl border p-5 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="text-[10px] font-extrabold uppercase tracking-widest mb-4" style={{ color: '#111111' }}>Investigation Pipeline</div>
            <div className="space-y-1">
              {PIPELINE.map(p => (
                <div key={p.n} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: '#C4B5B0' }}>
                  <span className="text-xs font-bold font-mono" style={{ color: '#990011' }}>{p.n}</span>
                  <span className="text-xs font-semibold" style={{ color: '#111111' }}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: '#C4B5B0' }}>
              <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#111111' }}>Recent Scans</div>
              <Link href="/history" className="text-xs font-bold" style={{ color: '#990011' }}>All →</Link>
            </div>
            {recentScans.length === 0 ? (
              <div className="p-5 text-xs text-center" style={{ color: '#554B49' }}>No scans yet</div>
            ) : (
              <div className="divide-y" style={{ borderColor: '#C4B5B0' }}>
                {recentScans.map(s => {
                  const isThreat = s.classification === 'critical' || s.classification === 'dangerous';
                  const color = isThreat ? '#990011' : s.classification === 'suspicious' ? '#B86A00' : '#176B52';
                  return (
                    <Link
                      key={String(s._id)}
                      href={`/investigate/${String(s._id)}`}
                      className="flex items-center justify-between px-4 py-3 transition hover:bg-white/40"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-mono font-semibold truncate" style={{ color: '#111111' }}>
                          {s.inputType === 'file'
                            ? (s.inputMetadata as Record<string, unknown>)?.filename as string
                            : (s.inputMetadata as Record<string, unknown>)?.truncatedContent as string}
                        </div>
                        <div className="text-[10px] capitalize font-mono mt-0.5" style={{ color: '#554B49' }}>
                          {s.inputType} · {String(s.attackerIntent || 'unknown').replace(/_/g, ' ')}
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono shrink-0" style={{ color }}>{Number(s.riskScore)}/100</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

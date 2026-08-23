export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getServerAuthSession } from '@/lib/auth/auth-options';
import InvestigateForm from '@/components/InvestigateForm';
import DemoVideoPlayer from '@/components/DemoVideoPlayer';
import FakeClickDemo from '@/components/FakeClickDemo';

export default async function LandingPage() {
  const session = await getServerAuthSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-12" style={{ background: '#ECE6E2' }}>
      {/* ═══ HERO ═══ */}
      <div className="space-y-6 pb-10 border-b" style={{ borderColor: '#C4B5B0' }}>
        <div className="space-y-3">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: '#990011' }}>
            Risk_Radar · Digital Immune System
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-[66px] font-extrabold leading-[0.95] tracking-tight" style={{ color: '#111111' }}>
            INVESTIGATE<br />BEFORE YOU<br />INTERACT.
          </h1>
          <p className="text-base sm:text-lg max-w-2xl font-medium leading-relaxed" style={{ color: '#554B49' }}>
            Autonomous security intelligence that analyzes suspicious links, messages, and files before they become incidents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3.5 pt-1">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-extrabold text-white tracking-wide transition hover:opacity-90 shadow-md"
              style={{ background: '#990011' }}
            >
              GO TO MY DASHBOARD →
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-extrabold text-white tracking-wide transition hover:opacity-90 shadow-md"
                style={{ background: '#990011' }}
              >
                START PROTECTING YOURSELF →
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-5 py-3.5 rounded-xl text-sm font-bold border transition hover:bg-white/40 shadow-xs"
                style={{ borderColor: '#C4B5B0', color: '#111111', background: '#E0D8D4' }}
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ═══ VALUE PILLARS ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: '01 / MULTI-SIGNAL HEURISTICS',
            desc: 'Deterministic homoglyph analysis, keyword entropy, and structural file evaluation in milliseconds.',
            color: '#111111',
          },
          {
            title: '02 / CONTEXTUAL AI REASONING',
            desc: 'Multi-engine LLM intent extraction classifying phishing, credential harvesting, and scam behavior.',
            color: '#990011',
          },
          {
            title: '03 / THREAT DNA MEMORY',
            desc: 'Behavioral pattern clustering using Jaccard vector similarity that remembers attacks across new domains.',
            color: '#176B52',
          },
        ].map((pillar) => (
          <div key={pillar.title} className="rounded-2xl border p-6 shadow-sm space-y-2" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="text-xs font-extrabold font-mono" style={{ color: pillar.color }}>
              {pillar.title}
            </div>
            <p className="text-xs font-medium leading-relaxed" style={{ color: '#554B49' }}>
              {pillar.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ═══ PRIMARY INVESTIGATION SANDBOX ═══ */}
      <div id="investigate-form-card" className="rounded-2xl border p-6 md:p-8 space-y-5 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
        <div className="pb-4 border-b" style={{ borderColor: '#C4B5B0' }}>
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>
            Interactive Security Sandbox
          </div>
          <h2 className="text-xl font-extrabold" style={{ color: '#111111' }}>
            TEST AN ARTIFACT WITH RISK_RADAR
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#554B49' }}>
            Paste a suspicious URL, message, or email to preview real-time threat detection and behavioral analysis.
          </p>
        </div>
        <InvestigateForm showDemos={true} />
      </div>

      {/* ═══ DEMO VIDEO SECTION ═══ */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#990011' }}>
              Product Demo · 40 Seconds
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold leading-tight" style={{ color: '#111111' }}>
              See Risk_Radar in Action
            </h2>
            <p className="text-sm mt-1.5 max-w-lg font-medium" style={{ color: '#554B49' }}>
              One suspicious click. One investigation. One decision before it&apos;s too late.
            </p>
          </div>
          <div
            className="shrink-0 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-2 rounded-xl border self-start sm:self-auto"
            style={{ background: 'rgba(153,0,17,0.07)', borderColor: 'rgba(153,0,17,0.2)', color: '#990011' }}
          >
            Watch how Risk_Radar investigates a suspicious banking URL.
          </div>
        </div>

        <DemoVideoPlayer />

        <p className="text-xs font-medium text-center" style={{ color: '#554B49' }}>
          40 sec · Product Demo · No external links · All analysis runs on your own backend
        </p>
      </div>

      {/* ═══ FAKE CLICK PHISHING DEMO ═══ */}
      <FakeClickDemo />

      {/* ═══ CALL TO ACTION ═══ */}
      <div className="rounded-2xl border p-8 sm:p-10 text-center space-y-4 shadow-md" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#990011' }}>
          Zero Trust Defense
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#111111' }}>
          Deploy your personal security console
        </h2>
        <p className="text-sm max-w-md mx-auto font-medium" style={{ color: '#554B49' }}>
          Get isolated scan history, automated incident triage, Threat DNA clustering, and custom security policy enforcement.
        </p>
        <div className="pt-2">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex px-8 py-3.5 rounded-xl text-sm font-extrabold text-white tracking-wide shadow-md hover:opacity-90 transition"
              style={{ background: '#990011' }}
            >
              Open Dashboard →
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-flex px-8 py-3.5 rounded-xl text-sm font-extrabold text-white tracking-wide shadow-md hover:opacity-90 transition"
              style={{ background: '#990011' }}
            >
              Create Free Account →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

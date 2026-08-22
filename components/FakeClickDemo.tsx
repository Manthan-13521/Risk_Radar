'use client';

import { useState } from 'react';

const STEPS = [
  { label: 'URL Analysis', detail: 'Domain structure inspected' },
  { label: 'Heuristic Analysis', detail: 'Suspicious urgency pattern detected' },
  { label: 'Identity Analysis', detail: 'Brand / domain mismatch detected' },
  { label: 'Threat DNA', detail: '87% similar to credential-theft attacks' },
  { label: 'AI Reasoning', detail: 'Intent analysis complete' },
];

export default function FakeClickDemo() {
  const [phase, setPhase] = useState<'idle' | 'investigating' | 'verdict'>('idle');
  const [step, setStep] = useState(0);

  const triggerInvestigation = () => {
    if (phase !== 'idle') return;
    setPhase('investigating');
    setStep(0);
    let s = 0;
    const interval = setInterval(() => {
      s++;
      setStep(s);
      if (s >= STEPS.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('verdict'), 400);
      }
    }, 500);
  };

  const reset = () => { setPhase('idle'); setStep(0); };

  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#C4B5B0', background: '#E0D8D4' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#C4B5B0' }}>
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: '#990011' }}>
            Interactive Phishing Demo · Sandboxed
          </div>
          <h3 className="text-base font-extrabold" style={{ color: '#111111' }}>
            What Happens Without Risk_Radar?
          </h3>
        </div>
        <div
          className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border"
          style={{ background: 'rgba(153,0,17,0.08)', borderColor: 'rgba(153,0,17,0.25)', color: '#990011' }}
        >
          Demo Only · No Real Navigation
        </div>
      </div>

      <div className="p-6">
        {/* Phase A — Fake SMS card */}
        {phase === 'idle' && (
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Fake phishing message */}
            <div className="flex-1">
              <div className="text-xs font-bold mb-3" style={{ color: '#554B49' }}>
                A typical user receives this message:
              </div>
              <div className="rounded-2xl border p-5 shadow-sm" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: '#1565C0' }}>SBI</div>
                  <div>
                    <div className="text-xs font-extrabold" style={{ color: '#111111' }}>SBI Bank · Alert</div>
                    <div className="text-[10px]" style={{ color: '#554B49' }}>sbi-kyc-verify.example</div>
                  </div>
                  <div className="ml-auto text-[10px]" style={{ color: '#554B49' }}>Just now</div>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#111111' }}>
                  ⚠️ <strong>URGENT:</strong> Your SBI account requires immediate KYC verification. Failure to verify within 24 hours will result in your account being <strong>permanently frozen</strong>.
                </p>
                <button
                  onClick={triggerInvestigation}
                  className="w-full py-3 rounded-xl text-sm font-extrabold text-white transition hover:opacity-90 shadow-md relative"
                  style={{ background: '#1565C0' }}
                >
                  🔗 Verify Now — sbi-kyc-verify.example
                </button>
              </div>
              <div className="mt-3 text-xs font-medium" style={{ color: '#554B49' }}>
                👆 Click <strong>&ldquo;Verify Now&rdquo;</strong> — Risk_Radar intercepts before any navigation happens.
              </div>
            </div>

            {/* Info sidebar */}
            <div className="md:w-56 space-y-3">
              <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>Without Risk_Radar</div>
              {[
                'Clicks link without thinking',
                'Enters banking credentials',
                'Account gets compromised',
                'Data sold on dark web',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#111111' }}>
                  <span className="text-red-600 font-bold shrink-0 mt-0.5">✗</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase B — Investigating */}
        {phase === 'investigating' && (
          <div className="space-y-4">
            <div
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{ background: 'rgba(153,0,17,0.06)', borderColor: 'rgba(153,0,17,0.25)' }}
            >
              <div className="w-3 h-3 rounded-full animate-ping shrink-0" style={{ background: '#990011' }} />
              <div className="text-sm font-extrabold uppercase tracking-widest" style={{ color: '#990011' }}>
                Risk_Radar Intercepted — Investigating
              </div>
            </div>
            <div className="space-y-2">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: i < step ? 'rgba(153,0,17,0.06)' : '#ECE6E2',
                    borderColor: i < step ? 'rgba(153,0,17,0.2)' : '#C4B5B0',
                    opacity: i > step ? 0.45 : 1,
                  }}
                >
                  <span className="text-sm font-mono font-extrabold w-5 text-center shrink-0" style={{ color: i < step ? '#990011' : '#C4B5B0' }}>
                    {i < step ? '✓' : i === step - 1 ? '▸' : '○'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold" style={{ color: '#111111' }}>{s.label}</div>
                    {i < step && (
                      <div className="text-[10px] font-medium mt-0.5" style={{ color: '#990011' }}>{s.detail}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: '#C4B5B0' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ background: '#990011', width: `${(step / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Phase C — Verdict */}
        {phase === 'verdict' && (
          <div className="space-y-4">
            {/* Verdict banner */}
            <div
              className="rounded-2xl border p-5 text-center shadow-sm"
              style={{ background: 'rgba(118,0,13,0.1)', borderColor: 'rgba(153,0,17,0.4)' }}
            >
              <div className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: '#990011' }}>
                Risk_Radar Verdict
              </div>
              <div className="text-3xl font-extrabold mb-1" style={{ color: '#76000D' }}>DO NOT CONTINUE</div>
              <div className="text-sm font-bold" style={{ color: '#990011' }}>CRITICAL THREAT DETECTED</div>
            </div>

            {/* Score row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'RISK SCORE', value: '94', sub: '/ 100', color: '#990011' },
                { label: 'CONFIDENCE', value: '92', sub: '%', color: '#111111' },
                { label: 'INTENT', value: 'Credential', sub: 'Theft', color: '#B86A00' },
              ].map(m => (
                <div key={m.label} className="rounded-xl border p-3 text-center shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#554B49' }}>{m.label}</div>
                  <div className="text-xl font-extrabold font-mono" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-[10px]" style={{ color: '#554B49' }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Evidence */}
            <div className="space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>
                Evidence
              </div>
              {[
                { label: 'Lookalike Domain', detail: 'sbi-kyc-verify.example ≠ sbi.co.in' },
                { label: 'Artificial Urgency', detail: '"24 hours" pressure tactic' },
                { label: 'Brand Mismatch', detail: 'Impersonating SBI from unknown domain' },
                { label: 'Threat DNA Match', detail: '87% similar to credential-theft campaigns' },
                { label: 'Suspicious Auth Path', detail: '/login pathway on unverified domain' },
              ].map((e, i) => (
                <div key={i} className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl border text-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
                  <span className="font-bold shrink-0 mt-0.5" style={{ color: '#990011' }}>✗</span>
                  <div>
                    <span className="font-extrabold" style={{ color: '#111111' }}>{e.label}</span>
                    <span className="ml-2 font-medium" style={{ color: '#554B49' }}>{e.detail}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded-xl text-sm font-extrabold text-white shadow-md transition hover:opacity-90"
                style={{ background: '#990011' }}
                onClick={reset}
              >
                Block &amp; Quarantine
              </button>
              <button
                onClick={reset}
                className="px-5 py-3 rounded-xl text-sm font-bold border transition hover:bg-white/40"
                style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#554B49' }}
              >
                Reset Demo
              </button>
            </div>

            <div className="text-center text-[10px] font-medium" style={{ color: '#554B49' }}>
              ↑ Sandboxed demo — no actual navigation occurred.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

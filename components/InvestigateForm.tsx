'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

const STEPS = [
  '01  SIGNAL EXTRACTION',
  '02  CONTENT ANALYSIS',
  '03  AI REASONING',
  '04  THREAT DNA',
  '05  POLICY DECISION',
];

export const DEMO_SCENARIOS = [
  { label: 'Bank Phishing', type: 'message' as const, content: 'https://paypa1-security.example.invalid/login', cls: 'critical' },
  { label: 'Delivery Scam', type: 'message' as const, content: 'Your package could not be delivered. Pay a ₹49 redelivery fee immediately using the link: https://deliv-pay.top/track', cls: 'dangerous' },
  { label: 'Account Suspension', type: 'message' as const, content: 'FINAL WARNING: Verify your HDFC banking account today or access will be disabled. Complete identity verification immediately.', cls: 'dangerous' },
  { label: 'Safe Website', type: 'message' as const, content: 'https://www.google.com/search?q=cybersecurity+threat+intelligence', cls: 'safe' },
];

function clsStyle(cls: string): { bg: string; color: string } {
  if (cls === 'critical') return { bg: '#76000D', color: '#fff' };
  if (cls === 'dangerous') return { bg: '#990011', color: '#fff' };
  if (cls === 'suspicious') return { bg: '#B86A00', color: '#fff' };
  return { bg: '#176B52', color: '#fff' };
}

export default function InvestigateForm({
  compact = false,
  showDemos = true,
  onScanStateChange,
}: {
  compact?: boolean;
  showDemos?: boolean;
  onScanStateChange?: (stage: number) => void;
}) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [inputType, setInputType] = useState<'message' | 'file'>('message');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const urlContent = searchParams?.get('content');
    const urlType = searchParams?.get('type');
    if (urlContent) {
      setContent(decodeURIComponent(urlContent));
      if (urlType === 'file') setInputType('file');
      else setInputType('message');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        const next = prev < 5 ? prev + 1 : prev;
        if (onScanStateChange) onScanStateChange(next);
        return next;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [loading, onScanStateChange]);

  const loadDemo = (demoContent: string, demoType: 'message' | 'file' = 'message') => {
    setInputType(demoType);
    setContent(demoContent);
    setError(null);
    if (demoType === 'message' && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInvestigation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    const trimmed = content.trim();
    if (inputType === 'message' && !trimmed) {
      setError('Please enter a URL or message to investigate.');
      return;
    }
    if (inputType === 'file' && !fileInputRef.current?.files?.[0] && !fileName) {
      setError('Please select a file to investigate.');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep(1);

    try {
      const fd = new FormData();
      fd.append('type', inputType);
      if (inputType === 'message') {
        fd.append('content', trimmed);
      } else if (fileInputRef.current?.files?.[0]) {
        fd.append('file', fileInputRef.current.files[0]);
      }

      const res = await fetch('/api/investigate', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Investigation request failed');
      }

      const data = await res.json();
      if (!data?.id) {
        throw new Error('Invalid investigation response from server');
      }

      // Immediate guaranteed navigation
      window.location.href = `/investigate/${data.id}`;
    } catch (err: unknown) {
      console.error('[Investigate] Execution error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during investigation');
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const disabled = loading || (inputType === 'message' && !content.trim()) || (inputType === 'file' && !fileName);

  if (compact) {
    return (
      <form onSubmit={handleInvestigation} className="space-y-3">
        {error && (
          <div className="p-2.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(153,0,17,0.08)', border: '1px solid rgba(153,0,17,0.2)', color: '#990011' }}>
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <input
            name="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Paste suspicious URL, message or address..."
            disabled={loading}
            className="flex-1 px-4 py-3.5 rounded-xl text-sm font-sans font-medium"
            style={{ background: '#ECE6E2', border: '1.5px solid #C4B5B0', color: '#111111', outline: 'none' }}
          />
          <input type="hidden" name="type" value="message" />
          <button
            type="submit"
            disabled={disabled}
            className="px-6 py-3.5 rounded-xl text-sm font-extrabold text-white shrink-0 transition hover:opacity-90 shadow-sm disabled:cursor-not-allowed"
            style={{ background: disabled ? '#C4B5B0' : '#990011', color: disabled ? '#554B49' : '#fff' }}
          >
            {loading ? 'Scanning...' : 'Investigate →'}
          </button>
        </div>
        {loading && (
          <div className="rounded-xl p-3 text-xs font-mono font-bold" style={{ background: 'rgba(153,0,17,0.06)', border: '1px solid rgba(153,0,17,0.15)', color: '#990011' }}>
            INVESTIGATION IN PROGRESS · {STEPS[Math.min(loadingStep, STEPS.length - 1)]}
          </div>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleInvestigation} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(153,0,17,0.08)', border: '1px solid rgba(153,0,17,0.2)', color: '#990011' }}>
          {error}
        </div>
      )}

      {/* Top row: Type selector & In-place Demo buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 p-1 rounded-xl border w-fit" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
          <button
            type="button"
            onClick={() => { setInputType('message'); setFileName(null); }}
            className="px-4 py-2 rounded-lg text-xs font-extrabold transition"
            style={inputType === 'message' ? { background: '#990011', color: '#fff' } : { color: '#554B49' }}
          >
            URL / MESSAGE
          </button>
          <button
            type="button"
            onClick={() => { setInputType('file'); fileInputRef.current?.click(); }}
            className="px-4 py-2 rounded-lg text-xs font-extrabold transition"
            style={inputType === 'file' ? { background: '#990011', color: '#fff' } : { color: '#554B49' }}
          >
            FILE
          </button>
        </div>

        {showDemos && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest mr-1" style={{ color: '#554B49' }}>
              Demo:
            </span>
            {DEMO_SCENARIOS.map(d => {
              const { bg, color: pillColor } = clsStyle(d.cls);
              const isSelected = content === d.content;
              return (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => loadDemo(d.content, d.type)}
                  className="px-3 py-1 rounded-full text-[10px] font-extrabold transition hover:opacity-85 shadow-xs"
                  style={{
                    background: bg,
                    color: pillColor,
                    outline: isSelected ? '2px solid #111111' : 'none',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                  }}
                  title={`Load "${d.label}" sample into the form`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <input type="hidden" name="type" value={inputType} />

      {inputType === 'message' ? (
        <textarea
          ref={textareaRef}
          name="content"
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={loading}
          rows={5}
          placeholder="Paste suspicious URL, email header, SMS text, or message here..."
          className="w-full p-4 rounded-xl text-sm font-mono leading-relaxed resize-y shadow-xs"
          style={{ background: '#ECE6E2', border: '1.5px solid #C4B5B0', color: '#111111', outline: 'none' }}
        />
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition hover:bg-white/40 shadow-xs"
          style={{ borderColor: '#C4B5B0', background: '#ECE6E2' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) setFileName(f.name); }}
          />
          <div className="text-3xl mb-3" style={{ color: '#990011' }}>↑</div>
          <div className="text-sm font-bold" style={{ color: '#111111' }}>
            {fileName ? `Selected: ${fileName}` : 'Click to select a file'}
          </div>
          <p className="text-xs mt-1" style={{ color: '#554B49' }}>PDF, DOCX, TXT, CSV · Max 10MB · Metadata only</p>
        </div>
      )}

      {/* Animated pipeline during scan */}
      {loading && (
        <div className="rounded-xl p-4 space-y-3 shadow-xs" style={{ background: 'rgba(153,0,17,0.06)', border: '1px solid rgba(153,0,17,0.2)' }}>
          <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#990011' }}>INVESTIGATION IN PROGRESS</div>
          <div className="space-y-1.5">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold w-4" style={{ color: i < loadingStep ? '#990011' : '#C4B5B0' }}>
                  {i < loadingStep ? '✓' : i === loadingStep ? '▸' : '○'}
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: i < loadingStep ? '#990011' : i === loadingStep ? '#111111' : '#554B49' }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: '#C4B5B0' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ background: '#990011', width: `${Math.min(loadingStep * 20 + 5, 100)}%` }} />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="w-full py-4 rounded-xl text-sm font-extrabold tracking-widest uppercase transition hover:opacity-90 shadow-md disabled:cursor-not-allowed"
        style={{
          background: disabled ? '#C4B5B0' : '#990011',
          color: disabled ? '#554B49' : '#ffffff',
        }}
      >
        {loading ? 'INVESTIGATION RUNNING...' : 'INVESTIGATE →'}
      </button>
    </form>
  );
}

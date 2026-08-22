'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const STEPS = [
  '01  SIGNAL EXTRACTION',
  '02  CONTENT ANALYSIS',
  '03  AI REASONING',
  '04  THREAT DNA',
  '05  POLICY DECISION',
];

export default function InvestigateForm({
  compact = false,
  onScanStateChange,
}: {
  compact?: boolean;
  onScanStateChange?: (stage: number) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [inputType, setInputType] = useState<'message' | 'file'>('message');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const urlContent = searchParams?.get('content');
    const urlType = searchParams?.get('type');
    if (urlContent) setContent(urlContent);
    if (urlType === 'file') setInputType('file');
    else if (urlType) setInputType('message');
  }, [searchParams]);

  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        const next = prev < 5 ? prev + 1 : prev;
        if (onScanStateChange) onScanStateChange(next);
        return next;
      });
    }, 450);
    return () => clearInterval(interval);
  }, [loading, onScanStateChange]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLoadingStep(1);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/investigate', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(await res.text() || 'Investigation failed');
      const data = await res.json();
      router.push(`/investigate/${data.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const disabled = loading || (inputType === 'message' && !content.trim()) || (inputType === 'file' && !fileName);

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="p-2.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(153,0,17,0.08)', border: '1px solid rgba(153,0,17,0.2)', color: '#990011' }}>
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <input
            name="content" value={content} onChange={e => setContent(e.target.value)}
            placeholder="Paste suspicious URL, message or address..."
            disabled={loading}
            className="flex-1 px-4 py-3.5 rounded-xl text-sm font-sans font-medium"
            style={{ background: '#ECE6E2', border: '1.5px solid #C4B5B0', color: '#111111', outline: 'none' }}
          />
          <input type="hidden" name="type" value="message" />
          <button
            type="submit" disabled={loading || !content.trim()}
            className="px-6 py-3.5 rounded-xl text-sm font-extrabold text-white shrink-0 transition hover:opacity-90"
            style={{ background: loading || !content.trim() ? '#C4B5B0' : '#990011', color: loading || !content.trim() ? '#554B49' : '#fff' }}
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl text-xs font-bold" style={{ background: 'rgba(153,0,17,0.08)', border: '1px solid rgba(153,0,17,0.2)', color: '#990011' }}>
          {error}
        </div>
      )}

      {/* Type selector */}
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

      <input type="hidden" name="type" value={inputType} />

      {inputType === 'message' ? (
        <textarea
          name="content" value={content} onChange={e => setContent(e.target.value)}
          disabled={loading} rows={5}
          placeholder="Paste suspicious URL, email header, SMS text, or message here..."
          className="w-full p-4 rounded-xl text-sm font-mono leading-relaxed resize-y"
          style={{ background: '#ECE6E2', border: '1.5px solid #C4B5B0', color: '#111111', outline: 'none' }}
        />
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition hover:bg-white/40"
          style={{ borderColor: '#C4B5B0', background: '#ECE6E2' }}
        >
          <input
            ref={fileInputRef} type="file" name="file" className="hidden"
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
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(153,0,17,0.04)', border: '1px solid rgba(153,0,17,0.15)' }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#990011' }}>INVESTIGATION IN PROGRESS</div>
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
        type="submit" disabled={disabled}
        className="w-full py-4 rounded-xl text-sm font-extrabold tracking-widest uppercase transition hover:opacity-90 shadow-md"
        style={{ background: disabled ? '#C4B5B0' : '#990011', color: disabled ? '#554B49' : '#fff' }}
      >
        {loading ? 'INVESTIGATION RUNNING...' : 'INVESTIGATE →'}
      </button>
    </form>
  );
}

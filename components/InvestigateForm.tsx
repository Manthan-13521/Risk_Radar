"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

  // Animated pipeline progress states during submission
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
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
      const res = await fetch('/api/investigate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Investigation failed');
      }

      const data = await res.json();
      router.push(`/investigate/${data.id}`);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const PIPELINE_STEPS = [
    'Receiving input & verifying payload...',
    'Extracting behavioral security signals...',
    'Analyzing attacker intent with AI...',
    'Comparing against historical Threat DNA...',
    'Evaluating authoritative safety policies...',
  ];

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-950/80 border border-red-700/60 text-red-300 p-2.5 rounded-lg text-xs font-mono">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <input
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste suspicious URL, email, message or address..."
            disabled={loading}
            className="flex-1 bg-[#111111] border border-[#222222] focus:border-teal-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition shadow-inner font-sans"
          />
          <input type="hidden" name="type" value="message" />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-teal-500 hover:bg-teal-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold text-sm px-6 py-3 rounded-xl transition shadow-[0_0_15px_rgba(20,184,166,0.3)] shrink-0 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <span>🔍</span>
                <span>Investigate</span>
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="p-3 bg-[#0e1422] border border-teal-900/50 rounded-lg flex items-center gap-3 animate-in fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            <span className="text-xs text-teal-300 font-mono">
              {PIPELINE_STEPS[Math.min(loadingStep, PIPELINE_STEPS.length - 1)]}
            </span>
          </div>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-950/80 border border-red-700/60 text-red-300 p-3 rounded-lg text-xs font-mono">
          {error}
        </div>
      )}

      {/* Input Type Selector Pills */}
      <div className="flex items-center gap-2 bg-[#0e0e0e] p-1 rounded-xl border border-[#222222] w-fit">
        <button
          type="button"
          onClick={() => {
            setInputType('message');
            setFileName(null);
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            inputType === 'message'
              ? 'bg-[#1c1c1c] text-white shadow-sm border border-[#333333]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>🔗</span>
          <span>URL / Message</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setInputType('file');
            if (fileInputRef.current) fileInputRef.current.click();
          }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            inputType === 'file'
              ? 'bg-[#1c1c1c] text-white shadow-sm border border-[#333333]'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>📎</span>
          <span>Upload File</span>
        </button>
      </div>

      <input type="hidden" name="type" value={inputType} />

      {inputType === 'message' ? (
        <div className="relative">
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            rows={4}
            placeholder="Paste suspicious URL, email header, SMS text, or malicious code snippet here..."
            className="w-full bg-[#111111] border border-[#222222] focus:border-teal-500/60 rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none transition shadow-inner font-mono leading-relaxed resize-y"
          />
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-8 border-2 border-dashed border-[#2a2a2a] hover:border-teal-500/50 rounded-xl bg-[#0e0e0e] flex flex-col items-center justify-center cursor-pointer transition group"
        >
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFileName(file.name);
            }}
          />
          <div className="w-12 h-12 rounded-full bg-teal-950/60 border border-teal-800/60 text-teal-300 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition">
            📎
          </div>
          <div className="text-sm font-bold text-zinc-200 group-hover:text-teal-300 transition text-center">
            {fileName ? `Selected: ${fileName}` : 'Click or drop file to inspect metadata'}
          </div>
          <p className="text-xs text-zinc-500 mt-1 text-center">
            PDF, DOCX, TXT, CSV, or Executable metadata (Max 10MB) · ShieldSense never executes binaries.
          </p>
        </div>
      )}

      {/* Live Pipeline Progress Indicator */}
      {loading && (
        <div className="p-4 bg-[#0a101b] border border-teal-900/60 rounded-xl space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-teal-300 font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
              <span>{PIPELINE_STEPS[Math.min(loadingStep, PIPELINE_STEPS.length - 1)]}</span>
            </span>
            <span className="text-zinc-500">{Math.min(loadingStep * 20 + 20, 100)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-400 h-1.5 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(20,184,166,0.8)]"
              style={{ width: `${Math.min(loadingStep * 20 + 20, 100)}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || (inputType === 'message' && !content.trim()) || (inputType === 'file' && !fileName)}
        className="w-full bg-teal-500 hover:bg-teal-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-extrabold py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(20,184,166,0.3)] text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>Executing Investigation Sandbox...</span>
          </>
        ) : (
          <>
            <span>⚡</span>
            <span>Launch Security Investigation</span>
          </>
        )}
      </button>
    </form>
  );
}

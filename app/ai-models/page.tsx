export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default async function AIModelsPage() {
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  const hasKey = Boolean(process.env.OPENROUTER_API_KEY);

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Reasoning Engine</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>AI MODEL CENTER</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>
          Configuration, reasoning constraints, and schema enforcement for the AI reasoning layer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Model Config Card */}
        <div className="rounded-2xl border p-6 space-y-4 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#111111' }}>
            Active Reasoning Engine
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between p-3 rounded-xl border" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Provider</span>
              <span className="font-bold" style={{ color: '#111111' }}>OpenRouter AI Gateway</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Model ID</span>
              <span className="truncate max-w-xs font-bold" style={{ color: '#990011' }}>{model}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>API Key Status</span>
              <span className="font-bold" style={{ color: hasKey ? '#176B52' : '#B86A00' }}>
                {hasKey ? 'CONFIGURED ✓' : 'NOT SET (FALLBACK ACTIVE)'}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Structured Schema</span>
              <span className="font-bold" style={{ color: '#176B52' }}>Strict Zod (LLMOutputSchema)</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Max Tokens</span>
              <span className="font-bold" style={{ color: '#111111' }}>1500 tokens</span>
            </div>
          </div>
        </div>

        {/* Evaluation & Self-Test Card */}
        <div className="rounded-2xl border p-6 flex flex-col justify-between space-y-4 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: '#111111' }}>
              Model Diagnostic Evaluation
            </div>
            <p className="text-xs leading-relaxed font-medium" style={{ color: '#554B49' }}>
              Verify end-to-end model inference, JSON formatting accuracy, and policy override mechanics directly against the golden evaluation set.
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href="/evaluation"
              className="w-full block text-center py-3 px-4 rounded-xl text-xs font-bold border transition hover:bg-white/40 shadow-xs"
              style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111' }}
            >
              Open Evaluation Lab →
            </Link>
            <Link
              href="/scanner?type=url&content=https%3A%2F%2Fwww.google.com%2F"
              className="w-full block text-center py-3 px-4 rounded-xl text-xs font-extrabold text-white transition hover:opacity-90 shadow-sm"
              style={{ background: '#990011' }}
            >
              Run Safe Synthetic Test Case
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

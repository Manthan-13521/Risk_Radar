export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function AIModelsPage() {
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  const hasKey = Boolean(process.env.OPENROUTER_API_KEY);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <PageHeader
        title="AI Model Center"
        subtitle="Configuration, reasoning constraints, and schema enforcement for the AI reasoning layer."
        badge={
          <span className="text-xs bg-blue-950/80 border border-blue-800/60 text-blue-300 px-2.5 py-0.5 rounded font-mono">
            {model}
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Model Config Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Active Reasoning Engine
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-2.5 bg-zinc-950/60 border border-zinc-800 rounded">
              <span className="text-zinc-500">Provider</span>
              <span className="text-zinc-200">OpenRouter AI Gateway</span>
            </div>
            <div className="flex justify-between p-2.5 bg-zinc-950/60 border border-zinc-800 rounded">
              <span className="text-zinc-500">Model ID</span>
              <span className="text-blue-300 truncate max-w-xs">{model}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-zinc-950/60 border border-zinc-800 rounded">
              <span className="text-zinc-500">API Key Status</span>
              <span className={hasKey ? 'text-emerald-400' : 'text-amber-400'}>
                {hasKey ? 'CONFIGURED ✓' : 'NOT SET (FALLBACK ACTIVE)'}
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-zinc-950/60 border border-zinc-800 rounded">
              <span className="text-zinc-500">Structured Schema</span>
              <span className="text-emerald-400">Strict Zod (LLMOutputSchema)</span>
            </div>
            <div className="flex justify-between p-2.5 bg-zinc-950/60 border border-zinc-800 rounded">
              <span className="text-zinc-500">Max Tokens</span>
              <span className="text-zinc-200">1500 tokens</span>
            </div>
          </div>
        </div>

        {/* Evaluation & Self-Test Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Model Diagnostic Evaluation
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Verify end-to-end model inference, JSON formatting accuracy, and policy override mechanics directly against the golden evaluation set.
            </p>
          </div>

          <div className="space-y-2">
            <Link
              href="/evaluation"
              className="w-full block text-center py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
            >
              Open Evaluation Lab →
            </Link>
            <Link
              href="/investigate?type=url&content=https%3A%2F%2Fwww.google.com%2F"
              className="w-full block text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
            >
              Run Safe Synthetic Test Case
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

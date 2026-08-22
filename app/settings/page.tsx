export const dynamic = 'force-dynamic';

import { PageHeader } from '@/components/ui/PageHeader';

export default async function SettingsPage() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  const hasMongo = Boolean(process.env.MONGODB_URI);
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  const hasWhatsApp = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <PageHeader
        title="Settings & System Configuration"
        subtitle="Global platform variables, security policies, and environment posture."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Environment & Runtime
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between p-2.5 bg-zinc-950/60 border border-zinc-800 rounded">
              <span className="text-zinc-500">Environment</span>
              <span className="text-zinc-200 uppercase">{nodeEnv}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-zinc-950/60 border border-zinc-800 rounded">
              <span className="text-zinc-500">Database Engine</span>
              <span className={hasMongo ? 'text-emerald-400' : 'text-amber-400'}>
                {hasMongo ? 'MongoDB Atlas (Configured)' : 'Not Configured'}
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-zinc-950/60 border border-zinc-800 rounded">
              <span className="text-zinc-500">AI Reasoning Model</span>
              <span className="text-blue-300 truncate max-w-xs">{model}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-zinc-950/60 border border-zinc-800 rounded">
              <span className="text-zinc-500">Voice Synthesis</span>
              <span className={hasOpenAi ? 'text-emerald-400' : 'text-zinc-500'}>
                {hasOpenAi ? 'Enabled (OpenAI)' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between p-2.5 bg-zinc-950/60 border border-zinc-800 rounded">
              <span className="text-zinc-500">WhatsApp Gateway</span>
              <span className={hasWhatsApp ? 'text-emerald-400' : 'text-zinc-500'}>
                {hasWhatsApp ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Engine Directives */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Engine Guardrails
          </h2>

          <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
            <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded">
              <div className="font-bold text-zinc-200 mb-1">Authoritative Safety Overrides</div>
              <p>Hard deterministic security rules prevent model hallucinations from marking elevated threats as clean.</p>
            </div>
            <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded">
              <div className="font-bold text-zinc-200 mb-1">Simulated Action Enforcement</div>
              <p>Quarantine and Block recommendations execute in a controlled sandbox without altering host OS states.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

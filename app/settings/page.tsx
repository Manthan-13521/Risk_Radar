export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  const hasMongo = Boolean(process.env.MONGODB_URI);
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  const hasWhatsApp = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID);

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#FCF6F5' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#D5C8C5' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Platform Settings</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>SETTINGS & CONFIGURATION</h1>
        <p className="text-sm mt-1" style={{ color: '#6F6664' }}>
          Global platform variables, security policies, and environment posture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Details */}
        <div className="rounded-2xl border p-6 space-y-4" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#111111' }}>
            Environment & Runtime
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between p-3 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <span style={{ color: '#6F6664' }}>Environment</span>
              <span className="uppercase font-bold" style={{ color: '#111111' }}>{nodeEnv}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <span style={{ color: '#6F6664' }}>Database Engine</span>
              <span className="font-bold" style={{ color: hasMongo ? '#176B52' : '#B86A00' }}>
                {hasMongo ? 'MongoDB Atlas (Configured)' : 'Not Configured'}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <span style={{ color: '#6F6664' }}>AI Reasoning Model</span>
              <span className="truncate max-w-xs font-bold" style={{ color: '#990011' }}>{model}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <span style={{ color: '#6F6664' }}>Voice Synthesis</span>
              <span className="font-bold" style={{ color: hasOpenAi ? '#176B52' : '#6F6664' }}>
                {hasOpenAi ? 'Enabled (OpenAI)' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <span style={{ color: '#6F6664' }}>WhatsApp Gateway</span>
              <span className="font-bold" style={{ color: hasWhatsApp ? '#176B52' : '#6F6664' }}>
                {hasWhatsApp ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Engine Directives */}
        <div className="rounded-2xl border p-6 space-y-4" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#111111' }}>
            Engine Guardrails
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-4 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <div className="font-bold mb-1" style={{ color: '#111111' }}>Authoritative Safety Overrides</div>
              <p style={{ color: '#6F6664' }}>
                Hard deterministic security rules prevent model hallucinations from marking elevated threats as clean.
              </p>
            </div>
            <div className="p-4 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <div className="font-bold mb-1" style={{ color: '#111111' }}>Simulated Action Enforcement</div>
              <p style={{ color: '#6F6664' }}>
                Quarantine and Block recommendations execute in a controlled sandbox without altering host OS states.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default async function WhatsAppIntegrationPage() {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const hasToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN);
  const isConfigured = Boolean(phoneId && hasToken);

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Integrations</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>WHATSAPP SECURITY GATEWAY</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>
          Conversational endpoint for users to forward suspicious messages, voice notes, and URLs directly from WhatsApp.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-xs"
          style={{
            background: isConfigured ? 'rgba(23,107,82,0.1)' : 'rgba(111,102,100,0.1)',
            borderColor: isConfigured ? 'rgba(23,107,82,0.25)' : '#C4B5B0',
            color: isConfigured ? '#176B52' : '#554B49',
          }}>
          <span className="w-2 h-2 rounded-full bg-current" />
          {isConfigured ? 'GATEWAY ONLINE' : 'NOT CONFIGURED'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection State */}
        <div className="space-y-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: '#554B49' }}>
            WhatsApp Cloud API Status
          </div>

          <div
            className="rounded-2xl border p-5 shadow-sm"
            style={{
              background: isConfigured ? 'rgba(23,107,82,0.08)' : '#E0D8D4',
              borderColor: isConfigured ? 'rgba(23,107,82,0.25)' : '#C4B5B0',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm" style={{ color: '#111111' }}>Meta WhatsApp Cloud API</div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase" style={{ color: isConfigured ? '#176B52' : '#554B49' }}>
                <span className="w-2 h-2 rounded-full bg-current" />
                {isConfigured ? 'Healthy' : 'Not Configured'}
              </div>
            </div>
            <div className="text-xs font-medium" style={{ color: '#554B49' }}>
              {isConfigured ? `Phone ID: ${phoneId?.substring(0, 6)}...` : 'Credentials not configured'}
            </div>
          </div>

          <div className="rounded-2xl border p-5 space-y-3 text-xs shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
            <div className="font-extrabold text-sm" style={{ color: '#111111' }}>Webhook Endpoint URL</div>
            <div className="p-3.5 rounded-xl font-mono border break-all font-bold shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#990011' }}>
              /api/whatsapp/webhook
            </div>
            <p className="font-medium" style={{ color: '#554B49' }}>
              Configure this webhook URL inside Meta Developer Portal to receive real-time forwarded scam messages.
            </p>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="rounded-2xl border p-6 space-y-4 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#111111' }}>
            Setup Instructions
          </div>

          <div className="space-y-3 text-xs leading-relaxed font-medium" style={{ color: '#554B49' }}>
            <div className="flex gap-3 p-3.5 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span className="font-mono font-extrabold" style={{ color: '#990011' }}>1.</span>
              <span>Register a WhatsApp Cloud API application in Meta Developer Console.</span>
            </div>
            <div className="flex gap-3 p-3.5 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span className="font-mono font-extrabold" style={{ color: '#990011' }}>2.</span>
              <span>
                Set <code className="font-mono font-bold" style={{ color: '#111111' }}>WHATSAPP_PHONE_NUMBER_ID</code> and{' '}
                <code className="font-mono font-bold" style={{ color: '#111111' }}>WHATSAPP_ACCESS_TOKEN</code> in your environment variables.
              </span>
            </div>
            <div className="flex gap-3 p-3.5 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span className="font-mono font-extrabold" style={{ color: '#990011' }}>3.</span>
              <span>Subscribe to the <code className="font-mono font-bold" style={{ color: '#111111' }}>messages</code> webhook topic.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

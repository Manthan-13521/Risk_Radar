export const dynamic = 'force-dynamic';

export default async function WhatsAppIntegrationPage() {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const hasToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN);
  const isConfigured = Boolean(phoneId && hasToken);

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#FCF6F5' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#D5C8C5' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Integrations</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>WHATSAPP SECURITY GATEWAY</h1>
        <p className="text-sm mt-1" style={{ color: '#6F6664' }}>
          Conversational endpoint for users to forward suspicious messages, voice notes, and URLs directly from WhatsApp.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold"
          style={{
            background: isConfigured ? 'rgba(23,107,82,0.08)' : 'rgba(111,102,100,0.08)',
            borderColor: isConfigured ? 'rgba(23,107,82,0.2)' : '#D5C8C5',
            color: isConfigured ? '#176B52' : '#6F6664',
          }}>
          <span className="w-2 h-2 rounded-full bg-current" />
          {isConfigured ? 'GATEWAY ONLINE' : 'NOT CONFIGURED'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection State */}
        <div className="space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#6F6664' }}>
            WhatsApp Cloud API Status
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              background: isConfigured ? 'rgba(23,107,82,0.06)' : '#F0E8E6',
              borderColor: isConfigured ? 'rgba(23,107,82,0.2)' : '#D5C8C5',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm" style={{ color: '#111111' }}>Meta WhatsApp Cloud API</div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: isConfigured ? '#176B52' : '#6F6664' }}>
                <span className="w-2 h-2 rounded-full bg-current" />
                {isConfigured ? 'Healthy' : 'Not Configured'}
              </div>
            </div>
            <div className="text-xs" style={{ color: '#6F6664' }}>
              {isConfigured ? `Phone ID: ${phoneId?.substring(0, 6)}...` : 'Credentials not configured'}
            </div>
          </div>

          <div className="rounded-2xl border p-5 space-y-3 text-xs" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
            <div className="font-bold text-sm" style={{ color: '#111111' }}>Webhook Endpoint URL</div>
            <div className="p-3 rounded-xl font-mono border break-all" style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#990011' }}>
              /api/whatsapp/webhook
            </div>
            <p style={{ color: '#6F6664' }}>
              Configure this webhook URL inside Meta Developer Portal to receive real-time forwarded scam messages.
            </p>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="rounded-2xl border p-6 space-y-4" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#111111' }}>
            Setup Instructions
          </div>

          <div className="space-y-3 text-xs leading-relaxed" style={{ color: '#6F6664' }}>
            <div className="flex gap-3 p-3 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <span className="font-mono font-bold" style={{ color: '#990011' }}>1.</span>
              <span>Register a WhatsApp Cloud API application in Meta Developer Console.</span>
            </div>
            <div className="flex gap-3 p-3 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <span className="font-mono font-bold" style={{ color: '#990011' }}>2.</span>
              <span>
                Set <code className="font-mono font-bold" style={{ color: '#111111' }}>WHATSAPP_PHONE_NUMBER_ID</code> and{' '}
                <code className="font-mono font-bold" style={{ color: '#111111' }}>WHATSAPP_ACCESS_TOKEN</code> in your environment variables.
              </span>
            </div>
            <div className="flex gap-3 p-3 rounded-xl border" style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}>
              <span className="font-mono font-bold" style={{ color: '#990011' }}>3.</span>
              <span>Subscribe to the <code className="font-mono font-bold" style={{ color: '#111111' }}>messages</code> webhook topic.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

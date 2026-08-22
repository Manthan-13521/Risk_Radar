export const dynamic = 'force-dynamic';

import { PageHeader } from '@/components/ui/PageHeader';
import { HealthIndicator } from '@/components/ui/HealthIndicator';

export default async function WhatsAppIntegrationPage() {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const hasToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN);
  const isConfigured = Boolean(phoneId && hasToken);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <PageHeader
        title="WhatsApp Security Gateway"
        subtitle="Conversational endpoint for users to forward suspicious messages, voice notes, and URLs directly from WhatsApp."
        badge={
          <span className="text-xs bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-2.5 py-0.5 rounded font-mono">
            {isConfigured ? 'GATEWAY ONLINE' : 'NOT CONFIGURED'}
          </span>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection State */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            WhatsApp Cloud API Status
          </h2>

          <HealthIndicator
            label="Meta WhatsApp Cloud API"
            status={isConfigured ? 'healthy' : 'not_configured'}
            detail={isConfigured ? `Phone ID: ${phoneId?.substring(0, 6)}...` : 'Credentials not configured'}
          />

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3 text-xs">
            <h3 className="font-semibold text-zinc-200">Webhook Endpoint URL</h3>
            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded font-mono text-zinc-400 break-all">
              /api/whatsapp/webhook
            </div>
            <p className="text-zinc-500">
              Configure this webhook URL inside Meta Developer Portal to receive real-time forwarded scam messages.
            </p>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Setup Instructions
          </h2>

          <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
            <div className="flex gap-3">
              <span className="font-mono text-blue-400 font-bold">1.</span>
              <span>Register a WhatsApp Cloud API application in Meta Developer Console.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-mono text-blue-400 font-bold">2.</span>
              <span>
                Set <code className="text-zinc-200 font-mono">WHATSAPP_PHONE_NUMBER_ID</code> and{' '}
                <code className="text-zinc-200 font-mono">WHATSAPP_ACCESS_TOKEN</code> in your environment variables.
              </span>
            </div>
            <div className="flex gap-3">
              <span className="font-mono text-blue-400 font-bold">3.</span>
              <span>Subscribe to the <code className="text-zinc-200 font-mono">messages</code> webhook topic.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * WhatsApp Cloud API client.
 * Used ONLY server-side. Credentials never exposed to the browser.
 *
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

export interface WhatsAppAlertPayload {
  riskScore: number;
  confidenceScore: number;
  classification: string;
  attackerIntent: string;
  topEvidence: string[];
  recommendedAction: string;
  scanId: string;
}

const GRAPH_API_VERSION = 'v19.0';
const ALERT_THRESHOLD_RISK = 30; // alert for suspicious (30+), dangerous (60+), critical (80+)
const ALERT_THRESHOLD_ACTIONS = new Set(['quarantine', 'block', 'warn']);

export function shouldSendAlert(riskScore: number, recommendedAction: string): boolean {
  return riskScore >= ALERT_THRESHOLD_RISK && ALERT_THRESHOLD_ACTIONS.has(recommendedAction);
}

function formatActionAdvice(action: string): string {
  switch (action) {
    case 'block':      return 'Do NOT click, open, or respond. Block the sender.';
    case 'quarantine': return 'Do NOT click or respond. Treat as suspicious.';
    case 'warn':       return 'Be cautious before clicking or responding.';
    default:           return 'Exercise caution.';
  }
}

function buildAlertText(payload: WhatsAppAlertPayload): string {
  const intent = payload.attackerIntent.replace(/_/g, ' ');
  const evidenceLine = payload.topEvidence.length > 0
    ? payload.topEvidence.slice(0, 3).join(', ')
    : 'suspicious characteristics';
  const advice = formatActionAdvice(payload.recommendedAction);

  const severityLabel =
    payload.riskScore >= 80 ? '🔴 CRITICAL THREAT'
    : payload.riskScore >= 60 ? '🟠 HIGH RISK'
    : '🟡 SUSPICIOUS';

  return [
    `🚨 *Risk Detected — ShieldSense Alert*`,
    ``,
    `${severityLabel}`,
    `*Risk Score:* ${payload.riskScore}/100`,
    `*Confidence:* ${payload.confidenceScore}/100`,
    ``,
    `*Likely Intent:* ${intent}`,
    `*Warning Signs:* ${evidenceLine}`,
    ``,
    `⚠️ *Action Required:* ${advice}`,
    ``,
    `_ShieldSense AI Security Firewall — hackathon prototype_`,
  ].join('\n');
}

/**
 * Send a WhatsApp text alert to the configured recipient.
 * Returns true on success, false on failure (non-throwing).
 */
export async function sendWhatsAppAlert(payload: WhatsAppAlertPayload): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;
  const recipient     = process.env.WHATSAPP_ALERT_RECIPIENT;

  if (!phoneNumberId || !accessToken || !recipient) {
    console.warn('WhatsApp alert skipped: missing environment variables.');
    return false;
  }

  const body = {
    messaging_product: 'whatsapp',
    to: recipient,
    type: 'text',
    text: { body: buildAlertText(payload) },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('WhatsApp API error:', res.status, text.substring(0, 200));
      return false;
    }

    return true;
  } catch (err: unknown) {
    console.error('WhatsApp send failed:', (err as Error).message);
    return false;
  }
}
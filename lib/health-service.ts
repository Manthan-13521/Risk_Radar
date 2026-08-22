export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'offline' | 'not_configured';
  detail?: string;
  checkedAt: string; // ISO string for serialization
}

export async function checkAiHealth(): Promise<ServiceHealth> {
  const model = process.env.OPENROUTER_MODEL;
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || !model) {
    return {
      name: 'OpenRouter AI',
      status: 'not_configured',
      detail: 'OPENROUTER_API_KEY or OPENROUTER_MODEL not set',
      checkedAt: new Date().toISOString(),
    };
  }
  return {
    name: 'OpenRouter AI',
    status: 'healthy',
    detail: `Model: ${model}`,
    checkedAt: new Date().toISOString(),
  };
}

export async function checkDbHealth(): Promise<ServiceHealth> {
  try {
    const { getDb } = await import('./mongodb');
    const db = await getDb();
    await db.command({ ping: 1 });
    return {
      name: 'MongoDB',
      status: 'healthy',
      detail: 'Connected',
      checkedAt: new Date().toISOString(),
    };
  } catch (e) {
    return {
      name: 'MongoDB',
      status: 'offline',
      detail: `Connection failed: ${String(e).substring(0, 80)}`,
      checkedAt: new Date().toISOString(),
    };
  }
}

export async function checkVoiceHealth(): Promise<ServiceHealth> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return {
      name: 'Voice TTS',
      status: 'not_configured',
      detail: 'OPENAI_API_KEY not set',
      checkedAt: new Date().toISOString(),
    };
  }
  return {
    name: 'Voice TTS',
    status: 'healthy',
    detail: 'OpenAI TTS configured',
    checkedAt: new Date().toISOString(),
  };
}

export async function checkWhatsAppHealth(): Promise<ServiceHealth> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneId || !token) {
    return {
      name: 'WhatsApp',
      status: 'not_configured',
      detail: 'WhatsApp Business API not configured',
      checkedAt: new Date().toISOString(),
    };
  }
  return {
    name: 'WhatsApp',
    status: 'healthy',
    detail: `Phone ID configured`,
    checkedAt: new Date().toISOString(),
  };
}

export async function getAllServiceHealth(): Promise<ServiceHealth[]> {
  const [ai, db, voice, wa] = await Promise.all([
    checkAiHealth(),
    checkDbHealth(),
    checkVoiceHealth(),
    checkWhatsAppHealth(),
  ]);
  return [ai, db, voice, wa];
}

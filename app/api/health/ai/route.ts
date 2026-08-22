import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

  if (!apiKey || apiKey.trim() === '') {
    return NextResponse.json(
      {
        configured: false,
        modelConfigured: false,
        status: 'missing_config',
      },
      { status: 200 }
    );
  }

  // Safe minimal connectivity check
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          configured: true,
          modelConfigured: Boolean(model),
          status: 'provider_error',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        configured: true,
        modelConfigured: Boolean(model),
        status: 'ready',
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        configured: true,
        modelConfigured: Boolean(model),
        status: 'provider_error',
      },
      { status: 200 }
    );
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';

const VoiceRequestSchema = z.object({
  text: z
    .string()
    .min(1, 'Voice text cannot be empty.')
    .max(2000, 'Voice text exceeds the 2000-character limit.'),
});

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = VoiceRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Voice explanation unavailable.' },
        { status: 503 }
      );
    }

    const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: parsed.data.text,
        voice: 'alloy',
        response_format: 'mp3',
        speed: 1.0,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!ttsRes.ok) {
      console.error('TTS API error:', ttsRes.status);
      return NextResponse.json(
        { error: 'Voice explanation unavailable.' },
        { status: 502 }
      );
    }

    const audioBuffer = await ttsRes.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    console.error('Voice route error:', (error as Error).message);
    return NextResponse.json(
      { error: 'Voice explanation unavailable.' },
      { status: 500 }
    );
  }
}
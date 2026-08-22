import { NextResponse } from 'next/server';

/**
 * Voice endpoint — stub that returns 404 gracefully.
 * Voice is now handled 100% client-side via the browser Web Speech API (free, no API key needed).
 * This route exists only so old references don't 500 — it returns a clear 410 Gone response.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Server-side TTS removed. Voice is handled client-side via Web Speech API.' },
    { status: 410 }
  );
}
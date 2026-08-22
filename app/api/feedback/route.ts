import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const schema = z.object({
  scanId: z.string(),
  correct: z.boolean(),
  feedbackType: z
    .enum(['false_positive', 'false_negative', 'wrong_intent', 'wrong_evidence', 'wrong_confidence'])
    .optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const db = await getDb();
    await db.collection('feedback').insertOne({ ...data, timestamp: new Date() });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const feedback = await db.collection('feedback').find({}).sort({ timestamp: -1 }).limit(100).toArray();
    return NextResponse.json(feedback.map((f) => ({ ...f, _id: f._id?.toString() })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

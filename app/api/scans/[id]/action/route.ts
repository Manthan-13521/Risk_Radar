import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const VALID_ACTIONS = new Set(['allow', 'warn', 'quarantine', 'block']);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid scan ID.' }, { status: 400 });
    }

    const body = (await req.json()) as { action?: string };
    const { action } = body;

    if (!action || !VALID_ACTIONS.has(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be allow, warn, quarantine, or block.' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('scans').updateOne(
      { _id: new ObjectId(id) },
      { $set: { actionTaken: action } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, actionTaken: action });
  } catch (error: unknown) {
    console.error('Action error:', (error as Error).message);
    return NextResponse.json({ error: 'Failed to record action.' }, { status: 500 });
  }
}

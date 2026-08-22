import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid scan ID.' }, { status: 400 });
    }
    const db = await getDb();
    const scan = await db.collection('scans').findOne({ _id: new ObjectId(id) });
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
    }
    return NextResponse.json({ scan });
  } catch (error: unknown) {
    console.error('Scan fetch error:', (error as Error).message);
    return NextResponse.json({ error: 'Failed to fetch scan.' }, { status: 500 });
  }
}

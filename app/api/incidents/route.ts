import { NextResponse } from 'next/server';
import { getIncidents } from '@/lib/incident-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const incidents = await getIncidents();
    return NextResponse.json(incidents.map((i) => ({ ...i, _id: i._id?.toString() })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

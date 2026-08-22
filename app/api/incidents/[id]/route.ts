import { NextResponse } from 'next/server';
import { getIncidentById, updateIncidentStatus } from '@/lib/incident-service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const incident = await getIncidentById(params.id);
    if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ...incident, _id: incident._id?.toString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const schema = z.object({ status: z.string(), actionTaken: z.string().optional() });
    const { status, actionTaken } = schema.parse(body);
    const ok = await updateIncidentStatus(params.id, status, actionTaken);
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

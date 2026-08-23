import { NextResponse } from 'next/server';
import { getIncidentById, updateIncidentStatus } from '@/lib/incident-service';
import { getServerAuthSession } from '@/lib/auth/auth-options';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerAuthSession();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === 'ADMIN';

    const incident = await getIncidentById(params.id, userId, isAdmin);
    if (!incident) {
      return NextResponse.json({ error: 'Incident not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ ...incident, _id: incident._id?.toString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.enum(['triage', 'investigating', 'contained', 'resolved']),
  actionTaken: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerAuthSession();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === 'ADMIN';

    const body = await req.json();
    const { status, actionTaken } = updateSchema.parse(body);

    const ok = await updateIncidentStatus(params.id, status, actionTaken, userId, isAdmin);
    if (!ok) {
      return NextResponse.json({ error: 'Incident not found or unauthorized to update' }, { status: 404 });
    }
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

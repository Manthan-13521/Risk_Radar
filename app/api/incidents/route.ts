import { NextResponse } from 'next/server';
import { getIncidents } from '@/lib/incident-service';
import { getServerAuthSession } from '@/lib/auth/auth-options';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === 'ADMIN';

    const incidents = await getIncidents(100, userId, isAdmin);
    return NextResponse.json(incidents.map((i) => ({ ...i, _id: i._id?.toString() })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

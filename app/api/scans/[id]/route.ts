import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerAuthSession } from '@/lib/auth/auth-options';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid scan ID.' }, { status: 400 });
    }

    const session = await getServerAuthSession();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === 'ADMIN';

    const db = await getDb();
    const scan = await db.collection('scans').findOne({ _id: new ObjectId(id) });
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
    }

    // Security Authorization Check:
    // If the scan belongs to another user, and requester is not that user nor an ADMIN, forbid access
    if (scan.userId && userId && scan.userId !== userId && !isAdmin && !scan.isDemo) {
      return NextResponse.json({ error: 'Access denied to this investigation.' }, { status: 403 });
    }

    return NextResponse.json({ scan });
  } catch (error: unknown) {
    console.error('Scan fetch error:', (error as Error).message);
    return NextResponse.json({ error: 'Failed to fetch scan.' }, { status: 500 });
  }
}

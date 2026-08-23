import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getServerAuthSession } from '@/lib/auth/auth-options';

export async function GET(req: Request) {
  try {
    const session = await getServerAuthSession();
    const userId = session?.user?.id || null;
    const isAdmin = session?.user?.role === 'ADMIN';

    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    const query: Record<string, unknown> = {};
    const typeFilter = searchParams.get('type');
    if (typeFilter && typeFilter !== 'all') {
      query.inputType = typeFilter;
    }
    const classFilter = searchParams.get('classification');
    if (classFilter && classFilter !== 'all') {
      query.classification = classFilter;
    }

    // Scoped scan ownership: User only sees their own scans and demo/legacy records
    if (userId && !isAdmin) {
      query.$or = [{ userId }, { isDemo: true }, { userId: { $exists: false } }];
    }

    const scans = await db.collection('scans')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ scans });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/dashboard';
import { getServerAuthSession } from '@/lib/auth/auth-options';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === 'ADMIN';

    const stats = await getDashboardStats(userId, isAdmin);
    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

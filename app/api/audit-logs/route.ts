import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/audit-service';
import { getServerAuthSession } from '@/lib/auth/auth-options';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === 'ADMIN';

    const logs = await getAuditLogs(100, userId, isAdmin);
    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

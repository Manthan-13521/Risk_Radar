import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/audit-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await getAuditLogs();
    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    const query: Record<string, string> = {};
    const typeFilter = searchParams.get('type');
    if (typeFilter && typeFilter !== 'all') {
      query.inputType = typeFilter;
    }
    const classFilter = searchParams.get('classification');
    if (classFilter && classFilter !== 'all') {
      query.classification = classFilter;
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
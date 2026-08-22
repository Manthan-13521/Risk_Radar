import { NextRequest, NextResponse } from 'next/server';
import { updateKnowledgeEntry, deleteKnowledgeEntry } from '@/lib/knowledge-service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const schema = z.object({
      enabled: z.boolean().optional(),
      description: z.string().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      value: z.string().optional(),
    });
    const data = schema.parse(body);
    const ok = await updateKnowledgeEntry(params.id, data);
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ok = await deleteKnowledgeEntry(params.id);
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

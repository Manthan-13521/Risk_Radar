import { NextRequest, NextResponse } from 'next/server';
import { updatePolicy, deletePolicy } from '@/lib/policy-service';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const patchSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  action: z.enum(['allow', 'warn', 'quarantine', 'block']).optional(),
  minimumRisk: z.number().min(0).max(100).optional(),
  priority: z.number().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = patchSchema.parse(body);
    const ok = await updatePolicy(params.id, data);
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ok = await deletePolicy(params.id);
    return NextResponse.json({ ok });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

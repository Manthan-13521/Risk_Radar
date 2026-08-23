import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeEntries, createKnowledgeEntry } from '@/lib/knowledge-service';
import { getServerAuthSession } from '@/lib/auth/auth-options';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await getKnowledgeEntries();
    return NextResponse.json(entries.map((e) => ({ ...e, _id: e._id?.toString() })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

const schema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum([
    'trusted_domain',
    'brand_identity',
    'scam_pattern',
    'dna_pattern',
    'suspicious_phrase',
    'false_positive',
  ]),
  description: z.string().max(500),
  tags: z.array(z.string()),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  source: z.string(),
  value: z.string(),
  enabled: z.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only ADMIN can modify global intelligence base
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Administrator privileges required to add knowledge base entries.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = schema.parse(body);
    const id = await createKnowledgeEntry(data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

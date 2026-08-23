import { NextRequest, NextResponse } from 'next/server';
import { getPolicies, createPolicy } from '@/lib/policy-service';
import { getServerAuthSession } from '@/lib/auth/auth-options';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const policies = await getPolicies();
    return NextResponse.json(policies.map((p) => ({ ...p, _id: p._id?.toString() })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

const policySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  inputType: z.enum(['url', 'message', 'file', 'any']),
  conditions: z.array(
    z.object({
      signal: z.string(),
      operator: z.enum(['equals', 'gte', 'lte', 'contains']),
      value: z.union([z.string(), z.number(), z.boolean()]),
    })
  ),
  minimumRisk: z.number().min(0).max(100).optional(),
  minimumConfidence: z.number().min(0).max(100).optional(),
  action: z.enum(['allow', 'warn', 'quarantine', 'block']),
  enabled: z.boolean(),
  priority: z.number().int().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only ADMIN can create security policies
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Administrator privileges required to configure system policies.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = policySchema.parse(body);
    const id = await createPolicy(data);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

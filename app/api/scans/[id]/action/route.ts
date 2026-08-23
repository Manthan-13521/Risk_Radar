import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerAuthSession } from '@/lib/auth/auth-options';

const VALID_ACTIONS = new Set(['allow', 'warn', 'quarantine', 'block']);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid scan ID.' }, { status: 400 });
    }

    const session = await getServerAuthSession();
    const userId = session?.user?.id;
    const isAdmin = session?.user?.role === 'ADMIN';

    // Support both JSON body AND HTML form submissions (application/x-www-form-urlencoded)
    const contentType = req.headers.get('content-type') ?? '';
    let action: string | undefined;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      action = (formData.get('action') as string) ?? undefined;
    } else {
      try {
        const body = (await req.json()) as { action?: string };
        action = body.action;
      } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
      }
    }

    if (!action || !VALID_ACTIONS.has(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be allow, warn, quarantine, or block.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const scan = await db.collection('scans').findOne({ _id: new ObjectId(id) });
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found.' }, { status: 404 });
    }

    // Security check: cannot modify actions on other users' private scans
    if (scan.userId && userId && scan.userId !== userId && !isAdmin && !scan.isDemo) {
      return NextResponse.json({ error: 'Unauthorized to modify this scan.' }, { status: 403 });
    }

    await db.collection('scans').updateOne(
      { _id: new ObjectId(id) },
      { $set: { actionTaken: action } }
    );

    // Redirect back to the investigation result page after form submission
    if (contentType.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(new URL(`/investigate/${id}`, req.url), 303);
    }

    return NextResponse.json({ success: true, actionTaken: action });
  } catch (error: unknown) {
    console.error('Action error:', (error as Error).message);
    return NextResponse.json({ error: 'Failed to record action.' }, { status: 500 });
  }
}

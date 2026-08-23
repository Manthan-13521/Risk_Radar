import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserByEmail, normalizeEmail } from '@/lib/auth/user-service';

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address').trim(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const normalized = normalizeEmail(parsed.data.email);
    const user = await findUserByEmail(normalized);

    // If email delivery service is not yet connected:
    return NextResponse.json({
      configured: false,
      userExists: Boolean(user),
      message: 'Password reset requires email delivery service (SMTP / SendGrid) configuration. For this environment, please contact your administrator or register a new test account.',
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

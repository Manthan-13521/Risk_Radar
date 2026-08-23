import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, findUserByEmail, normalizeEmail } from '@/lib/auth/user-service';
import { logAuditEvent } from '@/lib/audit-service';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name is too long').trim(),
    email: z.string().email('Please enter a valid email address').trim(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || 'Invalid input data.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const normalized = normalizeEmail(email);

    const existingUser = await findUserByEmail(normalized);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 409 }
      );
    }

    const newUser = await createUser({
      name,
      email: normalized,
      password,
      provider: 'credentials',
      role: 'USER',
    });

    const userIdStr = newUser._id ? newUser._id.toString() : '';

    // Audit log account creation
    try {
      await logAuditEvent({
        eventType: 'action_approved',
        actor: userIdStr || normalized,
        objectId: userIdStr,
        objectType: 'user',
        severity: 'info',
        result: 'success',
        details: { action: 'user_signup', email: normalized, provider: 'credentials' },
        userId: userIdStr,
      });
    } catch {
      // Audit log non-blocking
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully.',
        user: {
          id: userIdStr,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[Auth/Signup] Registration error:', (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create account.' },
      { status: 500 }
    );
  }
}

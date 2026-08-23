import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export type UserRole = 'USER' | 'ADMIN';
export type AuthProvider = 'credentials' | 'google';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string | null;
  provider: AuthProvider;
  role: UserRole;
  organizationId?: string | null; // Prepared for future multi-tenancy
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Optimized salt rounds for fast & secure hashing
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const normalized = normalizeEmail(email);
  return db.collection<User>('users').findOne({ email: normalized });
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return null;
  return db.collection<User>('users').findOne({ _id: new ObjectId(id) });
}

export async function createUser(params: {
  name: string;
  email: string;
  password?: string;
  image?: string | null;
  provider: AuthProvider;
  role?: UserRole;
  organizationId?: string | null;
}): Promise<User> {
  const db = await getDb();
  const normalizedEmail = normalizeEmail(params.email);

  const existing = await db.collection<User>('users').findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  let passwordHash: string | undefined = undefined;
  if (params.password) {
    passwordHash = await hashPassword(params.password);
  }

  const now = new Date();
  const newUser: Omit<User, '_id'> = {
    name: params.name.trim(),
    email: normalizedEmail,
    passwordHash,
    image: params.image || null,
    provider: params.provider,
    role: params.role || 'USER',
    organizationId: params.organizationId || null,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };

  const result = await db.collection('users').insertOne(newUser);
  return {
    _id: result.insertedId,
    ...newUser,
  };
}

// Ultra-fast single-query atomic upsert for Google login
export async function upsertGoogleUser(params: {
  name: string;
  email: string;
  image?: string | null;
}): Promise<User> {
  const db = await getDb();
  const normalizedEmail = normalizeEmail(params.email);
  const now = new Date();

  const res = await db.collection<User>('users').findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        lastLoginAt: now,
        updatedAt: now,
        ...(params.image ? { image: params.image } : {}),
        ...(params.name ? { name: params.name } : {}),
      },
      $setOnInsert: {
        email: normalizedEmail,
        provider: 'google',
        role: 'USER',
        organizationId: null,
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  if (res) {
    return res as unknown as User;
  }

  return {
    name: params.name || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    image: params.image || null,
    provider: 'google',
    role: 'USER',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };
}

export async function updateUserLastLogin(id: string): Promise<void> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return;
  await db.collection('users').updateOne(
    { _id: new ObjectId(id) },
    { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
  );
}

let indexesEnsured = false;
export async function ensureMongoIndexes(): Promise<void> {
  if (indexesEnsured) return;
  try {
    const db = await getDb();
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Scans collection indexes
    await db.collection('scans').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('scans').createIndex({ createdAt: -1 });
    await db.collection('scans').createIndex({ dnaTags: 1 });

    // Incidents collection indexes
    await db.collection('incidents').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('incidents').createIndex({ userId: 1, status: 1 });

    // Audit logs collection indexes
    await db.collection('audit_logs').createIndex({ userId: 1, timestamp: -1 });
    await db.collection('audit_logs').createIndex({ timestamp: -1 });

    indexesEnsured = true;
  } catch (err) {
    console.warn('[MongoDB] Index creation note:', (err as Error).message);
  }
}

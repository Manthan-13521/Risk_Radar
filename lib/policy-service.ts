import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

export interface PolicyCondition {
  signal: string;
  operator: 'equals' | 'gte' | 'lte' | 'contains';
  value: string | number | boolean;
}

export interface Policy {
  _id?: ObjectId;
  name: string;
  description: string;
  inputType: 'url' | 'message' | 'file' | 'any';
  conditions: PolicyCondition[];
  minimumRisk?: number;
  minimumConfidence?: number;
  action: 'allow' | 'warn' | 'quarantine' | 'block';
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_POLICIES: Omit<Policy, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Lookalike Brand Guard',
    description: 'Block lookalike domains combined with login or auth paths — highest risk phishing pattern.',
    inputType: 'url',
    conditions: [
      { signal: 'lookalike_domain', operator: 'equals', value: true },
      { signal: 'credential_path', operator: 'equals', value: true },
    ],
    minimumRisk: 70,
    action: 'block',
    enabled: true,
    priority: 1,
  },
  {
    name: 'Executable File Guard',
    description: 'Quarantine all executable and double-extension files regardless of AI confidence.',
    inputType: 'file',
    conditions: [{ signal: 'executable_file', operator: 'equals', value: true }],
    minimumRisk: 75,
    action: 'quarantine',
    enabled: true,
    priority: 2,
  },
  {
    name: 'Credential + Urgency Guard',
    description: 'Escalate messages combining artificial urgency with credential demands.',
    inputType: 'message',
    conditions: [
      { signal: 'credential_request', operator: 'equals', value: true },
      { signal: 'urgency', operator: 'equals', value: true },
    ],
    minimumRisk: 60,
    action: 'quarantine',
    enabled: true,
    priority: 3,
  },
  {
    name: 'Financial Fraud Pattern Guard',
    description: 'Flag advance fee, lottery, and payment fraud patterns with delivery lures.',
    inputType: 'any',
    conditions: [{ signal: 'financial_scam', operator: 'equals', value: true }],
    minimumRisk: 75,
    action: 'quarantine',
    enabled: true,
    priority: 4,
  },
  {
    name: 'IP Host Direct Dial Guard',
    description: 'Flag direct-to-IP connections which bypass domain name validation.',
    inputType: 'url',
    conditions: [{ signal: 'ip_host', operator: 'equals', value: true }],
    minimumRisk: 65,
    action: 'warn',
    enabled: true,
    priority: 5,
  },
];

async function ensureDefaultPolicies(): Promise<void> {
  const db = await getDb();
  const count = await db.collection('policies').countDocuments();
  if (count === 0) {
    const now = new Date();
    await db.collection('policies').insertMany(
      DEFAULT_POLICIES.map((p) => ({ ...p, createdAt: now, updatedAt: now }))
    );
  }
}

export async function getPolicies(): Promise<Policy[]> {
  const db = await getDb();
  await ensureDefaultPolicies();
  return db.collection<Policy>('policies').find({}).sort({ priority: 1 }).toArray();
}

export async function createPolicy(
  data: Omit<Policy, '_id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = await getDb();
  const result = await db.collection('policies').insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function updatePolicy(id: string, data: Partial<Policy>): Promise<boolean> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return false;
  const result = await db.collection('policies').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

export async function deletePolicy(id: string): Promise<boolean> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return false;
  const result = await db.collection('policies').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

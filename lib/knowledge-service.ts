import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

export type KnowledgeEntryType =
  | 'trusted_domain'
  | 'brand_identity'
  | 'scam_pattern'
  | 'dna_pattern'
  | 'suspicious_phrase'
  | 'false_positive';

export interface KnowledgeEntry {
  _id?: ObjectId;
  name: string;
  type: KnowledgeEntryType;
  description: string;
  tags: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  value: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  const db = await getDb();
  return db.collection<KnowledgeEntry>('knowledge').find({}).sort({ createdAt: -1 }).toArray();
}

export async function createKnowledgeEntry(
  data: Omit<KnowledgeEntry, '_id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const db = await getDb();
  const result = await db.collection('knowledge').insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function updateKnowledgeEntry(
  id: string,
  data: Partial<KnowledgeEntry>
): Promise<boolean> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return false;
  const result = await db.collection('knowledge').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

export async function deleteKnowledgeEntry(id: string): Promise<boolean> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return false;
  const result = await db.collection('knowledge').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

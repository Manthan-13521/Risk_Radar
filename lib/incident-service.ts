import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

export interface Incident {
  _id?: ObjectId;
  incidentId: string;
  scanId: string | null;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'triage' | 'investigating' | 'contained' | 'resolved';
  riskScore: number;
  confidenceScore: number;
  attackerIntent: string;
  classification: string;
  evidence: Array<Record<string, unknown>>;
  dnaTags: string[];
  recommendedAction: string;
  actionTaken?: string;
  summary: string;
  demo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getIncidents(limit = 50): Promise<Incident[]> {
  const db = await getDb();
  return db.collection<Incident>('incidents').find({}).sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return null;
  return db.collection<Incident>('incidents').findOne({ _id: new ObjectId(id) });
}

export async function createIncidentFromScan(scan: Record<string, unknown>): Promise<string> {
  const db = await getDb();
  const classification = String(scan.classification || 'suspicious');
  const riskScore = Number(scan.riskScore || 0);
  const severity: Incident['severity'] =
    classification === 'critical' ? 'critical' :
    classification === 'dangerous' ? 'high' :
    riskScore >= 50 ? 'medium' : 'low';

  const incident: Omit<Incident, '_id'> = {
    incidentId: `INC-${Date.now()}`,
    scanId: String(scan._id || ''),
    severity,
    status: 'triage',
    riskScore,
    confidenceScore: Number(scan.confidenceScore || 0),
    attackerIntent: String(scan.attackerIntent || 'uncertain'),
    classification,
    evidence: (scan.evidence as Array<Record<string, unknown>>) || [],
    dnaTags: (scan.dnaTags as string[]) || [],
    recommendedAction: String(scan.recommendedAction || 'warn'),
    summary: `${classification.toUpperCase()} threat — ${String(scan.attackerIntent || 'uncertain').replace(/_/g, ' ')}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('incidents').insertOne(incident);
  return result.insertedId.toString();
}

export async function updateIncidentStatus(
  id: string,
  status: string,
  actionTaken?: string
): Promise<boolean> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return false;
  const update: Record<string, unknown> = { status, updatedAt: new Date() };
  if (actionTaken) update.actionTaken = actionTaken;
  const result = await db.collection('incidents').updateOne(
    { _id: new ObjectId(id) },
    { $set: update }
  );
  return result.modifiedCount > 0;
}

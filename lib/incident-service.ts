import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';

export interface Incident {
  _id?: ObjectId;
  incidentId: string;
  scanId: string | null;
  userId?: string | null;
  organizationId?: string | null;
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

export async function getIncidents(limit = 50, userId?: string, isAdmin = false): Promise<Incident[]> {
  const db = await getDb();
  const query: Record<string, unknown> = {};

  if (userId && !isAdmin) {
    // Show user's incidents and demo/unassigned incidents
    query.$or = [{ userId }, { demo: true }, { userId: { $exists: false } }];
  }

  return db.collection<Incident>('incidents').find(query).sort({ createdAt: -1 }).limit(limit).toArray();
}

export async function getIncidentById(id: string, userId?: string, isAdmin = false): Promise<Incident | null> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return null;

  const incident = await db.collection<Incident>('incidents').findOne({ _id: new ObjectId(id) });
  if (!incident) return null;

  // Authorization check: User can access if they own it, or if it is demo/legacy, or if admin
  if (userId && !isAdmin) {
    if (incident.userId && incident.userId !== userId && !incident.demo) {
      return null; // Unauthorized to view another user's private incident
    }
  }

  return incident;
}

export async function createIncidentFromScan(
  scan: Record<string, unknown>,
  userId?: string | null
): Promise<string> {
  const db = await getDb();
  const classification = String(scan.classification || 'suspicious');
  const riskScore = Number(scan.riskScore || 0);
  const severity: Incident['severity'] =
    classification === 'critical' ? 'critical' :
    classification === 'dangerous' ? 'high' :
    riskScore >= 50 ? 'medium' : 'low';

  const assignedUserId = userId || (scan.userId as string) || null;
  const isDemo = Boolean(scan.isDemo || scan.demo);

  const incident: Omit<Incident, '_id'> = {
    incidentId: `INC-${Date.now()}`,
    scanId: String(scan._id || ''),
    userId: assignedUserId,
    organizationId: (scan.organizationId as string) || null,
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
    demo: isDemo,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('incidents').insertOne(incident);
  return result.insertedId.toString();
}

export async function updateIncidentStatus(
  id: string,
  status: string,
  actionTaken?: string,
  userId?: string,
  isAdmin = false
): Promise<boolean> {
  const db = await getDb();
  if (!ObjectId.isValid(id)) return false;

  const query: Record<string, unknown> = { _id: new ObjectId(id) };
  if (userId && !isAdmin) {
    query.$or = [{ userId }, { demo: true }, { userId: { $exists: false } }];
  }

  const update: Record<string, unknown> = { status, updatedAt: new Date() };
  if (actionTaken) update.actionTaken = actionTaken;
  
  const result = await db.collection('incidents').updateOne(
    query,
    { $set: update }
  );
  return result.modifiedCount > 0;
}

import { getDb } from './mongodb';

export type AuditEventType =
  | 'investigation_created'
  | 'threat_detected'
  | 'policy_evaluated'
  | 'action_approved'
  | 'policy_modified'
  | 'knowledge_added'
  | 'ai_fallback'
  | 'incident_created'
  | 'incident_resolved'
  | 'feedback_submitted';

export interface AuditEvent {
  eventType: AuditEventType;
  actor: string;
  objectId?: string;
  objectType?: string;
  severity: 'info' | 'warning' | 'critical';
  result: 'success' | 'failure';
  details: Record<string, unknown>;
  timestamp: Date;
}

export async function logAuditEvent(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
  try {
    const db = await getDb();
    await db.collection('audit_logs').insertOne({ ...event, timestamp: new Date() });
  } catch {
    // Audit log failure must never block main investigation flow
    console.error('[Audit] Failed to log event:', event.eventType);
  }
}

export async function getAuditLogs(limit = 100): Promise<AuditEvent[]> {
  const db = await getDb();
  return db
    .collection<AuditEvent>('audit_logs')
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

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
  | 'feedback_submitted'
  | 'user_login'
  | 'user_signup';

export interface AuditEvent {
  eventType: AuditEventType;
  actor: string;
  userId?: string | null;
  objectId?: string;
  objectType?: string;
  severity: 'info' | 'warning' | 'critical';
  result: 'success' | 'failure';
  details: Record<string, unknown>;
  timestamp: Date;
}

// Sanitize metadata to never log sensitive credentials
function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'secret', 'token', 'apikey', 'api_key', 'api-key', 'auth', 'cred', 'hash'];
  
  for (const [k, v] of Object.entries(details)) {
    const lowerKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (sensitiveKeys.some((s) => lowerKey.includes(s.replace(/[^a-z0-9]/g, '')))) {
      sanitized[k] = '[REDACTED]';
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

export async function logAuditEvent(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
  try {
    const db = await getDb();
    const cleanEvent: AuditEvent = {
      ...event,
      details: sanitizeDetails(event.details || {}),
      timestamp: new Date(),
    };
    await db.collection('audit_logs').insertOne(cleanEvent);
  } catch {
    // Audit log failure must never block main investigation flow
    console.error('[Audit] Failed to log event:', event.eventType);
  }
}

export async function getAuditLogs(limit = 100, userId?: string, isAdmin = false): Promise<AuditEvent[]> {
  const db = await getDb();
  const query: Record<string, unknown> = {};
  
  if (userId && !isAdmin) {
    query.$or = [{ userId }, { actor: userId }];
  }

  return db
    .collection<AuditEvent>('audit_logs')
    .find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
}

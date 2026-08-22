import { z } from 'zod';

export const EvidenceSchema = z.object({
  type: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string(),
  description: z.string(),
});

export const LLMOutputSchema = z.object({
  risk_score: z.number().min(0).max(100),
  confidence_score: z.number().min(0).max(100),
  classification: z.enum(['safe', 'suspicious', 'dangerous', 'critical']),
  attacker_intent: z.enum([
    'credential_theft',
    'account_takeover',
    'payment_fraud',
    'malware_delivery',
    'personal_data_collection',
    'identity_impersonation',
    'scam_redirection',
    'uncertain',
  ]),
  explanation: z.string(),
  evidence: z.array(EvidenceSchema),
  dna_tags: z.array(z.string()),
  recommended_action: z.enum(['allow', 'warn', 'quarantine', 'block']),
});

export type LLMOutput = z.infer<typeof LLMOutputSchema>;
export type EvidenceItem = z.infer<typeof EvidenceSchema>;
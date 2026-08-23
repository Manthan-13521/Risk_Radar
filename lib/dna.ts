import { getDb } from './mongodb';

export const DNA_TAGS = [
  'BRAND_IMPERSONATION',
  'URGENCY',
  'LOOKALIKE_DOMAIN',
  'CREDENTIAL_REQUEST',
  'PAYMENT_REQUEST',
  'SUSPICIOUS_URL',
  'BRAND_MISMATCH',
  'DELIVERY_SCAM',
  'ACCOUNT_TAKEOVER',
  'MALWARE_DELIVERY',
  'PERSONAL_DATA_REQUEST',
  'REDIRECT_SCAM',
  'FINANCIAL_SCAM',
  'IP_HOST',
  'CREDENTIAL_PATH',
  'PAYMENT_PATH',
  'SECURITY_PATH',
  'SUSPICIOUS_TLD',
  'EXCESSIVE_SUBDOMAINS',
  'ENCODED_URL',
  'EMBEDDED_CREDENTIALS',
  'INSECURE_HTTP',
  'DOUBLE_EXTENSION',
  'EXECUTABLE_FILE',
  'MACRO_CAPABLE_FILE',
  'PROMPT_INJECTION',
  'OPEN_REDIRECT',
];

/**
 * Weighted significance tiers for Threat DNA Behavioral Matching.
 * High-value behavioral signatures contribute significantly more weight than low-entropy generic traits.
 */
export const TAG_WEIGHTS: Record<string, number> = {
  // Tier 1: High-Value Behavioral & Exploit Signatures (Weight: 3.0)
  LOOKALIKE_DOMAIN: 3.0,
  CREDENTIAL_REQUEST: 3.0,
  BRAND_IMPERSONATION: 3.0,
  PAYMENT_REQUEST: 3.0,
  EXECUTABLE_FILE: 3.0,
  DOUBLE_EXTENSION: 3.0,
  FINANCIAL_SCAM: 3.0,
  PROMPT_INJECTION: 3.0,
  CREDENTIAL_PATH: 2.5,

  // Tier 2: Medium-Value Threat Indicators (Weight: 2.0)
  URGENCY: 2.0,
  DELIVERY_SCAM: 2.0,
  BRAND_MISMATCH: 2.0,
  IP_HOST: 2.0,
  PAYMENT_PATH: 2.0,
  OPEN_REDIRECT: 2.0,
  MACRO_CAPABLE_FILE: 2.0,
  SUSPICIOUS_TLD: 1.5,
  EMBEDDED_CREDENTIALS: 2.0,

  // Tier 3: Low-Value Structural Noise (Weight: 0.5)
  INSECURE_HTTP: 0.5,
  SUSPICIOUS_URL: 0.5,
  ENCODED_URL: 0.5,
  EXCESSIVE_SUBDOMAINS: 0.8,
  SECURITY_PATH: 0.8,
};

export interface DnaMatch {
  scanId: string;
  overlapPercent: number;
  sharedTags: string[];
  previousIntent: string;
  matchQuality: 'strong_behavioral_cluster' | 'moderate_correlation' | 'limited_overlap';
}

const INVALID_TAGS = new Set(['UNANALYZED', 'UNKNOWN', 'ERROR', 'FALLBACK', 'EMPTY', 'NONE', 'N/A', 'UNCERTAIN']);

export function normalizeTag(tag: string): string | null {
  if (!tag) return null;
  const upper = tag.toUpperCase().replace(/[\s-]/g, '_');
  if (INVALID_TAGS.has(upper)) return null;

  if (DNA_TAGS.includes(upper)) return upper;
  if (upper.includes('PROMPT_INJECTION') || upper.includes('INJECTION')) return 'PROMPT_INJECTION';
  if (upper.includes('CREDENTIAL')) return 'CREDENTIAL_REQUEST';
  if (upper.includes('PAYMENT') || upper.includes('FINANCIAL')) return 'PAYMENT_REQUEST';
  if (upper.includes('URGEN')) return 'URGENCY';
  if (upper.includes('LOOKALIKE')) return 'LOOKALIKE_DOMAIN';
  if (upper.includes('BRAND')) return upper.includes('MISMATCH') ? 'BRAND_MISMATCH' : 'BRAND_IMPERSONATION';
  if (upper.includes('DELIVERY')) return 'DELIVERY_SCAM';
  if (upper.includes('IP')) return 'IP_HOST';
  if (upper.includes('REDIRECT')) return 'OPEN_REDIRECT';
  if (upper.includes('URL') || upper.includes('LINK')) return 'SUSPICIOUS_URL';

  return upper;
}

/**
 * Weighted Behavioral Jaccard Similarity:
 * Computes: sum(weight(intersection)) / sum(weight(union))
 */
export function calculateWeightedDnaSimilarity(tagsA: string[], tagsB: string[]): {
  overlapPercent: number;
  sharedTags: string[];
  hasHighValueShared: boolean;
} {
  const setA = new Set(tagsA);
  // setB omitted

  const shared = tagsB.filter((t) => setA.has(t));
  const union = Array.from(new Set([...tagsA, ...tagsB]));

  if (shared.length === 0 || union.length === 0) {
    return { overlapPercent: 0, sharedTags: [], hasHighValueShared: false };
  }

  let sharedWeightSum = 0;
  let unionWeightSum = 0;
  let hasHighValueShared = false;

  for (const tag of shared) {
    const w = TAG_WEIGHTS[tag] || 1.0;
    sharedWeightSum += w;
    if (w >= 2.5) {
      hasHighValueShared = true;
    }
  }

  for (const tag of union) {
    const w = TAG_WEIGHTS[tag] || 1.0;
    unionWeightSum += w;
  }

  const overlapPercent = Math.round((sharedWeightSum / unionWeightSum) * 100);

  return {
    overlapPercent,
    sharedTags: shared,
    hasHighValueShared,
  };
}

/**
 * Find the best Threat DNA match among stored scans.
 * Prevents generic low-entropy matches (e.g. INSECURE_HTTP + SUSPICIOUS_URL) from displaying false 100% campaign matches.
 */
export async function findSimilarDNA(newTagsRaw: string[], userId?: string | null): Promise<DnaMatch[]> {
  const newTags = Array.from(
    new Set(
      newTagsRaw
        .map(normalizeTag)
        .filter((t): t is string => Boolean(t) && !INVALID_TAGS.has(t as string))
    )
  );

  // Require at least 2 meaningful tags for any similarity comparison
  if (newTags.length < 2) return [];

  const db = await getDb();

  const query: Record<string, unknown> = {
    dnaTags: { $exists: true, $ne: [] },
  };

  if (userId) {
    query.$or = [{ userId }, { isDemo: true }, { userId: { $exists: false } }];
  }

  const recent = await db
    .collection('scans')
    .find(query, { projection: { dnaTags: 1, attackerIntent: 1 } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const matches: DnaMatch[] = recent
    .map((scan) => {
      const rawTags: string[] = scan.dnaTags ?? [];
      const scanTags = Array.from(
        new Set(
          rawTags
            .map(normalizeTag)
            .filter((t): t is string => Boolean(t) && !INVALID_TAGS.has(t as string))
        )
      );

      if (scanTags.length < 2) return null;

      const { overlapPercent, sharedTags, hasHighValueShared } = calculateWeightedDnaSimilarity(newTags, scanTags);

      // Must have at least 50% weighted overlap and at least 2 shared tags
      if (overlapPercent < 50 || sharedTags.length < 2) return null;

      let matchQuality: DnaMatch['matchQuality'] = 'limited_overlap';
      if (overlapPercent >= 75 && hasHighValueShared) {
        matchQuality = 'strong_behavioral_cluster';
      } else if (overlapPercent >= 60 || hasHighValueShared) {
        matchQuality = 'moderate_correlation';
      }

      return {
        scanId: scan._id.toString(),
        overlapPercent,
        sharedTags,
        previousIntent: (scan.attackerIntent as string) ?? 'uncertain',
        matchQuality,
      };
    })
    .filter((m): m is DnaMatch => m !== null)
    .sort((a, b) => b.overlapPercent - a.overlapPercent);

  return matches.length > 0 ? [matches[0]] : [];
}

export async function getPatternStats(userId?: string | null, isAdmin = false) {
  const db = await getDb();
  const query: Record<string, unknown> = {};

  if (userId && !isAdmin) {
    query.$or = [{ userId }, { isDemo: true }, { userId: { $exists: false } }];
  }

  const scans = await db
    .collection('scans')
    .find(query, { projection: { dnaTags: 1, classification: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const totalScans = scans.length;
  const threatsFound = scans.filter(
    (s) => s.classification === 'dangerous' || s.classification === 'critical'
  ).length;

  const tagCounts: Record<string, number> = {};
  const patternOccurrences: Record<string, { tags: string[]; count: number; lastDetected: Date }> = {};

  for (const scan of scans) {
    const rawTags: string[] = scan.dnaTags ?? [];
    const validTags = rawTags
      .map(normalizeTag)
      .filter((t): t is string => Boolean(t) && !INVALID_TAGS.has(t as string));

    if (validTags.length === 0) continue;

    for (const t of validTags) {
      tagCounts[t] = (tagCounts[t] ?? 0) + 1;
    }
    const sortedTags = Array.from(new Set(validTags)).sort();
    const key = sortedTags.join(',');
    if (patternOccurrences[key]) {
      patternOccurrences[key].count++;
    } else {
      patternOccurrences[key] = { tags: sortedTags, count: 1, lastDetected: scan.createdAt as Date };
    }
  }

  const patterns = Object.values(patternOccurrences).sort((a, b) => b.count - a.count);
  return { totalScans, threatsFound, distinctPatterns: patterns.length, tagCounts, patterns };
}

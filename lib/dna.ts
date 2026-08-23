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
];

export interface DnaMatch {
  scanId: string;
  overlapPercent: number;
  sharedTags: string[];
  previousIntent: string;
}

const INVALID_TAGS = new Set(['UNANALYZED', 'UNKNOWN', 'ERROR', 'FALLBACK', 'EMPTY', 'NONE', 'N/A']);

export function normalizeTag(tag: string): string | null {
  if (!tag) return null;
  const upper = tag.toUpperCase().replace(/[\s-]/g, '_');
  if (INVALID_TAGS.has(upper)) return null;

  if (DNA_TAGS.includes(upper)) return upper;
  if (upper.includes('CREDENTIAL')) return 'CREDENTIAL_REQUEST';
  if (upper.includes('PAYMENT') || upper.includes('FINANCIAL')) return 'PAYMENT_REQUEST';
  if (upper.includes('URGEN')) return 'URGENCY';
  if (upper.includes('LOOKALIKE')) return 'LOOKALIKE_DOMAIN';
  if (upper.includes('BRAND')) return upper.includes('MISMATCH') ? 'BRAND_MISMATCH' : 'BRAND_IMPERSONATION';
  if (upper.includes('DELIVERY')) return 'DELIVERY_SCAM';
  if (upper.includes('IP')) return 'IP_HOST';
  if (upper.includes('URL') || upper.includes('LINK')) return 'SUSPICIOUS_URL';
  
  return upper;
}

/** Jaccard similarity: |A ∩ B| / |A ∪ B| */
function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const intersection = b.filter((t) => setA.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return Math.round((intersection / union) * 100);
}

/**
 * Find the best DNA match among stored scans.
 * User scans are matched against user's own history + demo scans to prevent cross-user data leakage.
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
  
  // Privacy isolation query: user scans + global demo scans
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

      const overlapPercent = jaccardSimilarity(newTags, scanTags);
      if (overlapPercent < 50) return null;

      const sharedTags = scanTags.filter((t: string) => newTags.includes(t));
      if (sharedTags.length < 2) return null;

      return {
        scanId: scan._id.toString(),
        overlapPercent,
        sharedTags,
        previousIntent: (scan.attackerIntent as string) ?? 'uncertain',
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

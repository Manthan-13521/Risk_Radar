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
];

export interface DnaMatch {
  scanId: string;
  overlapPercent: number;
  sharedTags: string[];
  previousIntent: string;
}

export function normalizeTag(tag: string): string {
  const upper = tag.toUpperCase().replace(/[\s-]/g, '_');
  if (DNA_TAGS.includes(upper)) return upper;
  if (upper.includes('CREDENTIAL')) return 'CREDENTIAL_REQUEST';
  if (upper.includes('PAYMENT')) return 'PAYMENT_REQUEST';
  if (upper.includes('URGEN')) return 'URGENCY';
  if (upper.includes('BRAND')) return upper.includes('MISMATCH') ? 'BRAND_MISMATCH' : 'BRAND_IMPERSONATION';
  if (upper.includes('URL') || upper.includes('LINK')) return 'SUSPICIOUS_URL';
  if (upper.includes('DELIVERY')) return 'DELIVERY_SCAM';
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
 * Find the best DNA match among recent stored scans.
 * Called BEFORE the current scan is inserted, so the result set
 * will never include the current scan.
 */
export async function findSimilarDNA(newTagsRaw: string[]): Promise<DnaMatch[]> {
  const newTags = Array.from(new Set(newTagsRaw.map(normalizeTag)));
  if (newTags.length === 0) return [];

  const db = await getDb();
  const recent = await db
    .collection('scans')
    .find({ dnaTags: { $exists: true, $ne: [] } }, { projection: { dnaTags: 1, attackerIntent: 1 } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const matches: DnaMatch[] = recent
    .map((scan) => {
      const scanTags: string[] = scan.dnaTags ?? [];
      if (scanTags.length === 0) return null;
      const overlapPercent = jaccardSimilarity(newTags, scanTags);
      if (overlapPercent < 50) return null;
      const sharedTags = scanTags.filter((t: string) => newTags.includes(t));
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

export async function getPatternStats() {
  const db = await getDb();
  const scans = await db
    .collection('scans')
    .find({}, { projection: { dnaTags: 1, classification: 1, createdAt: 1 } })
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
    const tags: string[] = scan.dnaTags ?? [];
    if (tags.length === 0) continue;
    for (const t of tags) {
      tagCounts[t] = (tagCounts[t] ?? 0) + 1;
    }
    const sortedTags = [...tags].sort();
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

import { getDb } from './mongodb';

export interface KnowledgeMatch {
  type: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  impact: 'risk_reduction' | 'risk_elevation' | 'informational';
  scoreModifier: number;
}

export interface KnowledgeEnrichmentResult {
  matches: KnowledgeMatch[];
  isCustomTrustedDomain: boolean;
  isFalsePositiveException: boolean;
  scoreAdjustment: number;
  enrichedBrands: string[];
  detectedPhrases: string[];
}

/**
 * Queries active knowledge base entries from MongoDB (falling back cleanly if DB unavailable)
 * and evaluates against the scanned content, domain, and metadata.
 */
export async function enrichWithKnowledge(
  content: string,
  targetHostnames: string[] = []
): Promise<KnowledgeEnrichmentResult> {
  const result: KnowledgeEnrichmentResult = {
    matches: [],
    isCustomTrustedDomain: false,
    isFalsePositiveException: false,
    scoreAdjustment: 0,
    enrichedBrands: [],
    detectedPhrases: [],
  };

  const lowerContent = content.toLowerCase();
  const cleanHosts = targetHostnames.map((h) => h.toLowerCase().trim());

  try {
    const db = await getDb();
    const activeEntries = await db
      .collection('knowledge')
      .find({ enabled: { $ne: false } })
      .toArray();

    for (const entry of activeEntries) {
      const entryType = entry.type;
      const entryValue = (entry.value || '').toLowerCase().trim();
      const entryName = entry.name || '';

      if (!entryValue && !entryName) continue;

      // 1. Dynamic Trusted Domains
      if (entryType === 'trusted_domain') {
        const matchesHost = cleanHosts.some(
          (host) => host === entryValue || host.endsWith('.' + entryValue)
        );
        if (matchesHost) {
          result.isCustomTrustedDomain = true;
          result.scoreAdjustment -= 30;
          result.matches.push({
            type: 'knowledge_trusted_domain',
            name: entryName || entryValue,
            description: entry.description || `Domain ${entryValue} is recognized as an approved trusted destination.`,
            severity: 'low',
            tags: entry.tags || ['TRUSTED_DOMAIN'],
            impact: 'risk_reduction',
            scoreModifier: -30,
          });
        }
      }

      // 2. Dynamic Brand Identity Profiles
      else if (entryType === 'brand_identity') {
        const brandKey = entryValue || entryName.toLowerCase();
        if (lowerContent.includes(brandKey) || cleanHosts.some((h) => h.includes(brandKey))) {
          result.enrichedBrands.push(brandKey);
          result.matches.push({
            type: 'knowledge_brand_profile',
            name: entryName,
            description: entry.description || `Active brand identity profile monitored: ${entryName}.`,
            severity: 'medium',
            tags: entry.tags || ['BRAND_PROFILE'],
            impact: 'informational',
            scoreModifier: 0,
          });
        }
      }

      // 3. Known Threat / Scam Patterns
      else if (entryType === 'scam_pattern' || entryType === 'threat_pattern') {
        const patternWords = entryValue.split(',').map((w: string) => w.trim()).filter(Boolean);
        const matchCount = patternWords.filter((w: string) => lowerContent.includes(w)).length;
        if (patternWords.length > 0 && matchCount >= Math.min(2, patternWords.length)) {
          const mod = entry.severity === 'critical' ? 35 : entry.severity === 'high' ? 25 : 15;
          result.scoreAdjustment += mod;
          result.matches.push({
            type: 'knowledge_threat_pattern',
            name: entryName,
            description: entry.description || `Matches threat signature: ${entryName}`,
            severity: entry.severity || 'high',
            tags: entry.tags || ['THREAT_PATTERN'],
            impact: 'risk_elevation',
            scoreModifier: mod,
          });
        }
      }

      // 4. Suspicious Phrases
      else if (entryType === 'suspicious_phrase') {
        if (lowerContent.includes(entryValue)) {
          result.detectedPhrases.push(entryValue);
          const mod = 15;
          result.scoreAdjustment += mod;
          result.matches.push({
            type: 'knowledge_suspicious_phrase',
            name: entryName || 'Suspicious Phrase Match',
            description: entry.description || `Detected flagged phrase pattern: "${entryValue}"`,
            severity: entry.severity || 'medium',
            tags: entry.tags || ['SUSPICIOUS_PHRASE'],
            impact: 'risk_elevation',
            scoreModifier: mod,
          });
        }
      }

      // 5. False Positive Exceptions
      else if (entryType === 'false_positive') {
        const matchesContent = entryValue && lowerContent.includes(entryValue);
        const matchesHost = cleanHosts.some((h) => h.includes(entryValue));
        if (matchesContent || matchesHost) {
          result.isFalsePositiveException = true;
          result.scoreAdjustment -= 25;
          result.matches.push({
            type: 'knowledge_false_positive_exception',
            name: entryName,
            description: entry.description || `Recognized benign exception rule: ${entryName}`,
            severity: 'low',
            tags: entry.tags || ['FALSE_POSITIVE_EXCEPTION'],
            impact: 'risk_reduction',
            scoreModifier: -25,
          });
        }
      }
    }
  } catch (e: unknown) {
    console.warn('[KnowledgeEnrichment] Offline or DB lookup skipped:', (e as Error).message);
  }

  return result;
}

/**
 * Trusted domain baseline for ShieldSense
 * 
 * Trusted domain baseline reduces URL risk contribution and increases
 * confidence in the absence of conflicting signals.
 * Trusted domain !== automatically safe (context & subdomains still matter).
 */

const TRUSTED_DOMAINS = new Set([
  'google.com',
  'github.com',
  'openai.com',
  'microsoft.com',
  'apple.com',
  'wikipedia.org',
  'example.com',
  'example.org',
  'example.net',
]);

/**
 * Checks if the hostname belongs to a known trusted registrable domain.
 */
export function isTrustedDomain(hostname: string): boolean {
  if (!hostname) return false;
  const cleanHost = hostname.toLowerCase().trim();
  
  if (TRUSTED_DOMAINS.has(cleanHost)) return true;
  
  const domainList = Array.from(TRUSTED_DOMAINS);
  for (let i = 0; i < domainList.length; i++) {
    if (cleanHost.endsWith('.' + domainList[i])) {
      return true;
    }
  }
  return false;
}

/**
 * Score modifier for trusted domains.
 * Reduces score by 25 points if domain is trusted.
 */
export function getTrustedDomainScore(hostname: string): number {
  return isTrustedDomain(hostname) ? -25 : 0;
}

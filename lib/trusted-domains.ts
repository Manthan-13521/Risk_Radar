/**
 * Structured Trusted Domain & Search Engine Knowledge Base for Risk_Radar
 * 
 * CORE PRINCIPLE:
 * - A trusted domain is a POSITIVE SIGNAL when the URL structure is benign.
 * - It does NOT grant an unconditional whitelist (subdomain spoofing & malicious paths are still analyzed).
 * - Legitimate search engine query parameters (e.g. ?q=threat+intelligence) are user input, not domain threats.
 */

const TRUSTED_DOMAINS = new Set([
  'google.com',
  'googleusercontent.com',
  'gstatic.com',
  'youtube.com',
  'microsoft.com',
  'live.com',
  'office.com',
  'bing.com',
  'github.com',
  'apple.com',
  'icloud.com',
  'amazon.com',
  'paypal.com',
  'wikipedia.org',
  'openai.com',
  'duckduckgo.com',
  'yahoo.com',
  'example.com',
  'example.org',
  'example.net',
]);

const SEARCH_ENGINE_HOSTS = new Set([
  'google.com',
  'www.google.com',
  'bing.com',
  'www.bing.com',
  'duckduckgo.com',
  'www.duckduckgo.com',
  'search.yahoo.com',
  'yahoo.com',
  'www.yahoo.com',
  'ecosia.org',
  'www.ecosia.org',
  'baidu.com',
  'www.baidu.com',
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
 * Recognizes legitimate search engine query URLs.
 * Example: https://www.google.com/search?q=cybersecurity+threat+intelligence
 */
export function isSearchEngineUrl(parsedUrl: URL): boolean {
  const host = parsedUrl.hostname.toLowerCase().trim();
  const isSearchHost = SEARCH_ENGINE_HOSTS.has(host) || Array.from(SEARCH_ENGINE_HOSTS).some(sh => host === sh || host.endsWith('.' + sh));
  if (!isSearchHost) return false;

  const path = parsedUrl.pathname.toLowerCase();
  const isSearchPath = path === '/search' || path === '/' || path === '/web' || path === '/s';
  const hasSearchParam = parsedUrl.searchParams.has('q') || parsedUrl.searchParams.has('p') || parsedUrl.searchParams.has('query') || parsedUrl.searchParams.has('wd');

  return isSearchPath && hasSearchParam;
}

/**
 * Score modifier for trusted domains.
 * Provides a strong -30 point risk reduction when domain is trusted and path is non-malicious.
 */
export function getTrustedDomainScore(hostname: string): number {
  return isTrustedDomain(hostname) ? -30 : 0;
}

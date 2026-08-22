export function analyzeUrl(url: string) {
  try {
    const parsed = new URL(url);
    const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname);
    const subdomains = parsed.hostname.split('.').length - 2;
    const suspiciousTlds = ['.xyz', '.top', '.click', '.gq', '.tk', '.ml', '.cc'];
    const hasSuspiciousTld = suspiciousTlds.some(tld => parsed.hostname.endsWith(tld));
    
    let severity = 'low';
    let description = 'URL appears normal.';
    
    if (isIp || hasSuspiciousTld || subdomains > 2) {
      severity = 'high';
      description = 'URL uses an IP address, suspicious TLD, or excessive subdomains.';
    } else if (url.length > 150 || url.includes('%')) {
      severity = 'medium';
      description = 'URL is unusually long or heavily encoded.';
    }
    
    return {
      detected: severity !== 'low',
      type: 'suspicious_url',
      severity,
      title: 'Suspicious destination',
      description,
      details: { hostname: parsed.hostname, isIp, subdomains, hasSuspiciousTld }
    };
  } catch {
    return { detected: false, type: 'suspicious_url', severity: 'low', title: 'Invalid URL', description: 'Could not parse URL.' };
  }
}

export function detectLookalike(url: string, brands: string[]) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    for (const brand of brands) {
      if (hostname.includes(brand) && !hostname.endsWith(`.${brand}.com`) && hostname !== `${brand}.com`) {
        return {
          detected: true,
          type: 'lookalike_domain',
          severity: 'high',
          title: 'Lookalike Domain',
          description: `The domain mimics ${brand} but is not the official domain.`,
          brand
        };
      }
      
      // Basic homoglyph check
      const homoglyphs = brand.replace(/o/g, '0').replace(/l/g, '1').replace(/i/g, '1');
      if (hostname.includes(homoglyphs)) {
         return {
          detected: true,
          type: 'lookalike_domain',
          severity: 'critical',
          title: 'Lookalike Domain',
          description: `The domain uses character substitution to mimic ${brand}.`,
          brand
        };
      }
    }
  } catch {}
  return { detected: false, type: 'lookalike_domain', severity: 'low', title: '', description: '' };
}
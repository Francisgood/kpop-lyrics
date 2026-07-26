// Image hosts we route through Next's optimizer (resize + AVIF/WebP + long cache,
// served same-origin via /_next/image — ideal for the in-app browsers most of our
// LatAm mobile traffic uses). Publisher CDNs seen in the news feed + our own art
// hosts. Kept in sync with remotePatterns in next.config.ts (which imports this).
//
// `**.` = any subdomain. Anything NOT listed falls back to a plain <img> in
// SmartImage, so a new publisher can never break a page — it just isn't optimized
// until we add its host here.
export const OPTIMIZED_IMAGE_HOSTS = [
  "**.soompi.io",
  "image.koreaboo.com",
  "www.billboard.com",
  "newsimg.koreatimes.co.kr",
  "assets.teenvogue.com",
  "wimg.heraldcorp.com",
  "upload.wikimedia.org",
  "blogger.googleusercontent.com",
  "www.hellokpop.com",
  "www.asianjunkie.com",
  "www.nme.com",
  "d.kpopstarz.com",
  "www.kpopmap.com",
  "kbizoom.com",
  "**.mzstatic.com", // Apple Music / iTunes album art
  "**.pinkvilla.com",
  "static.billboard.com",
] as const;

function hostMatches(hostname: string, pattern: string): boolean {
  if (pattern.startsWith("**.")) {
    const base = pattern.slice(3);
    return hostname === base || hostname.endsWith("." + base);
  }
  return hostname === pattern;
}

// Can Next's optimizer handle this src? Same-origin (public/) always can; external
// only if its host is allow-listed above (and therefore in remotePatterns).
export function canOptimize(src: string | null | undefined): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    return OPTIMIZED_IMAGE_HOSTS.some((p) => hostMatches(new URL(src).hostname, p));
  } catch {
    return false;
  }
}

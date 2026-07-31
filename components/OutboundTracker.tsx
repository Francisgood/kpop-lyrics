"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/gtag";

/**
 * Site-wide outbound-click tracking. One delegated listener catches every click
 * on a link that leaves aegyoarena.com and fires a GA4 event:
 *   - known social destinations  → `social_click`   { platform, link_url }
 *   - everything else external    → `outbound_click` { link_domain, link_url }
 * so we can see where visitors go when they navigate off the site.
 *
 * Internal links (aegyoarena.com + subdomains like arcade.) are ignored. Skipped:
 * `.social-btn` (the footer buttons self-track the same social_click event) and
 * `[data-no-outbound]` (the prediction-market unit, which has its own event) — so
 * nothing double-counts.
 */
const SOCIALS: { test: RegExp; platform: string }[] = [
  { test: /(^|\.)instagram\.com$/, platform: "instagram" },
  { test: /(^|\.)tiktok\.com$/, platform: "tiktok" },
  { test: /(^|\.)(youtube\.com|youtu\.be)$/, platform: "youtube" },
  { test: /(^|\.)reddit\.com$/, platform: "reddit" },
  { test: /(^|\.)(x\.com|twitter\.com)$/, platform: "x" },
  { test: /(^|\.)facebook\.com$/, platform: "facebook" },
  { test: /(^|\.)threads\.(net|com)$/, platform: "threads" },
  { test: /(^|\.)(discord\.gg|discord\.com)$/, platform: "discord" },
  { test: /(^|\.)open\.spotify\.com$|(^|\.)spotify\.com$/, platform: "spotify" },
];

export default function OutboundTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      const a = el?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.hasAttribute("data-no-outbound") || a.classList.contains("social-btn")) return;

      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return; // skip mailto/tel/hash
      const host = url.host.toLowerCase();
      // Internal = aegyoarena.com and any subdomain (arcade., etc.)
      if (host === location.host.toLowerCase() || host.endsWith("aegyoarena.com")) return;

      const social = SOCIALS.find((s) => s.test.test(host));
      if (social) trackEvent("social_click", { platform: social.platform, link_url: url.href });
      else trackEvent("outbound_click", { link_domain: host, link_url: url.href });
    };
    // Capture phase so it fires even if an inner handler stops propagation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

"use client";

import { trackEvent } from "@/lib/gtag";

/**
 * Footer social-follow buttons. Each click fires a GA4 `social_click` event with
 * the destination `platform`, so we can see cross-channel follow-through — e.g.
 * how many visitors go on to TikTok (pairing this event's `platform` with GA4's
 * session traffic-source lets you read IG→TikTok and YT→TikTok specifically).
 */
const SOCIALS: { platform: string; label: string; href: string; node: React.ReactNode }[] = [
  {
    platform: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/aegyoarena",
    node: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07Zm0 1.44c-3.14 0-3.51.01-4.75.07-1.15.05-1.77.24-2.19.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.42-.35 1.04-.4 2.19-.06 1.24-.07 1.61-.07 4.75s.01 3.51.07 4.75c.05 1.15.24 1.77.4 2.19.22.55.47.94.88 1.35.41.41.8.66 1.35.88.42.16 1.04.35 2.19.4 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c1.15-.05 1.77-.24 2.19-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.42.35-1.04.4-2.19.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.05-1.15-.24-1.77-.4-2.19a3.64 3.64 0 0 0-.88-1.35 3.64 3.64 0 0 0-1.35-.88c-.42-.16-1.04-.35-2.19-.4-1.24-.06-1.61-.07-4.75-.07Zm0 2.45a5.95 5.95 0 1 1 0 11.9 5.95 5.95 0 0 1 0-11.9Zm0 1.44a4.51 4.51 0 1 0 0 9.02 4.51 4.51 0 0 0 0-9.02Zm6.2-.34a1.39 1.39 0 1 1-2.78 0 1.39 1.39 0 0 1 2.78 0Z" /></svg>
    ),
  },
  { platform: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@aegyo.arena", node: "♪" },
  {
    platform: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@Aegyoarena",
    node: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" /></svg>
    ),
  },
  {
    platform: "reddit",
    label: "Reddit",
    href: "https://www.reddit.com/user/aegyo-arena/",
    node: (
      <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M24 11.78a2.57 2.57 0 0 0-4.36-1.83 12.6 12.6 0 0 0-6.86-2.17l1.17-5.5 3.82.81a1.83 1.83 0 1 0 .19-.87l-4.27-.9a.45.45 0 0 0-.53.35l-1.3 6.11a12.63 12.63 0 0 0-6.96 2.17 2.57 2.57 0 1 0-2.84 4.22 5.16 5.16 0 0 0-.06.78c0 3.98 4.64 7.21 10.36 7.21s10.36-3.23 10.36-7.21a5.16 5.16 0 0 0-.06-.78A2.57 2.57 0 0 0 24 11.78ZM6.33 13.6a1.83 1.83 0 1 1 3.66 0 1.83 1.83 0 0 1-3.66 0Zm10.23 4.85a5.42 5.42 0 0 1-3.9 1.2h-.03a5.42 5.42 0 0 1-3.9-1.2.34.34 0 1 1 .48-.49 4.76 4.76 0 0 0 3.42 1.02h.03a4.76 4.76 0 0 0 3.42-1.02.34.34 0 0 1 .48.49Zm-.36-3.02a1.83 1.83 0 1 1 0-3.66 1.83 1.83 0 0 1 0 3.66Z" /></svg>
    ),
  },
  { platform: "x", label: "X / Twitter", href: "https://x.com/aegyoarena", node: "✕" },
];

export default function SocialLinks() {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {SOCIALS.map(({ platform, label, href, node }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-btn"
          aria-label={label}
          onClick={() => trackEvent("social_click", { platform, link_url: href })}
        >
          {node}
        </a>
      ))}
    </div>
  );
}

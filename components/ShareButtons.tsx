"use client";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  artist: string;
  slug: string;
  firstKoLine?: string;
}

const BASE_URL = "https://kpop-lyrics-production.up.railway.app";

export default function ShareButtons({ title, artist, slug, firstKoLine }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url       = `${BASE_URL}/songs/${slug}`;
  const hashtags  = `kpop ${artist.replace(/[\s()]/g, "")} AegyoAnnotate`;
  const tweetText = `🎵 "${title}" by ${artist}${firstKoLine ? `\n\n${firstKoLine}` : ""}\n\nKorean lyrics, translations & K-pop slang explained 👇`;

  const twitterHref =
    `https://twitter.com/intent/tweet` +
    `?text=${encodeURIComponent(tweetText)}` +
    `&url=${encodeURIComponent(url)}` +
    `&hashtags=${encodeURIComponent(hashtags)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for browsers without clipboard API
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const pill: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid var(--genius-border)",
    borderRadius: 999,
    padding: "6px 14px",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 0.12s",
    background: "#fff",
    color: "#000",
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontSize: "0.7rem", color: "var(--genius-gray)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
        Share
      </span>
      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...pill, background: "#000", color: "#fff", border: "1px solid #000" }}
      >
        𝕏 Post
      </a>
      <button
        onClick={copyLink}
        style={{ ...pill, background: copied ? "#FFFF64" : "#fff", border: "1px solid var(--genius-border)" }}
      >
        {copied ? "✓ Copied!" : "🔗 Copy link"}
      </button>
    </div>
  );
}

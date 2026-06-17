"use client";

import { useEffect } from "react";
import type { Embed } from "@/app/culture/content";

// Renders a uniform grid of social embeds for a Culture Vulture topic.
// Instagram reels use the official blockquote embed (processed by embed.js);
// YouTube uses a 16:9 lazy iframe.
export default function CultureFeed({ embeds }: { embeds: Embed[] }) {
  const hasInstagram = embeds.some((e) => e.kind === "instagram");

  useEffect(() => {
    if (!hasInstagram) return;
    const process = () => (window as unknown as { instgrm?: { Embeds: { process: () => void } } }).instgrm?.Embeds?.process();
    const existing = document.getElementById("instagram-embed-js");
    if (existing) {
      process();
      return;
    }
    const s = document.createElement("script");
    s.id = "instagram-embed-js";
    s.async = true;
    s.src = "https://www.instagram.com/embed.js";
    s.onload = process;
    document.body.appendChild(s);
  }, [hasInstagram]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(330px, 100%), 1fr))", gap: 20, alignItems: "start" }}>
      {embeds.map((e, i) =>
        e.kind === "instagram" ? (
          <blockquote
            key={e.permalink}
            className="instagram-media"
            data-instgrm-permalink={e.permalink}
            data-instgrm-version="14"
            style={{ background: "#FFF", border: 0, borderRadius: 12, boxShadow: "0 2px 14px rgba(0,0,0,0.35)", margin: 0, padding: 0, width: "100%", minWidth: 0, maxWidth: "100%" }}
          >
            <a href={e.permalink} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: 16, color: "#555", fontSize: "0.85rem" }}>
              View this reel on Instagram
            </a>
          </blockquote>
        ) : (
          <div key={e.id} style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden", background: "#000", border: "1px solid var(--border)" }}>
            <iframe
              src={`https://www.youtube.com/embed/${e.id}`}
              title="K-pop mukbang video"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            />
          </div>
        ),
      )}
    </div>
  );
}

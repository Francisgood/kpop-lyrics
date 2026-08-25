"use client";

// A "Videos" section for an artist or song page — curated official dance practices,
// showcases, reels. Reuses the site's embed conventions (YouTube iframe with ES
// captions via youtubeWithLang; Instagram via embed.js; TikTok as a link card).

import { useEffect } from "react";
import { useLang, useT, youtubeWithLang } from "@/components/LangProvider";
import type { VideoItem } from "@/lib/videos";

function Embed({ v }: { v: VideoItem }) {
  const { lang } = useLang();
  const es = lang === "es";
  if (v.kind === "youtube")
    return (
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden", background: "#000" }}>
        <iframe src={youtubeWithLang(`https://www.youtube.com/embed/${v.ref}`, lang)} title={v.title ?? "video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
      </div>
    );
  if (v.kind === "instagram")
    return (
      <blockquote className="instagram-media" data-instgrm-permalink={v.ref} data-instgrm-version="14" style={{ background: "#fff", border: 0, borderRadius: 12, margin: 0, padding: 0, width: "100%", minWidth: 0, maxWidth: "100%" }}>
        <a href={v.ref} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: 14, color: "#888", fontSize: "0.82rem" }}>{es ? "Ver en Instagram" : "View on Instagram"}</a>
      </blockquote>
    );
  return (
    <a href={v.ref} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 200, borderRadius: 12, background: "linear-gradient(135deg,#010101,#1b1b22)", color: "#fff", padding: 20, textAlign: "center" }}>
      <span style={{ fontSize: "2rem" }}>🎵</span>
      <span style={{ fontWeight: 800 }}>{es ? "Ver en TikTok" : "Watch on TikTok"}</span>
    </a>
  );
}

export default function EntityVideos({ videos, title, titleEs }: { videos: VideoItem[]; title?: string; titleEs?: string }) {
  const pick = useT();
  const hasIg = videos.some((v) => v.kind === "instagram");

  // Load + (re)process Instagram embeds once, if any are present.
  useEffect(() => {
    if (!hasIg) return;
    const process = () => (window as unknown as { instgrm?: { Embeds: { process: () => void } } }).instgrm?.Embeds?.process();
    if (document.getElementById("instagram-embed-js")) { setTimeout(process, 60); return; }
    const s = document.createElement("script");
    s.id = "instagram-embed-js"; s.async = true; s.src = "https://www.instagram.com/embed.js"; s.onload = process;
    document.body.appendChild(s);
  }, [hasIg]);

  if (!videos.length) return null;

  return (
    <section style={{ marginBottom: 48 }}>
      <div className="section-header">{pick(title ?? "Videos", titleEs ?? "Videos")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, alignItems: "start" }}>
        {videos.map((v, i) => (
          <div key={i}>
            {v.title && <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#ff6fa8", marginBottom: 8 }}>{pick(v.title, v.titleEs)}</div>}
            <Embed v={v} />
            {v.note && <div style={{ fontSize: "0.8rem", color: "var(--genius-gray, #8a8194)", lineHeight: 1.55, marginTop: 8 }}>{pick(v.note, v.noteEs)}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

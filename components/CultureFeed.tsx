"use client";

import { useEffect } from "react";
import type { Embed } from "@/app/culture/content";
import { useLang, useT, youtubeWithLang } from "@/components/LangProvider";

function YouTube({ id }: { id: string }) {
  const { lang } = useLang();
  const t = useT();
  return (
    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 14, overflow: "hidden", background: "#000" }}>
      <iframe
        src={youtubeWithLang(`https://www.youtube.com/embed/${id}`, lang)}
        title={t("K-pop culture video", "Video de cultura K-pop")}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
      />
    </div>
  );
}

function Instagram({ permalink }: { permalink: string }) {
  const t = useT();
  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={permalink}
      data-instgrm-version="14"
      style={{ background: "#FFF", border: 0, borderRadius: 14, boxShadow: "0 1px 10px rgba(0,0,0,0.12)", margin: 0, padding: 0, width: "100%", minWidth: 0, maxWidth: "100%" }}
    >
      <a href={permalink} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: 16, color: "#888", fontSize: "0.85rem" }}>
        {t("View this reel on Instagram", "Mira este reel en Instagram")}
      </a>
    </blockquote>
  );
}

function TikTok({ url }: { url: string }) {
  // TikTok short links (/t/…) don't expose a video id for the official embed, so we
  // render a branded click-through card instead of a live player.
  const t = useT();
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e7e7ea", background: "linear-gradient(135deg,#010101 0%,#1b1b22 100%)", color: "#fff", minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: "2.4rem" }}>🎵</div>
        <div style={{ fontWeight: 800, fontSize: "1rem" }}>{t("Watch on TikTok", "Míralo en TikTok")}</div>
        <div style={{ fontSize: "0.78rem", color: "#9a9aa6" }}>{t("Fashion clip · tap to play", "Clip de moda · toca para reproducir")}</div>
        <span style={{ marginTop: 4, display: "inline-block", padding: "7px 16px", borderRadius: 100, background: "#fe2c55", color: "#fff", fontWeight: 700, fontSize: "0.78rem" }}>{t("Open ↗", "Abrir ↗")}</span>
      </div>
    </a>
  );
}

function render(e: Embed) {
  if (e.kind === "youtube") return <YouTube id={e.id} />;
  if (e.kind === "instagram") return <Instagram permalink={e.permalink} />;
  return <TikTok url={e.url} />;
}

export default function CultureFeed({ embeds }: { embeds: Embed[] }) {
  const hasInstagram = embeds.some((e) => e.kind === "instagram");
  const t = useT();

  useEffect(() => {
    if (!hasInstagram) return;
    const process = () => (window as unknown as { instgrm?: { Embeds: { process: () => void } } }).instgrm?.Embeds?.process();
    if (document.getElementById("instagram-embed-js")) {
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

  if (!embeds.length) return null;
  const [featured, ...rest] = embeds;

  return (
    <div>
      {/* Featured — Video of the Day */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#15131f", color: "#ffd35c", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 100, marginBottom: 14 }}>
          🔥 {t("Video of the Day", "Video del Día")}
        </div>
        <div style={{ maxWidth: featured.kind === "youtube" ? 720 : 460 }}>{render(featured)}</div>
      </div>

      {rest.length > 0 && (
        <>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 700, color: "#15131f", margin: "0 0 4px" }}>{t("Right Now", "Ahora Mismo")}</h2>
          <p style={{ color: "#6b6b72", fontSize: "0.92rem", margin: "0 0 20px" }}>{t("The clips the fandom can’t stop watching.", "Los clips que el fandom no para de ver.")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 20, alignItems: "start" }}>
            {rest.map((e, i) => (
              <div key={i}>{render(e)}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

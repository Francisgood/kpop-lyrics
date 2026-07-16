"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CULTURE, TOPIC_ORDER, type CultureTopic, type Embed } from "@/app/culture/content";
import { useLang, useT, youtubeWithLang } from "@/components/LangProvider";

const ACCENT: Record<CultureTopic, string> = {
  dance: "linear-gradient(135deg,#ff6fa8,#b14cff)",
  fashion: "linear-gradient(135deg,#7c5cff,#3a8dff)",
  beauty: "linear-gradient(135deg,#ff7eb3,#ff9f6b)",
  mukbang: "linear-gradient(135deg,#ffb347,#ff6f6f)",
};

function EmbedView({ e }: { e: Embed }) {
  const { lang } = useLang();
  const es = lang === "es";
  if (e.kind === "youtube")
    return (
      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", background: "#000" }}>
        {/* youtubeWithLang turns on Spanish CC + player UI when the site is in ES. */}
        <iframe src={youtubeWithLang(`https://www.youtube.com/embed/${e.id}`, lang)} title="culture video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
      </div>
    );
  if (e.kind === "instagram")
    return (
      <blockquote className="instagram-media" data-instgrm-permalink={e.permalink} data-instgrm-version="14" style={{ background: "#fff", border: 0, borderRadius: 10, margin: 0, padding: 0, width: "100%", minWidth: 0, maxWidth: "100%" }}>
        <a href={e.permalink} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: 14, color: "#888", fontSize: "0.82rem" }}>{es ? "Ver en Instagram" : "View on Instagram"}</a>
      </blockquote>
    );
  return (
    <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 160, borderRadius: 10, background: "linear-gradient(135deg,#010101,#1b1b22)", color: "#fff", padding: 20, textAlign: "center" }}>
      <span style={{ fontSize: "2rem" }}>🎵</span>
      <span style={{ fontWeight: 800 }}>{es ? "Ver en TikTok" : "Watch on TikTok"}</span>
      <span style={{ fontSize: "0.74rem", color: "#9a9aa6" }}>{es ? "toca para reproducir ↗" : "tap to play ↗"}</span>
    </a>
  );
}

export default function CultureCorner() {
  const { lang } = useLang();
  const es = lang === "es";
  // Topic title/tagline come from the shared content.ts — prefer its Spanish
  // fields in ES, falling back to English wherever one isn't filled in.
  // (Named `pick`, not `t`: the TOPIC_ORDER.map below binds `t` to the topic key.)
  const pick = useT();
  const [open, setOpen] = useState<CultureTopic | null>(null);

  // (Re)process Instagram embeds whenever a modal with IG content opens.
  useEffect(() => {
    if (!open) return;
    const m = CULTURE[open];
    if (!m.embeds.some((e) => e.kind === "instagram")) return;
    const process = () => (window as unknown as { instgrm?: { Embeds: { process: () => void } } }).instgrm?.Embeds?.process();
    if (document.getElementById("instagram-embed-js")) {
      setTimeout(process, 60);
      return;
    }
    const s = document.createElement("script");
    s.id = "instagram-embed-js";
    s.async = true;
    s.src = "https://www.instagram.com/embed.js";
    s.onload = process;
    document.body.appendChild(s);
  }, [open]);

  // Lock body scroll while a modal is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const active = open ? CULTURE[open] : null;
  const activeTitle = active ? pick(active.title, active.titleEs) : "";
  const preview = active ? active.embeds.slice(0, 4) : [];

  return (
    <section style={{ marginTop: 56, paddingTop: 40, borderTop: "2px solid #000" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 6 }}>
        {/* "Culture Vulture" is the feature's brand name — kept in both languages. */}
        <div className="section-header" style={{ margin: 0 }}>Culture Vulture</div>
        <span style={{ fontSize: "0.68rem", background: "#000", color: "#FFFF64", padding: "2px 9px", borderRadius: 999, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{es ? "Ver y Explorar" : "Watch & Explore"}</span>
      </div>
      <p style={{ fontSize: "0.82rem", color: "var(--genius-gray)", marginBottom: 24, lineHeight: 1.6 }}>
        {es
          ? "Más del fandom — baile, moda, belleza y mukbang. Toca una categoría para seguir viendo."
          : "More from the fandom — dance, fashion, beauty & mukbang. Tap a category to keep watching."}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px,100%), 1fr))", gap: 16 }}>
        {TOPIC_ORDER.map((t) => {
          const m = CULTURE[t];
          const count = m.embeds.length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => (count > 0 ? setOpen(t) : null)}
              style={{ textAlign: "left", cursor: count > 0 ? "pointer" : "default", border: 0, borderRadius: 16, padding: 0, overflow: "hidden", background: ACCENT[t], color: "#fff", minHeight: 132, position: "relative", opacity: count > 0 ? 1 : 0.7 }}
            >
              <div style={{ padding: "18px 18px 16px", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ fontSize: "1.9rem", marginBottom: 6 }}>{m.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{pick(m.title, m.titleEs)}</div>
                <div style={{ fontSize: "0.76rem", opacity: 0.9, marginTop: 2 }}>{pick(m.tagline, m.taglineEs)}</div>
                <div style={{ marginTop: "auto", paddingTop: 12, fontSize: "0.74rem", fontWeight: 700 }}>
                  {count > 0
                    ? `${count} clip${count > 1 ? "s" : ""} · ${es ? "Explorar" : "Explore"} →`
                    : (es ? "Próximamente" : "Coming soon")}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Future: creator uploads (age-gated) */}
      <div style={{ marginTop: 18, padding: "12px 16px", background: "#faf7fb", border: "1px solid #f0e6ef", borderRadius: 8, fontSize: "0.78rem", color: "#7a5c72", lineHeight: 1.6 }}>
        <strong>{es ? "Próximamente:" : "Coming soon:"}</strong>{" "}
        {es ? (
          <>publica tus propios clips de cultura. Para mantenerlo seguro, los creadores verifican que son mayores de 18 años (o la edad mínima de su país) con una rápida{" "}
          <a href="https://didit.me/products/id-verification/" target="_blank" rel="noopener noreferrer" style={{ color: "#ff6fa8", fontWeight: 700, textDecoration: "none" }}>verificación de identidad de didit.me</a> que llega a tu correo.</>
        ) : (
          <>post your own culture clips. To keep it safe, creators verify they&rsquo;re 18+ (or their country&rsquo;s minimum age) with a quick{" "}
          <a href="https://didit.me/products/id-verification/" target="_blank" rel="noopener noreferrer" style={{ color: "#ff6fa8", fontWeight: 700, textDecoration: "none" }}>didit.me ID check</a> sent to your email.</>
        )}
      </div>

      {/* Modal */}
      {active && (
        <div
          onClick={() => setOpen(null)}
          style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.66)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", overflowY: "auto" }}
        >
          <div onClick={(ev) => ev.stopPropagation()} style={{ width: "min(560px, 96vw)", background: "var(--bg-card)", border: "1px solid var(--border-strong)", borderRadius: 18, padding: "20px 22px 26px", boxShadow: "0 24px 70px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", fontWeight: 700, color: "var(--ink)" }}>{active.emoji} {activeTitle}</span>
              <button type="button" onClick={() => setOpen(null)} aria-label={es ? "Cerrar" : "Close"} style={{ background: "none", border: "none", color: "var(--ink-dim)", fontSize: "1.7rem", lineHeight: 1, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {preview.map((e, i) => (
                <div key={i}>
                  <EmbedView e={e} />
                </div>
              ))}
            </div>
            <Link href={`/culture/${active.key}`} style={{ display: "block", textAlign: "center", marginTop: 18, padding: "11px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.85rem", textDecoration: "none" }}>
              {es ? <>Ver todo {activeTitle} en Culture Vulture →</> : <>See all {activeTitle} on Culture Vulture →</>}
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

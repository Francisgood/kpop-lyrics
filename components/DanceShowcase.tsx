"use client";

import type { RichTopic, RightNowCard, Tutorial } from "@/app/culture/content";
import NewsletterCard from "@/components/NewsletterCard";
import { useLang, useT, youtubeWithLang, type Lang } from "@/components/LangProvider";

/** Watch links: routed through youtubeWithLang so ES viewers land on Spanish captions + player UI. */
const yt = (id: string, lang: Lang) => youtubeWithLang(`https://www.youtube.com/watch?v=${id}`, lang);
/** Thumbnails are plain image assets — deliberately NOT language-wrapped (caption params are meaningless on an image). */
const thumb = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

// Canonical level values drive the badge styling (and any future filtering), so they stay
// English keys. LEVEL_ES is display-only.
const LEVEL: Record<Tutorial["level"], { bg: string; fg: string }> = {
  BEGINNER: { bg: "#dcfce7", fg: "#15803d" },
  INTERMEDIATE: { bg: "#fef3c7", fg: "#b45309" },
  ADVANCED: { bg: "#fee2e2", fg: "#b91c1c" },
};
const LEVEL_ES: Record<Tutorial["level"], string> = {
  BEGINNER: "PRINCIPIANTE",
  INTERMEDIATE: "INTERMEDIO",
  ADVANCED: "AVANZADO",
};

// Spanish for the descriptor copy that lives in app/culture/content.ts (shared data file
// owned elsewhere) — translated here at render time rather than forked, mirroring TOPIC_ES
// in app/culture/[topic]/page.tsx. Keyed by the English source string; anything not listed
// falls back to English, so this degrades safely if content.ts changes.
// Song titles, artist names and channel names are intentionally absent — those never translate.
const CONTENT_ES: Record<string, string> = {
  "Featured on YouTube": "Destacado en YouTube",
  "The mirrored version everyone’s using to learn the chorus point choreo, count by count. This is the one the whole fandom is drilling this week.":
    "La versión espejo que todos están usando para aprender el point choreo del coro, cuenta por cuenta. Esta es la que todo el fandom está practicando esta semana.",
  Chorus: "Coro",
  Mirrored: "Espejo",
  "Full Routine": "Rutina Completa",
  "YouTube · Slowed 0.75x tutorial": "YouTube · Tutorial en cámara lenta 0.75x",
  "YouTube · Step by step tutorial": "YouTube · Tutorial paso a paso",
  "YouTube · SHERO dance tutorial": "YouTube · Tutorial de baile de SHERO",
};
const esOf = (s: string) => CONTENT_ES[s] ?? s;

function PlayOverlay() {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#ff0000", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
      </div>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return <span style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: "#15131f", color: "#fff", fontWeight: 800, fontSize: "0.72rem" }}>{initials}</span>;
}

function RightNow({ c }: { c: RightNowCard }) {
  const { lang } = useLang();
  const t = useT();
  const img = c.source === "youtube" ? thumb(c.youtubeId!) : c.thumb!;
  const href = c.source === "youtube" ? yt(c.youtubeId!, lang) : c.href ?? "#";
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <div style={{ background: "#fff", border: "1px solid #ececf0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={c.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <PlayOverlay />
          <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.7)", color: "#fff", fontWeight: 800, fontSize: "0.62rem", padding: "2px 7px", borderRadius: 6 }}>{c.rank}</span>
          <span style={{ position: "absolute", top: 8, right: 8, background: c.source === "youtube" ? "#ff0000" : "#fff", color: c.source === "youtube" ? "#fff" : "#15131f", fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 999 }}>{c.source === "youtube" ? "YouTube" : "Reels"}</span>
          {c.views && <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.78)", color: "#fff", fontWeight: 700, fontSize: "0.66rem", padding: "2px 8px", borderRadius: 999 }}>▶ {c.views}</span>}
        </div>
        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#15131f", lineHeight: 1.3, marginBottom: 8 }}>{c.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar initials={c.initials} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#15131f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.channel}</span>
              <span style={{ display: "block", fontSize: "0.7rem", color: "#9a9aa6" }}>{t(c.type, esOf(c.type))}</span>
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function DanceShowcase({ data }: { data: RichTopic }) {
  const { lang } = useLang();
  const t = useT();
  const f = data.featured;
  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Featured — Video of the Day */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#15131f", color: "#ffd35c", fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 100, marginBottom: 14 }}>🔥 {t("Video of the Day", "Video del Día")}</div>
        <a href={yt(f.youtubeId, lang)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
          <div style={{ background: "#fff", border: "1px solid #ececf0", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div style={{ position: "relative", paddingBottom: "48%", height: 0, background: "#000" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumb(f.youtubeId)} alt={f.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <PlayOverlay />
              <span style={{ position: "absolute", top: 12, left: 12, background: "#ff0000", color: "#fff", fontWeight: 800, fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999 }}>{t(f.label, esOf(f.label))}</span>
            </div>
            <div style={{ padding: "20px 22px 22px" }}>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.3rem,3vw,1.7rem)", fontWeight: 700, color: "#15131f", margin: "0 0 8px", lineHeight: 1.2 }}>{f.title}</h2>
              <p style={{ color: "#54545c", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 16px" }}>{t(f.desc, esOf(f.desc))}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar initials={f.initials} />
                  <span><span style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#15131f" }}>{f.channel}</span><span style={{ display: "block", fontSize: "0.72rem", color: "#9a9aa6" }}>{t(f.type, esOf(f.type))}</span></span>
                </span>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 7, background: "#ff0000", color: "#fff", fontWeight: 800, fontSize: "0.82rem", padding: "10px 18px", borderRadius: 100 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> {t("Watch on YouTube", "Míralo en YouTube")}
                </span>
              </div>
            </div>
          </div>
        </a>
      </div>

      {/* Right Now */}
      <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "#15131f", margin: "0 0 2px" }}>{t("Right Now", "Ahora Mismo")}</h2>
      <p style={{ color: "#6b6b72", fontSize: "0.92rem", margin: "0 0 20px" }}>{t("The covers, point choreo, and group routines racking up the most loops this week.", "Los dance covers, el point choreo y las rutinas grupales que más se repiten en loop esta semana.")}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px,100%), 1fr))", gap: 18, marginBottom: 44 }}>
        {data.rightNow.map((c) => <RightNow key={c.rank} c={c} />)}
      </div>

      {/* Learn the Moves */}
      <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "#15131f", margin: "0 0 2px" }}>{t("Learn the Moves", "Aprende los Pasos")}</h2>
      <p style={{ color: "#6b6b72", fontSize: "0.92rem", margin: "0 0 20px" }}>{t("Slow breakdowns, count-by-count, so you can actually nail the point choreo — not just admire it.", "Breakdowns lentos, cuenta por cuenta, para que de verdad te salga el point choreo — no solo lo admires.")}</p>
      <div style={{ display: "grid", gap: 14, marginBottom: 44 }}>
        {data.tutorials.map((tut) => (
          <a key={tut.youtubeId} href={yt(tut.youtubeId, lang)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
            <div style={{ background: "#fff", border: "1px solid #ececf0", borderRadius: 14, padding: 12, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ position: "relative", width: 132, flexShrink: 0, borderRadius: 10, overflow: "hidden", aspectRatio: "16/9", background: "#000" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb(tut.youtubeId)} alt={tut.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <PlayOverlay />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ background: LEVEL[tut.level].bg, color: LEVEL[tut.level].fg, fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 999 }}>{t(tut.level, LEVEL_ES[tut.level])}</span>
                  <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "#9a9aa6", textTransform: "uppercase", letterSpacing: "0.08em" }}>{t(tut.tag, esOf(tut.tag))}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#15131f", lineHeight: 1.3, marginBottom: 3 }}>{tut.title}</div>
                <div style={{ fontSize: "0.76rem", color: "#9a9aa6" }}>{t(tut.subtitle, esOf(tut.subtitle))}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Join the Floor */}
      <div style={{ background: "linear-gradient(135deg,#15131f,#2a2540)", borderRadius: 20, padding: "32px 28px", textAlign: "center", color: "#fff", marginBottom: 36 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#ff9ec4", fontWeight: 700, marginBottom: 10 }}>{t("Join the Floor", "Súmate a la Pista")}</div>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, marginBottom: 8 }}>{t("Got moves? Show the fandom.", "¿Tienes pasos? Muéstraselos al fandom.")}</div>
        <p style={{ color: "#c9c7d6", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 540, margin: "0 auto 16px" }}>
          {t(
            "Submit your cover, your point choreo, or your take on this week’s challenge — the best ones get featured right here on the Dance page. Creators verify they’re 18+ (or their country’s minimum age) with a quick ",
            "Manda tu dance cover, tu point choreo o tu versión del challenge de esta semana — los mejores se lucen aquí mismo, en la página de Baile. Los creadores verifican que son mayores de 18 (o la edad mínima de su país) con una rápida ",
          )}
          <a href="https://didit.me/products/id-verification/" target="_blank" rel="noopener noreferrer" style={{ color: "#ff9ec4", fontWeight: 700, textDecoration: "none" }}>{t("didit.me ID check", "verificación de identidad de didit.me")}</a>.
        </p>
        <span style={{ display: "inline-block", padding: "11px 22px", borderRadius: 100, background: "#ff6fa8", color: "#fff", fontWeight: 800, fontSize: "0.85rem" }}>{t("Submit Your Video — coming soon", "Sube Tu Video — muy pronto")}</span>
      </div>

      {/* Stay in the Loop */}
      <NewsletterCard />
    </div>
  );
}

"use client";

import { useLang } from "@/components/LangProvider";

// The sealed "?" panel used in place of artist art for the mystery campaign.
// Shared so the giveaway hero and the /giveaways card render from one definition
// instead of drifting — and so there is no binary asset to regenerate if the
// styling changes. Deliberately CSS, not an image: it stays crisp at any size and
// next/image refuses to optimize SVG without dangerouslyAllowSVG.
export default function MysteryPanel({ caption = true }: { caption?: boolean }) {
  const { lang } = useLang();
  return (
    <div
      aria-hidden={!caption}
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(10,10,14,0.98), rgba(40,30,60,0.9))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        aria-hidden
        style={{
          fontFamily: "var(--serif)",
          fontSize: caption ? "clamp(5rem, 22vw, 9rem)" : "clamp(3.5rem, 16vw, 6rem)",
          color: "var(--volt)",
          lineHeight: 1,
          opacity: 0.92,
        }}
      >
        ?
      </span>
      {caption && (
        <span
          style={{
            position: "absolute",
            bottom: 16,
            fontFamily: "var(--mono)",
            fontSize: "0.68rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ink-faint)",
          }}
        >
          {lang === "es" ? "Artista sellado hasta la revelación" : "Artist sealed until the reveal"}
        </span>
      )}
    </div>
  );
}

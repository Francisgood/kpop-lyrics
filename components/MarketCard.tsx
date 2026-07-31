"use client";

import { useLang } from "@/components/LangProvider";
import { trackEvent } from "@/lib/gtag";

/**
 * A compact replica of the Daebak market's mobile card — the market question,
 * the current YES/NO odds, and Yes/No chips — with Daebak's Buy/Sell controls,
 * the DBK amount input, and trade volume intentionally left OUT. The ENTIRE unit
 * is a single link: a click anywhere pushes the reader to the Daebak market.
 *
 * Why a replica instead of an iframe: you can't hide elements inside a
 * cross-origin iframe, and Daebak exposes no per-market odds API (prices are read
 * on-chain), so the odds are passed in from ARTICLE_MARKETS config. They're a
 * snapshot, not auto-live — swap in a fetch here once Daebak ships a read endpoint.
 *
 * It's a points game (Daebak Rewards points → merch/tickets), not real money.
 */
export default function MarketCard({
  marketUrl,
  question,
  questionEs,
  yes,
  no,
}: {
  marketUrl: string;
  question: string;
  questionEs?: string;
  yes: number; // 0–100
  no: number; // 0–100
}) {
  const { lang } = useLang();
  const es = lang === "es";
  const t = (en: string, e: string) => (es ? e : en);
  const q = es && questionEs ? questionEs : question;

  return (
    <div style={{ marginTop: 34 }}>
      {/* "Advertisement" label — editorial distance between this promo unit and the site. */}
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 7 }}>
        {t("Advertisement", "Publicidad")}
      </div>
      <a
      href={marketUrl}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label={t("Predict on Daebak", "Predecir en Daebak")}
      onClick={() =>
        trackEvent("prediction_market_click", {
          promotion_id: "daebak-market",
          promotion_name: question,
          link_url: marketUrl,
        })
      }
      style={{
        display: "block",
        textDecoration: "none",
        border: "1px solid #2a2333",
        borderRadius: 18,
        background: "linear-gradient(180deg, #16121d, #0f0d13)",
        boxShadow: "0 0 0 1px rgba(184,160,255,0.14), 0 10px 30px rgba(0,0,0,0.35)",
        padding: "20px 20px 18px",
        color: "#fff",
      }}
    >
      {/* eyebrow */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.64rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8A0FF", fontWeight: 700 }}>
          {t("K-pop prediction", "Predicción K-pop")} · Daebak
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.58rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#22e06b", background: "rgba(34,224,107,0.12)", border: "1px solid rgba(34,224,107,0.4)", borderRadius: 999, padding: "2px 9px", fontWeight: 700 }}>
          {t("Open", "Abierto")}
        </span>
      </div>

      {/* market question */}
      <div style={{ fontSize: "1.12rem", fontWeight: 800, lineHeight: 1.28, marginBottom: 16, color: "#fff" }}>{q}</div>

      {/* odds tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: "#141019", border: "1px solid #2a2333", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.14em", color: "#9a90ab", fontWeight: 700, marginBottom: 4 }}>YES</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#22e06b", lineHeight: 1 }}>{yes}%</div>
        </div>
        <div style={{ background: "#141019", border: "1px solid #2a2333", borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.14em", color: "#9a90ab", fontWeight: 700, marginBottom: 4 }}>NO</div>
          <div style={{ fontSize: "1.7rem", fontWeight: 900, color: "#ff5b6e", lineHeight: 1 }}>{no}%</div>
        </div>
      </div>

      {/* Yes / No chips (visual — the whole card links to Daebak) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <span style={{ display: "block", textAlign: "center", background: "rgba(34,224,107,0.14)", border: "1px solid rgba(34,224,107,0.55)", color: "#22e06b", borderRadius: 10, padding: "11px 0", fontWeight: 800, fontSize: "0.92rem" }}>
          {t("Yes", "Sí")} {yes}%
        </span>
        <span style={{ display: "block", textAlign: "center", background: "rgba(255,91,110,0.12)", border: "1px solid rgba(255,91,110,0.5)", color: "#ff5b6e", borderRadius: 10, padding: "11px 0", fontWeight: 800, fontSize: "0.92rem" }}>
          {t("No", "No")} {no}%
        </span>
      </div>

      {/* footer CTA + points note */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span style={{ color: "#B8A0FF", fontWeight: 800, fontSize: "0.9rem" }}>
          {t("Tap to predict on Daebak", "Toca para predecir en Daebak")} →
        </span>
        <span style={{ color: "#6f6880", fontSize: "0.66rem" }}>
          {t("Points, not real money", "Puntos, no dinero real")}
        </span>
      </div>
    </a>
    </div>
  );
}

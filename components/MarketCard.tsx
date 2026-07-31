"use client";

import { useState } from "react";
import { useLang } from "@/components/LangProvider";

/**
 * A prediction-game promo attached to a specific article. Link-out to Daebak,
 * not an embedded surface. This is a POINTS game — players use Daebak Rewards
 * points (earned on Aegyo Arena), NOT real money, and redeem them for merch and
 * concert tickets. Aegyo Arena doesn't take real-money bets or hold funds.
 *
 * The audience is assumed to be new to this, so there's a plain-language "how it
 * works" explainer. EN/ES like the rest of the site.
 */
export default function MarketCard({ marketUrl }: { marketUrl: string }) {
  const { lang } = useLang();
  const es = lang === "es";
  const t = (en: string, e: string) => (es ? e : en);
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-label={t("Prediction game", "Juego de predicción")}
      style={{
        marginTop: 34,
        border: "2px solid #B8A0FF",
        borderRadius: 18,
        background: "linear-gradient(135deg, rgba(184,160,255,0.16), var(--bg-card))",
        boxShadow: "0 0 0 1px rgba(184,160,255,0.22)",
        padding: "24px 22px",
      }}
    >
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#B8A0FF", fontWeight: 700, marginBottom: 8 }}>
        {t("Prediction game", "Juego de predicción")} · Daebak Rewards
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.15, marginBottom: 10 }}>
        {t("Got a take on where this goes?", "¿Tienes un pronóstico de cómo termina esto?")}
      </div>
      <p style={{ fontSize: "0.9rem", color: "var(--ink-dim)", lineHeight: 1.6, margin: "0 0 14px", maxWidth: 460 }}>
        {t(
          "Predict this story on Daebak with your Daebak Rewards points — no real money. Call it right and stack points you can redeem for merch and concert tickets.",
          "Predice esta historia en Daebak con tus puntos de Daebak Rewards — sin dinero real. Acierta y acumula puntos que puedes canjear por merch y boletos de conciertos.",
        )}
      </p>

      {/* Plain-language explainer — the audience is assumed to be new to this. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ background: "transparent", border: "none", color: "#B8A0FF", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", padding: 0, marginBottom: open ? 10 : 16 }}
      >
        {open ? "▾ " : "▸ "}{t("New to this? How it works", "¿Nuevo en esto? Cómo funciona")}
      </button>
      {open && (
        <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)", lineHeight: 1.65, margin: "0 0 16px", padding: "14px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 12 }}>
          <p style={{ margin: "0 0 8px" }}>
            {t(
              "Daebak is a prediction game: you back what you think will happen using points. Right → you win more points; wrong → you don't. It's for fun and bragging rights.",
              "Daebak es un juego de predicción: apuestas por lo que crees que va a pasar usando puntos. Aciertas → ganas más puntos; fallas → no. Es por diversión y para presumir.",
            )}
          </p>
          <p style={{ margin: 0 }}>
            {t(
              "You play with Daebak Rewards points earned here on Aegyo Arena — not real money — and redeem them for merch and concert tickets. Daebak walks you through getting set up.",
              "Juegas con puntos de Daebak Rewards que ganas aquí en Aegyo Arena — no con dinero real — y los canjeas por merch y boletos de conciertos. Daebak te guía para empezar.",
            )}
          </p>
        </div>
      )}

      <a
        href={marketUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        style={{ display: "inline-flex", alignItems: "center", padding: "12px 24px", borderRadius: 100, background: "#B8A0FF", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.88rem", letterSpacing: "0.02em", textDecoration: "none" }}
      >
        {t("Predict on Daebak", "Predecir en Daebak")} →
      </a>

      <p style={{ fontSize: "0.68rem", color: "var(--ink-faint)", lineHeight: 1.5, margin: "14px 0 0", maxWidth: 480 }}>
        {t(
          "Play with Daebak Rewards points, not real money. Points have no cash value; redeem them for merch and concert tickets where available. Eligibility and rules are set by Daebak.",
          "Juega con puntos de Daebak Rewards, no con dinero real. Los puntos no tienen valor en efectivo; canjéalos por merch y boletos de conciertos donde estén disponibles. La elegibilidad y las reglas las define Daebak.",
        )}
      </p>
    </section>
  );
}

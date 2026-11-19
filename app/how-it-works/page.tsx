import Link from "next/link";
import type { Metadata } from "next";
import { T, LangToggle } from "@/components/LangProvider";

export const metadata: Metadata = {
  title: "How It Works — Aegyo Arena",
  description:
    "How Daebak Rewards works: earn points for everything you already do as a K-pop fan, climb the Arcade leaderboard, and redeem real merch, plushies and concert tickets.",
  alternates: { canonical: "/how-it-works" },
};

/** A localized string. `es` is omitted where the copy is identical in both languages. */
type L = { en: string; es?: string };

export default function HowItWorksPage() {
  return (
    <main>
      <section style={{ maxWidth: 1060, margin: "0 auto", padding: "48px 24px 10px" }}>
        <LangToggle align="center" marginBottom={16} />
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 14, textAlign: "center" }}>
          <T en="Daebak Rewards" es="Daebak Rewards" />
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 5vw, 2.8rem)", color: "var(--ink)", margin: "0 0 10px", textAlign: "center", lineHeight: 1.1 }}>
          <T en="How it works" es="Cómo funciona" />
        </h1>
        <p style={{ color: "var(--ink-dim)", fontSize: "1rem", textAlign: "center", maxWidth: 620, margin: "0 auto 36px", lineHeight: 1.65 }}>
          <T
            en="Three steps, and the middle one is the part most people miss."
            es="Tres pasos, y el del medio es el que casi todos se saltan."
          />
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="hm-steps">
          <Step
            n="01"
            title={{ en: "Earn points", es: "Gana puntos" }}
            body={{
              en: "Play, dance, learn slang, vote in polls, annotate lyrics. Six ways to bank points, all on the homepage.",
              es: "Juega, baila, aprende jerga, vota en encuestas, anota letras. Seis formas de sumar puntos, todas en la página principal.",
            }}
          />
          <Step
            n="02"
            title={{ en: "Climb the Arcade leaderboard", es: "Sube en el ranking del Arcade" }}
            body={{
              en: "Your standing on the leaderboard at arcade.aegyoarena.com/championship is what determines reward redemption. Points qualify you; your rank is what gets the reward handed over.",
              es: "Tu posición en el ranking de arcade.aegyoarena.com/championship es lo que determina la redención. Los puntos te califican; tu rango es lo que hace que te entreguen la recompensa.",
            }}
            accent
          />
          <Step
            n="03"
            title={{ en: "Redeem something real", es: "Canjea algo real" }}
            body={{
              en: "Merch, BABY-T-S plushies, concert tickets. Physical things that ship to your door.",
              es: "Merch, peluches BABY-T-S, boletos de concierto. Cosas físicas que llegan a tu puerta.",
            }}
          />
        </div>

        {/* Leaderboard callout — the mechanism that decides redemption. */}
        <a
          href="https://arcade.aegyoarena.com/championship"
          className="lb-callout"
          style={{
            display: "flex", alignItems: "center", gap: 16, textDecoration: "none", marginTop: 20,
            border: "1px solid var(--sakura)", borderRadius: 16, padding: "20px 24px",
            background: "linear-gradient(120deg, rgba(255,111,168,0.16), rgba(255,111,168,0.03))",
          }}
        >
          <span aria-hidden style={{ fontSize: "2.1rem", lineHeight: 1, flexShrink: 0 }}>🏆</span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontWeight: 800, color: "var(--ink)", fontSize: "1.05rem", marginBottom: 3 }}>
              <T en="The leaderboard decides who redeems" es="El ranking decide quién canjea" />
            </span>
            <span style={{ display: "block", fontSize: "0.9rem", color: "var(--ink-dim)", lineHeight: 1.55 }}>
              <T
                en="Rankings live at arcade.aegyoarena.com/championship and reset every month — so a new month is always a fresh shot at the top."
                es="El ranking vive en arcade.aegyoarena.com/championship y se reinicia cada mes — así que cada mes es una nueva oportunidad de llegar arriba."
              />
            </span>
          </span>
          <span className="lb-cta" style={{ marginLeft: "auto", color: "var(--sakura)", fontWeight: 800, fontSize: "0.88rem", whiteSpace: "nowrap", flexShrink: 0 }}>
            <T en="See the leaderboard →" es="Ver el ranking →" />
          </span>
        </a>
      </section>

      {/* Onward CTAs so the page doesn't dead-end. */}
      <section style={{ maxWidth: 1060, margin: "0 auto", padding: "36px 24px 72px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="https://arcade.aegyoarena.com"
            style={{ padding: "14px 30px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 900, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 8px 26px rgba(255,111,168,0.4)" }}
          >
            <T en="Start earning in the Arcade →" es="Empieza a ganar en el Arcade →" />
          </a>
          <Link
            href="/#earn"
            style={{ padding: "14px 28px", borderRadius: 100, border: "1px solid var(--border-strong)", color: "var(--ink)", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}
          >
            <T en="See the six ways to earn" es="Ver las seis formas de ganar" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function Step({ n, title, body, accent }: { n: string; title: L; body: L; accent?: boolean }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${accent ? "var(--sakura)" : "var(--border)"}`,
        borderRadius: 16, padding: "26px 24px",
      }}
    >
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.16em", color: accent ? "var(--sakura)" : "var(--ink-faint)", marginBottom: 12 }}>
        {n}
      </div>
      <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--ink)", marginBottom: 9, lineHeight: 1.3 }}>
        <T en={title.en} es={title.es} />
      </div>
      <div style={{ color: "var(--ink-dim)", fontSize: "0.93rem", lineHeight: 1.65 }}>
        <T en={body.en} es={body.es} />
      </div>
    </div>
  );
}

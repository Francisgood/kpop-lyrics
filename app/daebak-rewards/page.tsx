import Link from "next/link";
import type { Metadata } from "next";
import { T, LangToggle } from "@/components/LangProvider";

export const metadata: Metadata = {
  title: "Daebak Rewards — Aegyo Arena",
  description:
    "Earn points by contributing to Aegyo Arena and claim real merch — exclusive drops, our iconic chibi plushies, desk toys, concert tickets, and signed memorabilia.",
};

/** A localized string. `es` is omitted where the copy is identical in both languages. */
type L = { en: string; es?: string };

const TIERS: { tier: L; icon: string; name: L; pts: L; accent: string; note: L; link?: string; linkLabel?: L }[] = [
  {
    tier: { en: "Tier 1", es: "Nivel 1" }, icon: "👕", name: { en: "Merch Drop", es: "Drop de Merch" },
    pts: { en: "2,000 points", es: "2,000 puntos" }, accent: "var(--sakura)",
    note: { en: "Early access to limited-run Aegyo Arena apparel & accessories.", es: "Acceso anticipado a ropa y accesorios de edición limitada de Aegyo Arena." },
  },
  {
    tier: { en: "Tier 2", es: "Nivel 2" }, icon: "🧸", name: { en: "K-pop Plushie", es: "Peluche K-pop" },
    pts: { en: "3,000 points", es: "3,000 puntos" }, accent: "var(--volt)",
    note: { en: "Our iconic chibi plush collection — collect your bias.", es: "Nuestra icónica colección de peluches chibi — colecciona a tu bias." },
  },
  {
    tier: { en: "Tier 3", es: "Nivel 3" }, icon: "✨", name: { en: "Desk Toy", es: "Figura de Escritorio" },
    pts: { en: "4,000 points", es: "4,000 puntos" }, accent: "var(--sky)",
    note: { en: "Collectible desk figures to flex your fandom at work or in stream.", es: "Figuras coleccionables para presumir tu fandom en la oficina o en stream." },
  },
  {
    tier: { en: "Tier 4", es: "Nivel 4" }, icon: "🎫", name: { en: "Concert Tickets", es: "Boletos de Concierto" },
    pts: { en: "5,000 points", es: "5,000 puntos" }, accent: "var(--tangerine)",
    note: { en: "Only 4 tickets are available per season — first qualified, first served.", es: "Solo hay 4 boletos por temporada — el primero que califique se los lleva." },
    link: "/bts-giveaway", linkLabel: { en: "🎟 Enter the BTS Ticket Giveaway →", es: "🎟 Entra al Sorteo de Boletos de BTS →" },
  },
  {
    tier: { en: "Auction", es: "Subasta" }, icon: "✍️", name: { en: "Signed Memorabilia", es: "Memorabilia Firmada" },
    pts: { en: "Bid-based", es: "Por subasta" }, accent: "var(--lavender)",
    note: { en: "Spend your points to bid on one-of-a-kind signed items. Highest bid wins.", es: "Usa tus puntos para pujar por piezas firmadas únicas. Gana la puja más alta." },
  },
];

export default function DaebakRewardsPage() {
  return (
    <main>
      {/* Hero with plushie video */}
      <section style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "56px 24px 48px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }} className="dr-hero">
          <div>
            <LangToggle align="flex-start" marginBottom={16} />
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 16 }}>
              Daebak Rewards
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem, 6vw, 3.2rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.1 }}>
              <T en="Earn points. Claim real merch." es="Gana puntos. Reclama merch real." />
            </h1>
            <p style={{ color: "var(--ink-dim)", fontSize: "1.08rem", lineHeight: 1.7, marginBottom: 24 }}>
              <T
                en="Contribute to the wiki, rack up points, and trade them for exclusive drops, our chibi plush collection, desk toys, concert tickets, and signed memorabilia."
                es="Contribuye a la wiki, acumula puntos y cámbialos por drops exclusivos, nuestra colección de peluches chibi, figuras de escritorio, boletos de concierto y memorabilia firmada."
              />
            </p>
            <Link href="/contribute" style={{ display: "inline-block", padding: "13px 28px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none" }}>
              <T en="How to earn points →" es="Cómo ganar puntos →" />
            </Link>
          </div>
          <video
            src="/videos/daebak-plushies.mp4"
            poster="/images/redesign/hero-plush.png"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", borderRadius: 18, border: "1px solid var(--border-strong)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)", display: "block", background: "#000" }}
          />
        </div>
      </section>

      {/* Reward tiers */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 8px" }}><T en="The reward tiers" es="Los niveles de recompensa" /></h2>
        <p style={{ color: "var(--ink-dim)", marginBottom: 32, fontSize: "1rem" }}>
          <T en="The more you contribute, the higher you climb. Points are cumulative." es="Mientras más contribuyas, más alto llegas. Los puntos son acumulables." />
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          {TIERS.map((t) => (
            <div key={t.name.en} style={{ display: "flex", alignItems: "center", gap: 20, background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: `4px solid ${t.accent}`, borderRadius: 14, padding: "22px 26px" }} className="dr-tier">
              <div style={{ fontSize: "2.2rem", flexShrink: 0, width: 56, textAlign: "center" }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--ink)" }}><T en={t.name.en} es={t.name.es} /></span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)" }}><T en={t.tier.en} es={t.tier.es} /></span>
                </div>
                <div style={{ color: "var(--ink-dim)", fontSize: "0.92rem", marginTop: 4, lineHeight: 1.55 }}><T en={t.note.en} es={t.note.es} /></div>
                {t.link && t.linkLabel && (
                  <Link href={t.link} style={{ display: "inline-block", marginTop: 12, padding: "9px 20px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.85rem", textDecoration: "none", boxShadow: "0 4px 16px rgba(255,111,168,0.4)" }}>
                    <T en={t.linkLabel.en} es={t.linkLabel.es} />
                  </Link>
                )}
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: "1.05rem", color: t.accent }}><T en={t.pts.en} es={t.pts.es} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Earn points callout */}
        <div style={{ marginTop: 56, textAlign: "center", background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 16, padding: "44px 28px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.9rem", color: "var(--ink)", margin: "0 0 10px" }}>
            <T en="No points yet? Start earning." es="¿Aún sin puntos? Empieza a ganar." />
          </h2>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", marginBottom: 24, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
            <T
              en="Annotate lyrics, decode slang, and suggest edits. Every accepted contribution — and every upvote — banks points toward these rewards."
              es="Anota letras, descifra la jerga y sugiere ediciones. Cada contribución aceptada — y cada voto positivo — suma puntos para estas recompensas."
            />
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contribute" style={{ padding: "13px 28px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none" }}>
              <T en="Start contributing" es="Empieza a contribuir" />
            </Link>
            <Link href="/signup" style={{ padding: "13px 28px", borderRadius: 100, border: "1px solid var(--border-strong)", color: "var(--ink)", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
              <T en="Create an account" es="Crea una cuenta" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

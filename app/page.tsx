import Link from "next/link";
import type { Metadata } from "next";
import { T, LangToggle } from "@/components/LangProvider";

export const metadata: Metadata = {
  title: "Aegyo Arena — Where Your Attention Is Rewarded",
  description:
    "Social media farms your attention. Aegyo Arena pays it back. Earn points for playing, dancing, learning slang, voting in polls and contributing — then climb the Arcade leaderboard and redeem real K-pop merch, plushies, concert tickets and signed memorabilia.",
  openGraph: {
    title: "Aegyo Arena — Where Your Attention Is Rewarded",
    description:
      "Earn points for everything you already do as a K-pop fan. The Arcade leaderboard decides who redeems.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

/** A localized string. `es` is omitted where the copy is identical in both languages. */
type L = { en: string; es?: string };

// ── Ways to earn ────────────────────────────────────────────────────────────
// Every one of these is a live surface on the site or the Arcade subdomain —
// don't add a row here without a real destination to send people to.
const EARN: { icon: string; name: L; note: L; href: string; cta: L; external?: boolean }[] = [
  {
    icon: "🕹️",
    name: { en: "Play the Arcade", es: "Juega en el Arcade" },
    note: {
      en: "Claw machines, Bias Flap, slang guessing. Every game you play feeds your score on the leaderboard that decides redemption.",
      es: "Máquinas de garra, Bias Flap, adivina la jerga. Cada partida alimenta tu puntaje en el ranking que decide la redención.",
    },
    href: "https://arcade.aegyoarena.com",
    cta: { en: "Enter the Arcade", es: "Entrar al Arcade" },
    external: true,
  },
  {
    icon: "💃",
    name: { en: "Register for a random play dance", es: "Regístrate en un random play dance" },
    note: {
      en: "Real meetups in your city — random play dances, fan gatherings, pop-ups. Registering and showing up banks points.",
      es: "Encuentros reales en tu ciudad — random play dances, reuniones de fans, pop-ups. Registrarte y asistir suma puntos.",
    },
    href: "/events",
    cta: { en: "Find an event near you", es: "Busca un evento cerca" },
  },
  {
    icon: "🧠",
    name: { en: "Learn slang through memory games", es: "Aprende jerga con juegos de memoria" },
    note: {
      en: "Swipe through the Korean slang deck, then take the practice quiz it builds from your cards. Score a perfect 10 and earn 10 points — once a day.",
      es: "Desliza por el mazo de jerga coreana y haz el quiz de práctica que arma con tus tarjetas. Haz un 10 perfecto y gana 10 puntos — una vez al día.",
    },
    href: "/korean-slang",
    cta: { en: "Open the slang deck", es: "Abrir el mazo de jerga" },
  },
  {
    icon: "🪩",
    name: { en: "Teach choreography", es: "Enseña coreografía" },
    note: {
      en: "Film yourself teaching a K-pop dance, upload the YouTube clip, and earn 10 points — plus 100 more when 10+ fans upvote it.",
      es: "Grábate enseñando un baile de K-pop, sube el clip de YouTube y gana 10 puntos — más 100 cuando 10+ fans lo voten.",
    },
    href: "/teach-dance",
    cta: { en: "Upload a dance clip", es: "Sube un clip de baile" },
  },
  {
    icon: "👀",
    name: { en: "Spill a tip or rumor", es: "Suelta una pista o rumor" },
    note: {
      en: "Spotted an idol in your city, or heard something? Drop the sighting — photo, video, or link — plus the gossip. The tips we run bank you points.",
      es: "¿Viste a un idol en tu ciudad o escuchaste algo? Suelta el avistamiento — foto, video o link — y el chisme. Las pistas que publicamos te suman puntos.",
    },
    href: "/tips",
    cta: { en: "Submit a tip", es: "Enviar una pista" },
  },
  {
    icon: "✍️",
    name: { en: "Annotate lyrics & decode slang", es: "Anota letras y descifra jerga" },
    note: {
      en: "Explain a line, add a translation, suggest an edit. Every accepted contribution — and every upvote it earns — banks points.",
      es: "Explica un verso, agrega una traducción, sugiere una edición. Cada contribución aceptada — y cada voto que recibe — suma puntos.",
    },
    href: "/contribute",
    cta: { en: "See how to contribute", es: "Cómo contribuir" },
  },
];

// ── Reward tiers ────────────────────────────────────────────────────────────
const TIERS: { tier: L; icon: string; name: L; pts: L; accent: string; note: L; link?: string; linkLabel?: L }[] = [
  {
    tier: { en: "Tier 1", es: "Nivel 1" }, icon: "👕", name: { en: "Merch Drop", es: "Drop de Merch" },
    pts: { en: "2,000 points", es: "2,000 puntos" }, accent: "var(--sakura)",
    note: { en: "Early access to limited-run Aegyo Arena apparel & accessories.", es: "Acceso anticipado a ropa y accesorios de edición limitada de Aegyo Arena." },
    link: "/merch", linkLabel: { en: "See the tees →", es: "Ver las camisetas →" },
  },
  {
    tier: { en: "Tier 2", es: "Nivel 2" }, icon: "🧸", name: { en: "BABY-T-S Plushie", es: "Peluche BABY-T-S" },
    pts: { en: "3,000 points", es: "3,000 puntos" }, accent: "var(--volt)",
    note: { en: "Our chibi plush pendants — seven characters that spell DAEBAK! Collect your bias, or the whole set.", es: "Nuestros colgantes de peluche chibi — siete personajes que deletrean DAEBAK! Colecciona a tu bias, o el set completo." },
    link: "/shop", linkLabel: { en: "🧸 See the BABY-T-S collection →", es: "🧸 Ver la colección BABY-T-S →" },
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
    link: "/giveaways", linkLabel: { en: "🎟 See what's live →", es: "🎟 Ver qué está activo →" },
  },
  {
    tier: { en: "Auction", es: "Subasta" }, icon: "✍️", name: { en: "Signed Memorabilia", es: "Memorabilia Firmada" },
    pts: { en: "Bid-based", es: "Por subasta" }, accent: "var(--lavender)",
    note: { en: "Spend your points to bid on one-of-a-kind signed items. Highest bid wins.", es: "Usa tus puntos para pujar por piezas firmadas únicas. Gana la puja más alta." },
  },
];

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "56px 24px 50px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44, alignItems: "center" }} className="hm-hero">
          <div>
            <LangToggle align="flex-start" marginBottom={16} />
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 16 }}>
              <T en="Daebak Rewards" es="Daebak Rewards" />
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.1rem, 5.4vw, 3.2rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 18px", lineHeight: 1.1 }}>
              <T
                en="They farm your attention."
                es="Ellos explotan tu atención."
              />
              <br />
              <T
                en="We reward it."
                es="Nosotros la recompensamos."
              />
            </h1>
            <p style={{ color: "var(--ink-dim)", fontSize: "1.08rem", lineHeight: 1.7, marginBottom: 26 }}>
              <T
                en="Every other platform turns the hours you spend on K-pop into someone else’s ad revenue. Aegyo Arena turns them into points — and points into real merch, plushies, concert tickets and signed memorabilia."
                es="Las demás plataformas convierten las horas que dedicas al K-pop en ingresos publicitarios ajenos. Aegyo Arena las convierte en puntos — y los puntos en merch real, peluches, boletos de concierto y memorabilia firmada."
              />
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="https://arcade.aegyoarena.com"
                style={{ padding: "14px 30px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 900, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 8px 26px rgba(255,111,168,0.4)" }}
              >
                <T en="Start earning in the Arcade →" es="Empieza a ganar en el Arcade →" />
              </a>
              <Link
                href="/feed"
                style={{ padding: "14px 28px", borderRadius: 100, border: "1px solid var(--border-strong)", color: "var(--ink)", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}
              >
                <T en="Read the feed" es="Leer el feed" />
              </Link>
            </div>
          </div>

          {/* The plushie reel — the clearest picture of what points actually buy. */}
          <video
            src="/videos/daebak-plushies.mp4"
            poster="/images/redesign/hero-plush.png"
            autoPlay
            loop
            muted
            playsInline
            aria-label="The BABY-T-S plush collection"
            style={{ width: "100%", borderRadius: 18, border: "1px solid var(--border-strong)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)", display: "block", background: "#000" }}
          />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1060, margin: "0 auto", padding: "60px 24px 10px" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 10px", textAlign: "center" }}>
          <T en="How it works" es="Cómo funciona" />
        </h2>
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
              en: "Play, dance, learn slang, vote in polls, annotate lyrics. Six ways to bank points, all listed below.",
              es: "Juega, baila, aprende jerga, vota en encuestas, anota letras. Seis formas de sumar puntos, todas aquí abajo.",
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
              en: "Merch, BABY-T-S plushies, desk toys, concert tickets, signed memorabilia. Physical things that ship to your door.",
              es: "Merch, peluches BABY-T-S, figuras de escritorio, boletos de concierto, memorabilia firmada. Cosas físicas que llegan a tu puerta.",
            }}
          />
        </div>

        {/* Leaderboard callout — the mechanism that decides redemption. */}
        <a
          href="https://arcade.aegyoarena.com/championship"
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
          <span style={{ marginLeft: "auto", color: "var(--sakura)", fontWeight: 800, fontSize: "0.88rem", whiteSpace: "nowrap", flexShrink: 0 }}>
            <T en="See the leaderboard →" es="Ver el ranking →" />
          </span>
        </a>
      </section>

      {/* ── Ways to earn ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1060, margin: "0 auto", padding: "56px 24px 10px" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 10px" }}>
          <T en="Six ways to earn points" es="Seis formas de ganar puntos" />
        </h2>
        <p style={{ color: "var(--ink-dim)", fontSize: "1rem", margin: "0 0 30px", lineHeight: 1.65 }}>
          <T
            en="All of them are things you’d do anyway. That’s the point."
            es="Todas son cosas que harías de todos modos. Esa es la idea."
          />
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {EARN.map((e) => {
            const inner = (
              <>
                <div style={{ fontSize: "1.9rem", lineHeight: 1, marginBottom: 12 }} aria-hidden>{e.icon}</div>
                <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--ink)", marginBottom: 8, lineHeight: 1.3 }}>
                  <T en={e.name.en} es={e.name.es} />
                </div>
                <div style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 14 }}>
                  <T en={e.note.en} es={e.note.es} />
                </div>
                <div style={{ marginTop: "auto", color: "var(--sakura)", fontWeight: 800, fontSize: "0.85rem" }}>
                  <T en={e.cta.en} es={e.cta.es} /> →
                </div>
              </>
            );
            const style: React.CSSProperties = {
              display: "flex", flexDirection: "column", textDecoration: "none",
              background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 24px 22px",
            };
            // The Arcade is a separate subdomain app, so it gets a plain <a>.
            return e.external ? (
              <a key={e.href} href={e.href} style={style}>{inner}</a>
            ) : (
              <Link key={e.href} href={e.href} style={style}>{inner}</Link>
            );
          })}
        </div>
      </section>

      {/* ── Reward tiers ─────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1060, margin: "0 auto", padding: "56px 24px 10px" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 10px" }}>
          <T en="What the points are worth" es="Cuánto valen los puntos" />
        </h2>
        <p style={{ color: "var(--ink-dim)", fontSize: "1rem", margin: "0 0 30px", lineHeight: 1.65 }}>
          <T
            en="The more you contribute, the higher you climb. Points are cumulative — nothing expires out from under you."
            es="Mientras más contribuyas, más alto llegas. Los puntos son acumulables — nada se vence a tus espaldas."
          />
        </p>

        <div style={{ display: "grid", gap: 14 }}>
          {TIERS.map((t) => (
            <div key={t.name.en} style={{ display: "flex", alignItems: "center", gap: 20, background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: `4px solid ${t.accent}`, borderRadius: 14, padding: "22px 26px" }} className="hm-tier">
              <div style={{ fontSize: "2.2rem", flexShrink: 0, width: 56, textAlign: "center" }} aria-hidden>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--ink)" }}><T en={t.name.en} es={t.name.es} /></span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)" }}><T en={t.tier.en} es={t.tier.es} /></span>
                </div>
                <div style={{ color: "var(--ink-dim)", fontSize: "0.92rem", marginTop: 4, lineHeight: 1.55 }}><T en={t.note.en} es={t.note.es} /></div>
                {t.link && t.linkLabel && (
                  <Link href={t.link} style={{ display: "inline-block", marginTop: 12, padding: "9px 20px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.85rem", textDecoration: "none" }}>
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
      </section>

      {/* ── Close ────────────────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1060, margin: "0 auto", padding: "56px 24px 76px" }}>
        <div style={{ textAlign: "center", background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 18, padding: "48px 28px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.7rem, 4vw, 2.2rem)", color: "var(--ink)", margin: "0 0 12px", lineHeight: 1.2 }}>
            <T
              en="Your attention is already being spent. Start getting paid for it."
              es="Tu atención ya se está gastando. Empieza a cobrar por ella."
            />
          </h2>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", marginBottom: 26, maxWidth: 560, marginLeft: "auto", marginRight: "auto", lineHeight: 1.65 }}>
            <T
              en="Make an account, play a round, vote on a rumor. Points start banking from the first thing you do."
              es="Crea una cuenta, juega una ronda, vota un rumor. Los puntos empiezan a acumularse desde lo primero que hagas."
            />
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ padding: "14px 30px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 900, fontSize: "0.95rem", textDecoration: "none" }}>
              <T en="Create an account" es="Crea una cuenta" />
            </Link>
            <Link href="/contribute" style={{ padding: "14px 28px", borderRadius: 100, border: "1px solid var(--border-strong)", color: "var(--ink)", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
              <T en="How to earn points" es="Cómo ganar puntos" />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .hm-hero  { grid-template-columns: 1fr !important; gap: 28px !important; }
          .hm-steps { grid-template-columns: 1fr !important; }
          .hm-tier  { flex-wrap: wrap; }
        }
      `}</style>
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

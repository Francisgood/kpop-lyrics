import type { Metadata } from "next";
import Link from "next/link";
import RestockAlert from "@/components/RestockAlert";
import { T, LangToggle } from "@/components/LangProvider";

export const metadata: Metadata = {
  title: "Merch — Aegyo Arena",
  description:
    "Aegyo Arena street-style tees — $40 or 2,000 points each. Everything’s sold out right now. Sign up to get alerted the moment the warehouse restocks.",
};

// `name` is the slogan printed on the tee (a product name) — never translated.
const TEES = [
  { img: "/merch/tee-1.jpg", name: "“Hwaiting !!!”", sub: "Neon Seoul burgundy tee", subEs: "Camiseta vino Neon Seoul" },
  { img: "/merch/tee-2.jpg", name: "“I Learned Korean For This”", sub: "Oatmeal everyday tee", subEs: "Camiseta diaria color avena" },
  { img: "/merch/tee-3.jpg", name: "“My Parents Think It’s A Phase”", sub: "Black statement tee", subEs: "Camiseta negra con mensaje" },
  { img: "/merch/tee-4.jpg", name: "“Mukbang Made Me Do It”", sub: "Powder-blue tee", subEs: "Camiseta azul cielo" },
];

export default function MerchPage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "56px 24px 44px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", textAlign: "center" }}>
          <LangToggle align="center" marginBottom={16} />
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 16 }}>
            Aegyo Merch
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem, 6vw, 3.2rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.1 }}>
            <T en="Wear the culture." es="Viste la cultura." />
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.08rem", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 24px" }}>
            <T
              en="Limited-run street-style tees, worn in the neon of Seoul. Every drop is"
              es="Camisetas street-style de edición limitada, con el neón de Seoul. Cada drop cuesta"
            />{" "}
            <strong style={{ color: "var(--ink)" }}>$40</strong> <T en="or" es="o" />{" "}
            <strong style={{ color: "var(--sakura)" }}><T en="2,000 points" es="2,000 puntos" /></strong>.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 100, padding: "9px 20px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sakura)", display: "inline-block" }} />
            <span style={{ fontWeight: 800, fontSize: "0.82rem", letterSpacing: "0.04em", color: "var(--ink)", textTransform: "uppercase" }}>
              <T en="Every tee is sold out — restock incoming" es="Todo está agotado — pronto hay restock" />
            </span>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "56px 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 22 }}>
          {TEES.map((t) => (
            <div key={t.name} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", aspectRatio: "3 / 4", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.img}
                  alt={t.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block", filter: "grayscale(35%) brightness(0.82)" }}
                />
                {/* Sold-out scrim + badge */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)" }} />
                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(15,15,18,0.82)", color: "#fff", fontFamily: "var(--mono)", fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.18)" }}>
                  <T en="Sold Out" es="Agotado" />
                </div>
              </div>

              <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "var(--ink)", lineHeight: 1.3 }}>{t.name}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}><T en={t.sub} es={t.subEs} /></div>
                <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--ink)" }}>$40</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-faint)" }}><T en="or" es="o" /></span>
                  <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--sakura)" }}><T en="2,000 points" es="2,000 puntos" /></span>
                </div>
                <div style={{ marginTop: 12, textAlign: "center", padding: "10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--ink-faint)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  <T en="Sold Out" es="Agotado" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Restock alert */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "16px 24px 72px" }}>
        <div style={{ textAlign: "center", background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 18, padding: "48px 28px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.7rem, 4vw, 2.1rem)", color: "var(--ink)", margin: "0 0 10px" }}>
            <T en="Get first dibs on the restock." es="Aparta el restock antes que nadie." />
          </h2>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 26px" }}>
            <T
              en="Drop your email and we’ll alert you the moment the warehouse is back in stock — before the next public drop sells out again."
              es="Déjanos tu correo y te avisamos apenas el almacén vuelva a tener stock — antes de que el próximo drop público se agote otra vez."
            />
          </p>
          <RestockAlert />
          <p style={{ marginTop: 26, fontSize: "0.85rem", color: "var(--ink-faint)" }}>
            <T en="Rather earn it?" es="¿Prefieres ganártela?" />{" "}
            <Link href="/daebak-rewards" style={{ color: "var(--sakura)", fontWeight: 700 }}>
              <T en="Bank 2,000 points" es="Junta 2,000 puntos" />
            </Link>{" "}
            <T en="and claim a tee for free." es="y reclama una camiseta gratis." />
          </p>
        </div>
      </div>
    </main>
  );
}

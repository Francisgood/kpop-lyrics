import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CULTURE, RICH, TOPIC_ORDER, type CultureTopic } from "../content";
import CultureFeed from "@/components/CultureFeed";
import DanceShowcase from "@/components/DanceShowcase";
import { T, LangToggle } from "@/components/LangProvider";

export const dynamicParams = false;

// Spanish for the topic copy that lives in ../content.ts (shared data file — translated
// here at render time rather than forked). "Mukbang" is a Korean term and stays as-is.
const TOPIC_ES: Record<CultureTopic, { title: string; blurb: string }> = {
  dance: {
    title: "Baile",
    blurb: "Los pasos que el fandom no para de repetir — point choreography, dance covers y los challenges que están explotando en Reels ahora mismo.",
  },
  fashion: {
    title: "Moda",
    blurb: "Looks de idols, moda de aeropuerto y momentos de alfombra roja que el fandom analiza cuadro por cuadro.",
  },
  beauty: {
    title: "Belleza",
    blurb: "Looks de maquillaje de idols, rutinas de K-beauty y get-ready-with-me paso a paso. Drops curados muy pronto.",
  },
  mukbang: {
    title: "Mukbang",
    blurb: "Videos de mukbang y what-I-eat-in-a-day — el rincón comfort del fandom.",
  },
};

export function generateStaticParams() {
  return TOPIC_ORDER.map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const m = CULTURE[topic as CultureTopic];
  if (!m) return { title: "Culture Vulture — Aegyo Arena" };
  return { title: `${m.title} — Culture Vulture | Aegyo Arena`, description: m.blurb };
}

export default async function CultureTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const m = CULTURE[topic as CultureTopic];
  if (!m) notFound();
  const rich = RICH[topic as CultureTopic];
  const es = TOPIC_ES[topic as CultureTopic];

  return (
    <main style={{ background: "#fbfafc", color: "#15131f" }}>
      {/* Hero */}
      <section style={{ background: "#ffffff", borderBottom: "1px solid #ececf0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 26px" }}>
          <LangToggle align="flex-start" marginBottom={16} />
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#ff6fa8", marginBottom: 12 }}>Culture Vulture</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.1rem, 5.5vw, 3.1rem)", fontWeight: 700, margin: "0 0 8px", lineHeight: 1.04, color: "#15131f" }}>
            {m.emoji} <T en={m.title} es={es.title} />
          </h1>
          <p style={{ color: "#54545c", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 620, margin: 0 }}>
            <T en={m.blurb} es={es.blurb} />
          </p>

          {/* Category pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}>
            {TOPIC_ORDER.map((t) => {
              const active = t === m.key;
              const tt = CULTURE[t];
              return (
                <Link key={t} href={`/culture/${t}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 100, textDecoration: "none", fontWeight: 700, fontSize: "0.85rem",
                    border: active ? "1px solid #ff6fa8" : "1px solid #e2e2e8",
                    background: active ? "#ff6fa8" : "#fff",
                    color: active ? "#fff" : "#54545c",
                  }}>
                  <span>{tt.emoji}</span><T en={tt.title} es={TOPIC_ES[t].title} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "34px 24px 70px" }}>
        {rich ? (
          <DanceShowcase data={rich} />
        ) : m.embeds.length > 0 ? (
          <>
            <CultureFeed embeds={m.embeds} />
            <div style={{ marginTop: 34, background: "linear-gradient(135deg,#15131f,#2a2540)", borderRadius: 20, padding: "32px 28px", textAlign: "center", color: "#fff" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>
                <T en="Got something to share? Soon you can post it." es="¿Tienes algo para compartir? Muy pronto vas a poder publicarlo." />
              </div>
              <p style={{ color: "#c9c7d6", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 540, margin: "0 auto 18px" }}>
                <T
                  en={`Registered fans will be able to submit their own ${m.title.toLowerCase()} videos. To keep it safe, uploaders verify they’re 18+ (or the minimum age in their country) with a quick `}
                  es={`Los fans registrados van a poder subir sus propios videos de ${es.title.toLowerCase()}. Para que todo sea seguro, quienes suban contenido verifican que son mayores de 18 (o la edad mínima de su país) con una rápida `}
                />
                <a href="https://didit.me/products/id-verification/" target="_blank" rel="noopener noreferrer" style={{ color: "#ff9ec4", fontWeight: 700, textDecoration: "none" }}>
                  <T en="didit.me ID check" es="verificación de identidad de didit.me" />
                </a>
                <T en=" sent to their email." es=" que les llega por email." />
              </p>
              <span style={{ display: "inline-block", padding: "11px 22px", borderRadius: 100, background: "#ff6fa8", color: "#fff", fontWeight: 800, fontSize: "0.85rem" }}>
                <T en="Creator uploads — coming soon" es="Uploads de creadores — muy pronto" />
              </span>
            </div>
          </>
        ) : (
          <div style={{ background: "#fff", border: "1px dashed #d7d7df", borderRadius: 16, padding: "48px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>{m.emoji}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 700, marginBottom: 8, color: "#15131f" }}>
              <T en={`${m.title} drops coming soon`} es={`Los drops de ${es.title} llegan muy pronto`} />
            </div>
            <p style={{ color: "#6b6b72", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 18px" }}>
              <T
                en="We’re curating the best looks and routines. Got a clip we should feature? Tag "
                es="Estamos curando los mejores looks y rutinas. ¿Tienes un clip que deberíamos mostrar? Etiqueta a "
              />
              <a href="https://www.instagram.com/aegyoarena" target="_blank" rel="noopener noreferrer" style={{ color: "#ff6fa8", fontWeight: 700, textDecoration: "none" }}>@aegyoarena</a>.
            </p>
            <Link href="/culture/dance" style={{ color: "#ff6fa8", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
              <T en="Browse Dance instead →" es="Mejor explora Baile →" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { T, LangToggle } from "@/components/LangProvider";

export const metadata: Metadata = {
  title: "How we count votes — Aegyo Arena",
  description: "How Aegyo Arena's one-tap K-pop polls count votes: anonymous voting, device-scoped dedup, loose limits, bot flagging, and full transparency.",
};

// The fairness note linked from every poll's results (PRD §5.4) — transparency is
// cheap credibility with fans, and organized fan voting is a cultural sport.
export default function HowWeCountVotesPage() {
  const points: { en: string; es: string; body: string; bodyEs: string }[] = [
    {
      en: "One tap, no account.", es: "Un toque, sin cuenta.",
      body: "Every vote counts immediately — you don't need to sign up to be heard.",
      bodyEs: "Cada voto cuenta de inmediato — no necesitas registrarte para que te escuchemos.",
    },
    {
      en: "One vote per person.", es: "Un voto por persona.",
      body: "We recognize your device so you count once per poll. Claim your profile and that history follows you across devices.",
      bodyEs: "Reconocemos tu dispositivo para que cuentes una vez por encuesta. Reclama tu perfil y ese historial te sigue en todos tus dispositivos.",
    },
    {
      en: "Loose limits, not punishment.", es: "Límites suaves, no castigo.",
      body: "We deter casual flooding, but we don't block real fans — shared mobile-carrier IPs are normal, so the limits stay generous.",
      bodyEs: "Disuadimos el flooding casual, pero no bloqueamos a fans reales — las IPs compartidas de operadoras móviles son normales, así que los límites son generosos.",
    },
    {
      en: "Bots are flagged, not silently dropped.", es: "Los bots se marcan, no se descartan en silencio.",
      body: "Suspicious votes (headless browsers, impossible cadence) are flagged and still shown in the public split — and tracked separately, so we always know the real-vs-clean difference.",
      bodyEs: "Los votos sospechosos (navegadores headless, cadencia imposible) se marcan y siguen apareciendo en el conteo público — y se rastrean por separado, para conocer siempre la diferencia entre lo real y lo limpio.",
    },
    {
      en: "No CAPTCHAs.", es: "Sin CAPTCHAs.",
      body: "They'd break the five-second experience. If a poll ever shows severe manipulation, we can switch it to registered-voters-only instead.",
      bodyEs: "Romperían la experiencia de cinco segundos. Si una encuesta muestra manipulación grave, podemos cambiarla a solo votantes registrados.",
    },
    {
      en: "Your votes are never orphaned.", es: "Tus votos nunca quedan huérfanos.",
      body: "When you claim a profile, the votes you already cast on this device are attached to it — the results never change, they were already counted.",
      bodyEs: "Cuando reclamas un perfil, los votos que ya emitiste en este dispositivo se le adjuntan — los resultados no cambian, ya estaban contados.",
    },
  ];

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
      <LangToggle align="flex-start" marginBottom={16} />
      <div style={{ fontSize: "0.7rem", color: "var(--ink-faint)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 18 }}>
        <Link href="/" style={{ color: "var(--ink-faint)", textDecoration: "none" }}>Aegyo Arena</Link>
        {" / "}<T en="How we count votes" es="Cómo contamos los votos" />
      </div>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.9rem, 5vw, 2.6rem)", fontWeight: 800, color: "var(--ink)", lineHeight: 1.15, margin: "0 0 12px" }}>
        <T en="How we count votes" es="Cómo contamos los votos" />
      </h1>
      <p style={{ fontSize: "1.05rem", color: "var(--ink-dim)", lineHeight: 1.7, margin: "0 0 32px" }}>
        <T
          en="Our polls are built for fans, on phones, mid-scroll. Here's exactly how a vote is counted — no dark patterns, no fine print."
          es="Nuestras encuestas están hechas para fans, en el celular, a mitad del scroll. Así se cuenta un voto — sin patrones oscuros ni letra chica."
        />
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {points.map((p, i) => (
          <div key={i} style={{ borderLeft: "3px solid #ff6fa8", paddingLeft: 16 }}>
            <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "1.05rem", marginBottom: 5 }}>
              <T en={p.en} es={p.es} />
            </div>
            <div style={{ color: "var(--ink-dim)", lineHeight: 1.65 }}>
              <T en={p.body} es={p.bodyEs} />
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 34, fontSize: "0.85rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
        <T
          en="Voting will move to registered-only for some polls in the future. Claim your profile now so your streak and history come with you."
          es="En el futuro, algunas encuestas serán solo para votantes registrados. Reclama tu perfil ahora para que tu racha e historial te acompañen."
        />
      </p>
    </main>
  );
}

import type { Metadata } from "next";
import TeachChoreography from "@/components/TeachChoreography";
import DanceShowcase from "@/components/DanceShowcase";
import { CULTURE, RICH } from "@/app/culture/content";
import { T, LangToggle } from "@/components/LangProvider";

export const metadata: Metadata = {
  title: "Teach & Learn Dance — Aegyo Arena",
  description:
    "Teach a K-pop dance and earn points when fans upvote your clip — then learn the point choreography, dance covers, and challenges the fandom is looping right now.",
  alternates: { canonical: "/teach-dance" },
};

export default function TeachDancePage() {
  const dance = RICH.dance;

  return (
    <main>
      {/* ── Teach choreography (the earn feature) — dark, site theme ───────── */}
      <div style={{ paddingTop: 16 }}>
        <LangToggle align="center" marginBottom={4} />
        <TeachChoreography next="/teach-dance" />
      </div>

      {/* ── Dance showcase (from the old /culture/dance) — light band ──────── */}
      <section style={{ background: "#fbfafc", color: "#15131f", borderTop: "1px solid #ececf0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 72px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#ff6fa8", marginBottom: 12 }}>
            Culture Vulture
          </div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontWeight: 700, margin: "0 0 8px", lineHeight: 1.05, color: "#15131f" }}>
            💃 <T en="Dance" es="Baile" />
          </h2>
          <p style={{ color: "#54545c", fontSize: "1.02rem", lineHeight: 1.6, maxWidth: 640, margin: "0 0 28px" }}>
            <T
              en={CULTURE.dance.blurb}
              es="Los pasos que el fandom no para de repetir — point choreography, dance covers y los challenges que están explotando en Reels ahora mismo."
            />
          </p>
          {dance && <DanceShowcase data={dance} />}
        </div>
      </section>
    </main>
  );
}

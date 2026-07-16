import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { T, LangToggle } from "@/components/LangProvider";

export const revalidate = 86400;

export default async function DefinePage() {
  const terms = await prisma.codedTerm.findMany({
    include: {
      definitions: { orderBy: { votesUp: "desc" }, take: 1 },
      _count: { select: { annotations: true } },
    },
    orderBy: { term: "asc" },
  });

  return (
    <main>
      {/* Header */}
      <section style={{ background: "#000", color: "#fff", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <LangToggle align="flex-start" marginBottom={16} />
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            <T en="K-pop Dictionary" es="Diccionario K-pop" />
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>
            <T en="K-pop Slang & Terms" es="Jerga y Términos del K-pop" />
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", maxWidth: 520 }}>
            <T
              en="Fan-written definitions for K-pop culture vocabulary. Vote for the best definitions."
              es="Definiciones escritas por fans para el vocabulario de la cultura K-pop. Vota por las mejores."
            />
          </p>
          <div style={{ marginTop: 20 }}>
            <Link href="/quiz/korean-slang" style={{ display: "inline-block", background: "var(--genius-yellow)", color: "#000", fontWeight: 700, fontSize: "0.85rem", padding: "11px 20px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.02em" }}>
              <T
                en="Think you know your slang? Take the 10-question Korean Slang quiz →"
                es="¿Crees que dominas la jerga? Haz el quiz de 10 preguntas de jerga coreana →"
              />
            </Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {terms.map((term) => {
            const topDef = term.definitions[0];
            return (
              <Link key={term.id} href={`/korean-slang/${term.slug}`} style={{ textDecoration: "none" }}>
                <div className="genius-card" style={{ padding: 20, height: "100%" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#ff6fa8", marginBottom: 8 }}>
                    {term.term}
                  </div>
                  {term._count.annotations > 0 && (
                    <div style={{ display: "inline-block", background: "#000", color: "var(--genius-yellow)", fontSize: "0.7rem", fontWeight: 700, padding: "2px 9px", borderRadius: 999, marginBottom: 8 }}>
                      🎵 <T
                        en={`${term._count.annotations} song${term._count.annotations !== 1 ? "s" : ""}`}
                        es={`${term._count.annotations} ${term._count.annotations !== 1 ? "canciones" : "canción"}`}
                      />
                    </div>
                  )}
                  {topDef && (
                    <div style={{ fontSize: "0.88rem", color: "#fff", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {topDef.body}
                    </div>
                  )}
                  {topDef && (
                    <div style={{ marginTop: 12, display: "flex", gap: 8, fontSize: "0.78rem", color: "var(--genius-gray)" }}>
                      <span>👍 {topDef.votesUp}</span>
                      <span>👎 {topDef.votesDown}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}

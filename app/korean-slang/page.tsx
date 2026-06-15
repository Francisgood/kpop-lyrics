import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 86400;

export default async function DefinePage() {
  const terms = await prisma.codedTerm.findMany({
    include: {
      definitions: { orderBy: { votesUp: "desc" }, take: 1 },
    },
    orderBy: { term: "asc" },
  });

  return (
    <main>
      {/* Header */}
      <section style={{ background: "#000", color: "#fff", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            K-pop Dictionary
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>K-pop Slang & Terms</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", maxWidth: 520 }}>
            Fan-written definitions for K-pop culture vocabulary. Vote for the best definitions.
          </p>
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

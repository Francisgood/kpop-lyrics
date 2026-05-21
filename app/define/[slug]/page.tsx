import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const term = await prisma.codedTerm.findUnique({
    where: { slug },
    include: {
      definitions: { orderBy: { votesUp: "desc" } },
    },
  });

  if (!term) notFound();

  return (
    <main>
      {/* Term Header */}
      <section style={{ background: "#000", color: "#fff", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Aegyo Arena</Link>
            {" / "}
            <Link href="/define" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>K-POP TERMS</Link>
            {" / "}
            {term.term}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            K-pop Term
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 8px" }}>{term.term}</h1>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            {term.definitions.length} definition{term.definitions.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      {/* Definitions */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        {term.definitions.map((def, i) => (
          <div key={def.id} className="genius-card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{
                background: i === 0 ? "var(--genius-yellow)" : "#f0f0f0",
                color: "#000",
                fontWeight: 700,
                fontSize: "0.75rem",
                padding: "4px 12px",
                borderRadius: 999,
                letterSpacing: "0.05em"
              }}>
                #{i + 1} {i === 0 ? "TOP DEFINITION" : ""}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="vote-btn up" style={{ fontSize: "0.82rem" }}>
                  👍 {def.votesUp}
                </button>
                <button type="button" className="vote-btn down" style={{ fontSize: "0.82rem" }}>
                  👎 {def.votesDown}
                </button>
              </div>
            </div>

            <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#212121", margin: "0 0 16px" }}>
              {def.body}
            </p>

            {def.example && (
              <div style={{
                background: "rgba(255,255,100,0.15)",
                borderLeft: "3px solid var(--genius-yellow)",
                padding: "12px 16px",
                borderRadius: "0 4px 4px 0",
                marginTop: 12
              }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--genius-gray)", marginBottom: 6 }}>
                  Example
                </div>
                <div style={{ fontSize: "0.95rem", fontStyle: "italic", color: "#444" }}>
                  &ldquo;{def.example}&rdquo;
                </div>
              </div>
            )}
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/define" style={{ color: "var(--genius-gray)", textDecoration: "none", fontSize: "0.9rem" }}>
            ← Back to K-pop Terms
          </Link>
        </div>
      </div>
    </main>
  );
}

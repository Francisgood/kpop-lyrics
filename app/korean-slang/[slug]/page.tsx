import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import SlangDefinitions from "@/components/SlangDefinitions";

export const revalidate = 86400;

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
            <Link href="/korean-slang" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Korean Slang</Link>
            {" / "}
            {term.term}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Korean Slang
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 8px" }}>{term.term}</h1>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            {term.definitions.length} definition{term.definitions.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      {/* Definitions */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
        <SlangDefinitions
          termName={term.term}
          definitions={term.definitions.map((d) => ({ id: d.id, body: d.body, example: d.example, votesUp: d.votesUp, votesDown: d.votesDown }))}
        />

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/korean-slang" style={{ color: "var(--genius-gray)", textDecoration: "none", fontSize: "0.9rem" }}>
            ← Back to Korean Slang
          </Link>
        </div>
      </div>
    </main>
  );
}

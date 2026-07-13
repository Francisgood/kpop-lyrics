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
      annotations: { include: { song: { include: { album: { include: { artist: true } } } } } },
    },
  });

  if (!term) notFound();

  // Distinct songs whose lyrics are annotated with this term (deduped by song id).
  const heardInSongs = (() => {
    const byId = new Map<string, (typeof term.annotations)[number]["song"]>();
    for (const ann of term.annotations) {
      if (ann.song && !byId.has(ann.song.id)) byId.set(ann.song.id, ann.song);
    }
    return [...byId.values()];
  })();

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

        {/* Songs whose lyrics use this slang term */}
        {heardInSongs.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <div className="section-header">Heard in these songs</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {heardInSongs.map((song) => (
                <Link key={song.id} href={`/songs/${song.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#ff6fa8" }}>{song.title}</div>
                    {song.album?.artist && (
                      <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 4 }}>{song.album.artist.stageName}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/korean-slang" style={{ color: "var(--genius-gray)", textDecoration: "none", fontSize: "0.9rem" }}>
            ← Back to Korean Slang
          </Link>
        </div>
      </div>
    </main>
  );
}

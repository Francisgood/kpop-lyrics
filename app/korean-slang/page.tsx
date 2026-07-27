import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { T, LangToggle } from "@/components/LangProvider";
import SlangDeck, { type DeckTerm } from "@/components/SlangDeck";
import { hangulFromDefinition } from "@/lib/hangul";

export const revalidate = 3600;

type MediaRow = { slug: string; gifUrl: string | null; imageUrl: string | null; hangul: string | null };

export default async function DefinePage() {
  const terms = await prisma.codedTerm.findMany({
    include: {
      definitions: { orderBy: { votesUp: "desc" }, take: 1 },
      _count: { select: { annotations: true } },
    },
    orderBy: { term: "asc" },
  });

  // Card media (GIF / image / hangul) — read defensively: the SlangMedia table is
  // self-healing and may not exist yet, in which case the deck falls back to
  // branded gradient cards. (See app/api/admin/slang-media/route.ts.)
  const media = new Map<string, MediaRow>();
  try {
    const rows = await prisma.$queryRawUnsafe<MediaRow[]>(
      `SELECT "slug","gifUrl","imageUrl","hangul" FROM "SlangMedia"`,
    );
    for (const r of rows) media.set(r.slug, r);
  } catch { /* table not created yet → gradient cards */ }

  // Only terms that actually have a definition make good flash-cards.
  const deckTerms: DeckTerm[] = terms
    .filter((t) => t.definitions[0])
    .map((t) => {
      const d = t.definitions[0];
      const m = media.get(t.slug);
      return {
        slug: t.slug,
        term: t.term,
        // Prefer the curated Hangul (SlangMedia), else pull it from the definition.
        hangul: m?.hangul ?? hangulFromDefinition(d.body),
        gifUrl: m?.gifUrl ?? null,
        imageUrl: m?.imageUrl ?? null,
        def: d.body,
        defEs: d.bodyEs,
        example: d.example,
        exampleEs: d.exampleEs,
        songCount: t._count.annotations,
      };
    });

  return (
    <main>
      {/* Hero — the pitch */}
      <section style={{ background: "#000", color: "#fff", padding: "56px 24px 36px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <LangToggle align="flex-start" marginBottom={16} />
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            <T en="Slang Deck · Daily 10" es="Mazo de Jerga · 10 del día" />
          </div>
          <h1 style={{ fontSize: "2.6rem", fontWeight: 900, margin: "0 0 12px", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            <T en="Learn the K-pop slang your Korean mutuals actually use." es="Aprende la jerga K-pop que de verdad usan tus mutuals coreanos." />
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.02rem", maxWidth: 560, lineHeight: 1.6 }}>
            <T
              en="A fresh stack of 10 every day. Swipe right to save it to your deck, left to skip, tap to flip and learn. Half of it is Konglish — finally explained so you can talk back online."
              es="Un mazo nuevo de 10 cada día. Desliza a la derecha para guardar, izquierda para pasar, toca para girar y aprender. La mitad es konglish — por fin explicado para que puedas responder en línea."
            />
          </p>
          <div style={{ marginTop: 20 }}>
            <Link href="/quiz/korean-slang" style={{ display: "inline-block", background: "var(--genius-yellow)", color: "#000", fontWeight: 700, fontSize: "0.85rem", padding: "11px 20px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.02em" }}>
              <T
                en="Think you know your slang? Take the 10-question quiz →"
                es="¿Crees que dominas la jerga? Haz el quiz de 10 preguntas →"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* The deck */}
      <div style={{ padding: "36px 20px 8px" }}>
        <SlangDeck terms={deckTerms} />
      </div>

      {/* Browse-all A–Z index (crawlable — keeps the dictionary discoverable) */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 56px" }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <T en={`Browse all ${terms.length} terms A–Z`} es={`Explora los ${terms.length} términos A–Z`} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {terms.map((term) => {
            const topDef = term.definitions[0];
            return (
              <Link key={term.id} href={`/korean-slang/${term.slug}`} style={{ textDecoration: "none" }}>
                <div className="genius-card" style={{ padding: 18, height: "100%" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#ff6fa8", marginBottom: 8 }}>
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
                    <div style={{ fontSize: "0.86rem", color: "#fff", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {topDef.body}
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

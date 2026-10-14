/**
 * Server-side loader for the Korean-slang deck data — the single source of truth
 * shared by the deck page (/korean-slang) and the practice quiz
 * (/korean-slang/quiz), so both always draw from the same set of terms.
 *
 * `DeckTerm` lives here (not in the SlangDeck client component) so server pages
 * and the quiz can reference the shape without importing a client module.
 */

import { prisma } from "@/lib/prisma";
import { hangulFromDefinition, romanizeHangul } from "@/lib/hangul";

export type DeckTerm = {
  slug: string;
  term: string;
  hangul?: string | null;
  roman?: string | null;
  gifUrl?: string | null;
  imageUrl?: string | null;
  def: string;
  defEs?: string | null;
  example?: string | null;
  exampleEs?: string | null;
  songCount: number;
};

type MediaRow = { slug: string; gifUrl: string | null; imageUrl: string | null; hangul: string | null };

async function loadTerms() {
  return prisma.codedTerm.findMany({
    include: {
      definitions: { orderBy: { votesUp: "desc" }, take: 1 },
      _count: { select: { annotations: true } },
    },
    orderBy: { term: "asc" },
  });
}

export type SlangTermRow = Awaited<ReturnType<typeof loadTerms>>[number];

/**
 * Load every slang term plus its top definition, and derive the flash-card deck.
 * Returns the raw rows (for the A–Z index) alongside the `DeckTerm[]` used by the
 * deck + quiz, and a `hangulOf` helper so callers resolve Korean the same way.
 */
export async function getSlangData() {
  const terms = await loadTerms();

  // Card media (GIF / image / hangul). The SlangMedia table is self-healing and
  // may not exist yet, in which case cards fall back to branded gradients.
  const media = new Map<string, MediaRow>();
  try {
    const rows = await prisma.$queryRawUnsafe<MediaRow[]>(
      `SELECT "slug","gifUrl","imageUrl","hangul" FROM "SlangMedia"`,
    );
    for (const r of rows) media.set(r.slug, r);
  } catch { /* table not created yet → gradient cards */ }

  const hangulOf = (slug: string, body: string | null | undefined) =>
    media.get(slug)?.hangul ?? hangulFromDefinition(body);

  // Only terms that actually have a definition make good flash-cards / quiz items.
  const deckTerms: DeckTerm[] = terms
    .filter((t) => t.definitions[0])
    .map((t) => {
      const d = t.definitions[0];
      const m = media.get(t.slug);
      const hangul = hangulOf(t.slug, d.body);
      return {
        slug: t.slug,
        term: t.term,
        hangul,
        roman: romanizeHangul(hangul),
        gifUrl: m?.gifUrl ?? null,
        imageUrl: m?.imageUrl ?? null,
        def: d.body,
        defEs: d.bodyEs,
        example: d.example,
        exampleEs: d.exampleEs,
        songCount: t._count.annotations,
      };
    });

  return { terms, deckTerms, hangulOf };
}

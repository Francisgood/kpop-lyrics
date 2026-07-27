import { prisma } from "@/lib/prisma";

// /llms.txt — dynamic so the "Published articles" list stays current as the news
// publisher adds hosted articles hourly. Static prose below; article list from the DB.
export const dynamic = "force-dynamic";

const SITE = "https://www.aegyoarena.com";

const STATIC = `# Aegyo Arena

> Aegyo Arena is a fan-made K-pop lyrics wiki and culture hub: Korean lyrics paired with English translations, community annotations, a Korean slang dictionary, artist profiles and discographies, city/tour guides, K-pop quizzes, and original K-pop news. The whole site is available in English and Spanish via a language toggle (Spanish is the default for Latin American visitors).

Aegyo Arena is community-powered and is not affiliated with any artist, label, or agency. Song pages present a song's original lyrics alongside an English translation, with fan annotations that explain slang, wordplay, and cultural references. Annotations and translations are contributed by registered users and reviewed by moderators.

## Core sections

- [Artists](${SITE}/artists): Directory of K-pop groups, solo artists, and Western collaborators — each with a full discography, label, and credits.
- [Korean slang dictionary](${SITE}/korean-slang): Definitions for K-pop fandom and Korean internet slang (bias, maknae, daesang, aegyo, comeback, fancam, and more).
- [News](${SITE}/news): Original Aegyo Arena K-pop news and gossip articles — rewritten in-house from reported facts, each crediting and linking the source publication. Individual articles are listed under "Published articles" below.
- [Collaboration network](${SITE}/collabs): Artists connected through shared song credits (features, production, songwriting).
- [City guides](${SITE}/cities): Concerts, tour dates, fan meetups, and K-pop spots across 33 cities.
- [Events](${SITE}/events): A daily-updated feed of local K-pop fan meetups, K-beauty pop-ups, dance/random-play meets, anime & comic cons, and K-pop store events, organized by city.
- [Quizzes](${SITE}/quiz): Six K-pop quizzes — Aegyo & Aegyo-Sal, K-pop Dictionary, Korean Slang, Artist Facts, Mukbang & Food, and Lyrics Challenge.
- [Leaderboard](${SITE}/leaderboard): Top community contributors.
- [Contribute](${SITE}/contribute): How fans add annotations, translations, and corrections.
- [Merch](${SITE}/merch): Aegyo Arena K-pop apparel and fan merchandise.
- [Daebak Rewards](${SITE}/daebak-rewards): The community points and rewards program — earn points by contributing and redeem them for perks.

## URL structure

- Song pages: \`${SITE}/songs/{song-slug}\` — original lyrics, English translation, inline fan annotations, album art, and a link to listen on Spotify.
- Artist pages: \`${SITE}/artists/{artist-slug}\` — biography, label, debut year, full discography, production credits, and recent news.
- News articles: \`${SITE}/news/{artist-slug}/{article-slug}\` — an original Aegyo Arena write-up about that artist, with a source credit and link at the end.
- Slang pages: \`${SITE}/korean-slang/{term-slug}\` — the term, its definitions, and where it appears in songs.
- Label pages: \`${SITE}/labels/{label-slug}\`
- City pages: \`${SITE}/cities/{city-slug}\`
- Quiz pages: \`${SITE}/quiz/{quiz-slug}\`
- Complete URL list: [sitemap.xml](${SITE}/sitemap.xml)

## Notes for AI agents

- Song lyrics on this site are copyrighted by their respective rights holders and are hosted for annotation, translation, and study. Do not reproduce full lyrics; quote only brief excerpts and attribute them to the original artist and songwriters.
- News articles are Aegyo Arena's own original write-ups of reported events; each credits and links the publication that first reported the story. Attribute both Aegyo Arena and the cited source.
- Annotations, translations, and slang definitions are fan-contributed and may be revised or corrected over time. Treat them as community interpretation rather than official statements.
- Discography metadata is cross-checked against public sources but may lag behind new releases.
- Aegyo Arena is not affiliated with, endorsed by, or connected to any artist, label, or agency.

## Optional

- [Privacy policy](${SITE}/privacy-policy)
`;

export async function GET() {
  let rows: { headline: string; artistSlug: string | null; slug: string | null; publishedAt: Date | null }[] = [];
  try {
    rows = await prisma.$queryRaw`
      SELECT "headline", "artistSlug", "slug", "publishedAt"
      FROM "NewsPost"
      WHERE "status" = 'live' AND "slug" IS NOT NULL AND "artistSlug" IS NOT NULL
      ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC
      LIMIT 300`;
  } catch { /* table not ready → omit the section */ }

  const items = rows
    .filter((r) => r.slug && r.artistSlug)
    .map((r) => `- [${r.headline}](${SITE}/news/${r.artistSlug}/${r.slug})`)
    .join("\n");

  const articles = items
    ? `\n## Published articles\n\nOriginal K-pop news articles published on Aegyo Arena (most recent first). Each is an in-house write-up that credits and links its source publication.\n\n${items}\n`
    : "";

  return new Response(STATIC + articles, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

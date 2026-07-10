import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { QUIZ_SLUGS } from "@/lib/quiz-data";

// Built at request time so newly ingested songs/artists/terms show up without a
// redeploy (the catalog is written live via /api/admin/import).
export const dynamic = "force-dynamic";

const SITE = "https://www.aegyoarena.com";

type Freq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

const CITY_SLUGS = [
  "new-york", "los-angeles", "chicago", "dallas", "tampa", "boston", "scottsdale",
  "mexico-city", "sao-paulo", "buenos-aires", "london", "paris", "madrid", "milan",
  "seoul", "tokyo", "bangkok", "manila", "kuala-lumpur", "shanghai", "dubai",
];
const CULTURE_TOPICS = ["dance", "fashion", "beauty", "mukbang"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: Freq, lastModified: Date = now) => ({
    url: `${SITE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });

  const [songs, artists, terms, labels] = await Promise.all([
    prisma.song.findMany({ select: { slug: true, createdAt: true } }),
    prisma.artist.findMany({ select: { slug: true, createdAt: true } }),
    prisma.codedTerm.findMany({ select: { slug: true, createdAt: true } }),
    prisma.label.findMany({ select: { slug: true } }),
  ]);

  return [
    // ── Core pages ──────────────────────────────────────────────────────────
    entry("", 1.0, "daily"),
    entry("/artists", 0.9, "weekly"),
    entry("/korean-slang", 0.8, "weekly"),
    entry("/news", 0.8, "daily"),
    entry("/quiz", 0.8, "weekly"),
    entry("/collabs", 0.7, "weekly"),
    entry("/cities", 0.7, "weekly"),
    entry("/bts-giveaway", 0.7, "weekly"),
    entry("/leaderboard", 0.5, "daily"),
    entry("/contribute", 0.5, "monthly"),
    entry("/merch", 0.5, "monthly"),
    entry("/daebak-rewards", 0.5, "monthly"),
    entry("/privacy-policy", 0.2, "yearly"),
    entry("/bts-sweepstakes-terms", 0.2, "yearly"),

    // ── Static-set dynamic routes ───────────────────────────────────────────
    ...QUIZ_SLUGS.map((s) => entry(`/quiz/${s}`, 0.7, "monthly")),
    ...CULTURE_TOPICS.map((t) => entry(`/culture/${t}`, 0.6, "monthly")),
    ...CITY_SLUGS.map((c) => entry(`/cities/${c}`, 0.6, "monthly")),

    // ── Catalog ─────────────────────────────────────────────────────────────
    ...artists.map((a) => entry(`/artists/${a.slug}`, 0.8, "weekly", a.createdAt)),
    ...songs.map((s) => entry(`/songs/${s.slug}`, 0.7, "monthly", s.createdAt)),
    ...terms.map((t) => entry(`/korean-slang/${t.slug}`, 0.6, "monthly", t.createdAt)),
    ...labels.map((l) => entry(`/labels/${l.slug}`, 0.4, "monthly")),
  ];
}

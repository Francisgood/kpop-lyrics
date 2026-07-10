import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { QUIZ_SLUGS } from "@/lib/quiz-data";

// Cached and revalidated hourly: Googlebot always gets a fast, stable response
// instead of triggering a live catalog query on every fetch. New songs/artists
// ingested via /api/admin/import appear within the hour.
export const revalidate = 3600;

const SITE = "https://www.aegyoarena.com";

type Freq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

const CITY_SLUGS = [
  "new-york", "los-angeles", "chicago", "dallas", "tampa", "boston", "scottsdale",
  "mexico-city", "sao-paulo", "buenos-aires", "london", "paris", "madrid", "milan",
  "seoul", "tokyo", "bangkok", "manila", "kuala-lumpur", "shanghai", "dubai",
];
const CULTURE_TOPICS = ["dance", "fashion", "beauty", "mukbang"];

type Row = { slug: string; createdAt?: Date };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  // Date-only W3C format (YYYY-MM-DD) — the most widely accepted lastmod form.
  // Never emit a future date: Google ignores/flags lastmod values ahead of "now".
  const ymd = (d?: Date | null): string => ((d && d < now ? d : now)).toISOString().slice(0, 10);
  const today = ymd(now);

  const entry = (path: string, priority: number, changeFrequency: Freq, lastModified: string = today) => ({
    url: `${SITE}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });

  // Fail-safe: if the catalog query fails we still return a valid sitemap of the
  // static routes rather than a 500 (which Google reports as "couldn't be read").
  let songs: Row[] = [], artists: Row[] = [], terms: Row[] = [], labels: Row[] = [];
  try {
    [songs, artists, terms, labels] = await Promise.all([
      prisma.song.findMany({ select: { slug: true, createdAt: true } }),
      prisma.artist.findMany({ select: { slug: true, createdAt: true } }),
      prisma.codedTerm.findMany({ select: { slug: true, createdAt: true } }),
      prisma.label.findMany({ select: { slug: true } }),
    ]);
  } catch (e) {
    console.error("[sitemap] catalog query failed — serving static routes only:", e);
  }

  return [
    // ── Core pages ──────────────────────────────────────────────────────────
    entry("/", 1.0, "daily"),
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
    ...artists.map((a) => entry(`/artists/${a.slug}`, 0.8, "weekly", ymd(a.createdAt))),
    ...songs.map((s) => entry(`/songs/${s.slug}`, 0.7, "monthly", ymd(s.createdAt))),
    ...terms.map((t) => entry(`/korean-slang/${t.slug}`, 0.6, "monthly", ymd(t.createdAt))),
    ...labels.map((l) => entry(`/labels/${l.slug}`, 0.4, "monthly")),
  ];
}

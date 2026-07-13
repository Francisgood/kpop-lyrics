import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { QUIZ_SLUGS } from "@/lib/quiz-data";

// MUST be request-time: with `revalidate` Next generates this at BUILD time,
// where Prisma has no DB connection — which silently produced a static-only
// sitemap. Generating per request also means catalog ingested via
// /api/admin/import appears immediately, with no redeploy.
export const dynamic = "force-dynamic";

const SITE = "https://www.aegyoarena.com";

type Freq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

const CITY_SLUGS = [
  "new-york", "los-angeles", "chicago", "dallas", "tampa", "boston", "scottsdale", "toronto",
  "mexico-city", "guadalajara", "monterrey", "puebla", "tijuana", "chihuahua",
  "sao-paulo", "rio-de-janeiro", "buenos-aires", "santiago", "bogota", "medellin",
  "london", "paris", "madrid", "milan",
  "seoul", "tokyo", "bangkok", "manila", "kuala-lumpur", "shanghai", "dubai",
  "melbourne", "sydney",
];
const CULTURE_TOPICS = ["dance", "fashion", "beauty", "mukbang"];

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

  // Deliberately NOT wrapped in try/catch: if the catalog is unreachable we want
  // the request to fail so Google retries and keeps its known URLs, rather than
  // silently serving a truncated sitemap that drops ~2,200 pages from discovery.
  const [songs, artists, terms, labels] = await Promise.all([
    prisma.song.findMany({ select: { slug: true, createdAt: true } }),
    prisma.artist.findMany({ select: { slug: true, createdAt: true } }),
    prisma.codedTerm.findMany({ select: { slug: true, createdAt: true } }),
    prisma.label.findMany({ select: { slug: true } }),
  ]);

  return [
    // ── Core pages ──────────────────────────────────────────────────────────
    entry("/", 1.0, "daily"),
    entry("/artists", 0.9, "weekly"),
    entry("/korean-slang", 0.8, "weekly"),
    entry("/news", 0.8, "daily"),
    entry("/quiz", 0.8, "weekly"),
    entry("/collabs", 0.7, "weekly"),
    entry("/cities", 0.7, "weekly"),
    entry("/cities/meetups", 0.7, "weekly"),
    entry("/events", 0.7, "daily"),
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

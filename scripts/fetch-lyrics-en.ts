/**
 * Fetch English translations from Genius for songs that have Korean lyrics
 * but no English translation. Run this after fetch-lyrics-genius.ts.
 *
 * Strategy:
 *   1. Find songs with lyricsKo but no lyricsEn
 *   2. Search Genius API for "{artist} {title} English Translation"
 *   3. Accept only results attributed to "Genius English Translations"
 *   4. Scrape the translation page — full entity decoding
 *   5. Write lyricsEn to DB
 *
 * Never generates or infers translations. Skips if no Genius translation exists.
 * Audit appended to public/scraped/lyrics-en-audit.json
 *
 * Usage:
 *   GENIUS_TOKEN="..." DATABASE_URL="..." DIRECT_URL="..." \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-lyrics-en.ts
 *
 * Flags:
 *   --artist <slug>     Only process songs for this artist
 *   --limit <n>         Stop after N songs
 *   --dry-run           No DB writes
 *   --slug <song-slug>  Update a single specific song
 */

import { prisma } from "../lib/prisma";
import * as fs from "fs";
import * as path from "path";

// ─── Config ───────────────────────────────────────────────────────────────────

const GENIUS_TOKEN =
  process.env.GENIUS_TOKEN ||
  "cwf7vDQbKWyVJTX0GFqnVu2Weh_o13qcoYz5gBBVA5Fs6U0qmJGc4MyMCvz5M6Vj";

const DRY_RUN     = process.argv.includes("--dry-run");
const ARTIST_FILTER = (() => { const i = process.argv.indexOf("--artist"); return i !== -1 ? process.argv[i + 1] : null; })();
const SONG_SLUG   = (() => { const i = process.argv.indexOf("--slug"); return i !== -1 ? process.argv[i + 1] : null; })();
const LIMIT       = (() => { const i = process.argv.indexOf("--limit"); return i !== -1 ? parseInt(process.argv[i + 1], 10) : undefined; })();
const AUDIT_PATH  = path.join("public", "scraped", "lyrics-en-audit.json");

type AuditEntry = {
  songSlug: string;
  songTitle: string;
  artist: string;
  status: "updated" | "no_match" | "failed" | "skipped" | "dry_run";
  geniusUrl?: string;
  lines?: number;
  reason?: string;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

function normalize(s: string) {
  return s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function wordOverlap(a: string, b: string): number {
  const wa = new Set(normalize(a).split(" ").filter(Boolean));
  const wb = new Set(normalize(b).split(" ").filter(Boolean));
  if (!wa.size && !wb.size) return 1;
  const inter = [...wa].filter((w) => wb.has(w)).length;
  return inter / new Set([...wa, ...wb]).size;
}

/** Full HTML entity decode + br→newline + tag strip */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c, 10)));
}

// ─── Genius API ───────────────────────────────────────────────────────────────

async function geniusSearch(query: string): Promise<any[]> {
  const res = await fetch(
    `https://api.genius.com/search?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Bearer ${GENIUS_TOKEN}` } }
  );
  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) throw new Error(`Genius API ${res.status}`);
  const data = (await res.json()) as any;
  return data?.response?.hits?.filter((h: any) => h.type === "song").map((h: any) => h.result) ?? [];
}

/** Find the Genius English Translation page for a song */
async function findEnTranslation(artistName: string, title: string): Promise<{ url: string; geniusTitle: string } | null> {
  const hits = await geniusSearch(`${artistName} ${title} English Translation`);

  for (const hit of hits.slice(0, 8)) {
    const pa: string = hit.primary_artist?.name ?? "";
    const isTranslation =
      pa.toLowerCase().includes("english translation") ||
      pa.toLowerCase().includes("genius english") ||
      hit.title?.toLowerCase().includes("english translation");

    if (!isTranslation) continue;

    // Verify the song title matches
    const titleClean = (hit.title as string)
      .replace(/\(English Translation\)/i, "")
      .replace(/NewJeans\s*-\s*/i, "")
      .replace(/^[^-]+-\s*/,"")
      .trim();

    if (wordOverlap(title, titleClean) >= 0.4) {
      return { url: hit.url, geniusTitle: hit.title };
    }
  }
  return null;
}

// ─── Lyrics scraping ──────────────────────────────────────────────────────────

async function scrapeLyricsPage(pageUrl: string): Promise<string | null> {
  const res = await fetch(pageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
    },
  });
  if (!res.ok) return null;
  const html = await res.text();

  const parts: string[] = [];
  let depth = 0, inContainer = false, buf = "";
  const tokens = html.split(/(<[^>]+>)/);

  for (const tok of tokens) {
    if (tok.startsWith("<") && /data-lyrics-container="true"/.test(tok)) {
      inContainer = true; depth = 1; buf = ""; continue;
    }
    if (inContainer) {
      if (tok.startsWith("</div")) {
        depth--;
        if (depth <= 0) {
          const t = htmlToText(buf).trim();
          if (t) parts.push(t);
          inContainer = false; buf = ""; continue;
        }
      } else if (tok.startsWith("<div")) {
        depth++;
      }
      buf += tok;
    }
  }

  if (parts.length === 0) return null;

  const raw = parts.join("\n\n");
  // Strip the page header (contributors line) — keep from first section marker onward
  const firstSection = raw.indexOf("\n[");
  return firstSection > 0 ? raw.slice(firstSection + 1).trim() : raw.trim();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("══════════════════════════════════════════════════");
  console.log("  Aegyo Arena — Fetch English Translations (Genius)");
  if (DRY_RUN) console.log("  [DRY RUN]");
  if (ARTIST_FILTER) console.log(`  Artist: ${ARTIST_FILTER}`);
  if (SONG_SLUG) console.log(`  Song:   ${SONG_SLUG}`);
  console.log("══════════════════════════════════════════════════\n");

  // Load existing audit for resume support
  let existingAudit: AuditEntry[] = [];
  if (fs.existsSync(AUDIT_PATH)) {
    try { existingAudit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf-8")).entries ?? []; } catch {}
  }
  const alreadyDone = new Set(
    existingAudit.filter((e) => e.status === "updated" || e.status === "no_match" || e.status === "skipped").map((e) => e.songSlug)
  );

  // Query songs: have Korean lyrics, missing English
  const where: Record<string, any> = {
    lyricsKo: { not: null },
    lyricsEn: null,
  };
  if (SONG_SLUG) {
    where.slug = SONG_SLUG;
  } else {
    if (ARTIST_FILTER) {
      where.album = { artist: { slug: { contains: ARTIST_FILTER, mode: "insensitive" } } };
    }
    // Skip instrumentals
    where.AND = [
      { title: { not: { contains: "Inst" } } },
      { title: { not: { contains: "VCR" } } },
      { title: { not: { contains: "Ment" } } },
    ];
  }

  const songs = await prisma.song.findMany({
    where,
    select: {
      id: true, slug: true, title: true,
      album: { select: { artist: { select: { stageName: true, slug: true } } } },
    },
    orderBy: { viewCount: "desc" },
    ...(LIMIT ? { take: LIMIT } : {}),
  });

  const toProcess = SONG_SLUG ? songs : songs.filter((s) => !alreadyDone.has(s.slug));
  console.log(`Songs to process: ${toProcess.length} (${songs.length - toProcess.length} already done)\n`);

  const sessionAudit: AuditEntry[] = [];
  let updated = 0, noMatch = 0, failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const song = toProcess[i];
    const artistName = song.album?.artist?.stageName ?? "Unknown";
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${artistName} — "${song.title}" `);

    try {
      await sleep(400);
      const match = await findEnTranslation(artistName, song.title);

      if (!match) {
        console.log("→ no English translation on Genius");
        sessionAudit.push({ songSlug: song.slug, songTitle: song.title, artist: artistName, status: "no_match", reason: "No Genius English Translation found" });
        noMatch++;
        continue;
      }

      await sleep(700);
      const text = await scrapeLyricsPage(match.url);

      if (!text || text.length < 30) {
        console.log(`→ scrape empty from ${match.url}`);
        sessionAudit.push({ songSlug: song.slug, songTitle: song.title, artist: artistName, status: "failed", geniusUrl: match.url, reason: "Empty scrape" });
        failed++;
        continue;
      }

      const lines = text.split("\n").filter(Boolean).length;
      console.log(`→ ✓ ${lines} lines — ${match.geniusTitle}`);

      if (!DRY_RUN) {
        await prisma.song.update({ where: { id: song.id }, data: { lyricsEn: text } });
      }

      sessionAudit.push({ songSlug: song.slug, songTitle: song.title, artist: artistName, status: DRY_RUN ? "dry_run" : "updated", geniusUrl: match.url, lines });
      updated++;

    } catch (err: any) {
      const msg = (err as Error).message;
      console.log(`→ ERROR: ${msg}`);
      sessionAudit.push({ songSlug: song.slug, songTitle: song.title, artist: artistName, status: "failed", reason: msg });
      failed++;
      if (msg === "RATE_LIMITED") { console.log("  Sleeping 15s..."); await sleep(15000); }
    }

    if ((i + 1) % 25 === 0) flushAudit([...existingAudit, ...sessionAudit]);
  }

  flushAudit([...existingAudit, ...sessionAudit]);

  console.log("\n────────────────────────────────────────────────");
  console.log(`Updated:  ${updated}`);
  console.log(`No match: ${noMatch}  (no Genius English Translation exists)`);
  console.log(`Failed:   ${failed}`);
  console.log(`Audit:    ${AUDIT_PATH}`);
  console.log("\n✅  Done.");
}

function flushAudit(entries: AuditEntry[]) {
  const stats = entries.reduce((a, e) => { a[e.status] = (a[e.status] ?? 0) + 1; return a; }, {} as Record<string, number>);
  fs.writeFileSync(AUDIT_PATH, JSON.stringify({ generated: new Date().toISOString(), stats, entries }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

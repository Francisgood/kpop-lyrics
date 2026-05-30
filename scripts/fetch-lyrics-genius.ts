/**
 * Fetch lyrics from Genius for songs missing them in the database.
 *
 * Strategy:
 *   1. Search Genius API for the song (artist + title)
 *   2. Validate match via artist-name + title similarity — skip if < 40% confidence
 *   3. Scrape the Genius lyrics page (data-lyrics-container elements)
 *   4. Parse into lyricsKo / lyricsEn based on Hangul detection
 *      – never invents or infers text; only stores what Genius actually returned
 *   5. Write to DB; append every decision to public/scraped/lyrics-audit.json
 *
 * DO NOT hallucinate lyrics. If Genius returns nothing, the song is skipped.
 *
 * Usage:
 *   GENIUS_TOKEN="cwf7..." DATABASE_URL="..." DIRECT_URL="..." \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-lyrics-genius.ts
 *
 * Flags:
 *   --artist <slug>   Only process songs for this artist slug (substring match)
 *   --limit <n>       Stop after N songs
 *   --dry-run         Show matches but skip DB writes
 *   --min-confidence  Override confidence threshold (0-1, default 0.40)
 */

import { prisma } from "../lib/prisma";
import * as fs from "fs";
import * as path from "path";

// ─── Config ───────────────────────────────────────────────────────────────────

const GENIUS_TOKEN =
  process.env.GENIUS_TOKEN ||
  "cwf7vDQbKWyVJTX0GFqnVu2Weh_o13qcoYz5gBBVA5Fs6U0qmJGc4MyMCvz5M6Vj";

const GENIUS_API = "https://api.genius.com";

const DRY_RUN = process.argv.includes("--dry-run");

const ARTIST_FILTER = (() => {
  const i = process.argv.indexOf("--artist");
  return i !== -1 ? process.argv[i + 1] : null;
})();

const LIMIT = (() => {
  const i = process.argv.indexOf("--limit");
  return i !== -1 ? parseInt(process.argv[i + 1], 10) : undefined;
})();

const MIN_CONFIDENCE = (() => {
  const i = process.argv.indexOf("--min-confidence");
  return i !== -1 ? parseFloat(process.argv[i + 1]) : 0.40;
})();

const AUDIT_PATH = path.join("public", "scraped", "lyrics-audit.json");

// ─── Types ────────────────────────────────────────────────────────────────────

type AuditEntry = {
  songSlug: string;
  songTitle: string;
  artist: string;
  status: "updated" | "skipped" | "no_match" | "failed" | "dry_run";
  geniusUrl?: string;
  geniusTitle?: string;
  geniusArtist?: string;
  confidence?: number;
  linesKo?: number;
  linesEn?: number;
  reason?: string;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Jaccard word-overlap similarity between two strings (0–1) */
function similarity(a: string, b: string): number {
  const wa = new Set(normalize(a).split(" ").filter(Boolean));
  const wb = new Set(normalize(b).split(" ").filter(Boolean));
  if (wa.size === 0 && wb.size === 0) return 1;
  const intersection = [...wa].filter((w) => wb.has(w)).length;
  const union = new Set([...wa, ...wb]).size;
  return intersection / union;
}

function hasHangul(text: string): boolean {
  return /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(text);
}

/** Strip HTML tags and decode entities, treating <br> as newlines */
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
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

// ─── Genius API ───────────────────────────────────────────────────────────────

async function geniusSearch(query: string): Promise<any[]> {
  const url = `${GENIUS_API}/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${GENIUS_TOKEN}` },
  });
  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) throw new Error(`Genius search ${res.status}`);
  const data = (await res.json()) as any;
  return (
    data?.response?.hits
      ?.filter((h: any) => h.type === "song")
      .map((h: any) => h.result) ?? []
  );
}

// ─── Lyrics scraping ──────────────────────────────────────────────────────────

async function scrapeGeniusLyrics(pageUrl: string): Promise<string | null> {
  const res = await fetch(pageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
      "Cache-Control": "no-cache",
    },
  });
  if (!res.ok) return null;
  const html = await res.text();

  // Primary: data-lyrics-container divs (Genius current HTML)
  const parts: string[] = [];

  // Match each container — grab everything until the matching closing tag
  let depth = 0;
  let inContainer = false;
  let buf = "";
  const tokens = html.split(/(<[^>]+>)/);
  for (const tok of tokens) {
    if (tok.startsWith("<") && /data-lyrics-container="true"/.test(tok)) {
      inContainer = true;
      depth = 1;
      buf = "";
      continue;
    }
    if (inContainer) {
      if (tok.startsWith("</div")) {
        depth--;
        if (depth <= 0) {
          const text = htmlToText(buf).trim();
          if (text) parts.push(text);
          inContainer = false;
          buf = "";
          continue;
        }
      } else if (tok.startsWith("<div")) {
        depth++;
      }
      buf += tok;
    }
  }

  if (parts.length === 0) {
    // Fallback pattern — broader match
    const re = /data-lyrics-container="true"[^>]*>([\s\S]{80,8000}?)<\/div>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const text = htmlToText(m[1]).trim();
      if (text.length > 30) parts.push(text);
    }
  }

  return parts.length > 0 ? parts.join("\n\n").trim() : null;
}

/**
 * Split raw Genius lyrics into Korean and English fields.
 * Rules:
 *  - If the text contains Hangul: lyricsKo = the text, lyricsEn = null
 *    (unless Genius has embedded an English translation section)
 *  - If no Hangul: lyricsEn = the text (English-primary song like Dynamite)
 *  - lyricsRomanized is never generated — too error-prone without a validated source
 *  - Section headers like [Verse 1] are preserved in whichever field is populated
 */
function parseLyricsFields(raw: string): {
  lyricsKo: string | null;
  lyricsRomanized: string | null;
  lyricsEn: string | null;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { lyricsKo: null, lyricsRomanized: null, lyricsEn: null };

  if (!hasHangul(trimmed)) {
    // English-only K-pop song (Dynamite, Butter, Ice Cream, etc.)
    return { lyricsKo: null, lyricsRomanized: null, lyricsEn: trimmed };
  }

  // Korean song — check if Genius embedded an English translation section
  // Some annotated Genius pages have "English Translation" blocks
  const lines = trimmed.split("\n");
  const koLines: string[] = [];
  const enLines: string[] = [];
  let inEnSection = false;

  for (const line of lines) {
    const t = line.trim();

    // English translation section markers
    if (/^English Translation:?\s*$/i.test(t) || /^\[English Translation\]/i.test(t)) {
      inEnSection = true;
      enLines.push("[English Translation]");
      continue;
    }
    // Korean section marker (revert to ko mode)
    if (/^Korean:?\s*$/i.test(t) || /^\[Korean\]/i.test(t)) {
      inEnSection = false;
      koLines.push("[Korean]");
      continue;
    }

    if (inEnSection) {
      enLines.push(t);
    } else {
      koLines.push(t);
    }
  }

  const lyricsKo = koLines.join("\n").trim() || null;
  const lyricsEn = inEnSection && enLines.length > 1 ? enLines.join("\n").trim() : null;

  return { lyricsKo, lyricsRomanized: null, lyricsEn };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("══════════════════════════════════════════════════");
  console.log("  Aegyo Arena — Fetch Lyrics from Genius API");
  if (DRY_RUN) console.log("  [DRY RUN — DB writes disabled]");
  if (ARTIST_FILTER) console.log(`  Artist filter: ${ARTIST_FILTER}`);
  if (LIMIT) console.log(`  Limit: ${LIMIT} songs`);
  console.log(`  Min confidence: ${(MIN_CONFIDENCE * 100).toFixed(0)}%`);
  console.log("══════════════════════════════════════════════════\n");

  // Load existing audit if present (for resume support)
  let existingAudit: AuditEntry[] = [];
  if (fs.existsSync(AUDIT_PATH)) {
    try {
      const prev = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf-8"));
      existingAudit = prev.entries ?? [];
    } catch {}
  }
  const alreadyProcessed = new Set(
    existingAudit
      .filter((e) => e.status === "updated" || e.status === "skipped" || e.status === "no_match")
      .map((e) => e.songSlug)
  );

  // Query songs with no lyrics
  const where: Record<string, any> = {
    AND: [{ lyricsKo: null }, { lyricsEn: null }],
  };
  if (ARTIST_FILTER) {
    where.AND.push({
      album: {
        artist: { slug: { contains: ARTIST_FILTER, mode: "insensitive" } },
      },
    });
  }

  const songs = await prisma.song.findMany({
    where,
    select: {
      id: true,
      slug: true,
      title: true,
      album: {
        select: {
          artist: { select: { stageName: true, slug: true } },
        },
      },
    },
    orderBy: { viewCount: "desc" },
    ...(LIMIT ? { take: LIMIT } : {}),
  });

  // Filter out already-processed songs
  const toProcess = songs.filter((s) => !alreadyProcessed.has(s.slug));
  console.log(
    `Songs needing lyrics: ${songs.length} total, ${toProcess.length} unprocessed\n`
  );

  const sessionAudit: AuditEntry[] = [];
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const song = toProcess[i];
    const artistName = song.album?.artist?.stageName ?? "Unknown";
    const label = `[${i + 1}/${toProcess.length}]`;

    process.stdout.write(`${label} ${artistName} — "${song.title}" `);

    try {
      // 1. Search Genius
      await sleep(400); // rate limit buffer
      const hits = await geniusSearch(`${artistName} ${song.title}`);

      if (hits.length === 0) {
        console.log("→ no Genius results");
        sessionAudit.push({
          songSlug: song.slug,
          songTitle: song.title,
          artist: artistName,
          status: "no_match",
          reason: "No Genius search results",
        });
        skipped++;
        continue;
      }

      // 2. Pick best hit (title × 0.6 + artist × 0.4)
      let bestHit = hits[0];
      let bestScore = 0;
      for (const hit of hits.slice(0, 5)) {
        const ts = similarity(song.title, hit.title ?? "");
        const as_ = similarity(
          artistName,
          hit.primary_artist?.name ?? hit.artist_names ?? ""
        );
        const score = ts * 0.6 + as_ * 0.4;
        if (score > bestScore) {
          bestScore = score;
          bestHit = hit;
        }
      }

      // 3. Validate confidence
      if (bestScore < MIN_CONFIDENCE) {
        console.log(
          `→ low confidence ${(bestScore * 100).toFixed(0)}% — best: "${bestHit.title}" by ${bestHit.primary_artist?.name}`
        );
        sessionAudit.push({
          songSlug: song.slug,
          songTitle: song.title,
          artist: artistName,
          status: "no_match",
          geniusTitle: bestHit.title,
          geniusArtist: bestHit.primary_artist?.name,
          confidence: bestScore,
          reason: `Confidence ${(bestScore * 100).toFixed(0)}% below ${(MIN_CONFIDENCE * 100).toFixed(0)}% threshold`,
        });
        skipped++;
        continue;
      }

      // 4. Scrape Genius lyrics page
      await sleep(700);
      const raw = await scrapeGeniusLyrics(bestHit.url);

      if (!raw || raw.length < 40) {
        console.log(
          `→ scrape empty (confidence ${(bestScore * 100).toFixed(0)}%)`
        );
        sessionAudit.push({
          songSlug: song.slug,
          songTitle: song.title,
          artist: artistName,
          status: "failed",
          geniusUrl: bestHit.url,
          geniusTitle: bestHit.title,
          geniusArtist: bestHit.primary_artist?.name,
          confidence: bestScore,
          reason: "Lyrics page returned empty or too short — may be JS-rendered",
        });
        failed++;
        continue;
      }

      // 5. Parse into fields
      const { lyricsKo, lyricsRomanized, lyricsEn } = parseLyricsFields(raw);

      if (!lyricsKo && !lyricsEn) {
        console.log("→ parsed empty");
        sessionAudit.push({
          songSlug: song.slug,
          songTitle: song.title,
          artist: artistName,
          status: "failed",
          geniusUrl: bestHit.url,
          confidence: bestScore,
          reason: "Lyrics parsed to empty strings",
        });
        failed++;
        continue;
      }

      const koLines = (lyricsKo ?? "").split("\n").filter(Boolean).length;
      const enLines = (lyricsEn ?? "").split("\n").filter(Boolean).length;

      console.log(
        `→ ✓ ${(bestScore * 100).toFixed(0)}% conf | ${koLines}ko + ${enLines}en lines`
      );

      // 6. Write to DB
      if (!DRY_RUN) {
        const updateData: Record<string, string | null> = {};
        if (lyricsKo) updateData.lyricsKo = lyricsKo;
        if (lyricsEn) updateData.lyricsEn = lyricsEn;
        // lyricsRomanized intentionally skipped — no reliable automated source

        await prisma.song.update({
          where: { id: song.id },
          data: updateData,
        });
      }

      sessionAudit.push({
        songSlug: song.slug,
        songTitle: song.title,
        artist: artistName,
        status: DRY_RUN ? "dry_run" : "updated",
        geniusUrl: bestHit.url,
        geniusTitle: bestHit.title,
        geniusArtist: bestHit.primary_artist?.name,
        confidence: bestScore,
        linesKo: koLines,
        linesEn: enLines,
      });
      updated++;
    } catch (err: any) {
      const msg = (err as Error).message ?? String(err);
      console.log(`→ ERROR: ${msg}`);
      sessionAudit.push({
        songSlug: song.slug,
        songTitle: song.title,
        artist: song.album?.artist?.stageName ?? "Unknown",
        status: "failed",
        reason: msg,
      });
      failed++;

      if (msg === "RATE_LIMITED") {
        console.log("  Rate limited — waiting 15s...");
        await sleep(15000);
      }
    }

    // Flush audit every 25 songs so progress is saved even on crash
    if ((i + 1) % 25 === 0) {
      flushAudit([...existingAudit, ...sessionAudit]);
    }
  }

  // Final audit write
  flushAudit([...existingAudit, ...sessionAudit]);

  console.log("\n────────────────────────────────────────────────");
  console.log(`Updated:   ${updated}`);
  console.log(`Skipped:   ${skipped}  (low confidence or no results)`);
  console.log(`Failed:    ${failed}  (scrape errors — check audit)`);
  console.log(`Audit log: ${AUDIT_PATH}`);
  console.log("\n✅  Done.");
}

function flushAudit(entries: AuditEntry[]) {
  const stats = entries.reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  fs.writeFileSync(
    AUDIT_PATH,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        stats,
        validation_sources: [
          "Genius API — artist name + title similarity ≥ 40%",
          "Lyrics scraped from genius.com pages only — no AI generation",
          "All matches logged here for manual cross-reference",
          "Reference sites for manual review: soompi.com, allkpop.com, koreaboo.com, thebiaslist.com, genius.com",
        ],
        entries,
      },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// ── Curated idol video clips per term ─────────────────────────────────────────
// videoId = YouTube video ID. start = seconds offset. idol = who says it.
// caption = what they're saying/doing in the clip.
const TERM_VIDEOS: Record<string, { videoId: string; start: number; idol: string; caption: string }> = {
  "bias": {
    videoId: "BmAV8-X0Pww",
    start: 0,
    idol: "BTS on The Tonight Show",
    caption: "BTS explain what a \"bias\" is to Jimmy Fallon",
  },
  "stan": {
    videoId: "WGnGGiS3EHc",
    start: 0,
    idol: "BTS on James Corden",
    caption: "BTS react to fan tweets — idol-fan dynamic in real time",
  },
  "maknae": {
    videoId: "9bZkp7q19f0",
    start: 0,
    idol: "BTS — PSY Gangnam Style",
    caption: "The maknae line energy — youngest members' vibe captured",
  },
  "comeback": {
    videoId: "ioNng23DkIM",
    start: 0,
    idol: "BLACKPINK — How You Like That",
    caption: "BLACKPINK delivering the iconic 2020 comeback stage",
  },
  "fancam": {
    videoId: "IHNzOHi8sJs",
    start: 0,
    idol: "Lisa — LALISA M/V Fancam",
    caption: "Lisa's fancam — why fancams are a K-pop staple",
  },
  "daesang": {
    videoId: "qT8JfBk8qqI",
    start: 0,
    idol: "BTS — Melon Music Awards",
    caption: "BTS accepting a Daesang — the reaction says everything",
  },
  "visual": {
    videoId: "nV8gu4dHEjY",
    start: 0,
    idol: "BLACKPINK — Jisoo focus",
    caption: "Jisoo — officially the group's \"visual\" and why",
  },
  "ot7": {
    videoId: "MBdVXkSdhwU",
    start: 0,
    idol: "BTS — Permission to Dance",
    caption: "All 7 together — what OT7 Army moments look like",
  },
};

function getYoutubeSearchUrl(term: string): string {
  return `https://www.youtube.com/results?search_query=kpop+idol+${encodeURIComponent(term)}+explained`;
}

// ── Lyric line extractor ───────────────────────────────────────────────────────
function extractLyricSnippet(lyrics: string | null, term: string): string | null {
  if (!lyrics) return null;
  const lines = lyrics.split("\n").filter(Boolean);
  const lower = term.toLowerCase();
  const matchIdx = lines.findIndex((l) => l.toLowerCase().includes(lower));
  if (matchIdx === -1) return null;
  const start = Math.max(0, matchIdx - 1);
  const end = Math.min(lines.length - 1, matchIdx + 1);
  return lines.slice(start, end + 1).join("\n");
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const term = await prisma.codedTerm.findUnique({ where: { slug }, include: { definitions: { take: 1, orderBy: { votesUp: "desc" } } } });
  if (!term) return { title: "Term not found — Aegyo Arena" };
  return {
    title: `${term.term} — K-pop Term Meaning | Aegyo Arena`,
    description: term.definitions[0]?.body.slice(0, 160) ?? `What does "${term.term}" mean in K-pop?`,
  };
}

export default async function TermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const term = await prisma.codedTerm.findUnique({
    where: { slug },
    include: {
      definitions: { orderBy: { votesUp: "desc" } },
    },
  });

  if (!term) notFound();

  // Parallel: songs with this term in English lyrics + press signals
  const [songsWithTerm, signals] = await Promise.all([
    prisma.song.findMany({
      where: { lyricsEn: { contains: term.term, mode: "insensitive" } },
      include: {
        credits: {
          where: { role: "PRIMARY" },
          include: { artist: { select: { stageName: true, slug: true } } },
          take: 1,
        },
        album: { select: { coverArt: true } },
      },
      orderBy: { viewCount: "desc" },
      take: 6,
    }),
    prisma.contentSignal.findMany({
      where: {
        OR: [
          { entityType: "term", entityId: term.id },
          { headline: { contains: term.term, mode: "insensitive" } },
          { body: { contains: term.term, mode: "insensitive" } },
        ],
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
  ]);

  const video = TERM_VIDEOS[slug] ?? null;

  return (
    <main>
      {/* Header */}
      <section style={{ background: "#000", color: "#fff", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Aegyo Arena</Link>
            {" / "}
            <Link href="/define" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>K-POP TERMS</Link>
            {" / "}
            {term.term}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            K-pop Term
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 8px" }}>{term.term}</h1>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            {term.definitions.length} definition{term.definitions.length !== 1 ? "s" : ""}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>

        {/* ── Definitions ────────────────────────────────────────────────────── */}
        {term.definitions.map((def, i) => (
          <div key={def.id} className="genius-card" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{
                background: i === 0 ? "var(--genius-yellow)" : "#f0f0f0",
                color: "var(--on-accent)",
                fontWeight: 700,
                fontSize: "0.75rem",
                padding: "4px 12px",
                borderRadius: 999,
                letterSpacing: "0.05em"
              }}>
                #{i + 1} {i === 0 ? "TOP DEFINITION" : ""}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="vote-btn up" style={{ fontSize: "0.82rem" }}>
                  👍 {def.votesUp}
                </button>
                <button type="button" className="vote-btn down" style={{ fontSize: "0.82rem" }}>
                  👎 {def.votesDown}
                </button>
              </div>
            </div>

            <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "var(--ink)", margin: "0 0 16px" }}>
              {def.body}
            </p>

            {def.example && (
              <div style={{
                background: "rgba(255,255,100,0.15)",
                borderLeft: "3px solid var(--genius-yellow)",
                padding: "12px 16px",
                borderRadius: "0 4px 4px 0",
                marginTop: 12,
              }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--genius-gray)", marginBottom: 6 }}>
                  Example
                </div>
                <div style={{ fontSize: "0.95rem", fontStyle: "italic", color: "var(--ink-dim)" }}>
                  &ldquo;{def.example}&rdquo;
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ── Heard in Lyrics ─────────────────────────────────────────────────── */}
        <section style={{ marginTop: 56 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>Heard in Lyrics</div>
          {songsWithTerm.length === 0 ? (
            <p style={{ color: "var(--genius-gray)", fontSize: "0.88rem" }}>
              No song lyrics in our library mention &ldquo;{term.term}&rdquo; yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {songsWithTerm.map((song) => {
                const artist = song.credits[0]?.artist;
                const snippet = extractLyricSnippet(song.lyricsEn, term.term);
                return (
                  <Link key={song.id} href={`/songs/${song.slug}`} style={{ textDecoration: "none" }}>
                    <div className="genius-card" style={{ padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
                      {song.album?.coverArt && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={song.album.coverArt}
                          alt=""
                          style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--ink)", marginBottom: 2 }}>
                          {song.title}
                        </div>
                        {artist && (
                          <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginBottom: snippet ? 10 : 0 }}>
                            {artist.stageName}
                          </div>
                        )}
                        {snippet && (
                          <div style={{
                            background: "rgba(255,255,100,0.18)",
                            borderLeft: "3px solid var(--genius-yellow)",
                            padding: "8px 12px",
                            borderRadius: "0 4px 4px 0",
                            fontSize: "0.85rem",
                            color: "var(--ink)",
                            lineHeight: 1.65,
                            fontStyle: "italic",
                            whiteSpace: "pre-line",
                          }}>
                            {snippet}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--genius-gray)", flexShrink: 0, paddingTop: 4 }}>→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Press Mentions ──────────────────────────────────────────────────── */}
        {signals.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <div className="section-header" style={{ marginBottom: 16 }}>Press Mentions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {signals.map((sig) => (
                <div key={sig.id} className="genius-card" style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      {sig.sourceUrl ? (
                        <a href={sig.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--ink)", marginBottom: 4, lineHeight: 1.4 }}>
                            {sig.headline}
                          </div>
                        </a>
                      ) : (
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--ink)", marginBottom: 4, lineHeight: 1.4 }}>
                          {sig.headline}
                        </div>
                      )}
                      <div style={{ fontSize: "0.8rem", color: "var(--ink-dim)", lineHeight: 1.6, marginBottom: 6 }}>
                        {sig.body.slice(0, 180)}{sig.body.length > 180 ? "…" : ""}
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        {sig.source && (
                          <span style={{ fontSize: "0.72rem", color: "var(--genius-gray)", fontWeight: 600 }}>
                            {sig.source}
                          </span>
                        )}
                        {sig.publishedAt && (
                          <span style={{ fontSize: "0.72rem", color: "var(--genius-gray)" }}>
                            {new Date(sig.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        )}
                        <span style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          background: "var(--surface)",
                          padding: "2px 8px",
                          borderRadius: 999,
                          color: "var(--ink-dim)",
                        }}>
                          {sig.category}
                        </span>
                      </div>
                    </div>
                    {sig.sourceUrl && (
                      <a href={sig.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--genius-gray)", fontSize: "0.78rem", flexShrink: 0, textDecoration: "none", paddingTop: 2 }}>
                        ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Heard from an Idol ──────────────────────────────────────────────── */}
        <section style={{ marginTop: 56 }}>
          <div className="section-header" style={{ marginBottom: 4 }}>Heard from an Idol</div>
          <p style={{ fontSize: "0.82rem", color: "var(--genius-gray)", marginBottom: 20, marginTop: 0 }}>
            Watch how K-pop idols actually use this term
          </p>

          {video ? (
            <div>
              <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden", border: "2px solid var(--genius-border)" }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.videoId}?start=${video.start}&rel=0&modestbranding=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                  title={`${video.idol} — ${term.term}`}
                />
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{
                  background: "#ff0000",
                  color: "#fff",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 4,
                  letterSpacing: "0.06em",
                }}>
                  YOUTUBE
                </span>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--ink)" }}>{video.idol}</span>
                <span style={{ fontSize: "0.78rem", color: "var(--genius-gray)" }}>—</span>
                <span style={{ fontSize: "0.78rem", color: "var(--genius-gray)", fontStyle: "italic" }}>{video.caption}</span>
              </div>
            </div>
          ) : (
            <div className="genius-card" style={{ padding: 24 }}>
              <div style={{ fontSize: "0.88rem", color: "var(--ink-dim)", marginBottom: 16, lineHeight: 1.6 }}>
                No curated clip yet for <strong>&ldquo;{term.term}&rdquo;</strong>. Search YouTube to find idols using this term in interviews, vlogs, and variety shows.
              </div>
              <a
                href={getYoutubeSearchUrl(term.term)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#ff0000",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "10px 18px",
                  borderRadius: 4,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  letterSpacing: "0.04em",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Search &ldquo;{term.term}&rdquo; on YouTube
              </a>
            </div>
          )}
        </section>

        <div style={{ textAlign: "center", marginTop: 56 }}>
          <Link href="/define" style={{ color: "var(--genius-gray)", textDecoration: "none", fontSize: "0.9rem" }}>
            ← Back to K-pop Terms
          </Link>
        </div>
      </div>
    </main>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import type { Metadata } from "next";
import ViewTracker from "@/components/ViewTracker";
import ShareButtons from "@/components/ShareButtons";
import MukbangSection from "@/components/MukbangSection";
import FavoriteButton from "@/components/FavoriteButton";
import CommentsSection from "@/components/CommentsSection";
import { getSession } from "@/lib/auth";
import AnnotationLyrics from "@/components/AnnotationLyrics";

// Cache the DB fetch so generateMetadata and the page share one query per request
const getSong = cache(async (slug: string) => {
  return prisma.song.findUnique({
    where: { slug },
    include: {
      album: { include: { artist: true } },
      credits: { include: { artist: true } },
      annotations: { include: { term: { include: { definitions: { orderBy: { votesUp: "desc" }, take: 1 } } } } },
    },
  });
});

// ISR: re-generate every 10 minutes. View counts update async via /api/view.
export const revalidate = 600;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const song = await getSong(slug);
  if (!song) return { title: "Song not found — Aegyo Arena" };

  const artist      = song.album?.artist?.stageName ?? "";
  const cover       = song.coverArt ?? song.album?.coverArt;
  const firstKo     = song.lyricsKo?.split("\n")[0] ?? "";
  const firstEn     = song.lyricsEn?.split("\n")[0] ?? "";
  const description = `${firstKo}  ·  ${firstEn} — Korean lyrics, romanization & English translation with K-pop fan annotations.`;

  return {
    title: `${song.title} — ${artist} | Aegyo Arena`,
    description,
    openGraph: {
      title: `${song.title} by ${artist}`,
      description,
      type: "article",
      ...(cover ? { images: [{ url: cover, width: 600, height: 600, alt: `${song.title} cover art` }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${song.title} by ${artist}`,
      description,
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [song, session] = await Promise.all([getSong(slug), getSession()]);
  if (!song) notFound();
  const isLoggedIn = !!session;

  // ── Gather all artist IDs for news lookup ─────────────────────────────────
  const songArtistIds = [
    song.album?.artist?.id,
    ...song.credits.map((c) => c.artist.id),
  ].filter(Boolean) as string[];

  const recentNews = await prisma.artistNews.findMany({
    where: { artistId: { in: songArtistIds } },
    include: { artist: true },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });

  const koLines = (song.lyricsKo ?? "").split("\n");
  const enLines = (song.lyricsEn ?? "").split("\n");
  const roLines = (song.lyricsRomanized ?? "").split("\n");

  // Serialize annotations for the client annotation panel
  const annData = song.annotations.map((ann) => ({
    id: ann.id,
    lineIndex: ann.lineIndex,
    word: ann.word,
    note: ann.note,
    termSlug: ann.term?.slug ?? null,
    termName: ann.term?.term ?? null,
  }));

  const performers = song.credits.filter((c) => ["performer", "PRIMARY"].includes(c.role));
  const featured = song.credits.filter((c) => c.role === "featured");
  const producers = song.credits.filter((c) => ["producer", "songwriter", "composer"].includes(c.role));

  const mainArtist = song.album?.artist;

  return (
    <main>
      {/* Header */}
      <section style={{ background: "linear-gradient(135deg, #000 0%, #1a1a2e 80%)", color: "#fff", padding: "48px 24px 36px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Aegyo Arena</Link>
            {mainArtist && <> / <Link href={`/artists/${mainArtist.slug}`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{mainArtist.stageName}</Link></>}
            {song.album && <> / <Link href={`/artists/${mainArtist?.slug}`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{song.album.title}</Link></>}
            {" / "}{song.title}
          </div>

          <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
            {(song.coverArt || song.album?.coverArt) ? (
              <img src={song.coverArt || song.album?.coverArt || ""} alt={song.album?.title ?? song.title} style={{ width: 140, height: 140, borderRadius: 6, objectFit: "cover", flexShrink: 0, boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }} />
            ) : (
              <div style={{ width: 140, height: 140, borderRadius: 6, flexShrink: 0, background: "linear-gradient(135deg, #1a1a2e, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                🎵
              </div>
            )}
            <div>
              <h1 style={{ fontSize: "2.4rem", fontWeight: 800, margin: "0 0 8px" }}>{song.title}</h1>
              {mainArtist && (
                <Link href={`/artists/${mainArtist.slug}`} style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.85)", textDecoration: "none", fontWeight: 600 }}>
                  {mainArtist.stageName}
                </Link>
              )}
              {featured.length > 0 && (
                <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
                  {" "}feat. {featured.map((c, i) => (
                    <span key={c.id}>
                      <Link href={`/artists/${c.artist.slug}`} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{c.artist.stageName}</Link>
                      {i < featured.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              )}
              {song.album && (
                <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", marginTop: 6 }}>
                  {song.album.title} &middot; {song.releaseYear ?? song.album.releaseYear}
                </div>
              )}
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {performers.map((c) => (
                  <Link key={c.id} href={`/artists/${c.artist.slug}`} style={{ textDecoration: "none" }}>
                    <span className="btn-yellow" style={{ fontSize: "0.7rem" }}>{c.artist.stageName}</span>
                  </Link>
                ))}
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <ShareButtons
                  title={song.title}
                  artist={mainArtist?.stageName ?? ""}
                  slug={song.slug}
                  firstKoLine={song.lyricsKo?.split("\n")[0]}
                />
                <FavoriteButton entityType="song" entityId={song.id} isLoggedIn={isLoggedIn} />
              </div>
              <div style={{ marginTop: 10, fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
                {song.viewCount.toLocaleString()} views
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client-side async view tracking — deduped per 2 h in localStorage */}
      <ViewTracker songId={song.id} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 48 }}>
          {/* Lyrics + slide-out annotations */}
          <AnnotationLyrics
            songId={song.id}
            koLines={koLines}
            enLines={enLines}
            roLines={roLines}
            annotations={annData}
            isLoggedIn={isLoggedIn}
          />

          {/* Sidebar */}
          <aside>
            {/* Featured artists */}
            {featured.length > 0 && (
              <div className="genius-card" style={{ padding: 20, marginBottom: 16 }}>
                <div className="section-header" style={{ margin: "0 0 12px" }}>Featured</div>
                {featured.map((c) => (
                  <Link key={c.id} href={`/artists/${c.artist.slug}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <span style={{ fontSize: "1.2rem" }}>⭐</span>
                    <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "#ff6fa8" }}>{c.artist.stageName}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Credits */}
            {producers.length > 0 && (
              <div className="genius-card" style={{ padding: 20, marginBottom: 16 }}>
                <div className="section-header" style={{ margin: "0 0 12px" }}>Credits</div>
                {producers.map((c) => (
                  <div key={c.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--genius-gray)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.role}</div>
                    <Link href={`/artists/${c.artist.slug}`} style={{ fontWeight: 600, fontSize: "0.88rem", color: "#ff6fa8", textDecoration: "none" }}>{c.artist.stageName}</Link>
                  </div>
                ))}
              </div>
            )}

            {/* Annotations index */}
            {song.annotations.length > 0 && (
              <div className="genius-card" style={{ padding: 20, marginBottom: 16 }}>
                <div className="section-header" style={{ margin: "0 0 12px" }}>Annotations ({song.annotations.length})</div>
                {song.annotations.map((ann) => (
                  <div key={ann.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid var(--genius-border)" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#ff6fa8" }}>&ldquo;{ann.word}&rdquo; — line {ann.lineIndex + 1}</div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.72)", marginTop: 2 }}>{ann.note.slice(0, 80)}{ann.note.length > 80 ? "…" : ""}</div>
                    {ann.term && (
                      <Link href={`/korean-slang/${ann.term.slug}`} style={{ fontSize: "0.72rem", color: "var(--genius-gray)", textDecoration: "none", marginTop: 4, display: "block" }}>
                        → See: {ann.term.term}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Album */}
            {song.album && (
              <div className="genius-card" style={{ padding: 20 }}>
                <div className="section-header" style={{ margin: "0 0 12px" }}>From the Album</div>
                {song.album.coverArt && (
                  <img src={song.album.coverArt} alt={song.album.title} style={{ width: "100%", borderRadius: 4, objectFit: "cover", marginBottom: 12, maxHeight: 200 }} />
                )}
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{song.album.title}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 4 }}>{song.album.releaseYear} &middot; {song.album.type}</div>
                <Link href={`/artists/${song.album.artist.slug}`} style={{ display: "block", marginTop: 12 }}>
                  <span className="btn-yellow" style={{ fontSize: "0.7rem" }}>VIEW ARTIST</span>
                </Link>
              </div>
            )}
          </aside>
        </div>

        {/* Artists & Collaborators */}
        {(() => {
          const allArtists: { id: string; slug: string; name: string; imageUrl: string | null; role: string }[] = [];
          const seen = new Set<string>();
          if (mainArtist && !seen.has(mainArtist.id)) {
            seen.add(mainArtist.id);
            allArtists.push({ id: mainArtist.id, slug: mainArtist.slug, name: mainArtist.stageName, imageUrl: mainArtist.imageUrl, role: "Main Artist" });
          }
          for (const c of song.credits) {
            if (!seen.has(c.artist.id)) {
              seen.add(c.artist.id);
              const roleLabel = c.role === "featured" ? "Featured" : c.role === "producer" ? "Producer" : c.role === "songwriter" ? "Songwriter" : c.role === "composer" ? "Composer" : c.role === "PRIMARY" ? "Performer" : c.role;
              allArtists.push({ id: c.artist.id, slug: c.artist.slug, name: c.artist.stageName, imageUrl: c.artist.imageUrl, role: roleLabel });
            }
          }
          if (allArtists.length < 2) return null;
          return (
            <section style={{ marginTop: 48, paddingTop: 40, borderTop: "2px solid #000" }}>
              <div className="section-header">Artists &amp; Collaborators</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 4 }}>
                {allArtists.map((a) => (
                  <Link key={a.id} href={`/artists/${a.slug}`} style={{ textDecoration: "none" }}>
                    <div className="genius-card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, minWidth: 200 }}>
                      {a.imageUrl ? (
                        <img src={a.imageUrl} alt={a.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #eee" }} />
                      ) : (
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #1a1a2e, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>🎤</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#ff6fa8" }}>{a.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{a.role}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Recent News */}
        {recentNews.length > 0 && (
          <section style={{ marginTop: 48, paddingTop: 40, borderTop: "2px solid #000" }}>
            <div className="section-header">Recent News</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, marginTop: 4 }}>
              {recentNews.map((item) => (
                <Link key={item.id} href={`/artists/${item.artist.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
                    {item.artist.imageUrl && (
                      <img src={item.artist.imageUrl} alt="" style={{ position: "absolute", top: 0, right: 0, width: 90, height: "100%", objectFit: "cover", opacity: 0.07, borderRadius: "0 4px 4px 0" }} />
                    )}
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        {item.artist.imageUrl ? (
                          <img src={item.artist.imageUrl} alt={item.artist.stageName} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid #eee" }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", flexShrink: 0 }}>🎤</div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#ff6fa8" }}>{item.artist.stageName}</div>
                          <div style={{ fontSize: "0.68rem", color: "var(--genius-gray)" }}>
                            {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                            {item.source ? ` · ${item.source}` : ""}
                          </div>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: "0.64rem", background: "var(--genius-yellow)", color: "#000", padding: "2px 7px", borderRadius: 999, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {item.category}
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#ff6fa8", marginBottom: 6, lineHeight: 1.4 }}>{item.headline}</div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>{item.body.slice(0, 140)}{item.body.length > 140 ? "…" : ""}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        {/* Mukbang Corner — below recent news */}
        <MukbangSection />

        {/* Comments */}
        <CommentsSection
          entityType="song"
          entityId={song.id}
          isLoggedIn={isLoggedIn}
          currentUserName={session?.user.displayName ?? session?.user.email.split("@")[0]}
        />
      </div>
    </main>
  );
}

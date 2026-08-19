import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import CommentsSection from "@/components/CommentsSection";
import { getSession } from "@/lib/auth";
import { T, LangToggle } from "@/components/LangProvider";
import SmartImage from "@/components/SmartImage";

export const revalidate = 3600;

const CATEGORY_STYLES: Record<string, { label: string; labelEs: string; bg: string; color: string }> = {
  milestone: { label: "MILESTONE", labelEs: "HITO",     bg: "#FFFF64", color: "#000" },
  comeback:  { label: "COMEBACK",  labelEs: "COMEBACK", bg: "#000",    color: "#FFFF64" },
  award:     { label: "AWARD",     labelEs: "PREMIO",   bg: "#ACFA52", color: "#000" },
  collab:    { label: "COLLAB",    labelEs: "COLAB",    bg: "#e0e0ff", color: "#000" },
  drama:     { label: "DRAMA",     labelEs: "DRAMA",    bg: "#FF2A38", color: "#fff" },
  member:    { label: "MEMBER",    labelEs: "MIEMBRO",  bg: "#f0f0f0", color: "#000" },
  legal:     { label: "LEGAL",     labelEs: "LEGAL",    bg: "#FF2A38", color: "#fff" },
  label:     { label: "LABEL",     labelEs: "SELLO",    bg: "#1a1a2e", color: "#fff" },
};

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [session, artist] = await Promise.all([
    getSession(),
    prisma.artist.findUnique({
      where: { slug },
      include: {
        label: true,
        albums: {
          include: {
            songs: {
              include: { credits: { include: { artist: true } }, annotations: { include: { term: true } } },
              orderBy: { viewCount: "desc" },
            },
          },
          orderBy: { releaseYear: "desc" },
        },
        groupOf: {
          include: { member: true },
          orderBy: { position: "asc" },
        },
        memberships: { include: { group: true } },
        news: { orderBy: { publishedAt: "desc" } },
        songs: { include: { song: { include: { album: true } } } },
      },
    }),
  ]);

  if (!artist) notFound();

  const isLoggedIn = !!session;
  const isGroup = artist.type === "GROUP";
  const members = artist.groupOf;
  const totalSongs = artist.albums.reduce((n, a) => n + a.songs.length, 0);

  // For a group, its members' news + articles surface on the group page too, so
  // fans land here for anything about anyone in the group.
  const memberSlugs = members.map((m) => m.member.slug);
  const memberIds = members.map((m) => m.member.id);
  const newsSlugs = [slug, ...memberSlugs];

  // Aegyo Arena's own hosted articles (NewsPost) about this artist — or, for a
  // group, any member. Each links to /news/<its own artistSlug>/<slug>.
  type HostedArticle = {
    slug: string; headline: string; esHeadline: string | null;
    subheadline: string | null; esSubheadline: string | null;
    category: string | null; imageUrl: string | null; publishedAt: Date | null;
    artistSlug: string | null; artistName: string | null;
  };
  let hostedArticles: HostedArticle[] = [];
  try {
    hostedArticles = await prisma.$queryRaw<HostedArticle[]>`
      SELECT "slug","headline","esHeadline","subheadline","esSubheadline","category","imageUrl","publishedAt","artistSlug","artistName"
      FROM "NewsPost"
      WHERE "status" = 'live' AND "artistSlug" IN (${Prisma.join(newsSlugs)}) AND "slug" IS NOT NULL
      ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC
      LIMIT 12`;
  } catch { hostedArticles = []; }

  // Member ArtistNews merged with the group's own, newest first (each tagged by who).
  const memberNews = isGroup && memberIds.length
    ? await prisma.artistNews.findMany({
        where: { artistId: { in: memberIds } },
        include: { artist: { select: { slug: true, stageName: true } } },
        orderBy: { publishedAt: "desc" },
        take: 12,
      })
    : [];
  type NewsItem = {
    id: string; headline: string; body: string; source: string | null;
    sourceUrl: string | null; category: string; publishedAt: Date | null;
    whoSlug: string; whoName: string;
  };
  const artistNewsMerged: NewsItem[] = [
    ...artist.news.map((n) => ({ id: n.id, headline: n.headline, body: n.body, source: n.source, sourceUrl: n.sourceUrl, category: n.category, publishedAt: n.publishedAt, whoSlug: slug, whoName: artist.stageName })),
    ...memberNews.map((n) => ({ id: n.id, headline: n.headline, body: n.body, source: n.source, sourceUrl: n.sourceUrl, category: n.category, publishedAt: n.publishedAt, whoSlug: n.artist.slug, whoName: n.artist.stageName })),
  ].sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  const newsCount = hostedArticles.length + artistNewsMerged.length;

  // Same-label artists — contextual internal links (SEO + fan discovery).
  const relatedArtists = artist.labelId
    ? await prisma.artist.findMany({
        where: { labelId: artist.labelId, id: { not: artist.id } },
        select: { slug: true, stageName: true, imageUrl: true, type: true },
        orderBy: [{ debutYear: "asc" }, { stageName: "asc" }],
        take: 12,
      })
    : [];

  // Structured data — helps Google understand the entity + render breadcrumbs.
  const SITE = "https://www.aegyoarena.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicGroup",
        name: artist.stageName,
        url: `${SITE}/artists/${slug}`,
        ...(artist.imageUrl ? { image: artist.imageUrl } : {}),
        ...(artist.debutYear ? { foundingDate: String(artist.debutYear) } : {}),
        ...(artist.label ? { recordLabel: artist.label.name } : {}),
        ...(isGroup && members.length
          ? { member: members.map((m) => ({ "@type": "Person", name: m.member.stageName, url: `${SITE}/artists/${m.member.slug}` })) }
          : {}),
        ...(artist.albums.length
          ? { album: artist.albums.slice(0, 25).map((al) => ({ "@type": "MusicAlbum", name: al.title, ...(al.releaseYear ? { datePublished: String(al.releaseYear) } : {}) })) }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Aegyo Arena", item: SITE },
          { "@type": "ListItem", position: 2, name: "Artists", item: `${SITE}/artists` },
          { "@type": "ListItem", position: 3, name: artist.stageName, item: `${SITE}/artists/${slug}` },
        ],
      },
    ],
  };

  // Distinct K-pop slang terms annotated across all of this artist's songs (deduped by slug).
  const slangInLyrics = (() => {
    const bySlug = new Map<string, { slug: string; term: string }>();
    for (const album of artist.albums) {
      for (const song of album.songs) {
        for (const ann of song.annotations) {
          if (ann.term && !bySlug.has(ann.term.slug)) bySlug.set(ann.term.slug, { slug: ann.term.slug, term: ann.term.term });
        }
      }
    }
    return [...bySlug.values()];
  })();

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section className="artist-hero">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <LangToggle align="flex-start" marginBottom={16} />
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Aegyo Arena</Link>
            {" / "}
            <Link href="/artists" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}><T en="Artists" es="Artistas" /></Link>
            {" / "}
            {artist.stageName}
          </div>

          <div style={{ display: "flex", gap: 32, alignItems: "flex-end", flexWrap: "wrap" }}>
            {artist.imageUrl ? (
              <SmartImage src={artist.imageUrl} alt={artist.stageName} width={160} height={160} sizes="160px" priority style={{ width: 160, height: 160, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,100,0.3)" }} />
            ) : (
              <div style={{ width: 160, height: 160, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, rgba(255,255,100,0.2), rgba(255,255,100,0.05))", border: "2px solid rgba(255,255,100,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                {isGroup ? "🎤" : artist.type === "SOLOIST" ? "⭐" : "👤"}
              </div>
            )}
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
                {isGroup
                  ? <T en="K-pop Group" es="Grupo de K-pop" />
                  : artist.type === "SOLOIST"
                    ? <T en="Solo Artist" es="Artista Solista" />
                    : <T en="K-pop Artist" es="Artista de K-pop" />}
              </div>
              <h1 style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>{artist.stageName}</h1>
              {artist.realName && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", marginBottom: 8 }}>{artist.realName}</div>}
              <div style={{ display: "flex", gap: 16, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", flexWrap: "wrap" }}>
                {artist.debutYear && <span>Debut {artist.debutYear}</span>}
                {artist.label && <Link href={`/labels/${artist.label.slug}`} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{artist.label.name}</Link>}
                {isGroup && <span><T en={`${members.length} members`} es={`${members.length} miembros`} /></span>}
                <span>
                  <T
                    en={`${artist.albums.length} album${artist.albums.length !== 1 ? "s" : ""}`}
                    es={`${artist.albums.length} ${artist.albums.length !== 1 ? "álbumes" : "álbum"}`}
                  />
                </span>
                <span>
                  <T
                    en={`${totalSongs} song${totalSongs !== 1 ? "s" : ""}`}
                    es={`${totalSongs} ${totalSongs !== 1 ? "canciones" : "canción"}`}
                  />
                </span>
              </div>
            </div>
          </div>

          {/* External links */}
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Spotify", href: `https://open.spotify.com/search/${encodeURIComponent(artist.stageName)}`, bg: "#1DB954", color: "#fff" },
              { label: "Songkick", href: `https://www.songkick.com/search?query=${encodeURIComponent(artist.stageName)}`, bg: "#f80046", color: "#fff" },
              { label: "Seatgeek", href: `https://seatgeek.com/search#?q=${encodeURIComponent(artist.stageName)}`, bg: "#fa5252", color: "#fff" },
            ].map(({ label, href, bg, color }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ background: bg, color, fontSize: "0.72rem", fontWeight: 700, padding: "5px 14px", borderRadius: 999, textDecoration: "none", letterSpacing: "0.04em" }}>
                {label}
              </a>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <FavoriteButton entityType="artist" entityId={artist.id} isLoggedIn={isLoggedIn} />
          </div>

          {artist.bio && (
            <div style={{ marginTop: 16, color: "rgba(255,255,255,0.8)", maxWidth: 780, lineHeight: 1.85, fontSize: "0.95rem", whiteSpace: "pre-line" }}>
              <T en={artist.bio} es={artist.bioEs} />
            </div>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div className="responsive-sidebar-grid" style={{ gridTemplateColumns: "1fr 340px" }}>
          <div>
            {/* Member Roster */}
            {isGroup && members.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <div className="section-header"><T en="Members" es="Miembros" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                  {members.map(({ member, role }) => (
                    <Link key={member.id} href={`/artists/${member.slug}`} style={{ textDecoration: "none" }}>
                      <div className="member-card">
                        {member.imageUrl ? (
                          <SmartImage src={member.imageUrl} alt={member.stageName} width={60} height={60} sizes="60px" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", marginBottom: 8 }} />
                        ) : (
                          <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>👤</div>
                        )}
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#ff6fa8" }}>{member.stageName}</div>
                        {member.realName && <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 2 }}>{member.realName}</div>}
                        {role && <div style={{ fontSize: "0.68rem", color: "var(--genius-yellow)", background: "#000", borderRadius: 999, padding: "2px 8px", marginTop: 6, display: "inline-block" }}>{role}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Full Discography with every song */}
            <section style={{ marginBottom: 48 }}>
              <div className="section-header"><T en="Discography" es="Discografía" /></div>
              {artist.albums.map((album) => (
                <div key={album.id} style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
                    {/* Real cover art when we have it; the disc placeholder only as a fallback. */}
                    {album.coverArt ? (
                      <SmartImage src={album.coverArt} alt="" width={72} height={72} sizes="72px"
                        style={{ width: 72, height: 72, borderRadius: 6, objectFit: "cover", flexShrink: 0, background: "linear-gradient(135deg, #1a1a2e, #0f3460)" }} />
                    ) : (
                      <div style={{ width: 72, height: 72, borderRadius: 6, background: "linear-gradient(135deg, #1a1a2e, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>
                        💿
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ff6fa8" }}>{album.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 4 }}>
                        {album.releaseYear} &middot; {album.type} &middot;{" "}
                        <T
                          en={`${album.songs.length} track${album.songs.length !== 1 ? "s" : ""}`}
                          es={`${album.songs.length} ${album.songs.length !== 1 ? "canciones" : "canción"}`}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ borderLeft: "3px solid var(--genius-border)", paddingLeft: 20, marginLeft: 8 }}>
                    {album.songs.map((song, idx) => {
                      const featured = song.credits.filter((c) => c.role === "featured" && c.artist.id !== artist.id);
                      return (
                        <Link key={song.id} href={`/songs/${song.slug}`} style={{ textDecoration: "none" }}>
                          <div className="song-row">
                            <div style={{ width: 20, textAlign: "center", fontSize: "0.78rem", color: "var(--genius-gray)", fontWeight: 600 }}>{idx + 1}</div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#ff6fa8" }}>{song.title}</span>
                              {featured.length > 0 && (
                                <span style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginLeft: 6 }}>
                                  feat. {featured.map((c) => c.artist.stageName).join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            {/* Gossip & News */}
            {(hostedArticles.length > 0 || artistNewsMerged.length > 0) && (
              <section>
                <div className="section-header"><T en="News & Gossip" es="Noticias y Chismes" /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Aegyo Arena articles about this artist — click through to the full story. */}
                  {hostedArticles.map((a) => (
                    <Link key={a.slug} href={`/news/${a.artistSlug ?? slug}/${a.slug}`} style={{ textDecoration: "none" }}>
                      <div className="genius-card" style={{ padding: 22, display: "flex", gap: 16, alignItems: "flex-start", borderLeft: "3px solid #ff6fa8" }}>
                        {a.imageUrl && (
                          <SmartImage src={a.imageUrl} alt="" width={92} height={68} sizes="92px" style={{ width: 92, height: 68, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                            <span style={{ background: "rgba(255,111,168,0.15)", color: "#ff6fa8", fontWeight: 800, fontSize: "0.62rem", letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 999, textTransform: "uppercase" }}>
                              {a.category ?? "news"}
                            </span>
                            {a.artistSlug && a.artistSlug !== slug && a.artistName && (
                              <span style={{ fontSize: "0.72rem", color: "var(--genius-gray)", fontWeight: 600 }}>{a.artistName}</span>
                            )}
                            {a.publishedAt && (
                              <span style={{ fontSize: "0.75rem", color: "var(--genius-gray)" }}>
                                <T
                                  en={new Date(a.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  es={new Date(a.publishedAt).toLocaleDateString("es-MX", { month: "short", day: "numeric", year: "numeric" })}
                                />
                              </span>
                            )}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#ff6fa8", marginBottom: 6, lineHeight: 1.3 }}>
                            <T en={a.headline} es={a.esHeadline} />
                          </div>
                          {a.subheadline && (
                            <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
                              <T en={a.subheadline} es={a.esSubheadline} />
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {artistNewsMerged.map((item) => {
                    const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES["milestone"];
                    return (
                      <div key={item.id} className="genius-card" style={{ padding: 22, overflow: "hidden", position: "relative" }}>
                        {artist.imageUrl && (
                          <div style={{ position: "absolute", top: 0, right: 0, width: 130, height: 130, overflow: "hidden", opacity: 0.07, borderRadius: "0 4px 0 50%", pointerEvents: "none" }}>
                            <SmartImage src={artist.imageUrl} alt="" width={130} height={130} sizes="130px" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                          <span style={{ background: style.bg, color: style.color, fontWeight: 700, fontSize: "0.67rem", letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
                            <T en={style.label} es={style.labelEs} />
                          </span>
                          {item.whoSlug !== slug && (
                            <Link href={`/artists/${item.whoSlug}`} style={{ fontSize: "0.72rem", color: "#ff6fa8", fontWeight: 700, textDecoration: "none", marginTop: 3 }}>{item.whoName}</Link>
                          )}
                          {item.publishedAt && (
                            <span style={{ fontSize: "0.75rem", color: "var(--genius-gray)", marginTop: 3 }}>
                              <T
                                en={new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                es={new Date(item.publishedAt).toLocaleDateString("es-MX", { month: "short", year: "numeric" })}
                              />
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#ff6fa8", marginBottom: 6 }}>{item.headline}</div>
                        <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.75 }}>{item.body}</div>
                        {item.source && (
                          <div style={{ marginTop: 10, fontSize: "0.72rem", color: "var(--genius-gray)" }}>
                            <T en="Source:" es="Fuente:" /> {item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--genius-gray)" }}>{item.source}</a> : item.source}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {/* Group membership for soloists */}
            {!isGroup && artist.memberships.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="section-header"><T en="Also in" es="También en" /></div>
                {artist.memberships.map(({ group }) => (
                  <Link key={group.id} href={`/artists/${group.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                    <div className="genius-card" style={{ padding: "12px 16px", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 10 }}>
                      {group.imageUrl ? (
                        <SmartImage src={group.imageUrl} alt={group.stageName} width={32} height={32} sizes="32px" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <span style={{ fontSize: "1.2rem" }}>🎤</span>
                      )}
                      {group.stageName}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Collab appearances */}
            {artist.songs.filter((c) => c.role === "featured").length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="section-header"><T en="Featured On" es="Aparece En" /></div>
                {artist.songs.filter((c) => c.role === "featured").map((c) => (
                  <Link key={c.song.id} href={`/songs/${c.song.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                    <div className="genius-card" style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#ff6fa8" }}>{c.song.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 2 }}>
                        {c.song.album?.title} ({c.song.album?.releaseYear})
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* K-pop slang appearing in this artist's lyrics */}
            {slangInLyrics.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="section-header"><T en="K-pop slang in their lyrics" es="Jerga K-pop en sus letras" /></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {slangInLyrics.map((t) => (
                    <Link key={t.slug} href={`/korean-slang/${t.slug}`} style={{ textDecoration: "none" }}>
                      <span style={{ display: "inline-block", background: "#000", color: "var(--genius-yellow)", fontSize: "0.78rem", fontWeight: 600, padding: "5px 12px", borderRadius: 999 }}>{t.term}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related artists on the same label — internal links for discovery + SEO */}
            {relatedArtists.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="section-header">
                  {artist.label
                    ? <T en={`More from ${artist.label.name}`} es={`Más de ${artist.label.name}`} />
                    : <T en="Related artists" es="Artistas relacionados" />}
                </div>
                {relatedArtists.map((r) => (
                  <Link key={r.slug} href={`/artists/${r.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                    <div className="genius-card" style={{ padding: "12px 16px", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 10 }}>
                      {r.imageUrl ? (
                        <SmartImage src={r.imageUrl} alt={r.stageName} width={32} height={32} sizes="32px" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <span style={{ fontSize: "1.2rem" }}>{r.type === "GROUP" ? "🎤" : "⭐"}</span>
                      )}
                      <span style={{ color: "#ff6fa8" }}>{r.stageName}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Quick stats */}
            <div className="genius-card" style={{ padding: 20 }}>
              <div className="section-header" style={{ margin: "0 0 14px" }}><T en="Quick Stats" es="Datos Rápidos" /></div>
              {[
                { en: "Debut Year", es: "Año de Debut", value: artist.debutYear ?? "—" },
                { en: "Label", es: "Sello", value: artist.label?.name ?? <T en="Independent" es="Independiente" /> },
                { en: "Albums", es: "Álbumes", value: artist.albums.length },
                { en: "Songs", es: "Canciones", value: totalSongs },
                { en: "News Items", es: "Noticias", value: newsCount },
              ].map(({ en, es, value }) => (
                <div key={en} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--genius-border)", fontSize: "0.83rem" }}>
                  <span style={{ color: "var(--genius-gray)" }}><T en={en} es={es} /></span>
                  <span style={{ fontWeight: 700, color: "#ff6fa8" }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <Link href="/collabs" style={{ display: "block" }}>
                <span className="btn-yellow" style={{ display: "block", textAlign: "center" }}><T en="VIEW COLLAB NETWORK" es="VER RED DE COLABORACIONES" /></span>
              </Link>
            </div>

            {/* Explore — internal links to the site's hubs (SEO crawl depth + discovery) */}
            <div style={{ marginTop: 24 }}>
              <div className="section-header"><T en="Explore Aegyo Arena" es="Explora Aegyo Arena" /></div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { href: "/artists", en: "All artists", es: "Artistas" },
                  { href: "/news", en: "K-pop news", es: "Noticias" },
                  { href: "/korean-slang", en: "Korean slang", es: "Jerga coreana" },
                  { href: "/collabs", en: "Collabs", es: "Colaboraciones" },
                  { href: "/quiz", en: "Quizzes", es: "Quizzes" },
                  { href: "/cities", en: "Concerts", es: "Conciertos" },
                  ...(artist.label ? [{ href: `/labels/${artist.label.slug}`, en: artist.label.name, es: artist.label.name }] : []),
                ].map((l) => (
                  <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
                    <span style={{ display: "inline-block", background: "#000", color: "#ff6fa8", fontSize: "0.78rem", fontWeight: 600, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--genius-border)" }}>
                      <T en={l.en} es={l.es} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Comments */}
        <CommentsSection
          entityType="artist"
          entityId={artist.id}
          isLoggedIn={isLoggedIn}
          currentUserName={session?.user.displayName ?? session?.user.email.split("@")[0]}
        />
      </div>
    </main>
  );
}

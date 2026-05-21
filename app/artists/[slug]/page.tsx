import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import CommentsSection from "@/components/CommentsSection";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CATEGORY_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  milestone: { label: "MILESTONE", bg: "#FFFF64", color: "#000" },
  comeback:  { label: "COMEBACK",  bg: "#000",    color: "#FFFF64" },
  award:     { label: "AWARD",     bg: "#ACFA52", color: "#000" },
  collab:    { label: "COLLAB",    bg: "#e0e0ff", color: "#000" },
  drama:     { label: "DRAMA",     bg: "#FF2A38", color: "#fff" },
  member:    { label: "MEMBER",    bg: "#f0f0f0", color: "#000" },
  legal:     { label: "LEGAL",     bg: "#FF2A38", color: "#fff" },
  label:     { label: "LABEL",     bg: "#1a1a2e", color: "#fff" },
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
              include: { credits: { include: { artist: true } } },
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

  return (
    <main>
      {/* Hero */}
      <section className="artist-hero">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Aegyo Arena</Link>
            {" / "}
            <Link href="/artists" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Artists</Link>
            {" / "}
            {artist.stageName}
          </div>

          <div style={{ display: "flex", gap: 32, alignItems: "flex-end", flexWrap: "wrap" }}>
            {artist.imageUrl ? (
              <img src={artist.imageUrl} alt={artist.stageName} style={{ width: 160, height: 160, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(255,255,100,0.3)" }} />
            ) : (
              <div style={{ width: 160, height: 160, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, rgba(255,255,100,0.2), rgba(255,255,100,0.05))", border: "2px solid rgba(255,255,100,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem" }}>
                {isGroup ? "🎤" : artist.type === "SOLOIST" ? "⭐" : "👤"}
              </div>
            )}
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>
                {isGroup ? "K-pop Group" : artist.type === "SOLOIST" ? "Solo Artist" : "K-pop Artist"}
              </div>
              <h1 style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>{artist.stageName}</h1>
              {artist.realName && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem", marginBottom: 8 }}>{artist.realName}</div>}
              <div style={{ display: "flex", gap: 16, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", flexWrap: "wrap" }}>
                {artist.debutYear && <span>Debut {artist.debutYear}</span>}
                {artist.label && <Link href={`/labels/${artist.label.slug}`} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>{artist.label.name}</Link>}
                {isGroup && <span>{members.length} members</span>}
                <span>{artist.albums.length} album{artist.albums.length !== 1 ? "s" : ""}</span>
                <span>{totalSongs} song{totalSongs !== 1 ? "s" : ""}</span>
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
              {artist.bio}
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
                <div className="section-header">Members</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                  {members.map(({ member, role }) => (
                    <Link key={member.id} href={`/artists/${member.slug}`} style={{ textDecoration: "none" }}>
                      <div className="member-card">
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.stageName} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", marginBottom: 8 }} />
                        ) : (
                          <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>👤</div>
                        )}
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#000" }}>{member.stageName}</div>
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
              <div className="section-header">Discography</div>
              {artist.albums.map((album) => (
                <div key={album.id} style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
                    <div style={{ width: 72, height: 72, borderRadius: 6, background: "linear-gradient(135deg, #1a1a2e, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>
                      💿
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#000" }}>{album.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 4 }}>
                        {album.releaseYear} &middot; {album.type} &middot; {album.songs.length} track{album.songs.length !== 1 ? "s" : ""}
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
                              <span style={{ fontWeight: 600, fontSize: "0.92rem", color: "#000" }}>{song.title}</span>
                              {featured.length > 0 && (
                                <span style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginLeft: 6 }}>
                                  feat. {featured.map((c) => c.artist.stageName).join(", ")}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)" }}>
                              {song.viewCount.toLocaleString()} views
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
            {artist.news.length > 0 && (
              <section>
                <div className="section-header">News & Gossip</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {artist.news.map((item) => {
                    const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES["milestone"];
                    return (
                      <div key={item.id} className="genius-card" style={{ padding: 22, overflow: "hidden", position: "relative" }}>
                        {artist.imageUrl && (
                          <div style={{ position: "absolute", top: 0, right: 0, width: 130, height: 130, overflow: "hidden", opacity: 0.07, borderRadius: "0 4px 0 50%", pointerEvents: "none" }}>
                            <img src={artist.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                          <span style={{ background: style.bg, color: style.color, fontWeight: 700, fontSize: "0.67rem", letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
                            {style.label}
                          </span>
                          {item.publishedAt && (
                            <span style={{ fontSize: "0.75rem", color: "var(--genius-gray)", marginTop: 3 }}>
                              {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#000", marginBottom: 6 }}>{item.headline}</div>
                        <div style={{ fontSize: "0.88rem", color: "#444", lineHeight: 1.75 }}>{item.body}</div>
                        {item.source && (
                          <div style={{ marginTop: 10, fontSize: "0.72rem", color: "var(--genius-gray)" }}>
                            Source: {item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--genius-gray)" }}>{item.source}</a> : item.source}
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
                <div className="section-header">Also in</div>
                {artist.memberships.map(({ group }) => (
                  <Link key={group.id} href={`/artists/${group.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                    <div className="genius-card" style={{ padding: "12px 16px", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 10 }}>
                      {group.imageUrl ? (
                        <img src={group.imageUrl} alt={group.stageName} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
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
                <div className="section-header">Featured On</div>
                {artist.songs.filter((c) => c.role === "featured").map((c) => (
                  <Link key={c.song.id} href={`/songs/${c.song.slug}`} style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                    <div className="genius-card" style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#000" }}>{c.song.title}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 2 }}>
                        {c.song.album?.title} ({c.song.album?.releaseYear})
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Quick stats */}
            <div className="genius-card" style={{ padding: 20 }}>
              <div className="section-header" style={{ margin: "0 0 14px" }}>Quick Stats</div>
              {[
                { label: "Debut Year", value: artist.debutYear ?? "—" },
                { label: "Label", value: artist.label?.name ?? "Independent" },
                { label: "Albums", value: artist.albums.length },
                { label: "Songs", value: totalSongs },
                { label: "News Items", value: artist.news.length },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--genius-border)", fontSize: "0.83rem" }}>
                  <span style={{ color: "var(--genius-gray)" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: "#000" }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <Link href="/collabs" style={{ display: "block" }}>
                <span className="btn-yellow" style={{ display: "block", textAlign: "center" }}>VIEW COLLAB NETWORK</span>
              </Link>
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

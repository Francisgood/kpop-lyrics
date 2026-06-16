import { searchAll } from "@/lib/search";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { label: string; icon: string }> = {
  artist: { label: "Artists", icon: "🎤" },
  song: { label: "Songs & Lyrics", icon: "🎵" },
  album: { label: "Albums", icon: "💿" },
  slang: { label: "Korean Slang", icon: "💬" },
  annotation: { label: "Annotations", icon: "✍️" },
  news: { label: "News", icon: "📰" },
};
const ORDER = ["artist", "song", "album", "slang", "annotation", "news"];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const { grouped, total } = query ? await searchAll(query) : { grouped: {} as Record<string, never[]>, total: 0 };

  return (
    <main>
      <section style={{ background: "#000", color: "#fff", padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 20px" }}>
            {query ? `Results for "${query}"` : "Explore K-pop"}
          </h1>
          <form action="/search" style={{ display: "flex", gap: 8, maxWidth: 520 }}>
            <input name="q" type="search" defaultValue={query} placeholder="Search artists, songs, lyrics, slang, news…" className="search-input" style={{ flex: 1 }} />
            <button type="submit" className="btn-yellow">SEARCH</button>
          </form>
          <div style={{ marginTop: 12, color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
            {query
              ? `${total} result${total !== 1 ? "s" : ""} · powered by Elasticsearch`
              : "Search across artists, songs, lyrics, annotations, Korean slang, and news."}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {ORDER.filter((t) => grouped[t]?.length).map((t) => (
          <section key={t} style={{ marginBottom: 44 }}>
            <div className="section-header">{TYPE_META[t]?.icon} {TYPE_META[t]?.label ?? t}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {grouped[t].map((h, i) => (
                <Link key={i} href={h.url} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.title}</div>
                    {h.subtitle && <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 2 }}>{h.subtitle}</div>}
                    {h.body && (
                      <div style={{ fontSize: "0.82rem", color: "#555", lineHeight: 1.5, marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {h.body}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {query && total === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--genius-gray)" }}>
            <div style={{ fontSize: "2rem", marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>No results for &ldquo;{query}&rdquo;</div>
            <div style={{ marginTop: 8 }}>Try an artist, song, lyric, slang term, or news headline.</div>
          </div>
        )}
      </div>
    </main>
  );
}

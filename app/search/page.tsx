import { searchAll } from "@/lib/search";
import Link from "next/link";
import { T, LangToggle } from "@/components/LangProvider";
import SearchForm from "./SearchForm";

export const dynamic = "force-dynamic";

const TYPE_META: Record<string, { label: string; labelEs: string; icon: string }> = {
  artist: { label: "Artists", labelEs: "Artistas", icon: "🎤" },
  song: { label: "Songs & Lyrics", labelEs: "Canciones y Letras", icon: "🎵" },
  album: { label: "Albums", labelEs: "Álbumes", icon: "💿" },
  slang: { label: "Korean Slang", labelEs: "Jerga Coreana", icon: "💬" },
  annotation: { label: "Annotations", labelEs: "Anotaciones", icon: "✍️" },
  news: { label: "News", labelEs: "Noticias", icon: "📰" },
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
          <LangToggle align="flex-start" marginBottom={16} />
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 20px" }}>
            {query
              ? <T en={`Results for "${query}"`} es={`Resultados para "${query}"`} />
              : <T en="Explore K-pop" es="Explora el K-pop" />}
          </h1>
          <SearchForm query={query} />
          <div style={{ marginTop: 12, color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
            {query
              ? <T
                  en={`${total} result${total !== 1 ? "s" : ""} · powered by Elasticsearch`}
                  es={`${total} resultado${total !== 1 ? "s" : ""} · con tecnología de Elasticsearch`}
                />
              : <T
                  en="Search across artists, songs, lyrics, annotations, Korean slang, and news."
                  es="Busca entre artistas, canciones, letras, anotaciones, jerga coreana y noticias."
                />}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {ORDER.filter((t) => grouped[t]?.length).map((t) => (
          <section key={t} style={{ marginBottom: 44 }}>
            <div className="section-header">
              {TYPE_META[t]?.icon} <T en={TYPE_META[t]?.label ?? t} es={TYPE_META[t]?.labelEs} />
            </div>
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
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              <T en={`No results for “${query}”`} es={`Sin resultados para “${query}”`} />
            </div>
            <div style={{ marginTop: 8 }}>
              <T
                en="Try an artist, song, lyric, slang term, or news headline."
                es="Prueba con un artista, una canción, una letra, un término de jerga o un titular."
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

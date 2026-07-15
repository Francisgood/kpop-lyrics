"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export type NewsRow = {
  id: string; headline: string; subheadline: string | null; body: string | null;
  imageUrl: string | null; imageCredit: string | null; category: string | null; tag: string | null;
  artistSlug: string | null; artistName: string | null; sourceName: string | null; sourceUrl: string;
  readMins: number; publishedAt: string | null;
};

type Lang = "en" | "es";

// Category pill color + per-language label.
const CAT: Record<string, { color: string; en: string; es: string }> = {
  news:        { color: "#4AC8F0", en: "News",        es: "Noticias" },
  gossip:      { color: "#FF6FA8", en: "Gossip",      es: "Chisme" },
  rumor:       { color: "#B8A0FF", en: "Rumor",       es: "Rumor" },
  chart:       { color: "#C8F04A", en: "Charts",      es: "Charts" },
  comeback:    { color: "#FF8C42", en: "Comeback",    es: "Comeback" },
  award:       { color: "#FFD700", en: "Awards",      es: "Premios" },
  collab:      { color: "#4AC8F0", en: "Collab",      es: "Collab" },
  debut:       { color: "#C8F04A", en: "Debut",       es: "Debut" },
  controversy: { color: "#FF7A7A", en: "Controversy", es: "Polémica" },
};
const catOf = (c: string | null) => CAT[c ?? "news"] ?? CAT.news;

// ── Homepage copy (English / Spanish) ───────────────────────────────────────
type PromoCopy = { eyebrow: string; title: string; body: string; cta: string };
type Copy = {
  lang: Lang;
  eyebrow: string; titlePre: string; titleEm: string; intro: string; introLink: string;
  readLabel: (n: number) => string; readMore: string;
  agoM: (n: number) => string; agoH: (n: number) => string; agoD: (n: number) => string; dateLocale: string;
  ex: { eyebrow: string; title: string; items: { href: string; tag: string; label: string; color: string }[] };
  ev: PromoCopy; qz: PromoCopy;
  emptyTitle: string; emptyBody: string; emptyLink: string; loading: string; caughtUp: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    lang: "en",
    eyebrow: "The Feed · Updated daily",
    titlePre: "K-pop news, gossip ", titleEm: "& rumors.",
    intro: "The whole scene in one endless scroll — comebacks, charts, scandals and scoops, rewritten for fans with a link to every source. ",
    introLink: "Explore the universe →",
    readLabel: (n) => `${n} min read`, readMore: "Read the full story →",
    agoM: (n) => `${n}m ago`, agoH: (n) => `${n}h ago`, agoD: (n) => `${n}d ago`, dateLocale: "en-US",
    ex: {
      eyebrow: "The Universe", title: "Explore everything", items: [
        { href: "/artists", tag: "Artists", label: "Discover every artist & group", color: "var(--sakura)" },
        { href: "/collabs", tag: "Collabs", label: "Artist collaborations", color: "var(--lavender)" },
        { href: "/korean-slang", tag: "Slang", label: "K-pop slang dictionary", color: "var(--sky)" },
        { href: "/cities", tag: "Cities", label: "Global K-pop cities & meetups", color: "var(--volt)" },
      ],
    },
    ev: { eyebrow: "Community · Live feed", title: "Fan events near you.", body: "K-pop meetups, dance meets, K-beauty pop-ups & comic cons — updated daily, sorted by city.", cta: "See what's on →" },
    qz: { eyebrow: "Play · Test yourself", title: "How well do you know K-pop?", body: "Aegyo, Korean slang & idol trivia — quick quizzes to prove your bias knowledge.", cta: "Take the quiz →" },
    emptyTitle: "The feed is warming up", emptyBody: "Fresh K-pop news, gossip & rumors are published here daily. Meanwhile,", emptyLink: "explore the universe →",
    loading: "Loading more…", caughtUp: "You're all caught up — check back soon for more. 💜",
  },
  es: {
    lang: "es",
    eyebrow: "El Feed · Actualizado a diario",
    titlePre: "Noticias, chismes ", titleEm: "y rumores.",
    intro: "Toda la escena en un scroll infinito — comebacks, charts, escándalos y primicias, reescritos para fans con enlace a cada fuente. ",
    introLink: "Explora el universo →",
    readLabel: (n) => `${n} min de lectura`, readMore: "Leer la historia completa →",
    agoM: (n) => `hace ${n}m`, agoH: (n) => `hace ${n}h`, agoD: (n) => `hace ${n}d`, dateLocale: "es-ES",
    ex: {
      eyebrow: "El Universo", title: "Explóralo todo", items: [
        { href: "/artists", tag: "Artistas", label: "Descubre cada artista y grupo", color: "var(--sakura)" },
        { href: "/collabs", tag: "Collabs", label: "Colaboraciones de artistas", color: "var(--lavender)" },
        { href: "/korean-slang", tag: "Jerga", label: "Diccionario de jerga K-pop", color: "var(--sky)" },
        { href: "/cities", tag: "Ciudades", label: "Ciudades y quedadas K-pop", color: "var(--volt)" },
      ],
    },
    ev: { eyebrow: "Comunidad · En vivo", title: "Eventos de fans cerca de ti.", body: "Quedadas K-pop, dance meets, pop-ups de K-beauty y comic cons — actualizado a diario, por ciudad.", cta: "Ver qué hay →" },
    qz: { eyebrow: "Juega · Ponte a prueba", title: "¿Cuánto sabes de K-pop?", body: "Aegyo, jerga coreana y trivia de idols — quizzes rápidos para demostrar cuánto sabes de tu bias.", cta: "Hacer el quiz →" },
    emptyTitle: "El feed se está calentando", emptyBody: "Cada día publicamos noticias, chismes y rumores de K-pop. Mientras tanto,", emptyLink: "explora el universo →",
    loading: "Cargando más…", caughtUp: "Estás al día — vuelve pronto para ver más. 💜",
  },
};

function timeAgo(iso: string | null, c: Copy): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 60) return c.agoM(Math.max(1, mins));
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return c.agoH(hrs);
  const days = Math.round(hrs / 24);
  if (days < 30) return c.agoD(days);
  return new Date(iso).toLocaleDateString(c.dateLocale, { month: "short", day: "numeric", year: "numeric" });
}

// ── Cross-promo units (cycled after every 5 articles) ───────────────────────
function ExploreUnit({ c }: { c: Copy }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-strong)", borderRadius: 18, padding: "24px 22px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 6 }}>{c.ex.eyebrow}</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", marginBottom: 16 }}>{c.ex.title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {c.ex.items.map((it) => (
          <Link key={it.href} href={it.href} style={{ display: "block", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", textDecoration: "none" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: it.color, fontWeight: 700, marginBottom: 4 }}>{it.tag}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600, lineHeight: 1.35 }}>{it.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EventsUnit({ c }: { c: Copy }) {
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(74,200,240,0.14), var(--bg-card))", border: "1px solid var(--sky)", borderRadius: 18, padding: "26px 24px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sky)", marginBottom: 6 }}>{c.ev.eyebrow}</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{c.ev.title}</div>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-dim)", margin: "0 0 14px", maxWidth: 380 }}>{c.ev.body}</p>
      <Link href="/events" style={{ display: "inline-flex", padding: "10px 20px", borderRadius: 100, background: "var(--sky)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.82rem", letterSpacing: "0.03em", textTransform: "uppercase", textDecoration: "none" }}>{c.ev.cta}</Link>
    </div>
  );
}

function QuizUnit({ c }: { c: Copy }) {
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(200,240,74,0.14), var(--bg-card))", border: "1px solid var(--volt)", borderRadius: 18, padding: "26px 24px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--volt)", marginBottom: 6 }}>{c.qz.eyebrow}</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{c.qz.title}</div>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-dim)", margin: "0 0 14px", maxWidth: 380 }}>{c.qz.body}</p>
      <Link href="/quiz" style={{ display: "inline-flex", padding: "10px 20px", borderRadius: 100, background: "var(--volt)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.82rem", letterSpacing: "0.03em", textTransform: "uppercase", textDecoration: "none" }}>{c.qz.cta}</Link>
    </div>
  );
}

const PROMOS = [ExploreUnit, EventsUnit, QuizUnit];

// ── Article card ────────────────────────────────────────────────────────────
function ArticleCard({ p, featured, c }: { p: NewsRow; featured?: boolean; c: Copy }) {
  const cc = catOf(p.category);
  const meta = [p.sourceName, timeAgo(p.publishedAt, c), c.readLabel(p.readMins)].filter(Boolean).join(" · ");
  return (
    <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer"
      className="news-card" style={{ display: "block", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", textDecoration: "none" }}>
      {p.imageUrl && (
        <div style={{ position: "relative", width: "100%", aspectRatio: featured ? "16 / 8" : "16 / 9", overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.imageUrl} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}
      <div style={{ padding: featured ? "22px 24px 24px" : "18px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ background: `${cc.color}22`, color: cc.color, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.07em", padding: "3px 9px", borderRadius: 999, textTransform: "uppercase" }}>{c.lang === "es" ? cc.es : cc.en}</span>
          {p.artistName && <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>{p.artistName}</span>}
        </div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: featured ? "1.7rem" : "1.25rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, margin: "0 0 8px" }}>{p.headline}</h2>
        {p.subheadline && <p style={{ fontSize: "0.92rem", color: "var(--ink-dim)", lineHeight: 1.55, margin: "0 0 12px" }}>{p.subheadline}</p>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>{meta}</span>
          <span style={{ fontSize: "0.76rem", color: cc.color, fontWeight: 800 }}>{c.readMore}</span>
        </div>
      </div>
    </a>
  );
}

export default function NewsFeed({ initial, initialOffset, initialHasMore }: { initial: NewsRow[]; initialOffset: number; initialHasMore: boolean }) {
  const [lang, setLang] = useState<Lang>("en");
  const [posts, setPosts] = useState<NewsRow[]>(initial);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const c = COPY[lang];

  // Language: saved preference wins, otherwise default Spanish browsers to ES.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aegyo-lang");
      if (saved === "en" || saved === "es") setLang(saved);
      else if ((navigator.language || "").toLowerCase().startsWith("es")) setLang("es");
    } catch { /* localStorage/navigator unavailable */ }
  }, []);

  function switchLang(l: Lang) {
    setLang(l);
    try { localStorage.setItem("aegyo-lang", l); } catch { /* ignore */ }
  }

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/news?offset=${offset}&limit=20`);
      const data = await res.json();
      setPosts((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        return [...prev, ...(data.posts as NewsRow[]).filter((x) => !seen.has(x.id))];
      });
      setOffset(data.nextOffset);
      setHasMore(Boolean(data.hasMore));
    } catch { setHasMore(false); }
    finally { setLoading(false); }
  }, [loading, hasMore, offset]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) loadMore(); }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  // Identical language toggle to the /bts-giveaway page.
  const LangToggle = () => (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
      <div style={{ display: "inline-flex", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 100, padding: 3 }}>
        {(["en", "es"] as Lang[]).map((l) => (
          <button key={l} type="button" onClick={() => switchLang(l)} aria-pressed={lang === l}
            style={{ padding: "6px 16px", borderRadius: 100, border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.02em", background: lang === l ? "var(--sakura)" : "transparent", color: lang === l ? "var(--on-accent)" : "var(--ink-dim)", transition: "background 0.15s, color 0.15s" }}>
            {l === "en" ? "English" : "Español"}
          </button>
        ))}
      </div>
    </div>
  );

  // Build the feed: every 5 articles, insert the next cross-promo unit (cycled).
  const nodes: React.ReactNode[] = [];
  let promoIdx = 0;
  posts.forEach((p, i) => {
    nodes.push(<ArticleCard key={p.id} p={p} featured={i === 0} c={c} />);
    if ((i + 1) % 5 === 0) {
      const Promo = PROMOS[promoIdx % PROMOS.length];
      promoIdx++;
      nodes.push(<div key={`promo-${i}`}><Promo c={c} /></div>);
    }
  });

  return (
    <main style={{ paddingBottom: 72 }}>
      {/* Feed header (the site nav in the layout stays sticky above this) */}
      <section style={{ background: "linear-gradient(180deg, var(--sakura-light), var(--bg))", borderBottom: "1px solid var(--border)", padding: "40px 24px 34px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <LangToggle />
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 12 }}>{c.eyebrow}</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem, 7vw, 3.4rem)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.05, margin: "0 0 12px" }}>
            {c.titlePre}<em style={{ color: "var(--sakura)", fontStyle: "italic" }}>{c.titleEm}</em>
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.02rem", lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
            {c.intro}
            <Link href="/artists" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>{c.introLink}</Link>
          </p>
        </div>
      </section>

      {/* Infinite-scroll feed */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 0" }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-dim)", lineHeight: 1.8 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📰</div>
            <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "1.1rem", marginBottom: 6 }}>{c.emptyTitle}</div>
            <div style={{ fontSize: "0.92rem", maxWidth: 440, margin: "0 auto" }}>{c.emptyBody}{" "}
              <Link href="/artists" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>{c.emptyLink}</Link>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{nodes}</div>
            <div ref={sentinel} style={{ height: 1 }} />
            {loading && <div style={{ textAlign: "center", padding: "28px", color: "var(--ink-faint)", fontSize: "0.85rem" }}>{c.loading}</div>}
            {!hasMore && <div style={{ textAlign: "center", padding: "32px", color: "var(--ink-faint)", fontSize: "0.82rem" }}>{c.caughtUp}</div>}
          </>
        )}
      </div>
    </main>
  );
}

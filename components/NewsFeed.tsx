"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export type NewsRow = {
  id: string; headline: string; subheadline: string | null; body: string | null;
  imageUrl: string | null; imageCredit: string | null; category: string | null; tag: string | null;
  artistSlug: string | null; artistName: string | null; sourceName: string | null; sourceUrl: string;
  readMins: number; publishedAt: string | null;
};

const CAT: Record<string, { label: string; color: string }> = {
  news:        { label: "News",        color: "#4AC8F0" },
  gossip:      { label: "Gossip",      color: "#FF6FA8" },
  rumor:       { label: "Rumor",       color: "#B8A0FF" },
  chart:       { label: "Charts",      color: "#C8F04A" },
  comeback:    { label: "Comeback",    color: "#FF8C42" },
  award:       { label: "Awards",      color: "#FFD700" },
  collab:      { label: "Collab",      color: "#4AC8F0" },
  debut:       { label: "Debut",       color: "#C8F04A" },
  controversy: { label: "Controversy", color: "#FF7A7A" },
};
const cat = (c: string | null) => CAT[c ?? "news"] ?? CAT.news;

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Cross-promo units (cycled after every 5 articles) ───────────────────────
function ExploreUnit() {
  const items = [
    { href: "/artists", tag: "Artists", label: "Discover every artist & group", color: "var(--sakura)" },
    { href: "/collabs", tag: "Collabs", label: "Artist collaborations", color: "var(--lavender)" },
    { href: "/korean-slang", tag: "Slang", label: "K-pop slang dictionary", color: "var(--sky)" },
    { href: "/cities", tag: "Cities", label: "Global K-pop cities & meetups", color: "var(--volt)" },
  ];
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-strong)", borderRadius: 18, padding: "24px 22px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 6 }}>The Universe</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", marginBottom: 16 }}>Explore everything</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        {items.map((it) => (
          <Link key={it.href} href={it.href} style={{ display: "block", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", textDecoration: "none" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: it.color, fontWeight: 700, marginBottom: 4 }}>{it.tag}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--ink)", fontWeight: 600, lineHeight: 1.35 }}>{it.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function EventsUnit() {
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(74,200,240,0.14), var(--bg-card))", border: "1px solid var(--sky)", borderRadius: 18, padding: "26px 24px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sky)", marginBottom: 6 }}>Community · Live feed</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>Fan events near you.</div>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-dim)", margin: "0 0 14px", maxWidth: 380 }}>K-pop meetups, dance meets, K-beauty pop-ups &amp; comic cons — updated daily, sorted by city.</p>
      <Link href="/events" style={{ display: "inline-flex", padding: "10px 20px", borderRadius: 100, background: "var(--sky)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.82rem", letterSpacing: "0.03em", textTransform: "uppercase", textDecoration: "none" }}>See what&apos;s on →</Link>
    </div>
  );
}

function QuizUnit() {
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(200,240,74,0.14), var(--bg-card))", border: "1px solid var(--volt)", borderRadius: 18, padding: "26px 24px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--volt)", marginBottom: 6 }}>Play · Test yourself</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>How well do you know K-pop?</div>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-dim)", margin: "0 0 14px", maxWidth: 380 }}>Aegyo, Korean slang &amp; idol trivia — quick quizzes to prove your bias knowledge.</p>
      <Link href="/quiz" style={{ display: "inline-flex", padding: "10px 20px", borderRadius: 100, background: "var(--volt)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.82rem", letterSpacing: "0.03em", textTransform: "uppercase", textDecoration: "none" }}>Take the quiz →</Link>
    </div>
  );
}

const PROMOS = [ExploreUnit, EventsUnit, QuizUnit];

// ── Article card ────────────────────────────────────────────────────────────
function ArticleCard({ p, featured }: { p: NewsRow; featured?: boolean }) {
  const cc = cat(p.category);
  const meta = [p.sourceName, timeAgo(p.publishedAt), `${p.readMins} min read`].filter(Boolean).join(" · ");
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
          <span style={{ background: `${cc.color}22`, color: cc.color, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.07em", padding: "3px 9px", borderRadius: 999, textTransform: "uppercase" }}>{cc.label}</span>
          {p.artistName && <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>{p.artistName}</span>}
        </div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: featured ? "1.7rem" : "1.25rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.2, margin: "0 0 8px" }}>{p.headline}</h2>
        {p.subheadline && <p style={{ fontSize: "0.92rem", color: "var(--ink-dim)", lineHeight: 1.55, margin: "0 0 12px" }}>{p.subheadline}</p>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>{meta}</span>
          <span style={{ fontSize: "0.76rem", color: cc.color, fontWeight: 800 }}>Read the full story →</span>
        </div>
      </div>
    </a>
  );
}

export default function NewsFeed({ initial, initialOffset, initialHasMore }: { initial: NewsRow[]; initialOffset: number; initialHasMore: boolean }) {
  const [posts, setPosts] = useState<NewsRow[]>(initial);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

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

  if (posts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--ink-dim)", lineHeight: 1.8 }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📰</div>
        <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "1.1rem", marginBottom: 6 }}>The feed is warming up</div>
        <div style={{ fontSize: "0.92rem", maxWidth: 440, margin: "0 auto" }}>Fresh K-pop news, gossip &amp; rumors are published here daily. Meanwhile, <Link href="/artists" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>explore the universe →</Link></div>
      </div>
    );
  }

  // Build the feed: every 5 articles, insert the next cross-promo unit (cycled).
  const nodes: React.ReactNode[] = [];
  let promoIdx = 0;
  posts.forEach((p, i) => {
    nodes.push(<ArticleCard key={p.id} p={p} featured={i === 0} />);
    if ((i + 1) % 5 === 0) {
      const Promo = PROMOS[promoIdx % PROMOS.length];
      promoIdx++;
      nodes.push(<div key={`promo-${i}`}><Promo /></div>);
    }
  });

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{nodes}</div>
      <div ref={sentinel} style={{ height: 1 }} />
      {loading && <div style={{ textAlign: "center", padding: "28px", color: "var(--ink-faint)", fontSize: "0.85rem" }}>Loading more…</div>}
      {!hasMore && posts.length > 0 && <div style={{ textAlign: "center", padding: "32px", color: "var(--ink-faint)", fontSize: "0.82rem" }}>You&apos;re all caught up — check back soon for more. 💜</div>}
    </>
  );
}

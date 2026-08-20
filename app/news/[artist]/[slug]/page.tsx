import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { T, LangToggle } from "@/components/LangProvider";
import NewsletterGate from "@/components/NewsletterGate";
import SmartImage from "@/components/SmartImage";
import PollCard from "@/components/PollCard";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { getPollSeed, type PollState } from "@/lib/polls";
import { getPollState } from "@/lib/polls-db";

export const dynamic = "force-dynamic";

const SITE = "https://www.aegyoarena.com";

// Poll definitions (question, options, Daebak upsell) live in `lib/polls.ts`
// (POLL_SEEDS); the interactive one-tap PollCard is rendered below the lead story.

type Article = {
  id: string; slug: string; headline: string; subheadline: string | null; body: string | null;
  esHeadline: string | null; esSubheadline: string | null; bodyEs: string | null;
  imageUrl: string | null; imageCredit: string | null; category: string | null;
  artistSlug: string | null; artistName: string | null;
  sourceName: string | null; sourceUrl: string; readMins: number; publishedAt: Date | null;
};

const CAT: Record<string, { en: string; es: string; color: string }> = {
  news:        { en: "News",        es: "Noticias",  color: "#4AC8F0" },
  gossip:      { en: "Gossip",      es: "Chisme",    color: "#FF6FA8" },
  rumor:       { en: "Rumor",       es: "Rumor",     color: "#B8A0FF" },
  chart:       { en: "Charts",      es: "Charts",    color: "#C8F04A" },
  comeback:    { en: "Comeback",    es: "Comeback",  color: "#FF8C42" },
  award:       { en: "Awards",      es: "Premios",   color: "#FFD700" },
  collab:      { en: "Collab",      es: "Collab",    color: "#4AC8F0" },
  debut:       { en: "Debut",       es: "Debut",     color: "#C8F04A" },
  controversy: { en: "Controversy", es: "Polémica",  color: "#FF7A7A" },
};
const catOf = (c: string | null) => CAT[c ?? "news"] ?? CAT.news;
const ARTICLE_COLS = `"id","slug","headline","subheadline","body","esHeadline","esSubheadline","bodyEs","imageUrl","imageCredit","category","artistSlug","artistName","sourceName","sourceUrl","readMins","publishedAt"`;
const paras = (t: string | null) => (t ?? "").split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const rows = await prisma.$queryRawUnsafe<Article[]>(
      `SELECT ${ARTICLE_COLS} FROM "NewsPost" WHERE "slug" = $1 AND "status" = 'live' LIMIT 1`, slug);
    return rows[0] ?? null;
  } catch { return null; }
}

// Related hosted articles, ranked: same artist first, then same category, then most
// recent. Powers the recommendations + the continue-reading + the gated article.
async function getRelated(excludeId: string, artistSlug: string | null, category: string | null, limit: number): Promise<Article[]> {
  try {
    return await prisma.$queryRawUnsafe<Article[]>(
      `SELECT ${ARTICLE_COLS} FROM "NewsPost"
       WHERE "status" = 'live' AND "slug" IS NOT NULL AND "id" <> $1
       ORDER BY ("artistSlug" = $2) DESC, ("category" = $3) DESC, "publishedAt" DESC NULLS LAST, "createdAt" DESC
       LIMIT $4`,
      excludeId, artistSlug ?? "", category ?? "", limit);
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ artist: string; slug: string }> }): Promise<Metadata> {
  const { artist, slug } = await params;
  const a = await getArticle(slug);
  if (!a) return { title: "Story not found — Aegyo Arena" };
  const url = `${SITE}/news/${artist}/${slug}`;
  return {
    title: `${a.headline} — Aegyo Arena`,
    description: a.subheadline ?? undefined,
    alternates: { canonical: `/news/${artist}/${slug}` },
    openGraph: { title: a.headline, description: a.subheadline ?? undefined, url, type: "article", images: a.imageUrl ? [a.imageUrl] : undefined, siteName: "Aegyo Arena" },
    twitter: { card: "summary_large_image", title: a.headline, description: a.subheadline ?? undefined },
  };
}

// Category pill + date row.
function MetaRow({ a }: { a: Article }) {
  const cc = catOf(a.category);
  const dEn = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  const dEs = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("es-MX", { month: "long", day: "numeric", year: "numeric" }) : "";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
      <span style={{ background: `${cc.color}22`, color: cc.color, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.07em", padding: "3px 10px", borderRadius: 999, textTransform: "uppercase" }}>
        <T en={cc.en} es={cc.es} />
      </span>
      <span style={{ fontSize: "0.74rem", color: "var(--ink-faint)" }}>
        <T en={`${dEn} · ${a.readMins} min read`} es={`${dEs} · ${a.readMins} min de lectura`} />
      </span>
    </div>
  );
}

function ArticleImage({ a, priority }: { a: Article; priority?: boolean }) {
  if (!a.imageUrl) return null;
  return (
    <figure style={{ margin: "0 0 26px" }}>
      {/* Optimized (resized + AVIF/WebP). Lead article image is the LCP → priority. */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", borderRadius: 16, border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)" }}>
        <SmartImage src={a.imageUrl} fill priority={priority} sizes="(max-width: 760px) 100vw, 672px" style={{ objectFit: "cover" }} />
      </div>
      {a.imageCredit && (
        <figcaption style={{ fontSize: "0.72rem", color: "var(--ink-faint)", marginTop: 8 }}>
          <T en={`Photo: ${a.imageCredit}`} es={`Foto: ${a.imageCredit}`} />
        </figcaption>
      )}
    </figure>
  );
}

function Body({ a }: { a: Article }) {
  const en = paras(a.body), es = paras(a.bodyEs);
  return (
    <div style={{ fontSize: "1.05rem", color: "var(--ink)", lineHeight: 1.85 }}>
      {en.map((p, i) => (
        <p key={i} style={{ margin: "0 0 18px" }}><T en={p} es={es[i] ?? (es.length ? "" : null)} /></p>
      ))}
    </div>
  );
}

// Source credit. The outbound link is deliberately a DIM/dark, non-CTA colour —
// we credit the source but don't invite readers to leave aegyoarena.com.
function Attribution({ a }: { a: Article }) {
  return (
    <div style={{ marginTop: 30, padding: "18px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>
        <T en="Source" es="Fuente" />
      </div>
      <p style={{ fontSize: "0.9rem", color: "var(--ink-dim)", lineHeight: 1.6, margin: "0 0 10px" }}>
        <T
          en={`Reported by ${a.sourceName ?? "the original publication"}. This article is Aegyo Arena's own write-up of that reporting.`}
          es={`Reportado por ${a.sourceName ?? "la publicación original"}. Este artículo es la versión propia de Aegyo Arena de esa información.`}
        />
      </p>
      <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer nofollow"
        style={{ fontSize: "0.8rem", color: "var(--ink-faint)", fontWeight: 400, textDecoration: "underline", textDecorationColor: "var(--border-strong)", wordBreak: "break-word" }}>
        <T en={`Read the original on ${a.sourceName ?? "the source"} →`} es={`Leer el original en ${a.sourceName ?? "la fuente"} →`} />
      </a>
    </div>
  );
}

// Juicy categories are gated on the article page too (not just the feed teaser):
// the body is blurred behind an email capture to grow the newsletter list.
const GATED_ARTICLE_CATEGORIES = new Set(["rumor", "gossip"]);

// A full article body (headline → sub → image → body → attribution). Lead article
// gets an h1; continue-reading articles get an h2. Gossip/rumor bodies are gated.
function FullArticle({ a, lead }: { a: Article; lead?: boolean }) {
  const Heading = lead ? "h1" : "h2";
  const gated = GATED_ARTICLE_CATEGORIES.has(a.category ?? "");
  return (
    <>
      <MetaRow a={a} />
      <Heading style={{ fontFamily: "var(--serif)", fontSize: lead ? "clamp(1.9rem, 5.5vw, 2.9rem)" : "clamp(1.6rem, 4.8vw, 2.4rem)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.12, margin: "0 0 14px" }}>
        <T en={a.headline} es={a.esHeadline} />
      </Heading>
      {a.subheadline && (
        <p style={{ fontSize: "1.08rem", color: "var(--ink-dim)", lineHeight: 1.6, margin: "0 0 22px" }}>
          <T en={a.subheadline} es={a.esSubheadline} />
        </p>
      )}
      <ArticleImage a={a} priority={lead} />
      {gated ? (
        <>
          {/* Juicy gossip: body blurred behind the email gate. Headline + sub stay
              visible as the hook; source credit still renders below. */}
          <div aria-hidden style={{ position: "relative", maxHeight: 260, overflow: "hidden", filter: "blur(6px)", userSelect: "none", pointerEvents: "none", WebkitMaskImage: "linear-gradient(to bottom, #000 22%, transparent)", maskImage: "linear-gradient(to bottom, #000 22%, transparent)" }}>
            <Body a={a} />
          </div>
          <div style={{ marginTop: -48, position: "relative", zIndex: 2 }}>
            <NewsletterGate source="gossip-gate" />
          </div>
        </>
      ) : (
        <Body a={a} />
      )}
      <Attribution a={a} />
    </>
  );
}

function RecCard({ a }: { a: Article }) {
  const cc = catOf(a.category);
  return (
    <Link href={`/news/${a.artistSlug}/${a.slug}`} className="news-card"
      style={{ display: "block", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", textDecoration: "none" }}>
      {a.imageUrl && (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
          <SmartImage src={a.imageUrl} fill sizes="(max-width: 760px) 100vw, 340px" style={{ objectFit: "cover" }} />
        </div>
      )}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ background: `${cc.color}22`, color: cc.color, fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 999, textTransform: "uppercase" }}><T en={cc.en} es={cc.es} /></span>
          {a.artistName && <span style={{ fontSize: "0.68rem", color: "var(--ink-faint)" }}>{a.artistName}</span>}
        </div>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.02rem", fontWeight: 700, color: "var(--ink)", lineHeight: 1.25 }}>
          <T en={a.headline} es={a.esHeadline} />
        </div>
      </div>
    </Link>
  );
}

export default async function NewsArticlePage({ params }: { params: Promise<{ artist: string; slug: string }> }) {
  const { artist, slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();
  if (a.artistSlug && a.artistSlug !== artist) redirect(`/news/${a.artistSlug}/${slug}`);

  // 4 recommendations + a continue-reading article + a gated article = up to 6 related.
  const related = await getRelated(a.id, a.artistSlug, a.category, 8);
  const recs = related.slice(0, 4);
  const nextArticle = related[4] ?? null;   // full, inline
  const gatedArticle = related[5] ?? null;  // blurred behind the newsletter gate

  // One-tap poll for this story — SSR-hydrated so the option cards are tappable on
  // first paint (no client fetch), with the caller's own vote resolved from cookie/session.
  const pollSeed = getPollSeed(a.slug);
  let pollState: PollState | null = null;
  if (pollSeed) {
    const session = await getSession();
    const cookieStore = await cookies();
    const deviceToken = cookieStore.get("aa_vid")?.value ?? null;
    const userId = session?.user.id ?? null;
    const voterName = session ? (session.user.displayName ?? session.user.email.split("@")[0]) : null;
    try { pollState = await getPollState(pollSeed, { userId, voterName, deviceToken }); } catch { pollState = null; }
  }

  return (
    <main style={{ paddingBottom: 72 }}>
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px 0" }}>
        <LangToggle align="flex-start" marginBottom={18} />
        <div style={{ fontSize: "0.72rem", color: "var(--ink-faint)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
          <Link href="/" style={{ color: "var(--ink-faint)", textDecoration: "none" }}>Aegyo Arena</Link>
          {" / "}<T en="News" es="Noticias" />
          {a.artistSlug && a.artistName && (
            <>{" / "}<Link href={`/artists/${a.artistSlug}`} style={{ color: "var(--sakura)", textDecoration: "none" }}>{a.artistName}</Link></>
          )}
        </div>

        {/* Article 1 — the story the reader came for */}
        <FullArticle a={a} lead />

        {/* One-tap poll for this story — vote → live results → profile claim (Daebak upsell inside) */}
        {pollState && <PollCard initial={pollState} articlePath={`/news/${a.artistSlug ?? artist}/${a.slug}`} />}

        {/* Content you may like — more of the same artist (fallback: same category) */}
        {recs.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 14 }}>
              <T en="Content you may like" es="Contenido que te puede gustar" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {recs.map((r) => <RecCard key={r.id} a={r} />)}
            </div>
          </section>
        )}

        {/* Article 2 — the next full-length story, inline, so reading continues */}
        {nextArticle && (
          <section style={{ marginTop: 44, paddingTop: 34, borderTop: "2px solid var(--border-strong)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--sky)", marginBottom: 18 }}>
              <T en="Keep reading" es="Sigue leyendo" />
            </div>
            <FullArticle a={nextArticle} />
          </section>
        )}

        {/* Article 3 — blurred behind a subscribe gate */}
        {gatedArticle && (
          <section style={{ marginTop: 44, paddingTop: 34, borderTop: "2px solid var(--border-strong)" }}>
            <MetaRow a={gatedArticle} />
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem, 4.8vw, 2.4rem)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.12, margin: "0 0 14px" }}>
              <T en={gatedArticle.headline} es={gatedArticle.esHeadline} />
            </h2>
            {gatedArticle.subheadline && (
              <p style={{ fontSize: "1.08rem", color: "var(--ink-dim)", lineHeight: 1.6, margin: "0 0 22px" }}>
                <T en={gatedArticle.subheadline} es={gatedArticle.esSubheadline} />
              </p>
            )}
            <ArticleImage a={gatedArticle} />
            {/* Teaser: blurred + faded so it reads as gated content. aria-hidden — the gate is the real CTA. */}
            <div aria-hidden style={{ position: "relative", maxHeight: 240, overflow: "hidden", filter: "blur(5px)", userSelect: "none", pointerEvents: "none", WebkitMaskImage: "linear-gradient(to bottom, #000 25%, transparent)", maskImage: "linear-gradient(to bottom, #000 25%, transparent)" }}>
              <Body a={gatedArticle} />
            </div>
            <div style={{ marginTop: -40, position: "relative", zIndex: 2 }}>
              <NewsletterGate source="article-gate" />
            </div>
          </section>
        )}

        <div style={{ marginTop: 34, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/" style={{ fontSize: "0.85rem", color: "var(--sky)", fontWeight: 700, textDecoration: "none" }}>
            <T en="← Back to the feed" es="← Volver al feed" />
          </Link>
          {a.artistSlug && (
            <Link href={`/artists/${a.artistSlug}`} style={{ fontSize: "0.85rem", color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
              <T en={`More on ${a.artistName ?? "this artist"} →`} es={`Más sobre ${a.artistName ?? "este artista"} →`} />
            </Link>
          )}
        </div>
      </article>
    </main>
  );
}

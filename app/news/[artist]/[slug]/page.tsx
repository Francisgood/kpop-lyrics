import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { T, LangToggle } from "@/components/LangProvider";

export const dynamic = "force-dynamic";

const SITE = "https://www.aegyoarena.com";

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

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const rows = await prisma.$queryRaw<Article[]>`
      SELECT "id","slug","headline","subheadline","body","esHeadline","esSubheadline","bodyEs",
             "imageUrl","imageCredit","category","artistSlug","artistName","sourceName","sourceUrl","readMins","publishedAt"
      FROM "NewsPost" WHERE "slug" = ${slug} AND "status" = 'live' LIMIT 1`;
    return rows[0] ?? null;
  } catch { return null; }
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
    openGraph: {
      title: a.headline, description: a.subheadline ?? undefined, url, type: "article",
      images: a.imageUrl ? [a.imageUrl] : undefined, siteName: "Aegyo Arena",
    },
    twitter: { card: "summary_large_image", title: a.headline, description: a.subheadline ?? undefined },
  };
}

// A full article hosted on Aegyo Arena — rewritten in the site's voice, with the
// original publication credited and linked at the end.
export default async function NewsArticlePage({ params }: { params: Promise<{ artist: string; slug: string }> }) {
  const { artist, slug } = await params;
  const a = await getArticle(slug);
  if (!a) notFound();
  // Canonical URL is /news/<artistSlug>/<slug> — send stray artist segments there.
  if (a.artistSlug && a.artistSlug !== artist) redirect(`/news/${a.artistSlug}/${slug}`);

  const cc = catOf(a.category);
  const dEn = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  const dEs = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("es-MX", { month: "long", day: "numeric", year: "numeric" }) : "";
  const paras = (t: string | null) => (t ?? "").split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const enParas = paras(a.body);
  const esParas = paras(a.bodyEs);

  return (
    <main style={{ paddingBottom: 72 }}>
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px 0" }}>
        <LangToggle align="flex-start" marginBottom={18} />

        <div style={{ fontSize: "0.72rem", color: "var(--ink-faint)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
          <Link href="/" style={{ color: "var(--ink-faint)", textDecoration: "none" }}>Aegyo Arena</Link>
          {" / "}
          <T en="News" es="Noticias" />
          {a.artistSlug && a.artistName && (
            <>
              {" / "}
              <Link href={`/artists/${a.artistSlug}`} style={{ color: "var(--sakura)", textDecoration: "none" }}>{a.artistName}</Link>
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ background: `${cc.color}22`, color: cc.color, fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.07em", padding: "3px 10px", borderRadius: 999, textTransform: "uppercase" }}>
            <T en={cc.en} es={cc.es} />
          </span>
          <span style={{ fontSize: "0.74rem", color: "var(--ink-faint)" }}>
            <T en={`${dEn} · ${a.readMins} min read`} es={`${dEs} · ${a.readMins} min de lectura`} />
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.9rem, 5.5vw, 2.9rem)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.12, margin: "0 0 14px" }}>
          <T en={a.headline} es={a.esHeadline} />
        </h1>
        {a.subheadline && (
          <p style={{ fontSize: "1.08rem", color: "var(--ink-dim)", lineHeight: 1.6, margin: "0 0 22px" }}>
            <T en={a.subheadline} es={a.esSubheadline} />
          </p>
        )}

        {a.imageUrl && (
          <figure style={{ margin: "0 0 26px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.imageUrl} alt="" style={{ width: "100%", borderRadius: 16, display: "block", border: "1px solid var(--border)" }} />
            {a.imageCredit && (
              <figcaption style={{ fontSize: "0.72rem", color: "var(--ink-faint)", marginTop: 8 }}>
                <T en={`Photo: ${a.imageCredit}`} es={`Foto: ${a.imageCredit}`} />
              </figcaption>
            )}
          </figure>
        )}

        {/* Body — Spanish version when the toggle is ES, English otherwise. */}
        <div style={{ fontSize: "1.05rem", color: "var(--ink)", lineHeight: 1.85 }}>
          {enParas.map((p, i) => (
            <p key={i} style={{ margin: "0 0 18px" }}>
              <T en={p} es={esParas[i] ?? (esParas.length ? "" : null)} />
            </p>
          ))}
        </div>

        {/* Source attribution — required, always at the end of the article. */}
        <div style={{ marginTop: 30, padding: "18px 20px", background: "var(--bg-card)", border: "1px solid var(--border-strong)", borderRadius: 14 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 8 }}>
            <T en="Source" es="Fuente" />
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--ink-dim)", lineHeight: 1.6, margin: "0 0 10px" }}>
            <T
              en={`Reported by ${a.sourceName ?? "the original publication"}. This article is Aegyo Arena's own write-up of that reporting.`}
              es={`Reportado por ${a.sourceName ?? "la publicación original"}. Este artículo es la versión propia de Aegyo Arena de esa información.`}
            />
          </p>
          <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "0.85rem", color: "var(--sakura)", fontWeight: 800, textDecoration: "none", wordBreak: "break-word" }}>
            <T en={`Read the original on ${a.sourceName ?? "the source"} →`} es={`Leer el original en ${a.sourceName ?? "la fuente"} →`} />
          </a>
        </div>

        <div style={{ marginTop: 26, display: "flex", gap: 14, flexWrap: "wrap" }}>
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

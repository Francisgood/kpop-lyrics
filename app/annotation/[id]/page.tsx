import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAnnotation, type AnnRow } from "@/lib/community-db";
import { contributorBySlug, slugify } from "@/app/leaderboard/data";
import { CITY_SLUG_SET } from "@/app/cities/city-slugs";
import UserAvatar from "@/components/UserAvatar";
import { prisma } from "@/lib/prisma";

// Resolve the annotation's song title to a published song page, if one exists.
async function findSongSlug(title: string): Promise<string | null> {
  if (!title) return null;
  const exact = await prisma.song.findFirst({ where: { title: { equals: title, mode: "insensitive" } }, select: { slug: true } });
  if (exact) return exact.slug;
  const core = title.replace(/\(.*?\)/g, "").trim();
  if (core && core !== title) {
    const fuzzy = await prisma.song.findFirst({ where: { title: { contains: core, mode: "insensitive" } }, select: { slug: true } });
    if (fuzzy) return fuzzy.slug;
  }
  return null;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const a = await getAnnotation(id);
  if (!a) return { title: "Annotation — Aegyo Arena" };
  return { title: `${a.authorName} on ${a.songTitle} — Aegyo Arena`, description: a.note.slice(0, 150) };
}

const STATUS = {
  approved: { label: "Approved & live", color: "#3ecf8e", bg: "rgba(62,207,142,0.12)" },
  rejected: { label: "Rejected by moderation", color: "#ff6b6b", bg: "rgba(255,107,107,0.12)" },
  pending: { label: "Pending review", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
} as const;

export default async function AnnotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a: AnnRow | null = await getAnnotation(id);
  if (!a) notFound();

  const contributor = contributorBySlug(a.authorSlug);
  const initial = contributor?.initial ?? a.authorName.charAt(0).toUpperCase();
  const color = contributor?.tierColor ?? "#ff6fa8";
  const st = STATUS[a.status];
  const songSlug = a.songSlug ?? (await findSongSlug(a.songTitle));

  return (
    <main>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 14 }}>Annotation</div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, color: "var(--ink)" }}>
            {a.word ? `“${a.word}”` : a.songTitle}
          </span>
          {a.romanization && <span style={{ color: "var(--ink-faint)", fontStyle: "italic", fontSize: "1rem" }}>{a.romanization}</span>}
        </div>
        <div style={{ color: "var(--ink-dim)", fontSize: "0.95rem", marginBottom: 20 }}>
          on {songSlug ? (
            <Link href={`/songs/${songSlug}`} style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>{a.songTitle} →</Link>
          ) : (
            <strong style={{ color: "var(--ink)" }}>{a.songTitle}</strong>
          )}
          <span style={{ marginLeft: 10, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: st.color, background: st.bg, padding: "2px 8px", borderRadius: 100 }}>{st.label}</span>
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: "3px solid var(--sakura)", borderRadius: 14, padding: "22px 24px", color: "var(--ink)", lineHeight: 1.8, fontSize: "1.02rem", marginBottom: 28 }}>
          {a.note}
        </div>

        {/* Author — click-through to their profile; a known city links to its city guide */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px" }}>
          <UserAvatar avatar={contributor?.avatar} initial={initial} color={color} size={48} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)" }}>Contributed by</span>
            <span style={{ display: "block", fontWeight: 700, color: "var(--ink)" }}>
              <Link href={`/u/${a.authorSlug}`} style={{ color: "var(--ink)", textDecoration: "none" }}>{a.authorName}</Link>
              {contributor ? (
                <>{" · "}{contributor.flag}{" "}
                {CITY_SLUG_SET.has(slugify(contributor.city)) ? (
                  <Link href={`/cities/${slugify(contributor.city)}`} style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>{contributor.city}</Link>
                ) : contributor.city}</>
              ) : ""}
            </span>
          </span>
          <Link href={`/u/${a.authorSlug}`} style={{ color: "var(--sakura)", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none", flexShrink: 0 }}>View profile →</Link>
        </div>

        {a.reviewedBy && (
          <div style={{ fontSize: "0.8rem", color: "var(--ink-faint)", marginTop: 16 }}>
            {a.status === "approved" ? "Approved" : "Reviewed"} by {a.reviewedBy}
            {a.reviewedAt ? ` on ${new Date(a.reviewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}.
          </div>
        )}

        <div style={{ marginTop: 28 }}>
          <Link href={`/u/${a.authorSlug}`} style={{ color: "var(--sakura)", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>← Back to {a.authorName}&rsquo;s profile</Link>
        </div>
      </div>
    </main>
  );
}

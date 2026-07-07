import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QUIZZES, getQuizBySlug } from "@/lib/quiz-data";
import QuizPlayer from "@/components/QuizPlayer";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);
  if (!quiz) return { title: "Quiz — Aegyo Arena" };
  const title = `${quiz.title} — Aegyo Arena`;
  const url = `https://www.aegyoarena.com/quiz/${quiz.slug}`;
  return {
    title,
    description: quiz.description,
    alternates: { canonical: `/quiz/${quiz.slug}` },
    openGraph: { title, description: quiz.description, url, type: "website", siteName: "Aegyo Arena" },
    twitter: { card: "summary_large_image", title, description: quiz.description },
  };
}

export default async function QuizSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);
  if (!quiz) notFound();

  const url = `https://www.aegyoarena.com/quiz/${quiz.slug}`;
  const xShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${quiz.blurb} Take the ${quiz.label} quiz on Aegyo Arena:`)}&url=${encodeURIComponent(url)}`;
  const others = QUIZZES.filter((q) => q.slug !== quiz.slug);

  return (
    <main>
      {/* Header */}
      <section style={{ borderBottom: "1px solid var(--border)", background: `linear-gradient(180deg, ${quiz.accent}20, transparent)` }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "34px 24px 30px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 18 }}>
            <Link href="/quiz" style={{ color: "var(--ink-faint)", textDecoration: "none" }}>Quizzes</Link>
            {" / "}
            <span style={{ color: "var(--ink-dim)" }}>{quiz.label}</span>
          </div>
          <div style={{ fontSize: "3rem", marginBottom: 10 }}>{quiz.emoji}</div>
          <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.7rem)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 12px", color: "var(--ink)" }}>{quiz.title}</h1>
          <p style={{ fontSize: "1rem", color: "var(--ink-dim)", lineHeight: 1.7, maxWidth: 500, margin: "0 auto 18px" }}>{quiz.blurb}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: quiz.accent, fontWeight: 700 }}>
              {quiz.questions.length} questions
            </span>
            <span style={{ color: "var(--ink-faint)" }}>·</span>
            <a href={xShare} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.78rem", color: "var(--ink-dim)", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Share this quiz
            </a>
          </div>
        </div>
      </section>

      {/* Player */}
      <section style={{ padding: "36px 24px 8px" }}>
        <QuizPlayer category={quiz} />
      </section>

      {/* Try another */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px 72px" }}>
        <div className="section-header" style={{ marginBottom: 16 }}>Try another quiz</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {others.map((q) => (
            <Link key={q.slug} href={`/quiz/${q.slug}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{q.emoji}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)" }}>{q.label}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--ink-faint)" }}>{q.questions.length} questions</div>
              </div>
              <span style={{ marginLeft: "auto", color: q.accent, fontWeight: 800 }}>→</span>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/quiz" style={{ fontSize: "0.82rem", color: "var(--ink-dim)", textDecoration: "none", borderBottom: "1px solid var(--border-strong)", paddingBottom: 2 }}>
            ← All quizzes
          </Link>
        </div>
      </section>
    </main>
  );
}

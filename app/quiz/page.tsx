import type { Metadata } from "next";
import Link from "next/link";
import { QUIZZES } from "@/lib/quiz-data";

const TITLE = "K-pop Quizzes — Aegyo Arena";
const DESC =
  "Four K-pop quizzes, five questions each: fandom slang, artist facts, idol mukbangs, and a lyrics challenge. Test your knowledge and share your score.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/quiz" },
  openGraph: { title: TITLE, description: DESC, url: "https://www.aegyoarena.com/quiz", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export default function QuizHubPage() {
  return (
    <main style={{ minHeight: "70vh" }}>
      {/* Hero */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 16 }}>
          Aegyo Arena · Quizzes
        </div>
        <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 3.6rem)", fontWeight: 800, lineHeight: 1.05, margin: "0 0 16px", color: "var(--ink)" }}>
          How well do you<br />really know K-pop?
        </h1>
        <p style={{ fontSize: "1.05rem", color: "var(--ink-dim)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          Four quizzes, five questions each. Pick your category, beat your score, and share the link —
          every quiz has its own page built to send to your group chat.
        </p>
      </section>

      {/* Quiz grid */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {QUIZZES.map((quiz) => (
            <Link key={quiz.slug} href={`/quiz/${quiz.slug}`} className="quiz-hub-card" style={{ textDecoration: "none", position: "relative", display: "flex", flexDirection: "column", background: "var(--bg-card)", border: "1px solid var(--border-strong)", borderRadius: 16, padding: "26px 24px 22px", overflow: "hidden" }}>
              <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: quiz.accent }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <span style={{ fontSize: "2rem", width: 54, height: 54, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: `${quiz.accent}22`, flexShrink: 0 }}>
                  {quiz.emoji}
                </span>
                <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--ink)", lineHeight: 1.2 }}>{quiz.label}</div>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--ink-dim)", lineHeight: 1.6, margin: "0 0 20px", flex: 1 }}>{quiz.blurb}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
                  {quiz.questions.length} questions
                </span>
                <span style={{ fontWeight: 800, fontSize: "0.85rem", color: quiz.accent }}>Play →</span>
              </div>
            </Link>
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: 40, fontSize: "0.85rem", color: "var(--ink-faint)", lineHeight: 1.7 }}>
          Made for sharing — post a single quiz to X, TikTok, or Instagram and send fans straight to it.
        </p>
      </section>

      <style>{`
        .quiz-hub-card { transition: transform 0.15s ease, border-color 0.15s ease; }
        .quiz-hub-card:hover { transform: translateY(-3px); border-color: var(--ink-faint); }
      `}</style>
    </main>
  );
}

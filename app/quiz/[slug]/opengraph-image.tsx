import { ImageResponse } from "next/og";
import { QUIZZES, getQuizBySlug } from "@/lib/quiz-data";

export const alt = "Aegyo Arena — K-pop Quiz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ slug: q.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = getQuizBySlug(slug);
  const accent = quiz?.accent ?? "#FF6FA8";
  const title = quiz?.title ?? "K-pop Quiz";
  const blurb = quiz?.blurb ?? "How well do you really know K-pop?";
  const count = quiz?.questions.length ?? 5;

  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", background: "#2C3340", padding: "70px 80px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 16, background: accent, display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", fontSize: 30, letterSpacing: 8, color: accent, fontWeight: 700 }}>
          AEGYO ARENA
        </div>
        <div style={{ display: "flex", marginTop: 44 }}>
          <div style={{ display: "flex", background: accent, color: "#1B2027", fontSize: 24, fontWeight: 700, padding: "9px 24px", borderRadius: 999, letterSpacing: 3 }}>
            K-POP QUIZ
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 82, fontWeight: 800, color: "#FAFAF8", lineHeight: 1.04, maxWidth: 940 }}>
          {title}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 32, color: "rgba(250,250,248,0.62)", lineHeight: 1.4, maxWidth: 900 }}>
          {blurb}
        </div>
        <div style={{ display: "flex", marginTop: "auto", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: accent, letterSpacing: 2 }}>{count} QUESTIONS</div>
          <div style={{ display: "flex", fontSize: 28, color: "rgba(250,250,248,0.45)" }}>aegyoarena.com/quiz</div>
        </div>
      </div>
    ),
    size,
  );
}

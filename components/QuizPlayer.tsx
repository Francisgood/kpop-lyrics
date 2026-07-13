"use client";
import { useState } from "react";
import type { QuizCategory } from "@/lib/quiz-data";

// Inline, page-embedded player for a SINGLE quiz category (the /quiz/<slug> pages).
// Mirrors the homepage QuizModal's question/result UI, minus the modal chrome, plus
// score sharing so each result can be posted to social.
export default function QuizPlayer({ category }: { category: QuizCategory }) {
  const [qIndex, setQIndex]       = useState(0);
  const [selected, setSelected]   = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore]         = useState(0);
  const [done, setDone]           = useState(false);
  const [copied, setCopied]       = useState(false);

  const questions = category.questions;
  const current   = questions[qIndex];
  const total     = questions.length;
  const accent    = category.accent;
  const pct       = Math.round((score / total) * 100);

  const url       = `https://www.aegyoarena.com/quiz/${category.slug}`;
  const shareText = `I scored ${score}/${total} on the ${category.label} quiz on Aegyo Arena. Can you beat me?`;
  const xHref     = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;

  function confirm() {
    if (selected === null) return;
    if (selected === current.answer) setScore((s) => s + 1);
    setConfirmed(true);
  }
  function next() {
    if (qIndex + 1 < total) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      setDone(true);
    }
  }
  function restart() {
    setQIndex(0); setSelected(null); setConfirmed(false); setScore(0); setDone(false);
  }
  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: category.title, text: shareText, url }); } catch { /* dismissed */ }
    } else {
      copyLink();
    }
  }
  function copyLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    }
  }

  const card: React.CSSProperties = {
    background: "#fff", borderRadius: 14, width: "100%", maxWidth: 620,
    margin: "0 auto", overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
    border: "1px solid rgba(0,0,0,0.06)",
  };

  const resultEmoji = pct === 100 ? "🏆" : pct >= 80 ? "🌟" : pct >= 60 ? "👏" : pct >= 40 ? "📖" : "💪";
  const resultMsg =
    pct === 100 ? "Perfect score. You're a certified K-pop expert." :
    pct >= 80   ? "Impressive — you really know your K-pop." :
    pct >= 60   ? "Nice. Solid fandom knowledge." :
    pct >= 40   ? "Not bad — keep exploring Aegyo Arena." :
    "Rookie run. Try again and climb the ranks!";

  // ── Result ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={card}>
        <div style={{ height: 5, background: accent }} />
        <div style={{ padding: "40px 32px 34px", textAlign: "center" }}>
          <div style={{ fontSize: "3.4rem", marginBottom: 12 }}>{resultEmoji}</div>
          <div style={{ fontWeight: 800, fontSize: "2.2rem", color: "#111", marginBottom: 10 }}>{score} / {total}</div>
          <div style={{ width: "100%", height: 8, background: "#eee", borderRadius: 999, marginBottom: 18, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: accent, borderRadius: 999, transition: "width 0.6s ease" }} />
          </div>
          <p style={{ color: "#555", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 26px" }}>{resultMsg}</p>

          <div style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: 12 }}>
            Share your score
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 22 }}>
            <button onClick={nativeShare} style={{ background: accent, color: "#111", border: "none", borderRadius: 8, padding: "12px 22px", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.03em" }}>
              Share result
            </button>
            <a href={xHref} target="_blank" rel="noopener noreferrer" style={{ background: "#111", color: "#fff", borderRadius: 8, padding: "12px 22px", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>
              Post on X
            </a>
            <button onClick={copyLink} style={{ background: "#f0f0f0", color: "#111", border: "none", borderRadius: 8, padding: "12px 20px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              {copied ? "Link copied ✓" : "Copy link"}
            </button>
          </div>
          <button onClick={restart} style={{ background: "none", color: "#888", border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}>
            Play again
          </button>
        </div>
      </div>
    );
  }

  // ── Question ──────────────────────────────────────────────────────────────
  return (
    <div style={card}>
      <div style={{ height: 5, background: "#eee", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(qIndex / total) * 100}%`, background: accent, transition: "width 0.3s" }} />
      </div>
      <div style={{ padding: "26px 28px 30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <span style={{ fontSize: "1.4rem" }}>{category.emoji}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: "0.8rem", color: "#111" }}>{category.label}</div>
            <div style={{ fontSize: "0.72rem", color: "#aaa" }}>Question {qIndex + 1} of {total}</div>
          </div>
          <div style={{ marginLeft: "auto", fontWeight: 800, fontSize: "0.85rem", color: accent }}>{score}/{qIndex}</div>
        </div>

        <div style={{ fontWeight: 800, fontSize: "1.08rem", lineHeight: 1.5, color: "#111", marginBottom: 20 }}>{current.q}</div>

        {current.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.image} alt={current.imageAlt ?? ""} style={{ display: "block", width: "100%", maxWidth: 320, margin: "0 auto 20px", borderRadius: 12, border: "1px solid #ececec" }} />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {current.options.map((opt, i) => {
            let bg = "#f7f7f8", border = "#ececec", color = "#111";
            if (confirmed) {
              if (i === current.answer) { bg = "#e6f9f0"; border = "#22c55e"; color = "#15803d"; }
              else if (i === selected)  { bg = "#fef2f2"; border = "#ef4444"; color = "#b91c1c"; }
            } else if (i === selected)  { bg = "#fffbeb"; border = accent; }
            return (
              <button
                key={i}
                onClick={() => { if (!confirmed) setSelected(i); }}
                disabled={confirmed}
                style={{ background: bg, border: `2px solid ${border}`, borderRadius: 9, padding: "14px 16px", textAlign: "left", cursor: confirmed ? "default" : "pointer", fontWeight: 600, fontSize: "0.9rem", color, lineHeight: 1.4, display: "flex", alignItems: "center", gap: 12 }}
              >
                <span style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0, background: border === "#ececec" ? "#e0e0e0" : border, color: border === "#ececec" ? "#666" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800 }}>
                  {confirmed && i === current.answer ? "✓" : confirmed && i === selected ? "✕" : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {confirmed && (
          <div style={{ marginTop: 16, background: "#f9f9f9", borderLeft: `4px solid ${accent}`, borderRadius: "0 6px 6px 0", padding: "12px 16px", fontSize: "0.82rem", color: "#555", lineHeight: 1.6 }}>
            {current.explanation}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          {!confirmed ? (
            <button onClick={confirm} disabled={selected === null}
              style={{ width: "100%", background: selected === null ? "#e5e5e5" : accent, color: selected === null ? "#aaa" : "#111", border: "none", borderRadius: 9, padding: "14px", fontWeight: 800, fontSize: "0.9rem", cursor: selected === null ? "not-allowed" : "pointer", letterSpacing: "0.04em" }}>
              CHECK ANSWER
            </button>
          ) : (
            <button onClick={next}
              style={{ width: "100%", background: accent, color: "#111", border: "none", borderRadius: 9, padding: "14px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", letterSpacing: "0.04em" }}>
              {qIndex + 1 < total ? "NEXT QUESTION →" : "SEE RESULTS →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

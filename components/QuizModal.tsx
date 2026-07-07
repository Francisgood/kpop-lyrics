"use client";
import { useState, useEffect, useCallback } from "react";

import { QUIZZES as CATEGORIES, type QuizCategory as Category } from "@/lib/quiz-data";

// ── Component ─────────────────────────────────────────────────────────────────

type Phase = "pick" | "quiz" | "result";

interface QuizModalProps {
  onClose: () => void;
}

export default function QuizModal({ onClose }: QuizModalProps) {
  const [phase, setPhase]           = useState<Phase>("pick");
  const [category, setCategory]     = useState<Category | null>(null);
  const [qIndex, setQIndex]         = useState(0);
  const [selected, setSelected]     = useState<number | null>(null);
  const [confirmed, setConfirmed]   = useState(false);
  const [score, setScore]           = useState(0);

  // Close on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);
  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function startCategory(cat: Category) {
    setCategory(cat);
    setQIndex(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
    setPhase("quiz");
  }

  function handleSelect(i: number) {
    if (confirmed) return;
    setSelected(i);
  }

  function handleConfirm() {
    if (selected === null || !category) return;
    if (selected === category.questions[qIndex].answer) {
      setScore(s => s + 1);
    }
    setConfirmed(true);
  }

  function handleNext() {
    if (!category) return;
    if (qIndex + 1 < category.questions.length) {
      setQIndex(i => i + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      setPhase("result");
    }
  }

  function handleRestart() {
    setPhase("pick");
    setCategory(null);
    setQIndex(0);
    setSelected(null);
    setConfirmed(false);
    setScore(0);
  }

  const questions = category?.questions ?? [];
  const current   = questions[qIndex];
  const accent    = category?.accent ?? "var(--genius-yellow)";
  const total     = questions.length;
  const pct       = Math.round((score / total) * 100);

  const resultEmoji =
    pct === 100 ? "🏆" :
    pct >= 80   ? "🌟" :
    pct >= 60   ? "👏" :
    pct >= 40   ? "📖" : "💪";

  const resultMsg =
    pct === 100 ? "Perfect score! You're a certified K-pop expert." :
    pct >= 80   ? "Impressive! You really know your K-pop." :
    pct >= 60   ? "Nice! You've got solid fandom knowledge." :
    pct >= 40   ? "Keep exploring — the K-pop dictionary is waiting." :
    "Time to deep-dive into Aegyo Arena!";

  // ── Shared overlay & panel styles ──────────────────────────────────────────

  const overlay: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px",
    overflowY: "auto",
  };

  const panel: React.CSSProperties = {
    background: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 560,
    maxHeight: "calc(100dvh - 32px)",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
  };

  const closeBtn: React.CSSProperties = {
    position: "absolute", top: 14, right: 14,
    background: "none", border: "none", cursor: "pointer",
    fontSize: "1.4rem", color: "#888", lineHeight: 1, zIndex: 1,
    padding: 4,
  };

  // ── Pick category ──────────────────────────────────────────────────────────

  if (phase === "pick") {
    return (
      <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={panel}>
          <button style={closeBtn} onClick={onClose} aria-label="Close">✕</button>
          <div style={{ padding: "36px 32px 32px" }}>
            <div style={{ fontSize: "0.65rem", color: "var(--genius-yellow)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Aegyo Arena</div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 8px" }}>K-pop Quiz</h2>
            <p style={{ color: "#777", fontSize: "0.88rem", marginBottom: 28 }}>
              5 questions · Pick a category to start
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => startCategory(cat)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    background: "#f8f8f8", border: "2px solid #eee",
                    borderRadius: 10, padding: "18px 20px",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = cat.accent; (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#eee"; (e.currentTarget as HTMLButtonElement).style.background = "#f8f8f8"; }}
                >
                  <span style={{ fontSize: "2rem", flexShrink: 0 }}>{cat.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "#000" }}>{cat.label}</div>
                    <div style={{ fontSize: "0.78rem", color: "#777", marginTop: 2 }}>{cat.questions.length} questions</div>
                  </div>
                  <span style={{ marginLeft: "auto", color: "#ccc", fontSize: "1.2rem" }}>›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────

  if (phase === "quiz" && current) {
    return (
      <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={panel}>
          <button style={closeBtn} onClick={onClose} aria-label="Close">✕</button>

          {/* Progress bar */}
          <div style={{ height: 4, background: "#eee", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((qIndex) / total) * 100}%`, background: accent, transition: "width 0.3s" }} />
          </div>

          <div style={{ padding: "28px 28px 32px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: "1.4rem" }}>{category!.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#000" }}>{category!.label}</div>
                <div style={{ fontSize: "0.72rem", color: "#aaa" }}>Question {qIndex + 1} of {total}</div>
              </div>
              <div style={{ marginLeft: "auto", fontWeight: 800, fontSize: "0.85rem", color: accent }}>
                {score}/{qIndex}
              </div>
            </div>

            {/* Question */}
            <div style={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.5, marginBottom: 20, color: "#000" }}>
              {current.q}
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {current.options.map((opt, i) => {
                let bg = "#f8f8f8", border = "#eee", color = "#000";
                if (confirmed) {
                  if (i === current.answer)              { bg = "#e6f9f0"; border = "#22c55e"; color = "#15803d"; }
                  else if (i === selected && i !== current.answer) { bg = "#fef2f2"; border = "#ef4444"; color = "#b91c1c"; }
                } else if (i === selected) {
                  bg = "#fffbeb"; border = accent; color = "#000";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={confirmed}
                    style={{
                      background: bg, border: `2px solid ${border}`, borderRadius: 8,
                      padding: "14px 16px", textAlign: "left", cursor: confirmed ? "default" : "pointer",
                      fontWeight: 600, fontSize: "0.9rem", color, lineHeight: 1.4,
                      transition: "all 0.12s",
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: border === "#eee" ? "#e5e5e5" : border, color: confirmed && i === current.answer ? "#fff" : (border === "#eee" ? "#666" : "#fff"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>
                      {confirmed && i === current.answer ? "✓" : confirmed && i === selected && i !== current.answer ? "✕" : String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {confirmed && (
              <div style={{ marginTop: 18, background: "#f9f9f9", borderLeft: `4px solid ${accent}`, borderRadius: "0 6px 6px 0", padding: "12px 16px", fontSize: "0.82rem", color: "#555", lineHeight: 1.6 }}>
                {current.explanation}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              {!confirmed ? (
                <button
                  onClick={handleConfirm}
                  disabled={selected === null}
                  style={{ flex: 1, background: selected === null ? "#e5e5e5" : accent, color: selected === null ? "#aaa" : "#000", border: "none", borderRadius: 8, padding: "14px", fontWeight: 800, fontSize: "0.9rem", cursor: selected === null ? "not-allowed" : "pointer", letterSpacing: "0.04em" }}
                >
                  CHECK ANSWER
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  style={{ flex: 1, background: accent, color: "#000", border: "none", borderRadius: 8, padding: "14px", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", letterSpacing: "0.04em" }}
                >
                  {qIndex + 1 < total ? "NEXT QUESTION →" : "SEE RESULTS →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={panel}>
        <button style={closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <div style={{ padding: "40px 32px 36px", textAlign: "center" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>{resultEmoji}</div>
          <div style={{ fontWeight: 800, fontSize: "2rem", marginBottom: 8 }}>
            {score} / {total}
          </div>
          <div style={{ width: "100%", height: 8, background: "#eee", borderRadius: 999, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: accent, borderRadius: 999, transition: "width 0.6s ease" }} />
          </div>
          <p style={{ color: "#555", fontSize: "0.95rem", marginBottom: 28, lineHeight: 1.6 }}>{resultMsg}</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={handleRestart}
              style={{ background: accent, color: "#000", border: "none", borderRadius: 8, padding: "14px 24px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", letterSpacing: "0.04em" }}
            >
              TRY ANOTHER CATEGORY
            </button>
            <button
              onClick={onClose}
              style={{ background: "#f0f0f0", color: "#000", border: "none", borderRadius: 8, padding: "14px 24px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer" }}
            >
              Back to Site
            </button>
          </div>

          {/* Category breakdown */}
          <div style={{ marginTop: 28, textAlign: "left" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 12 }}>Your answers</div>
            {questions.map((q, i) => {
              // We don't track per-question answers in result phase — show the score tally
              return null;
            })}
            <div style={{ fontSize: "0.82rem", color: "#777" }}>
              {score === total ? "Every answer correct — phenomenal!" : `${total - score} question${total - score !== 1 ? "s" : ""} to revisit. Check the K-pop Dictionary for help.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import QuizModal from "./QuizModal";

export default function QuizButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "rgba(255,215,0,0.15)",
          border: "1px solid rgba(255,215,0,0.4)",
          borderRadius: 4,
          color: "var(--genius-yellow)",
          fontSize: "0.75rem",
          fontWeight: 800,
          letterSpacing: "0.06em",
          padding: "6px 14px",
          cursor: "pointer",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        QUIZ
      </button>
      {open && <QuizModal onClose={() => setOpen(false)} />}
    </>
  );
}

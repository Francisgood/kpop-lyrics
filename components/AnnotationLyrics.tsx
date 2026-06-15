"use client";

import { useState } from "react";
import Link from "next/link";

export type Ann = {
  id: string;
  lineIndex: number;
  word: string;
  note: string;
  termSlug: string | null;
  termName: string | null;
};

/**
 * Lyrics + Genius-style annotations.
 * - Annotated lines are pink-highlighted and clickable.
 * - Clicking a line slides an annotation panel out from the right (view = everyone).
 * - Contributing requires sign-up: logged-out users get a sign-up gate; logged-in
 *   users get an inline suggestion form that posts to /api/edits.
 */
export default function AnnotationLyrics({
  songId,
  koLines,
  enLines,
  roLines,
  annotations,
  isLoggedIn,
}: {
  songId: string;
  koLines: string[];
  enLines: string[];
  roLines: string[];
  annotations: Ann[];
  isLoggedIn: boolean;
}) {
  const byLine = new Map<number, Ann[]>();
  for (const a of annotations) {
    const arr = byLine.get(a.lineIndex) ?? [];
    arr.push(a);
    byLine.set(a.lineIndex, arr);
  }

  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [contribOpen, setContribOpen] = useState(false);

  const activeAnns = activeLine != null ? byLine.get(activeLine) ?? [] : [];
  const open = activeLine != null;

  function close() {
    setActiveLine(null);
    setContribOpen(false);
  }
  function onContribute() {
    if (!isLoggedIn) {
      setGateOpen(true);
      return;
    }
    setContribOpen(true);
  }

  return (
    <section>
      {annotations.length > 0 && (
        <div style={{ background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: "0.82rem", color: "var(--ink-dim)" }}>
          <strong style={{ color: "var(--sakura)" }}>Annotated lyrics</strong> — pink-highlighted lines have K-pop slang &amp; culture notes. Tap a line to read it.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid var(--border-strong)" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>한국어 (Korean)</div>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>English Translation</div>
      </div>

      {koLines.map((line, i) => {
        const isEmpty = !line.trim() && !enLines[i]?.trim();
        if (isEmpty) return <div key={i} style={{ height: 20 }} />;
        const annotated = (byLine.get(i)?.length ?? 0) > 0;
        const isActive = activeLine === i;
        return (
          <div key={i} className="lyric-line" style={{ borderBottom: "1px solid var(--border)", padding: "10px 0" }}>
            <div>
              {annotated ? (
                <button
                  type="button"
                  onClick={() => setActiveLine(i)}
                  style={{
                    display: "block", width: "100%", textAlign: "left", cursor: "pointer",
                    font: "inherit", fontWeight: 500,
                    background: isActive ? "var(--sakura)" : "var(--sakura-light)",
                    color: isActive ? "var(--on-accent)" : "var(--ink)",
                    border: "none", borderLeft: "3px solid var(--sakura)",
                    padding: "4px 10px", borderRadius: "0 4px 4px 0",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {line || " "}
                </button>
              ) : (
                <div className="lyric-line-ko" style={{ fontWeight: 500 }}>{line || " "}</div>
              )}
              {roLines[i] && <div className="lyric-romanized">{roLines[i]}</div>}
            </div>
            <div className="lyric-line-en" style={{ color: "#fff" }}>{enLines[i] || " "}</div>
          </div>
        );
      })}

      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200,
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 0.2s",
        }}
      />

      {/* Slide-out annotation panel */}
      <aside
        aria-hidden={!open}
        style={{
          position: "fixed", top: 0, right: 0, height: "100vh", width: "min(440px, 92vw)",
          background: "var(--bg-card)", borderLeft: "1px solid var(--border-strong)",
          boxShadow: "-12px 0 40px rgba(0,0,0,0.45)", zIndex: 201,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          overflowY: "auto",
        }}
      >
        {open && (
          <div style={{ padding: "20px 22px 48px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sakura)" }}>Annotation</span>
              <button type="button" onClick={close} aria-label="Close annotation" style={{ background: "none", border: "none", color: "var(--ink-dim)", fontSize: "1.6rem", lineHeight: 1, cursor: "pointer" }}>×</button>
            </div>

            <div style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--ink)", lineHeight: 1.5, marginBottom: roLines[activeLine!] ? 2 : 14 }}>
              {koLines[activeLine!]}
            </div>
            {roLines[activeLine!] && <div style={{ fontSize: "0.82rem", color: "var(--ink-faint)", fontStyle: "italic", marginBottom: 14 }}>{roLines[activeLine!]}</div>}
            <div style={{ fontSize: "0.9rem", color: "var(--ink-dim)", marginBottom: 4 }}>{enLines[activeLine!]}</div>

            {activeAnns.map((a) => (
              <div key={a.id} style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 16 }}>
                <div style={{ fontWeight: 700, color: "var(--sakura)", fontSize: "1rem", marginBottom: 6 }}>&ldquo;{a.word}&rdquo;</div>
                <div style={{ color: "var(--ink)", lineHeight: 1.7, fontSize: "0.95rem" }}>{a.note}</div>
                {a.termSlug && (
                  <Link href={`/korean-slang/${a.termSlug}`} style={{ display: "inline-block", marginTop: 10, fontSize: "0.8rem", color: "var(--sakura)", fontWeight: 600, textDecoration: "none" }}>
                    See full definition: {a.termName} →
                  </Link>
                )}
              </div>
            ))}

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 16 }}>
              {contribOpen ? (
                <ContributeForm songId={songId} lineIndex={activeLine!} onClose={() => setContribOpen(false)} />
              ) : (
                <button type="button" onClick={onContribute} style={{ width: "100%", padding: "11px", borderRadius: 8, border: "1px solid var(--sakura)", background: "transparent", color: "var(--sakura)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                  + Suggest an annotation
                </button>
              )}
            </div>
          </div>
        )}
      </aside>

      {gateOpen && <SignUpGate onClose={() => setGateOpen(false)} />}
    </section>
  );
}

function ContributeForm({ songId, lineIndex, onClose }: { songId: string; lineIndex: number; onClose: () => void }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit() {
    if (!text.trim()) return;
    setState("saving");
    try {
      const res = await fetch("/api/edits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "song",
          entityId: songId,
          field: `annotation:line-${lineIndex + 1}`,
          suggestedVal: text,
          reason: "Annotation suggestion",
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <div style={{ color: "var(--volt)", fontSize: "0.88rem", textAlign: "center", padding: "10px" }}>✓ Thanks! Your annotation was submitted for review.</div>;
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Explain the slang, reference, or cultural meaning of this line…"
        rows={4}
        style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "10px 12px", color: "var(--ink)", fontFamily: "var(--sans)", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box" }}
      />
      {state === "error" && <div style={{ color: "var(--sakura)", fontSize: "0.78rem", marginTop: 6 }}>Something went wrong — please try again.</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="button" onClick={submit} disabled={state === "saving" || !text.trim()} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", opacity: state === "saving" || !text.trim() ? 0.6 : 1 }}>
          {state === "saving" ? "Submitting…" : "Submit"}
        </button>
        <button type="button" onClick={onClose} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "transparent", color: "var(--ink-dim)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

function SignUpGate({ onClose }: { onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(380px, 94vw)", background: "var(--bg-card)", border: "1px solid var(--sakura)", borderRadius: 16, padding: "32px 28px", textAlign: "center", position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}>
        <button type="button" onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "var(--ink-faint)", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer" }}>×</button>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.9rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Sign up to annotate</div>
        <div style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 24 }}>
          Create a free Aegyo Arena account to contribute annotations, suggest edits, and earn Daebak Rewards.
        </div>
        <Link href="/signup" style={{ display: "block", padding: "13px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none", marginBottom: 14 }}>
          Sign Up
        </Link>
        <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--sakura)", fontWeight: 700 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/LangProvider";

type Def = { id: string; body: string; example: string | null; votesUp: number; votesDown: number };

export default function SlangDefinitions({ termName, definitions }: { termName: string; definitions: Def[] }) {
  const router = useRouter();
  // Only the UI chrome is translated here. The definition bodies/examples are DB
  // content with no ES column, and termName is a Korean term — both render as-is.
  const t = useT();
  const [counts, setCounts] = useState<Record<string, { up: number; down: number }>>(
    Object.fromEntries(definitions.map((d) => [d.id, { up: d.votesUp, down: d.votesDown }])),
  );
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<{ top: number; left: number; text: string } | null>(null);
  const [annotate, setAnnotate] = useState<{ text: string } | null>(null);
  const [note, setNote] = useState("");
  const [annState, setAnnState] = useState<"idle" | "saving" | "done">("idle");

  useEffect(() => {
    fetch("/api/vote").then((r) => r.json()).then((d) => { if (d.votes) setMyVotes(d.votes); }).catch(() => {});
  }, []);

  useEffect(() => {
    function compute() {
      const s = window.getSelection();
      const c = containerRef.current;
      if (!s || s.isCollapsed || !c || s.rangeCount === 0) { setSel(null); return; }
      const text = s.toString().trim();
      const range = s.getRangeAt(0);
      if (text.length < 2 || !c.contains(range.commonAncestorContainer)) { setSel(null); return; }
      const rect = range.getBoundingClientRect();
      setSel({ top: rect.top, left: rect.left + rect.width / 2, text });
    }
    const onUp = () => setTimeout(compute, 0);
    const onSel = () => { const s = window.getSelection(); if (!s || s.isCollapsed) setSel(null); };
    const onScroll = () => setSel(null);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    document.addEventListener("selectionchange", onSel);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
      document.removeEventListener("selectionchange", onSel);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  async function vote(id: string, value: 1 | -1) {
    if (busy) return;
    setBusy(id);
    try {
      const res = await fetch("/api/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ definitionId: id, value }) });
      if (res.status === 401) { router.push("/signup"); return; }
      const d = await res.json();
      if (res.ok) {
        setCounts((c) => ({ ...c, [id]: { up: d.votesUp, down: d.votesDown } }));
        setMyVotes((m) => ({ ...m, [id]: d.myVote }));
      }
    } finally {
      setBusy(null);
    }
  }

  function startAnnotate() {
    if (!sel) return;
    setAnnotate({ text: sel.text });
    setNote("");
    setAnnState("idle");
    setSel(null);
    window.getSelection()?.removeAllRanges();
  }

  async function submitAnnotation() {
    if (!annotate || !note.trim()) return;
    setAnnState("saving");
    const res = await fetch("/api/annotate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ songTitle: `${termName} — Korean slang`, word: annotate.text, note }) });
    if (res.status === 401) { router.push("/signup"); return; }
    setAnnState(res.ok ? "done" : "idle");
  }

  return (
    <>
      <div style={{ background: "rgba(255,111,168,0.08)", border: "1px solid var(--sakura)", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: "0.82rem", color: "var(--ink-dim)" }}>
        <strong style={{ color: "var(--sakura)" }}>Tip:</strong>{t(" vote on the definitions, or ", " vota las definiciones, o ")}<strong style={{ color: "var(--sakura)" }}>{t("highlight any text", "resalta cualquier texto")}</strong>{t(" to add your own annotation.", " para agregar tu propia anotación.")}
      </div>

      <div ref={containerRef}>
        {definitions.map((def, i) => {
          const c = counts[def.id] ?? { up: def.votesUp, down: def.votesDown };
          const mv = myVotes[def.id] ?? 0;
          return (
            <div key={def.id} className="genius-card" style={{ padding: 28, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ background: i === 0 ? "var(--genius-yellow)" : "#f0f0f0", color: "#000", fontWeight: 700, fontSize: "0.75rem", padding: "4px 12px", borderRadius: 999, letterSpacing: "0.05em" }}>
                  #{i + 1} {i === 0 ? t("TOP DEFINITION", "DEFINICIÓN TOP") : ""}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => vote(def.id, 1)} disabled={busy === def.id} className="vote-btn up"
                    style={{ fontSize: "0.82rem", cursor: "pointer", fontWeight: mv === 1 ? 800 : 500, border: mv === 1 ? "1px solid var(--sakura)" : undefined, color: mv === 1 ? "var(--sakura)" : undefined }}>
                    👍 {c.up}
                  </button>
                  <button type="button" onClick={() => vote(def.id, -1)} disabled={busy === def.id} className="vote-btn down"
                    style={{ fontSize: "0.82rem", cursor: "pointer", fontWeight: mv === -1 ? 800 : 500, border: mv === -1 ? "1px solid var(--sakura)" : undefined, color: mv === -1 ? "var(--sakura)" : undefined }}>
                    👎 {c.down}
                  </button>
                </div>
              </div>

              <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#fff", margin: "0 0 16px" }}>{def.body}</p>

              {def.example && (
                <div style={{ background: "rgba(255,111,168,0.18)", borderLeft: "3px solid var(--sakura)", padding: "12px 16px", borderRadius: "0 4px 4px 0", marginTop: 12 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--genius-gray)", marginBottom: 6 }}>{t("Example", "Ejemplo")}</div>
                  <div style={{ fontSize: "0.95rem", fontStyle: "italic", color: "#fff" }}>&ldquo;{def.example}&rdquo;</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sel && (
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={startAnnotate}
          style={{ position: "fixed", top: Math.max(8, sel.top - 46), left: sel.left, transform: "translateX(-50%)", zIndex: 150, background: "var(--sakura)", color: "var(--on-accent)", border: "none", borderRadius: 100, padding: "8px 16px", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>
          ✏️ {t("Annotate", "Anotar")}
        </button>
      )}

      {annotate && (
        <div onClick={() => setAnnotate(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px, 94vw)", background: "var(--bg-card)", border: "1px solid var(--sakura)", borderRadius: 16, padding: "24px 22px", position: "relative" }}>
            <button type="button" onClick={() => setAnnotate(null)} aria-label={t("Close", "Cerrar")} style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", color: "var(--ink-faint)", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer" }}>×</button>
            {annState === "done" ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>✓</div>
                <div style={{ color: "var(--ink)", fontWeight: 700 }}>{t("Submitted for review", "Enviado para revisión")}</div>
                <div style={{ color: "var(--ink-dim)", fontSize: "0.85rem", marginTop: 4 }}>{t(`Thanks for contributing to ${termName}!`, `¡Gracias por contribuir a ${termName}!`)}</div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 8 }}>{t("Annotate", "Anotar")}</div>
                <div style={{ fontSize: "0.9rem", color: "var(--ink-dim)", marginBottom: 12 }}>{t("On ", "Sobre ")}<strong style={{ color: "var(--sakura)" }}>&ldquo;{annotate.text}&rdquo;</strong></div>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} autoFocus placeholder={t("Explain the nuance, origin, or usage…", "Explica el matiz, el origen o el uso…")} style={{ width: "100%", background: "#fff", color: "#000", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "10px 12px", fontSize: "0.9rem", boxSizing: "border-box", resize: "vertical" }} />
                <button type="button" onClick={submitAnnotation} disabled={annState === "saving" || !note.trim()} style={{ width: "100%", marginTop: 10, padding: "11px", borderRadius: 8, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 700, cursor: "pointer", opacity: annState === "saving" || !note.trim() ? 0.6 : 1 }}>
                  {annState === "saving" ? t("Submitting…", "Enviando…") : t("Submit annotation", "Enviar anotación")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

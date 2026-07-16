"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

export type Ann = {
  id: string;
  lineIndex: number;
  word: string;
  note: string;
  termSlug: string | null;
  termName: string | null;
  // Community (contributor) annotations carry an author + a link to the detail page.
  authorName?: string | null;
  authorSlug?: string | null;
  href?: string | null;
};

type SelPrompt = { top: number; left: number; text: string; lineIndex: number };

/**
 * Lyrics + Genius-style annotations.
 * - Annotated lines are pink-highlighted and clickable → slide-out panel (view = everyone).
 * - Highlight ANY lyric text → a floating "Annotate" prompt appears at the selection.
 *   Logged-out users see "Sign Up to Start Annotating" (sign-up gate); logged-in users
 *   get the inline suggestion form (prefilled with the highlighted phrase), posting to /api/edits.
 */
export default function AnnotationLyrics({
  songId,
  songTitle,
  koLines,
  enLines,
  roLines,
  annotations,
  isLoggedIn,
}: {
  songId: string;
  songTitle?: string;
  koLines: string[];
  enLines: string[];
  roLines: string[];
  annotations: Ann[];
  isLoggedIn: boolean;
}) {
  const { lang } = useLang();
  const es = lang === "es";
  const byLine = new Map<number, Ann[]>();
  for (const a of annotations) {
    const arr = byLine.get(a.lineIndex) ?? [];
    arr.push(a);
    byLine.set(a.lineIndex, arr);
  }

  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [contribOpen, setContribOpen] = useState(false);
  const [selText, setSelText] = useState("");
  const [selPrompt, setSelPrompt] = useState<SelPrompt | null>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);

  // ~95% of traffic is mobile. On touch devices the native iOS selection bar
  // (Copy / Look Up / Find Selection) fires on any text highlight and covers our
  // floating "Annotate" prompt — so highlight-to-annotate is unusable there. On
  // coarse pointers we instead let users TAP a line to annotate it, and disable
  // text selection on the lyrics so the OS menu never appears.
  const [isTouch, setIsTouch] = useState(false);

  const activeAnns = activeLine != null ? byLine.get(activeLine) ?? [] : [];
  const open = activeLine != null;

  // Detect touch / coarse-pointer devices (mobile) — see note above.
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Highlight-to-annotate (desktop / fine pointer only): surface a floating prompt
  // at the current text selection. Skipped on touch, where tapping a line is the entry.
  useEffect(() => {
    if (isTouch) { setSelPrompt(null); return; }
    function compute() {
      const sel = window.getSelection();
      const container = lyricsRef.current;
      if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !container) {
        setSelPrompt(null);
        return;
      }
      const text = sel.toString().trim();
      const range = sel.getRangeAt(0);
      if (text.length < 2 || !container.contains(range.commonAncestorContainer)) {
        setSelPrompt(null);
        return;
      }
      let node: Node | null = sel.anchorNode;
      let lineIndex = -1;
      while (node && node !== container) {
        if (node instanceof HTMLElement && node.dataset.line != null) {
          lineIndex = Number(node.dataset.line);
          break;
        }
        node = node.parentNode;
      }
      const rect = range.getBoundingClientRect();
      setSelPrompt({ top: rect.top, left: rect.left + rect.width / 2, text, lineIndex });
    }
    const onUp = () => setTimeout(compute, 0);
    const onSelChange = () => {
      const s = window.getSelection();
      if (!s || s.isCollapsed) setSelPrompt(null);
    };
    const onScroll = () => setSelPrompt(null);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    document.addEventListener("selectionchange", onSelChange);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
      document.removeEventListener("selectionchange", onSelChange);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [isTouch]);

  function close() {
    setActiveLine(null);
    setContribOpen(false);
    setSelText("");
  }
  function onContribute() {
    if (!isLoggedIn) {
      setGateOpen(true);
      return;
    }
    setContribOpen(true);
  }
  function startAnnotateFromSelection() {
    if (!selPrompt) return;
    const { text, lineIndex } = selPrompt;
    setSelPrompt(null);
    window.getSelection()?.removeAllRanges();
    if (!isLoggedIn) {
      setGateOpen(true);
      return;
    }
    setSelText(text);
    setActiveLine(lineIndex >= 0 ? lineIndex : 0);
    setContribOpen(true);
  }
  // Touch entry point: tap a (non-annotated) line to annotate the whole line.
  function startAnnotateFromLine(lineIndex: number) {
    if (!isLoggedIn) {
      setGateOpen(true);
      return;
    }
    setSelText(koLines[lineIndex]?.trim() ?? "");
    setActiveLine(lineIndex);
    setContribOpen(true);
  }

  return (
    <section>
      {annotations.length > 0 ? (
        <div style={{ background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: "0.82rem", color: "var(--ink-dim)" }}>
          <strong style={{ color: "var(--sakura)" }}>{es ? "Letra anotada" : "Annotated lyrics"}</strong>
          {es
            ? <> — las líneas en rosa tienen notas de jerga y cultura K-pop (tócalas para leerlas). O <strong style={{ color: "var(--sakura)" }}>{isTouch ? "toca cualquier línea" : "resalta cualquier línea"}</strong> para agregar la tuya.</>
            : <> — pink lines have K-pop slang &amp; culture notes (tap to read). Or <strong style={{ color: "var(--sakura)" }}>{isTouch ? "tap any line" : "highlight any line"}</strong> to add your own.</>}
        </div>
      ) : (
        <div style={{ background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: "0.82rem", color: "var(--ink-dim)" }}>
          <strong style={{ color: "var(--sakura)" }}>
            {es ? (isTouch ? "Toca cualquier verso" : "Resalta cualquier verso") : (isTouch ? "Tap any lyric" : "Highlight any lyric")}
          </strong>
          {es
            ? " para empezar una anotación — explica la jerga, las referencias y la cultura detrás de las palabras."
            : " to start an annotation — explain the slang, references, and culture behind the words."}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid var(--border-strong)" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{es ? "한국어 (Coreano)" : "한국어 (Korean)"}</div>
        {/* The right column holds the ENGLISH translation — the ES label says so rather than implying Spanish lyrics. */}
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{es ? "Traducción al inglés" : "English Translation"}</div>
      </div>

      <div ref={lyricsRef} style={isTouch ? { WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" } : undefined}>
        {Array.from({ length: Math.max(koLines.length, enLines.length, roLines.length) }).map((_unused, i) => {
          const line = koLines[i] ?? "";
          const isEmpty = !line.trim() && !enLines[i]?.trim();
          if (isEmpty) return <div key={i} style={{ height: 20 }} />;
          const annotated = (byLine.get(i)?.length ?? 0) > 0;
          const isActive = activeLine === i;
          const tapToAnnotate = isTouch && !annotated;
          return (
            <div
              key={i}
              className="lyric-line"
              data-line={i}
              role={tapToAnnotate ? "button" : undefined}
              tabIndex={tapToAnnotate ? 0 : undefined}
              onClick={tapToAnnotate ? () => startAnnotateFromLine(i) : undefined}
              onKeyDown={tapToAnnotate ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startAnnotateFromLine(i); } } : undefined}
              style={{ borderBottom: "1px solid var(--border)", padding: "10px 0", cursor: tapToAnnotate ? "pointer" : undefined, WebkitTapHighlightColor: isTouch ? "rgba(255,111,168,0.22)" : undefined }}
            >
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
                    {line || " "}
                  </button>
                ) : (
                  <div className="lyric-line-ko" style={{ fontWeight: 500 }}>{line || " "}</div>
                )}
                {roLines[i] && <div className="lyric-romanized">{roLines[i]}</div>}
              </div>
              <div className="lyric-line-en" style={{ color: "#fff" }}>{enLines[i] || " "}</div>
            </div>
          );
        })}
      </div>

      {/* Floating highlight-to-annotate prompt (desktop only) */}
      {!isTouch && selPrompt && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={startAnnotateFromSelection}
          style={{
            position: "fixed", top: Math.max(8, selPrompt.top - 46), left: selPrompt.left, transform: "translateX(-50%)", zIndex: 150,
            background: "var(--sakura)", color: "var(--on-accent)", border: "none", borderRadius: 100,
            padding: "8px 16px", fontSize: "0.8rem", fontWeight: 800, cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)", whiteSpace: "nowrap",
          }}
        >
          {isLoggedIn
            ? (es ? "✏️ Anotar" : "✏️ Annotate")
            : (es ? "Regístrate para empezar a anotar" : "Sign Up to Start Annotating")}
        </button>
      )}

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
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sakura)" }}>{es ? "Anotación" : "Annotation"}</span>
              <button type="button" onClick={close} aria-label={es ? "Cerrar anotación" : "Close annotation"} style={{ background: "none", border: "none", color: "var(--ink-dim)", fontSize: "1.6rem", lineHeight: 1, cursor: "pointer" }}>×</button>
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
                    {es ? "Ver definición completa" : "See full definition"}: {a.termName} →
                  </Link>
                )}
                {a.authorName && (
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {a.authorSlug ? (
                      <Link href={`/u/${a.authorSlug}`} style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sakura)", textDecoration: "none" }}>— {a.authorName}</Link>
                    ) : (
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--ink)" }}>— {a.authorName}</span>
                    )}
                    {a.href && (
                      <Link href={a.href} style={{ fontSize: "0.76rem", color: "var(--ink-faint)", textDecoration: "none", marginLeft: "auto" }}>{es ? "ver completa →" : "view full →"}</Link>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 16 }}>
              {contribOpen ? (
                <ContributeForm songId={songId} songTitle={songTitle} lineIndex={activeLine!} selectedText={selText} onClose={() => { setContribOpen(false); setSelText(""); }} />
              ) : (
                <button type="button" onClick={onContribute} style={{ width: "100%", padding: "11px", borderRadius: 8, border: "1px solid var(--sakura)", background: "transparent", color: "var(--sakura)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                  {es ? "+ Sugerir una anotación" : "+ Suggest an annotation"}
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

function ContributeForm({ songTitle, selectedText, onClose }: { songId: string; songTitle?: string; lineIndex: number; selectedText?: string; onClose: () => void }) {
  const { lang } = useLang();
  const es = lang === "es";
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit() {
    if (!text.trim()) return;
    setState("saving");
    try {
      const res = await fetch("/api/annotate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songTitle: songTitle ?? "a song",
          word: selectedText ?? "",
          note: text,
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <div style={{ color: "var(--volt)", fontSize: "0.88rem", textAlign: "center", padding: "10px" }}>
      {es ? "✓ ¡Gracias! Tu anotación se envió a la cola de moderación para revisión." : "✓ Thanks! Your annotation was submitted to the moderation queue for review."}
    </div>;
  }

  return (
    <div>
      {selectedText && (
        <div style={{ marginBottom: 10, fontSize: "0.82rem", color: "var(--ink-dim)" }}>
          {es ? "Anotando" : "Annotating"}: <span style={{ color: "var(--sakura)", fontWeight: 700 }}>&ldquo;{selectedText}&rdquo;</span>
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={es ? "Explica la jerga, la referencia o el significado cultural de esta línea…" : "Explain the slang, reference, or cultural meaning of this line…"}
        rows={4}
        autoFocus
        style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "10px 12px", color: "var(--ink)", fontFamily: "var(--sans)", fontSize: "0.9rem", resize: "vertical", boxSizing: "border-box" }}
      />
      {state === "error" && <div style={{ color: "var(--sakura)", fontSize: "0.78rem", marginTop: 6 }}>{es ? "Algo salió mal — inténtalo de nuevo." : "Something went wrong — please try again."}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="button" onClick={submit} disabled={state === "saving" || !text.trim()} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", opacity: state === "saving" || !text.trim() ? 0.6 : 1 }}>
          {state === "saving" ? (es ? "Enviando…" : "Submitting…") : (es ? "Enviar" : "Submit")}
        </button>
        <button type="button" onClick={onClose} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "transparent", color: "var(--ink-dim)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>{es ? "Cancelar" : "Cancel"}</button>
      </div>
    </div>
  );
}

function SignUpGate({ onClose }: { onClose: () => void }) {
  const { lang } = useLang();
  const es = lang === "es";
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(380px, 94vw)", background: "var(--bg-card)", border: "1px solid var(--sakura)", borderRadius: 16, padding: "32px 28px", textAlign: "center", position: "relative", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}>
        <button type="button" onClick={onClose} aria-label={es ? "Cerrar" : "Close"} style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", color: "var(--ink-faint)", fontSize: "1.5rem", lineHeight: 1, cursor: "pointer" }}>×</button>
        <div style={{ fontFamily: "var(--serif)", fontSize: "1.9rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>{es ? "Regístrate para anotar" : "Sign up to annotate"}</div>
        <div style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 24 }}>
          {es
            ? "Crea una cuenta gratis en Aegyo Arena para contribuir con anotaciones, sugerir ediciones y ganar Daebak Rewards."
            : "Create a free Aegyo Arena account to contribute annotations, suggest edits, and earn Daebak Rewards."}
        </div>
        <Link href="/signup" style={{ display: "block", padding: "13px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none", marginBottom: 14 }}>
          {es ? "Registrarse" : "Sign Up"}
        </Link>
        <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)" }}>
          {es ? "¿Ya tienes una cuenta?" : "Already have an account?"} <Link href="/login" style={{ color: "var(--sakura)", fontWeight: 700 }}>{es ? "Inicia sesión" : "Sign in"}</Link>
        </div>
      </div>
    </div>
  );
}

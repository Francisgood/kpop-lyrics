"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AnnotationPanel from "./AnnotationPanel";
import AnnotationSignUpModal from "./AnnotationSignUpModal";

type Annotation = {
  id: string;
  word: string;
  note: string;
  createdAt: string;
  user: { id: string; displayName: string | null; avatarUrl: string | null } | null;
  term: { slug: string; term: string } | null;
};

interface Props {
  koLines:            string[];
  enLines:            string[];
  roLines:            string[];
  annotationsByLine:  Record<number, Annotation[]>;
  songId:             string;
  songTitle:          string;
  songSlug:           string;
  isLoggedIn:         boolean;
  canAnnotate:        boolean;
  currentUserId?:     string;
}

interface SelectionTooltip {
  x:         number;  // viewport-relative (fixed positioning)
  y:         number;
  lineIndex: number;
}

export default function LyricsSection({
  koLines,
  enLines,
  roLines,
  annotationsByLine,
  songId,
  songTitle,
  songSlug,
  isLoggedIn,
  canAnnotate,
  currentUserId,
}: Props) {
  // ── panel / annotation form state ──────────────────────────────────────────
  const [activeLine,      setActiveLine]      = useState<number | null>(null);
  const [panelOpen,       setPanelOpen]       = useState(false);
  const [addingAnnotation, setAddingAnnotation] = useState(false);
  const [annWord,         setAnnWord]         = useState("");
  const [annNote,         setAnnNote]         = useState("");
  const [annSaving,       setAnnSaving]       = useState(false);
  const [annMsg,          setAnnMsg]          = useState("");

  // ── hover state (logged-in annotate-on-hover) ───────────────────────────
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  // ── text-selection tooltip (not logged-in) ──────────────────────────────
  const [selTooltip,     setSelTooltip]     = useState<SelectionTooltip | null>(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const lyricsRef = useRef<HTMLDivElement>(null);

  // Listen for text selection events — only for non-logged-in users
  useEffect(() => {
    if (isLoggedIn) return;

    function handleMouseUp(e: MouseEvent) {
      // Small delay so the selection is finalized
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
          setSelTooltip(null);
          return;
        }

        // Only trigger inside the lyrics container
        if (!lyricsRef.current) return;
        const range    = sel.getRangeAt(0);
        const node     = range.commonAncestorContainer as Node;
        if (!lyricsRef.current.contains(node)) {
          setSelTooltip(null);
          return;
        }

        // Find which lyric row was selected via data-lineindex attribute
        const el  = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as Element;
        const row = el?.closest?.("[data-lineindex]") as HTMLElement | null;
        const li  = row ? parseInt(row.dataset.lineindex ?? "-1", 10) : -1;

        const rect = range.getBoundingClientRect();
        if (rect.width === 0) { setSelTooltip(null); return; }

        setSelTooltip({
          x:         rect.left + rect.width / 2,
          y:         rect.bottom + 10,
          lineIndex: li,
        });
      }, 10);
    }

    function handleMouseDown(e: MouseEvent) {
      // Clear tooltip when clicking elsewhere (unless clicking the tooltip itself)
      const target = e.target as HTMLElement;
      if (!target.closest?.("[data-annotate-tooltip]")) {
        setSelTooltip(null);
      }
    }

    document.addEventListener("mouseup",   handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup",   handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isLoggedIn]);

  // ── panel helpers ───────────────────────────────────────────────────────
  const openLine = useCallback((i: number) => {
    setActiveLine(i);
    setPanelOpen(true);
    setAddingAnnotation(false);
    setAnnWord("");
    setAnnNote("");
    setAnnMsg("");
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setActiveLine(null);
    setAddingAnnotation(false);
  }, []);

  const submitAnnotation = useCallback(async () => {
    if (!annWord.trim() || !annNote.trim() || activeLine === null) return;
    setAnnSaving(true);
    try {
      const res = await fetch("/api/annotations", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ songId, lineIndex: activeLine, word: annWord.trim(), note: annNote.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setAnnMsg("✓ Annotation submitted! It will appear after page refresh.");
      setAddingAnnotation(false);
      setAnnWord("");
      setAnnNote("");
    } catch {
      setAnnMsg("Failed to save. Please try again.");
    } finally {
      setAnnSaving(false);
    }
  }, [annWord, annNote, activeLine, songId]);

  const activeAnnotations = activeLine !== null ? (annotationsByLine[activeLine] ?? []) : [];
  const activeKoLine      = activeLine !== null ? (koLines[activeLine] ?? "") : "";

  return (
    <>
      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #000" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--genius-gray)" }}>한국어 (Korean)</div>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--genius-gray)" }}>English Translation</div>
      </div>

      {/* Lyric rows */}
      <div ref={lyricsRef}>
        {koLines.map((koLine, i) => {
          const isEmpty  = !koLine.trim() && !enLines[i]?.trim();
          if (isEmpty) return <div key={i} style={{ height: 20 }} />;

          const lineAnns = annotationsByLine[i] ?? [];
          const hasAnns  = lineAnns.length > 0;
          const isActive = activeLine === i;
          const isHovered = hoveredLine === i;

          return (
            <div
              key={i}
              data-lineindex={i}
              style={{ position: "relative" }}
              onMouseEnter={() => setHoveredLine(i)}
              onMouseLeave={() => setHoveredLine(null)}
            >
              {/* Hover "Annotate" button for logged-in users (any line) */}
              {isLoggedIn && isHovered && !panelOpen && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => openLine(i)}
                  style={{
                    position:   "absolute",
                    right:      0,
                    top:        "50%",
                    transform:  "translateY(-50%)",
                    zIndex:     20,
                    background: "#000",
                    color:      "var(--genius-yellow)",
                    border:     "none",
                    borderRadius: 4,
                    padding:    "4px 10px",
                    fontSize:   "0.72rem",
                    fontWeight: 800,
                    cursor:     "pointer",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    boxShadow:  "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {hasAnns ? `✏️ ${lineAnns.length} annotation${lineAnns.length > 1 ? "s" : ""}` : "✏️ Annotate"}
                </button>
              )}

              <div
                className="lyric-line"
                style={{
                  cursor:     hasAnns || (isLoggedIn && isHovered) ? "pointer" : "text",
                  background: isActive
                    ? "#000"
                    : hasAnns
                    ? "rgba(0,0,0,0.055)"
                    : isHovered && isLoggedIn
                    ? "rgba(255,255,100,0.12)"
                    : "transparent",
                  borderRadius: 4,
                  transition:  "background 0.15s",
                  padding:     "10px 8px",
                  userSelect:  isLoggedIn ? "none" : "text",
                }}
                onClick={() => hasAnns && openLine(i)}
                title={hasAnns
                  ? `${lineAnns.length} annotation${lineAnns.length > 1 ? "s" : ""} — click to view`
                  : undefined}
              >
                {/* Korean column */}
                <div>
                  <div
                    className="lyric-line-ko"
                    style={{
                      fontWeight: 500,
                      color:      isActive ? "#fff" : undefined,
                      borderBottom: hasAnns && !isActive
                        ? "2px solid rgba(100,100,100,0.3)"
                        : isActive
                        ? "2px solid rgba(255,255,255,0.4)"
                        : "none",
                      display:     "inline",
                      paddingBottom: hasAnns ? 1 : 0,
                    }}
                  >
                    {koLine || "\u00a0"}
                  </div>
                  {roLines[i] && (
                    <div className="lyric-romanized" style={{ color: isActive ? "rgba(255,255,255,0.65)" : undefined }}>
                      {roLines[i]}
                    </div>
                  )}
                  {hasAnns && !isActive && (
                    <div style={{ display: "inline-block", marginLeft: 8, fontSize: "0.65rem", background: "rgba(0,0,0,0.12)", color: "#444", borderRadius: 10, padding: "1px 7px", verticalAlign: "middle", fontWeight: 700 }}>
                      {lineAnns.length}
                    </div>
                  )}
                  {hasAnns && isActive && (
                    <div style={{ display: "inline-block", marginLeft: 8, fontSize: "0.65rem", background: "var(--genius-yellow)", color: "#000", borderRadius: 10, padding: "1px 7px", verticalAlign: "middle", fontWeight: 700 }}>
                      {lineAnns.length}
                    </div>
                  )}
                </div>

                {/* English column */}
                <div
                  className="lyric-line-en"
                  style={{ color: isActive ? "rgba(255,255,255,0.75)" : "#444" }}
                >
                  {enLines[i] || "\u00a0"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Selection tooltip (non-logged-in) ─────────────────────────────── */}
      {selTooltip && (
        <div
          data-annotate-tooltip="true"
          style={{
            position:     "fixed",
            left:         selTooltip.x,
            top:          selTooltip.y,
            transform:    "translateX(-50%)",
            zIndex:       300,
            pointerEvents: "auto",
          }}
        >
          {/* Arrow pointing up */}
          <div style={{
            width:       0,
            height:      0,
            borderLeft:  "7px solid transparent",
            borderRight: "7px solid transparent",
            borderBottom: "7px solid #000",
            margin:      "0 auto",
          }} />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setSelTooltip(null);
              setShowSignUpModal(true);
            }}
            style={{
              background:   "#000",
              color:        "#fff",
              border:       "none",
              borderRadius: 6,
              padding:      "8px 16px",
              fontSize:     "0.82rem",
              fontWeight:   700,
              cursor:       "pointer",
              whiteSpace:   "nowrap",
              letterSpacing: "0.02em",
              boxShadow:    "0 4px 16px rgba(0,0,0,0.35)",
            }}
          >
            Sign Up to Start Annotating
          </button>
        </div>
      )}

      {/* ── Sign-up modal ─────────────────────────────────────────────────── */}
      {showSignUpModal && (
        <AnnotationSignUpModal onClose={() => setShowSignUpModal(false)} />
      )}

      {/* ── Annotation Panel ──────────────────────────────────────────────── */}
      <AnnotationPanel
        isOpen={panelOpen}
        onClose={closePanel}
        lineText={activeKoLine}
        lineIndex={activeLine ?? 0}
        annotations={activeAnnotations}
        songTitle={songTitle}
        songSlug={songSlug}
        isLoggedIn={isLoggedIn}
        canAnnotate={canAnnotate}
        currentUserId={currentUserId}
        onAddAnnotation={() => setAddingAnnotation(true)}
      />

      {/* ── Add Annotation form panel ─────────────────────────────────────── */}
      {addingAnnotation && panelOpen && activeLine !== null && (
        <div style={{
          position:       "fixed",
          top:            0,
          right:          0,
          bottom:         0,
          width:          "min(420px, 100vw)",
          background:     "#fff",
          zIndex:         202,
          boxShadow:      "-4px 0 32px rgba(0,0,0,0.25)",
          display:        "flex",
          flexDirection:  "column",
          overflowY:      "hidden",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "2px solid #000", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  New Annotation · Line {activeLine + 1}
                </div>
                <blockquote style={{ margin: 0, padding: "8px 12px", background: "#000", color: "#fff", borderRadius: 4, fontSize: "0.88rem", fontWeight: 600 }}>
                  {activeKoLine}
                </blockquote>
              </div>
              <button onClick={() => setAddingAnnotation(false)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "#333", padding: "2px 4px" }}>×</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#666", display: "block", marginBottom: 6 }}>
                Phrase being annotated
              </label>
              <input
                value={annWord}
                onChange={(e) => setAnnWord(e.target.value)}
                placeholder='e.g. "착각하지마", "빛이 나"'
                autoFocus
                style={{ width: "100%", padding: "8px 12px", border: "2px solid #e5e5e5", borderRadius: 4, fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "#000")}
                onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#666", display: "block", marginBottom: 6 }}>
                Annotation
              </label>
              <textarea
                value={annNote}
                onChange={(e) => setAnnNote(e.target.value)}
                placeholder="Explain the symbolism, analogy, simile, metaphor, cultural reference, or writing motif…"
                rows={6}
                style={{ width: "100%", padding: "8px 12px", border: "2px solid #e5e5e5", borderRadius: 4, fontSize: "0.9rem", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.6, outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "#000")}
                onBlur={(e)  => (e.target.style.borderColor = "#e5e5e5")}
              />
            </div>

            {annMsg && (
              <div style={{ fontSize: "0.82rem", color: annMsg.startsWith("✓") ? "#16a34a" : "#c62828", marginBottom: 12, fontWeight: 600 }}>
                {annMsg}
              </div>
            )}
          </div>

          <div style={{ padding: "16px 20px", borderTop: "1px solid #eee", flexShrink: 0, display: "flex", gap: 10 }}>
            <button
              onClick={submitAnnotation}
              disabled={annSaving || !annWord.trim() || !annNote.trim()}
              style={{ flex: 1, background: "var(--genius-yellow)", border: "none", borderRadius: 4, padding: "10px 0", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em", opacity: (!annWord.trim() || !annNote.trim()) ? 0.5 : 1 }}
            >
              {annSaving ? "Saving…" : "Submit Annotation"}
            </button>
            <button
              onClick={() => setAddingAnnotation(false)}
              style={{ background: "#f4f4f4", border: "none", borderRadius: 4, padding: "10px 16px", fontSize: "0.82rem", cursor: "pointer", fontWeight: 600 }}
            >
              Back
            </button>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Annotation = {
  id: string;
  word: string;
  note: string;
  term?: { slug: string; term: string; definitions: { id: string }[] } | null;
};

interface Props {
  koLine: string;
  enLine: string;
  roLine: string;
  lineIndex: number;
  songId: string;
  annotations: Annotation[];
  isLoggedIn: boolean;
  canDirectEdit: boolean;
}

export default function LyricLineAnnotatable({
  koLine,
  enLine,
  roLine,
  lineIndex,
  songId,
  annotations,
  isLoggedIn,
  canDirectEdit,
}: Props) {
  const router = useRouter();

  const [rowHovered, setRowHovered] = useState(false);
  const [koHovered, setKoHovered] = useState(false);

  // Ko line editing
  const [editingKo, setEditingKo] = useState(false);
  const [editKoVal, setEditKoVal] = useState(koLine);
  const [koReason, setKoReason] = useState("");
  const [savingKo, setSavingKo] = useState(false);
  const [koMsg, setKoMsg] = useState("");

  // En line editing
  const [editingEn, setEditingEn] = useState(false);
  const [editEnVal, setEditEnVal] = useState(enLine);
  const [enReason, setEnReason] = useState("");
  const [savingEn, setSavingEn] = useState(false);
  const [enMsg, setEnMsg] = useState("");

  // Annotation form
  const [addingAnnotation, setAddingAnnotation] = useState(false);
  const [annWord, setAnnWord] = useState("");
  const [annNote, setAnnNote] = useState("");
  const [savingAnn, setSavingAnn] = useState(false);
  const [annMsg, setAnnMsg] = useState("");

  // Mobile long press
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startLongPress = useCallback(() => {
    touchTimer.current = setTimeout(() => setRowHovered(true), 1000);
  }, []);
  const cancelLongPress = useCallback(() => {
    if (touchTimer.current) { clearTimeout(touchTimer.current); touchTimer.current = null; }
  }, []);

  async function saveLine(field: "lyricsKo" | "lyricsEn", value: string, reason: string) {
    const res = await fetch("/api/lyrics/line", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId, lineIndex, field, value, reason }),
    });
    if (!res.ok) throw new Error("Save failed");
    return (await res.json()).suggested as boolean | undefined;
  }

  async function handleSaveKo() {
    setSavingKo(true);
    try {
      const suggested = await saveLine("lyricsKo", editKoVal, koReason);
      setKoMsg(suggested ? "✓ Suggested!" : "✓ Saved");
      setEditingKo(false);
      if (!suggested) router.refresh();
      setTimeout(() => setKoMsg(""), 3000);
    } catch { alert("Save failed"); }
    finally { setSavingKo(false); }
  }

  async function handleSaveEn() {
    setSavingEn(true);
    try {
      const suggested = await saveLine("lyricsEn", editEnVal, enReason);
      setEnMsg(suggested ? "✓ Suggested!" : "✓ Saved");
      setEditingEn(false);
      if (!suggested) router.refresh();
      setTimeout(() => setEnMsg(""), 3000);
    } catch { alert("Save failed"); }
    finally { setSavingEn(false); }
  }

  async function handleSaveAnnotation() {
    if (!annWord.trim() || !annNote.trim()) return;
    setSavingAnn(true);
    try {
      const res = await fetch("/api/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId, lineIndex, word: annWord.trim(), note: annNote.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setAnnMsg("✓ Annotation added!");
      setAddingAnnotation(false);
      setAnnWord("");
      setAnnNote("");
      router.refresh();
      setTimeout(() => setAnnMsg(""), 3000);
    } catch { alert("Failed to save annotation"); }
    finally { setSavingAnn(false); }
  }

  const hasAnnotations = annotations.length > 0;
  const showPencils = rowHovered && !editingKo && !editingEn && !addingAnnotation;

  const pencilBtn: React.CSSProperties = {
    background: "var(--genius-yellow)",
    border: "none",
    borderRadius: "50%",
    width: 22,
    height: 22,
    cursor: "pointer",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    lineHeight: 1,
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
  };

  return (
    <div
      className="lyric-line"
      style={{ position: "relative" }}
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => { setRowHovered(false); setKoHovered(false); }}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
    >
      {/* ── Korean column (left) ── */}
      <div style={{ position: "relative" }}>
        {/* Ko text row with action buttons */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <div
            className="lyric-line-ko"
            style={{
              flex: 1,
              cursor: hasAnnotations ? "help" : "default",
              borderRadius: 3,
              padding: "1px 3px",
              background: hasAnnotations && koHovered ? "rgba(255,255,100,0.22)" : "transparent",
              transition: "background 0.12s",
            }}
            onMouseEnter={() => hasAnnotations && setKoHovered(true)}
            onMouseLeave={() => setKoHovered(false)}
          >
            {koLine || "\u00a0"}
          </div>

          {/* Pencil — edit Korean */}
          {showPencils && (
            <button
              onClick={() => { setEditingKo(true); setRowHovered(false); }}
              title={canDirectEdit ? "Edit Korean line" : "Suggest Korean line correction"}
              style={pencilBtn}
            >
              ✎
            </button>
          )}

          {/* Plus — add annotation (logged-in users) */}
          {showPencils && isLoggedIn && (
            <button
              onClick={() => { setAddingAnnotation(true); setRowHovered(false); }}
              title="Add annotation"
              style={{ ...pencilBtn, background: "#dbeafe", color: "#1d4ed8", fontSize: 15, fontWeight: 700, border: "1px solid #93c5fd" }}
            >
              +
            </button>
          )}
        </div>

        {roLine && <div className="lyric-romanized">{roLine}</div>}

        {/* Annotation hover tooltip */}
        {hasAnnotations && koHovered && !editingKo && !addingAnnotation && (
          <div style={{
            position: "absolute",
            left: 0,
            top: "calc(100% + 4px)",
            zIndex: 100,
            background: "#fff",
            border: "2px solid var(--genius-yellow)",
            borderRadius: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.14)",
            padding: "10px 14px",
            minWidth: 240,
            maxWidth: 340,
            pointerEvents: "none",
          }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--genius-gray)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              {annotations.length} annotation{annotations.length > 1 ? "s" : ""}
            </div>
            {annotations.map((ann, idx) => (
              <div key={ann.id} style={{ marginBottom: idx < annotations.length - 1 ? 8 : 0, paddingBottom: idx < annotations.length - 1 ? 8 : 0, borderBottom: idx < annotations.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#000", marginBottom: 2 }}>
                  &ldquo;{ann.word}&rdquo;
                </div>
                <div style={{ fontSize: "0.78rem", color: "#555", lineHeight: 1.5 }}>
                  {ann.note.length > 120 ? ann.note.slice(0, 120) + "…" : ann.note}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline annotation blocks */}
        {hasAnnotations && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {annotations.map((ann) => (
              <div key={ann.id} style={{ background: "rgba(255,255,100,0.2)", borderLeft: "3px solid var(--genius-yellow)", padding: "8px 12px", borderRadius: "0 4px 4px 0", fontSize: "0.8rem" }}>
                <div style={{ fontWeight: 700, color: "#000", marginBottom: 2 }}>
                  {ann.term ? (
                    <Link href={`/define/${ann.term.slug}`} style={{ color: "#000", textDecoration: "underline", textDecorationColor: "var(--genius-yellow)" }}>
                      &ldquo;{ann.word}&rdquo;
                    </Link>
                  ) : (
                    <>&ldquo;{ann.word}&rdquo;</>
                  )}
                </div>
                <div style={{ color: "#555", lineHeight: 1.6 }}>{ann.note}</div>
                {ann.term && ann.term.definitions.length > 0 && (
                  <div style={{ marginTop: 4, fontSize: "0.75rem", color: "var(--genius-gray)" }}>
                    See: <Link href={`/define/${ann.term.slug}`} style={{ color: "var(--genius-gray)" }}>{ann.term.term}</Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ko edit form */}
        {editingKo && (
          <div style={{ marginTop: 8, background: "#fffde7", border: "2px solid var(--genius-yellow)", borderRadius: 6, padding: "12px 14px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, marginBottom: 6, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {canDirectEdit ? "Edit Korean line" : "Suggest Korean line correction"}
            </div>
            <textarea
              value={editKoVal}
              onChange={(e) => setEditKoVal(e.target.value)}
              rows={2}
              autoFocus
              style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e5e5", borderRadius: 4, fontSize: "1rem", resize: "none", fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.6 }}
            />
            {!canDirectEdit && (
              <input
                value={koReason}
                onChange={(e) => setKoReason(e.target.value)}
                placeholder="Reason (optional)"
                style={{ width: "100%", marginTop: 6, padding: "5px 8px", border: "1px solid #e5e5e5", borderRadius: 4, fontSize: "0.82rem", boxSizing: "border-box" }}
              />
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={handleSaveKo} disabled={savingKo} className="btn-yellow" style={{ fontSize: "0.72rem" }}>
                {savingKo ? "Saving…" : canDirectEdit ? "SAVE" : "SUGGEST"}
              </button>
              <button onClick={() => { setEditingKo(false); setEditKoVal(koLine); setKoReason(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "var(--genius-gray)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {koMsg && <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 700, display: "block", marginTop: 4 }}>{koMsg}</span>}
        {annMsg && <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 700, display: "block", marginTop: 4 }}>{annMsg}</span>}

        {/* Add annotation form */}
        {addingAnnotation && (
          <div style={{ marginTop: 8, background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 6, padding: "12px 14px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, marginBottom: 8, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Add annotation for line {lineIndex + 1}
            </div>
            <input
              value={annWord}
              onChange={(e) => setAnnWord(e.target.value)}
              placeholder='Phrase being annotated (e.g. "화이팅")'
              autoFocus
              style={{ width: "100%", marginBottom: 6, padding: "6px 8px", border: "1px solid #93c5fd", borderRadius: 4, fontSize: "0.85rem", boxSizing: "border-box" }}
            />
            <textarea
              value={annNote}
              onChange={(e) => setAnnNote(e.target.value)}
              placeholder="Commentary or explanation for fans…"
              rows={3}
              style={{ width: "100%", padding: "6px 8px", border: "1px solid #93c5fd", borderRadius: 4, fontSize: "0.85rem", resize: "none", boxSizing: "border-box", fontFamily: "inherit", lineHeight: 1.5 }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={handleSaveAnnotation}
                disabled={savingAnn || !annWord.trim() || !annNote.trim()}
                style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 4, padding: "5px 14px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, opacity: (!annWord.trim() || !annNote.trim()) ? 0.5 : 1 }}
              >
                {savingAnn ? "Saving…" : "ADD"}
              </button>
              <button onClick={() => { setAddingAnnotation(false); setAnnWord(""); setAnnNote(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "var(--genius-gray)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── English column (right) ── */}
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <div className="lyric-line-en" style={{ flex: 1 }}>
            {enLine || "\u00a0"}
          </div>

          {/* Pencil — edit English */}
          {showPencils && (
            <button
              onClick={() => { setEditingEn(true); setRowHovered(false); }}
              title={canDirectEdit ? "Edit English line" : "Suggest English line correction"}
              style={pencilBtn}
            >
              ✎
            </button>
          )}
        </div>

        {/* En edit form */}
        {editingEn && (
          <div style={{ marginTop: 8, background: "#fffde7", border: "2px solid var(--genius-yellow)", borderRadius: 6, padding: "12px 14px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, marginBottom: 6, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {canDirectEdit ? "Edit English line" : "Suggest English line correction"}
            </div>
            <textarea
              value={editEnVal}
              onChange={(e) => setEditEnVal(e.target.value)}
              rows={2}
              autoFocus
              style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e5e5", borderRadius: 4, fontSize: "1rem", resize: "none", fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.6, color: "#444" }}
            />
            {!canDirectEdit && (
              <input
                value={enReason}
                onChange={(e) => setEnReason(e.target.value)}
                placeholder="Reason (optional)"
                style={{ width: "100%", marginTop: 6, padding: "5px 8px", border: "1px solid #e5e5e5", borderRadius: 4, fontSize: "0.82rem", boxSizing: "border-box" }}
              />
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={handleSaveEn} disabled={savingEn} className="btn-yellow" style={{ fontSize: "0.72rem" }}>
                {savingEn ? "Saving…" : canDirectEdit ? "SAVE" : "SUGGEST"}
              </button>
              <button onClick={() => { setEditingEn(false); setEditEnVal(enLine); setEnReason(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "var(--genius-gray)" }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {enMsg && <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 700, display: "block", marginTop: 4 }}>{enMsg}</span>}
      </div>
    </div>
  );
}

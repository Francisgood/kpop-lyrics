"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import SuggestEditButton from "./SuggestEditButton";

interface Props {
  field: string;
  entityType: string;
  entityId: string;
  currentVal: string;
  isLoggedIn: boolean;
  canDirectEdit: boolean;
  children: React.ReactNode;
}

export default function EditableWrapper({
  field,
  entityType,
  entityId,
  currentVal,
  isLoggedIn,
  canDirectEdit,
  children,
}: Props) {
  const router = useRouter();
  const [iconVisible, setIconVisible] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [directMode, setDirectMode] = useState(false);
  const [editValue, setEditValue] = useState(currentVal);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTextarea = field.startsWith("lyrics") || currentVal.includes("\n") || currentVal.length > 120;

  const showIcon = useCallback(() => setIconVisible(true), []);
  const hideIcon = useCallback(() => setIconVisible(false), []);

  const onTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => setIconVisible(true), 1000);
  }, []);
  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  function openEdit() {
    setDirectMode(canDirectEdit);
    setFormOpen(true);
    setIconVisible(false);
    setSaved(false);
  }

  async function submitDirect(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/edits/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, field, value: editValue }),
      });
      if (res.ok) {
        setSaved(true);
        setFormOpen(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{ position: "relative", display: "block" }}
      onMouseEnter={showIcon}
      onMouseLeave={hideIcon}
      onTouchStart={onTouchStart}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
    >
      {children}

      {/* Pencil button */}
      {iconVisible && !formOpen && (
        <button
          onClick={openEdit}
          title={canDirectEdit ? `Edit ${field}` : `Suggest edit for ${field}`}
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "var(--genius-yellow)",
            color: "#000",
            border: "none",
            cursor: "pointer",
            fontSize: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            lineHeight: 1,
          }}
        >
          ✎
        </button>
      )}

      {/* Saved badge */}
      {saved && (
        <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 700, marginLeft: 6 }}>✓ Saved</span>
      )}

      {/* Edit forms */}
      {formOpen && (
        <div style={{ marginTop: 10, background: "#f8f8f8", border: "1px solid var(--genius-border)", borderRadius: 6, padding: 16, zIndex: 20, position: "relative" }}>
          {directMode ? (
            /* Admin / owner — direct edit form */
            <>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, marginBottom: 8 }}>
                Edit "{field}"
              </div>
              <form onSubmit={submitDirect} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {isTextarea ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={10}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--genius-border)", borderRadius: 4, fontSize: "0.85rem", resize: "vertical", fontFamily: "inherit" }}
                  />
                ) : (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{ width: "100%", padding: "6px 12px", border: "1px solid var(--genius-border)", borderRadius: 4, fontSize: "0.88rem" }}
                  />
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="submit" disabled={saving} className="btn-yellow" style={{ fontSize: "0.72rem" }}>
                    {saving ? "Saving…" : "SAVE"}
                  </button>
                  <button type="button" onClick={() => setFormOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "var(--genius-gray)" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Regular user — suggestion form */
            <>
              <SuggestEditButton
                entityType={entityType}
                entityId={entityId}
                field={field}
                currentVal={currentVal}
                isLoggedIn={isLoggedIn}
              />
              <button type="button" onClick={() => setFormOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 8, display: "block" }}>
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

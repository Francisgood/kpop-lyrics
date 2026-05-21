"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  entityType: string;
  entityId: string;
  field: string;
  currentVal?: string;
  label?: string;
  isLoggedIn: boolean;
}

export default function SuggestEditButton({ entityType, entityId, field, currentVal, label = "Suggest Edit", isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentVal ?? "");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/edits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, field, currentVal, suggestedVal: value, reason }),
      });
      if (!res.ok) {
        const d = await res.json();
        setErrorMsg(d.error ?? "Failed");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong");
    }
  }

  if (!isLoggedIn) {
    return (
      <Link href="/login" style={{ fontSize: "0.72rem", color: "var(--genius-gray)", textDecoration: "none" }}>
        ✎ {label}
      </Link>
    );
  }

  if (status === "done") {
    return <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 700 }}>✓ Edit submitted — thanks!</span>;
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", color: "var(--genius-gray)", padding: 0, textDecoration: "underline" }}
      >
        ✎ {label}
      </button>

      {open && (
        <div style={{ marginTop: 10, background: "#f8f8f8", border: "1px solid var(--genius-border)", borderRadius: 6, padding: 16 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, marginBottom: 8, color: "#000" }}>
            Suggest a correction for "{field}"
          </div>
          {status === "error" && <div style={{ fontSize: "0.78rem", color: "#c62828", marginBottom: 8 }}>{errorMsg}</div>}
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              placeholder="Your suggested value…"
              style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--genius-border)", borderRadius: 4, fontSize: "0.88rem", resize: "vertical", fontFamily: "inherit" }}
            />
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)"
              style={{ width: "100%", padding: "6px 12px", border: "1px solid var(--genius-border)", borderRadius: 4, fontSize: "0.85rem" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" disabled={status === "loading"} className="btn-yellow" style={{ fontSize: "0.72rem" }}>
                {status === "loading" ? "Submitting…" : "SUBMIT"}
              </button>
              <button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "var(--genius-gray)" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

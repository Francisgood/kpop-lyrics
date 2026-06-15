"use client";

import { useState } from "react";

export default function RestockAlert() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [already, setAlready] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/restock-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg((d as { error?: string }).error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setAlready(Boolean((d as { alreadyListed?: boolean }).alreadyListed));
      setStatus("ok");
    } catch {
      setMsg("Network error — please try again.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", background: "var(--bg-card)", border: "1px solid var(--sakura)", borderRadius: 12, padding: "18px 22px", maxWidth: 460, margin: "0 auto" }}>
        <span style={{ fontSize: "1.5rem" }}>💜</span>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "0.98rem" }}>
            {already ? "You’re already on the list!" : "You’re on the list!"}
          </div>
          <div style={{ color: "var(--ink-dim)", fontSize: "0.85rem", marginTop: 2 }}>
            We’ll email you the moment these drop back in stock.
          </div>
        </div>
      </div>
    );
  }

  const input: React.CSSProperties = {
    flex: 1, minWidth: 200, padding: "13px 16px", border: "1px solid var(--border-strong)",
    borderRadius: 8, fontSize: "1rem", outline: "none", background: "#fff", color: "#000", boxSizing: "border-box",
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 460, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status === "loading"}
          aria-label="Email address"
          style={input}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{ padding: "13px 24px", borderRadius: 8, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.02em", cursor: status === "loading" ? "wait" : "pointer", whiteSpace: "nowrap" }}
        >
          {status === "loading" ? "…" : "Notify me"}
        </button>
      </div>
      {status === "error" && (
        <div role="alert" style={{ marginTop: 10, fontSize: "0.85rem", color: "#ff5a5a", fontWeight: 600 }}>{msg}</div>
      )}
      <p style={{ marginTop: 12, fontSize: "0.76rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
        One email when we restock — no spam. You can unsubscribe anytime.
      </p>
    </form>
  );
}

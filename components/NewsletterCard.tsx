"use client";

import { useState } from "react";
import { trackSignup } from "@/lib/conversions";

export default function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("saving");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "culture-dance" }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) trackSignup();
    } catch {
      setState("error");
    }
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #ececf0", borderRadius: 20, padding: "34px 28px", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#ff6fa8", fontWeight: 700, marginBottom: 10 }}>Stay in the Loop</div>
      <div style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, color: "#15131f", marginBottom: 6 }}>K-pop news, straight to you.</div>
      <p style={{ color: "#6b6b72", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 18px" }}>
        New lyrics, artist breakdowns, slang drops, and chart alerts. No spam. Just K-pop.
      </p>
      {state === "done" ? (
        <div style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.95rem" }}>✓ You’re on the list — see you in your inbox!</div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 460, margin: "0 auto" }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={{ flex: "1 1 220px", minWidth: 0, padding: "12px 16px", borderRadius: 100, border: "1px solid #e2e2e8", fontSize: "0.95rem", color: "#15131f", background: "#fbfafc" }}
          />
          <button type="submit" disabled={state === "saving"} style={{ padding: "12px 22px", borderRadius: 100, border: "none", background: "#ff6fa8", color: "#fff", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", opacity: state === "saving" ? 0.6 : 1 }}>
            {state === "saving" ? "Subscribing…" : "Subscribe — It’s Free"}
          </button>
        </form>
      )}
      {state === "error" && <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: 8 }}>Something went wrong — try again.</div>}
      <div style={{ fontSize: "0.78rem", color: "#9a9aa6", marginTop: 14 }}>Join 40,000+ fans already on the list.</div>
    </div>
  );
}

"use client";

import { useState } from "react";

// ── Join Rewards (Step 1 — email already known, just enroll) ─────────────────
export function EnrollButton({ enrolled }: { enrolled: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "done">(enrolled ? "done" : "idle");
  const [err, setErr] = useState("");

  async function handleEnroll() {
    setState("loading");
    setErr("");
    try {
      const res = await fetch("/api/profile/update", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ step: "enroll" }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setState("done");
    } catch (e) {
      setErr((e as Error).message);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 8, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "1.3rem" }}>✅</span>
        <div>
          <div style={{ fontWeight: 700, color: "#166534", fontSize: "0.9rem" }}>You&apos;re enrolled in Daebak Rewards!</div>
          <div style={{ fontSize: "0.78rem", color: "#15803d", marginTop: 2 }}>Check your email — your welcome message is on its way.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleEnroll}
        disabled={state === "loading"}
        className="btn-yellow"
        style={{ width: "100%", padding: "14px 20px", fontSize: "0.9rem", letterSpacing: "0.08em", opacity: state === "loading" ? 0.6 : 1 }}
      >
        {state === "loading" ? "Enrolling…" : "JOIN DAEBAK REWARDS →"}
      </button>
      {err && <div style={{ marginTop: 8, fontSize: "0.78rem", color: "#ef4444" }}>{err}</div>}
    </div>
  );
}

// ── Phone step ───────────────────────────────────────────────────────────────
export function PhoneForm({ current }: { current: string | null }) {
  const [phone, setPhone]   = useState(current ?? "");
  const [state, setState]   = useState<"idle" | "loading" | "done">(current ? "done" : "idle");
  const [err, setErr]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErr("");
    try {
      const res = await fetch("/api/profile/update", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ step: "phone", phone }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setState("done");
    } catch (e) {
      setErr((e as Error).message);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div style={{ fontSize: "0.82rem", color: "#166534", fontWeight: 600 }}>
        ✅ Phone saved — you&apos;ll get SMS alerts for prize unlocks &amp; K-pop drops
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1 555 000 0000"
        required
        style={{ flex: 1, border: "1px solid var(--genius-border)", borderRadius: 4, padding: "10px 12px", fontSize: "0.9rem", outline: "none" }}
      />
      <button type="submit" disabled={state === "loading"} className="btn-yellow" style={{ flexShrink: 0, opacity: state === "loading" ? 0.6 : 1 }}>
        {state === "loading" ? "…" : "SAVE"}
      </button>
      {err && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{err}</div>}
    </form>
  );
}

// ── Zip code step ────────────────────────────────────────────────────────────
export function ZipCodeForm({ current }: { current: string | null }) {
  const [zip, setZip]     = useState(current ?? "");
  const [state, setState] = useState<"idle" | "loading" | "done">(current ? "done" : "idle");
  const [err, setErr]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErr("");
    try {
      const res = await fetch("/api/profile/update", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ step: "zipcode", zipCode: zip }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? "Failed");
      setState("done");
    } catch (e) {
      setErr((e as Error).message);
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div style={{ fontSize: "0.82rem", color: "#166534", fontWeight: 600 }}>
        ✅ Zip code saved — you&apos;ll get alerts for K-pop events near you
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        type="text"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        placeholder="ZIP / Postal code"
        maxLength={12}
        required
        style={{ flex: 1, border: "1px solid var(--genius-border)", borderRadius: 4, padding: "10px 12px", fontSize: "0.9rem", outline: "none" }}
      />
      <button type="submit" disabled={state === "loading"} className="btn-yellow" style={{ flexShrink: 0, opacity: state === "loading" ? 0.6 : 1 }}>
        {state === "loading" ? "…" : "SAVE"}
      </button>
      {err && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{err}</div>}
    </form>
  );
}

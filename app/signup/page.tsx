"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Signup failed"); return; }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link href="/" style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 800, color: "var(--genius-yellow)", textDecoration: "none", background: "#000", padding: "4px 14px", borderRadius: 4 }}>
            Aegyo Arena
          </Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 20, marginBottom: 6, color: "var(--ink)" }}>Join the fandom</h1>
          <p style={{ color: "var(--genius-gray)", fontSize: "0.88rem" }}>Save artists, comment on songs, suggest edits</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div style={{ background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: 4, padding: "10px 14px", fontSize: "0.85rem", color: "#c62828" }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your fan name"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--genius-border)", borderRadius: 4, fontSize: "0.95rem", outline: "none", background: "var(--surface)" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--genius-border)", borderRadius: 4, fontSize: "0.95rem", outline: "none", background: "var(--surface)" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min. 6 characters"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--genius-border)", borderRadius: 4, fontSize: "0.95rem", outline: "none", background: "var(--surface)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-yellow"
            style={{ width: "100%", padding: "12px", fontSize: "0.85rem", marginTop: 6, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Creating account…" : "CREATE ACCOUNT"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: "var(--genius-gray)" }}>
          Already a member?{" "}
          <Link href="/login" style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </div>

        <div style={{ marginTop: 20, fontSize: "0.72rem", color: "var(--genius-gray)", textAlign: "center", lineHeight: 1.6 }}>
          By creating an account you agree this is a fan-made site.<br />No personal data is sold or shared.
        </div>
      </div>
    </main>
  );
}

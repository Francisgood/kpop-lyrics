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

  const field: React.CSSProperties = { width: "100%", padding: "12px 15px", border: "1px solid var(--border-strong)", borderRadius: 9, fontSize: "0.95rem", outline: "none", background: "#fff", color: "#000", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: "0.72rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 7 };

  return (
    <main style={{ minHeight: "82vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Card */}
        <div style={{ background: "var(--bg-card)", border: "8px solid #fff", borderRadius: 18, padding: "30px 30px 34px", boxShadow: "0 18px 50px rgba(0,0,0,0.35)" }}>
          {/* Fun welcome GIF */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/aegyo-signup.gif" alt="" aria-hidden="true" style={{ width: 168, height: 168, objectFit: "cover", borderRadius: 18, border: "1px solid var(--border)", boxShadow: "0 8px 30px rgba(255,111,168,0.25)" }} />
          </div>

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "2rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 6px" }}>Join the fandom</h1>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", margin: 0 }}>Save artists, comment on songs, suggest edits</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {error && (
              <div style={{ background: "rgba(255,90,90,0.1)", border: "1px solid rgba(255,90,90,0.35)", borderRadius: 9, padding: "10px 14px", fontSize: "0.85rem", color: "#ff9a9a" }}>
                {error}
              </div>
            )}

            <div>
              <label style={labelStyle}>Display Name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your fan name" style={field} />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={field} />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Min. 6 characters" style={field} />
            </div>

            <button type="submit" disabled={loading} className="btn-yellow" style={{ width: "100%", padding: "13px", fontSize: "0.85rem", marginTop: 4, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Creating account…" : "CREATE ACCOUNT"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 22, fontSize: "0.88rem", color: "var(--ink-dim)" }}>
          Already a member?{" "}
          <Link href="/login" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </div>

        <div style={{ marginTop: 18, fontSize: "0.72rem", color: "var(--ink-faint)", textAlign: "center", lineHeight: 1.6 }}>
          By creating an account you agree this is a fan-made site.<br />No personal data is sold or shared.
        </div>
      </div>
    </main>
  );
}

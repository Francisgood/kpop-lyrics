"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackLoginPageView, trackLoginSuccess } from "@/lib/conversions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pageview conversion (GA4 / Reddit / TikTok / Taboola).
  useEffect(() => { trackLoginPageView(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed"); return; }
      trackLoginSuccess();
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
        <div style={{ background: "var(--bg-card)", border: "8px solid #fff", borderRadius: 18, padding: "34px 30px", boxShadow: "0 18px 50px rgba(0,0,0,0.35)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "2rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 6px" }}>Welcome back</h1>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", margin: 0 }}>Sign in to save favorites, comment, and more</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            {error && (
              <div style={{ background: "rgba(255,90,90,0.1)", border: "1px solid rgba(255,90,90,0.35)", borderRadius: 9, padding: "10px 14px", fontSize: "0.85rem", color: "#ff9a9a" }}>
                {error}
              </div>
            )}

            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={field} />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={field} />
            </div>

            <div style={{ textAlign: "right", marginTop: -4 }}>
              <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--sakura)", fontWeight: 600, textDecoration: "none" }}>
                Forgot my password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-yellow" style={{ width: "100%", padding: "13px", fontSize: "0.85rem", marginTop: 4, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Signing in…" : "SIGN IN"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 22, fontSize: "0.88rem", color: "var(--ink-dim)" }}>
          No account?{" "}
          <Link href="/signup" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
            Create one free
          </Link>
        </div>
      </div>
    </main>
  );
}

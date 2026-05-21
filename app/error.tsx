"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: "5rem", fontWeight: 900, color: "#eee", lineHeight: 1, marginBottom: 8 }}>500</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: 8, lineHeight: 1.6 }}>
          An unexpected error occurred. Our team has been notified.
        </p>
        {error.digest && (
          <p style={{ color: "#aaa", fontSize: "0.72rem", fontFamily: "monospace", marginBottom: 24 }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{ background: "#FFFF64", border: "none", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 20px", borderRadius: 4, cursor: "pointer" }}
          >
            Try again
          </button>
          <Link href="/" style={{ background: "#000", color: "#fff", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 20px", borderRadius: 4, textDecoration: "none" }}>
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

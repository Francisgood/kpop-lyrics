"use client";

import Link from "next/link";
import { useEffect } from "react";

const HTTP_ERRORS: Record<string, { code: number; title: string; message: string }> = {
  NOT_FOUND:        { code: 404, title: "Artist Not Found",        message: "This artist page doesn't exist or may have been removed." },
  UNAUTHORIZED:     { code: 401, title: "Unauthorized",            message: "You need to be signed in to view this page." },
  FORBIDDEN:        { code: 403, title: "Forbidden",               message: "You don't have permission to view this page." },
  INTERNAL_SERVER:  { code: 500, title: "Something went wrong",    message: "We hit an unexpected error loading this artist page." },
  SERVICE_UNAVAILABLE: { code: 503, title: "Service Unavailable",  message: "The database is temporarily unavailable. Try again in a moment." },
};

function classify(error: Error): (typeof HTTP_ERRORS)[string] {
  const msg = error.message?.toLowerCase() ?? "";
  if (msg.includes("not found") || msg.includes("p2025"))      return HTTP_ERRORS.NOT_FOUND;
  if (msg.includes("unauthorized") || msg.includes("p2028"))   return HTTP_ERRORS.UNAUTHORIZED;
  if (msg.includes("forbidden"))                                return HTTP_ERRORS.FORBIDDEN;
  if (msg.includes("timeout") || msg.includes("connection"))   return HTTP_ERRORS.SERVICE_UNAVAILABLE;
  return HTTP_ERRORS.INTERNAL_SERVER;
}

export default function ArtistError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[artist-page-error]", error);
  }, [error]);

  const { code, title, message } = classify(error);

  return (
    <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>
        <div style={{ fontSize: "5rem", fontWeight: 900, color: "#eee", lineHeight: 1, marginBottom: 8 }}>
          {code}
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 12 }}>{title}</h1>
        <p style={{ color: "var(--ink-dim)", fontSize: "0.95rem", marginBottom: 8, lineHeight: 1.6 }}>{message}</p>
        {error.digest && (
          <p style={{ color: "var(--ink-dim)", fontSize: "0.72rem", fontFamily: "monospace", marginBottom: 24 }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{ background: "var(--sakura)", border: "none", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 20px", borderRadius: 4, cursor: "pointer" }}
          >
            Try again
          </button>
          <Link href="/artists" style={{ background: "#000", color: "#fff", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 20px", borderRadius: 4, textDecoration: "none" }}>
            Browse Artists
          </Link>
        </div>
      </div>
    </main>
  );
}

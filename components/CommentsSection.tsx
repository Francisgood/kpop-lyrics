"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { T, useLang, useT } from "@/components/LangProvider";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; displayName: string | null; avatarUrl: string | null };
}

interface Props {
  entityType: string;
  entityId: string;
  isLoggedIn: boolean;
  currentUserName?: string | null;
}

export default function CommentsSection({ entityType, entityId, isLoggedIn, currentUserName }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { lang } = useLang();
  const t = useT();

  const load = useCallback(async () => {
    const res = await fetch(`/api/comments?entityType=${entityType}&entityId=${entityId}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments);
    }
  }, [entityType, entityId]);

  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, body }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? t("Failed to post", "No se pudo publicar"));
        return;
      }
      setBody("");
      await load();
    } catch {
      setError(t("Something went wrong", "Algo salió mal"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div className="section-header">
        <T en={`Comments (${comments.length})`} es={`Comentarios (${comments.length})`} />
      </div>

      {comments.length === 0 && (
        <div style={{ color: "var(--genius-gray)", fontSize: "0.85rem", marginBottom: 16 }}>
          <T en="No comments yet. Be the first!" es="Aún no hay comentarios. ¡Sé el primero!" />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {comments.map((c) => (
          <div key={c.id} className="genius-card" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--genius-yellow)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0 }}>
                {(c.user.displayName ?? "?")[0].toUpperCase()}
              </div>
              <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--ink)" }}>{c.user.displayName ?? "Fan"}</span>
              <span style={{ fontSize: "0.72rem", color: "var(--genius-gray)" }}>
                {new Date(c.createdAt).toLocaleDateString(lang === "es" ? "es-419" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--ink)", lineHeight: 1.6 }}>{c.body}</div>
          </div>
        ))}
      </div>

      {isLoggedIn ? (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)" }}>
            <T en={`Comment as ${currentUserName}`} es={`Comentando como ${currentUserName}`} />
          </div>
          {error && <div style={{ fontSize: "0.82rem", color: "#c62828" }}>{error}</div>}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("Share your thoughts…", "Comparte lo que piensas…")}
            aria-label={t("Your comment", "Tu comentario")}
            rows={3}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--genius-border)", borderRadius: 4, fontSize: "0.9rem", resize: "vertical", outline: "none", fontFamily: "inherit", background: "rgba(255,255,255,0.06)", color: "var(--ink)" }}
          />
          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="btn-yellow"
            style={{ alignSelf: "flex-start", opacity: loading || !body.trim() ? 0.5 : 1 }}
          >
            {loading ? t("Posting…", "Publicando…") : t("POST COMMENT", "PUBLICAR COMENTARIO")}
          </button>
        </form>
      ) : (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--genius-border)", borderRadius: 4, padding: "16px 20px", fontSize: "0.88rem", color: "var(--ink-dim)" }}>
          <Link href="/login" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
            <T en="Sign in" es="Inicia sesión" />
          </Link>
          <T en=" or " es=" o " />
          <Link href="/signup" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
            <T en="create an account" es="crea una cuenta" />
          </Link>
          <T en=" to leave a comment." es=" para dejar un comentario." />
        </div>
      )}
    </div>
  );
}

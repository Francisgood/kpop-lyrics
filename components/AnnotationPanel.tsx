"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Annotation = {
  id: string;
  word: string;
  note: string;
  createdAt: string;
  user: { id: string; displayName: string | null; avatarUrl: string | null } | null;
  term: { slug: string; term: string } | null;
};

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; displayName: string | null; avatarUrl: string | null };
};

interface AnnotationCardProps {
  ann: Annotation;
  isLoggedIn: boolean;
  currentUserId?: string;
}

function AnnotationCard({ ann, isLoggedIn, currentUserId }: AnnotationCardProps) {
  const [votes, setVotes] = useState<{ upvotes: number; downvotes: number; userVote: number } | null>(null);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);

  // Load vote data
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/annotations/${ann.id}/votes`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setVotes(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [ann.id]);

  // Load comment count (lightweight)
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/annotations/${ann.id}/comments`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setCommentCount(d.comments.length); } })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [ann.id]);

  const handleVote = useCallback(async (value: 1 | -1) => {
    if (!isLoggedIn || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/annotations/${ann.id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (res.ok) setVotes(await res.json());
    } finally {
      setVoting(false);
    }
  }, [ann.id, isLoggedIn, voting]);

  const loadComments = useCallback(async () => {
    if (comments !== null) { setShowComments(true); return; }
    const res = await fetch(`/api/annotations/${ann.id}/comments`);
    const d = await res.json();
    setComments(d.comments);
    setCommentCount(d.comments.length);
    setShowComments(true);
  }, [ann.id, comments]);

  const submitComment = useCallback(async () => {
    if (!commentInput.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/annotations/${ann.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentInput.trim() }),
      });
      if (res.ok) {
        const { comment } = await res.json();
        setComments((prev) => [...(prev ?? []), comment]);
        setCommentCount((c) => (c ?? 0) + 1);
        setCommentInput("");
      }
    } finally {
      setSubmittingComment(false);
    }
  }, [ann.id, commentInput, submittingComment]);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const authorLabel = ann.user?.displayName ?? (ann.user ? "Anonymous" : "Anonymous");
  const userVote = votes?.userVote ?? 0;

  const shareAnnotation = useCallback(() => {
    const url = `${window.location.href.split("#")[0]}#ann-${ann.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    alert("Annotation link copied!");
  }, [ann.id]);

  return (
    <div id={`ann-${ann.id}`} style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 20, marginBottom: 20 }}>
      {/* Author row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        {ann.user?.avatarUrl ? (
          <img src={ann.user.avatarUrl} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "#fff", flexShrink: 0, fontWeight: 700 }}>
            {authorLabel.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink)" }}>{authorLabel}</div>
          <div style={{ fontSize: "0.68rem", color: "var(--ink-dim)" }}>{fmtDate(ann.createdAt)}</div>
        </div>
      </div>

      {/* Annotated word */}
      <div style={{ marginBottom: 8 }}>
        {ann.term ? (
          <Link href={`/define/${ann.term.slug}`} style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--ink)", background: "rgba(255,255,100,0.5)", padding: "2px 6px", borderRadius: 3, textDecoration: "none" }}>
            &ldquo;{ann.word}&rdquo;
          </Link>
        ) : (
          <span style={{ fontWeight: 800, fontSize: "0.88rem", background: "rgba(255,255,100,0.5)", padding: "2px 6px", borderRadius: 3 }}>
            &ldquo;{ann.word}&rdquo;
          </span>
        )}
      </div>

      {/* Note */}
      <div style={{ fontSize: "0.88rem", color: "var(--ink)", lineHeight: 1.7, marginBottom: 14 }}>
        {ann.note}
      </div>

      {ann.term && (
        <div style={{ marginBottom: 12, fontSize: "0.75rem" }}>
          <Link href={`/define/${ann.term.slug}`} style={{ color: "var(--ink-dim)", textDecoration: "underline" }}>
            → See full definition: {ann.term.term}
          </Link>
        </div>
      )}

      {/* Action row: votes + comments + share */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {/* Upvote */}
        <button
          onClick={() => handleVote(1)}
          disabled={!isLoggedIn || voting}
          title={isLoggedIn ? "Upvote" : "Sign in to vote"}
          style={{
            display: "flex", alignItems: "center", gap: 5, background: userVote === 1 ? "#000" : "#f4f4f4",
            color: userVote === 1 ? "#fff" : "#333", border: "none", borderRadius: 20, padding: "5px 12px",
            cursor: isLoggedIn ? "pointer" : "default", fontSize: "0.78rem", fontWeight: 700, transition: "all 0.15s",
          }}
        >
          <span>▲</span>
          <span>{votes?.upvotes ?? 0}</span>
        </button>

        {/* Downvote */}
        <button
          onClick={() => handleVote(-1)}
          disabled={!isLoggedIn || voting}
          title={isLoggedIn ? "Downvote" : "Sign in to vote"}
          style={{
            display: "flex", alignItems: "center", gap: 5, background: userVote === -1 ? "#c62828" : "#f4f4f4",
            color: userVote === -1 ? "#fff" : "#333", border: "none", borderRadius: 20, padding: "5px 12px",
            cursor: isLoggedIn ? "pointer" : "default", fontSize: "0.78rem", fontWeight: 700, transition: "all 0.15s",
          }}
        >
          <span>▼</span>
          <span>{votes?.downvotes ?? 0}</span>
        </button>

        {/* Comments toggle */}
        <button
          onClick={showComments ? () => setShowComments(false) : loadComments}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "var(--ink-dim)", fontSize: "0.78rem", cursor: "pointer", padding: "5px 6px" }}
        >
          💬 {commentCount !== null ? commentCount : "…"}
        </button>

        {/* Share */}
        <button
          onClick={shareAnnotation}
          style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "var(--ink-dim)", fontSize: "0.78rem", cursor: "pointer", padding: "5px 6px", marginLeft: "auto" }}
        >
          ↗ Share
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div style={{ marginTop: 14 }}>
          {(comments ?? []).length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {(comments ?? []).map((c) => (
                <div key={c.id} style={{ fontSize: "0.82rem", display: "flex", gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e5e5e5", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, marginTop: 1 }}>
                    {(c.user.displayName ?? "A").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 700, marginRight: 6, fontSize: "0.72rem" }}>{c.user.displayName ?? "Anonymous"}</span>
                    <span style={{ color: "var(--ink)" }}>{c.body}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "0.78rem", color: "var(--ink-dim)", marginBottom: 10 }}>No comments yet. Be first!</div>
          )}

          {isLoggedIn ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment()}
                placeholder="Add a comment…"
                style={{ flex: 1, padding: "6px 10px", border: "1px solid #e5e5e5", borderRadius: 20, fontSize: "0.82rem", outline: "none" }}
              />
              <button
                onClick={submitComment}
                disabled={submittingComment || !commentInput.trim()}
                style={{ background: "#000", color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", opacity: !commentInput.trim() ? 0.4 : 1 }}
              >
                Post
              </button>
            </div>
          ) : (
            <Link href="/login" style={{ fontSize: "0.78rem", color: "var(--ink-dim)", textDecoration: "underline" }}>
              Sign in to comment
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lineText: string;
  lineIndex: number;
  annotations: Annotation[];
  songTitle: string;
  songSlug: string;
  isLoggedIn: boolean;
  canAnnotate: boolean;
  currentUserId?: string;
  onAddAnnotation?: () => void;
}

export default function AnnotationPanel({
  isOpen,
  onClose,
  lineText,
  lineIndex,
  annotations,
  songTitle,
  songSlug,
  isLoggedIn,
  canAnnotate,
  currentUserId,
  onAddAnnotation,
}: Props) {
  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen && annotations.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, backdropFilter: "blur(1px)" }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(420px, 100vw)",
          background: "var(--surface)",
          zIndex: 201,
          boxShadow: "-4px 0 32px rgba(0,0,0,0.18)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          overflowY: "hidden",
        }}
      >
        {/* Panel header */}
        <div style={{ padding: "16px 20px", borderBottom: "2px solid #000", flexShrink: 0, background: "var(--surface)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--ink-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                {songTitle} · Line {lineIndex + 1}
              </div>
              <blockquote style={{ margin: 0, padding: "8px 12px", background: "#000", color: "#fff", borderRadius: 4, fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.5, wordBreak: "break-word" }}>
                {lineText || "\u00a0"}
              </blockquote>
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "var(--ink)", padding: "2px 4px", lineHeight: 1, flexShrink: 0, marginTop: 2 }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Annotations list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>
          {annotations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--ink-dim)", fontSize: "0.88rem" }}>
              No annotations yet for this line.
            </div>
          ) : (
            annotations.map((ann) => (
              <AnnotationCard
                key={ann.id}
                ann={ann}
                isLoggedIn={isLoggedIn}
                currentUserId={currentUserId}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", flexShrink: 0, background: "var(--surface)" }}>
          {canAnnotate ? (
            <button
              onClick={onAddAnnotation}
              style={{ width: "100%", background: "var(--genius-yellow)", border: "none", borderRadius: 4, padding: "10px 0", fontSize: "0.82rem", fontWeight: 800, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              + Add Annotation
            </button>
          ) : isLoggedIn ? (
            <div style={{ fontSize: "0.75rem", color: "var(--ink-dim)", textAlign: "center" }}>
              Contributor status required to add annotations
            </div>
          ) : (
            <Link
              href="/login"
              style={{ display: "block", textAlign: "center", background: "var(--surface)", padding: "10px 0", borderRadius: 4, fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)", textDecoration: "none" }}
            >
              Sign in to annotate
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

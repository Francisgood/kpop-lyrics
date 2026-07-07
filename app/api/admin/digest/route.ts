import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";
import { ensureCommunity } from "@/lib/community-db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily review digest — emails moderators the new lyric + annotation submissions
// that registered users have suggested, so they can be reviewed/approved.
// Auth: Bearer ${IMAGE_REFRESH_SECRET} (same automation secret as the other admin
// endpoints). Trigger daily (e.g. a scheduled job that curls this).
// Query params: ?hours=24 (look-back window), ?send=0 (dry run, no email).

const RECIPIENTS = ["noreply@aegyoarena.com", "simon@myosin.xyz"];
const SITE = "https://www.aegyoarena.com";

function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

function esc(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function clip(s: string, n = 220): string {
  const t = (s ?? "").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
}

type PendingAnn = { id: string; authorName: string; songTitle: string; songSlug: string | null; word: string; note: string; createdAt: Date };

async function handle(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const hours = Math.max(1, Number(url.searchParams.get("hours") ?? 24));
  const doSend = url.searchParams.get("send") !== "0";
  const since = new Date(Date.now() - hours * 3600_000);

  await ensureCommunity();

  // New pending community annotations from real registered users (their ids start with "u-").
  const anns = await prisma.$queryRawUnsafe<PendingAnn[]>(
    `SELECT "id","authorName","songTitle","songSlug","word","note","createdAt"
       FROM "CommunityAnnotation"
      WHERE "status" = 'pending' AND "id" LIKE 'u-%' AND "createdAt" >= $1
      ORDER BY "createdAt" DESC`,
    since,
  );

  // New pending edit suggestions (lyric submissions are entityType=song + field starting "lyrics").
  const editsRaw = await prisma.suggestedEdit.findMany({
    where: { status: "pending", createdAt: { gte: since } },
    include: { user: { select: { email: true, displayName: true } } },
    orderBy: { createdAt: "desc" },
  });
  const lyricEdits = editsRaw.filter((e) => e.entityType === "song" && e.field.toLowerCase().startsWith("lyrics"));
  const otherEdits = editsRaw.filter((e) => !(e.entityType === "song" && e.field.toLowerCase().startsWith("lyrics")));

  // Resolve song slug/title for the lyric submissions so we can link to the song page.
  const songIds = [...new Set(lyricEdits.map((e) => e.entityId))];
  const songs = songIds.length
    ? await prisma.song.findMany({ where: { id: { in: songIds } }, select: { id: true, slug: true, title: true } })
    : [];
  const songById = new Map(songs.map((s) => [s.id, s]));

  // Totals still awaiting review (context in the footer).
  const totalPendAnn = await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*)::int c FROM "CommunityAnnotation" WHERE "status" = 'pending' AND "id" LIKE 'u-%'`,
  );
  const totalPendEdit = await prisma.suggestedEdit.count({ where: { status: "pending" } });

  const newCount = anns.length + lyricEdits.length;
  const date = new Date().toISOString().slice(0, 10);
  const subject = newCount > 0
    ? `Aegyo Arena · ${newCount} new submission${newCount === 1 ? "" : "s"} to review (${date})`
    : `Aegyo Arena · daily review digest — no new submissions (${date})`;

  // ── HTML body ──────────────────────────────────────────────────────────────
  const parts: string[] = [];
  parts.push(`<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;color:#1b2027">`);
  parts.push(`<h1 style="font-size:20px;margin:0 0 4px">Daily review digest</h1>`);
  parts.push(`<p style="color:#888;font-size:13px;margin:0 0 20px">New submissions from registered users in the last ${hours}h · ${esc(date)}</p>`);

  if (lyricEdits.length) {
    parts.push(`<h2 style="font-size:15px;margin:22px 0 8px;color:#111">📝 Lyric submissions (${lyricEdits.length})</h2>`);
    for (const e of lyricEdits) {
      const s = songById.get(e.entityId);
      const who = e.user?.displayName || e.user?.email || "a user";
      const link = s ? `${SITE}/songs/${s.slug}` : `${SITE}/admin`;
      parts.push(
        `<div style="border:1px solid #eee;border-radius:8px;padding:12px 14px;margin-bottom:10px">
           <div style="font-weight:700;font-size:14px"><a href="${link}" style="color:#0f3460;text-decoration:none">${esc(s?.title ?? e.entityId)}</a> · <span style="color:#888;font-weight:400">${esc(e.field)}</span></div>
           <div style="font-size:12px;color:#888;margin:2px 0 8px">by ${esc(who)} · ${new Date(e.createdAt).toUTCString()}</div>
           <div style="white-space:pre-wrap;font-size:13px;color:#333;background:#fafafa;border-radius:6px;padding:8px 10px">${esc(clip(e.suggestedVal, 600))}</div>
         </div>`,
      );
    }
  }

  if (anns.length) {
    parts.push(`<h2 style="font-size:15px;margin:22px 0 8px;color:#111">💬 Annotations (${anns.length})</h2>`);
    for (const a of anns) {
      const link = a.songSlug ? `${SITE}/songs/${a.songSlug}` : `${SITE}/admin`;
      parts.push(
        `<div style="border:1px solid #eee;border-radius:8px;padding:12px 14px;margin-bottom:10px">
           <div style="font-weight:700;font-size:14px"><a href="${link}" style="color:#0f3460;text-decoration:none">${esc(a.songTitle)}</a>${a.word ? ` · <span style="color:#888;font-weight:400">“${esc(a.word)}”</span>` : ""}</div>
           <div style="font-size:12px;color:#888;margin:2px 0 8px">by ${esc(a.authorName)} · ${new Date(a.createdAt).toUTCString()}</div>
           <div style="font-size:13px;color:#333">${esc(clip(a.note, 400))}</div>
         </div>`,
      );
    }
  }

  if (newCount === 0) {
    parts.push(`<p style="font-size:14px;color:#555">No new lyric or annotation submissions in the last ${hours}h.</p>`);
  }

  const extra = otherEdits.length ? ` · ${otherEdits.length} other edit suggestion${otherEdits.length === 1 ? "" : "s"}` : "";
  parts.push(
    `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#666">
       <strong>${totalPendAnn[0]?.c ?? 0}</strong> annotation${(totalPendAnn[0]?.c ?? 0) === 1 ? "" : "s"} and <strong>${totalPendEdit}</strong> edit suggestion${totalPendEdit === 1 ? "" : "s"} still pending review${extra}.
       <br/><a href="${SITE}/admin" style="color:#0f3460">Open the moderation dashboard →</a>
     </div>`,
  );
  parts.push(`</div>`);
  const html = parts.join("");

  // ── Plain-text fallback ──────────────────────────────────────────────────────
  const textLines = [`Aegyo Arena — Daily review digest (${date})`, `New submissions in the last ${hours}h:`, ""];
  for (const e of lyricEdits) {
    const s = songById.get(e.entityId);
    textLines.push(`[Lyrics] ${s?.title ?? e.entityId} (${e.field}) — by ${e.user?.displayName || e.user?.email || "a user"}`);
    textLines.push(`  ${clip(e.suggestedVal, 200).replace(/\n/g, " ")}`);
  }
  for (const a of anns) {
    textLines.push(`[Annotation] ${a.songTitle}${a.word ? ` — “${a.word}”` : ""} — by ${a.authorName}`);
    textLines.push(`  ${clip(a.note, 200)}`);
  }
  if (newCount === 0) textLines.push("(none)");
  textLines.push("", `Pending review: ${totalPendAnn[0]?.c ?? 0} annotations, ${totalPendEdit} edits.`, `${SITE}/admin`);
  const text = textLines.join("\n");

  let sent = 0;
  if (doSend) {
    for (const to of RECIPIENTS) {
      if (await sendMail({ to, subject, text, html })) sent++;
    }
  }

  return NextResponse.json({
    ok: true,
    windowHours: hours,
    new: { annotations: anns.length, lyricSubmissions: lyricEdits.length, otherEdits: otherEdits.length },
    pendingTotals: { annotations: totalPendAnn[0]?.c ?? 0, edits: totalPendEdit },
    emailed: doSend ? sent : 0,
    recipients: doSend ? RECIPIENTS : [],
  });
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }

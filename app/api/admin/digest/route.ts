import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";
import { ensureCommunity } from "@/lib/community-db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily digest — emails the moderator a snapshot: new sign-ups, BTS giveaway
// entrants (total + last window), and the latest annotation/lyric submissions.
// Auth: Bearer ${IMAGE_REFRESH_SECRET}. Params: ?hours=24, ?send=0 (dry run),
// ?probe=1 (Mailjet connectivity diagnostic). Trigger once daily.

const RECIPIENTS = ["noreply@aegyoarena.com"];
const FROM = "hello@aegyoarena.com";
const SITE = "https://www.aegyoarena.com";

function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}
function esc(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function clip(s: string, n = 200): string {
  const t = (s ?? "").trim().replace(/\s+/g, " ");
  return t.length > n ? t.slice(0, n) + "…" : t;
}

type AnnSub = { id: string; authorName: string; songTitle: string; songSlug: string | null; word: string; note: string; status: string; createdAt: Date };
type Sub = { type: "Annotation" | "Lyrics"; title: string; slug: string | null; who: string; snippet: string; status: string; createdAt: Date };

async function handle(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);

  // Diagnostic: ?probe=1 — direct Mailjet send, returns raw response (keys / sender / account status).
  if (url.searchParams.get("probe") === "1") {
    const pub = process.env.MJ_APIKEY_PUBLIC, priv = process.env.MJ_APIKEY_PRIVATE;
    if (!pub || !priv) return NextResponse.json({ probe: true, mailConfigured: false, note: "MJ_APIKEY_PUBLIC/PRIVATE not present in this deployment" });
    const auth = Buffer.from(`${pub}:${priv}`).toString("base64");
    const r = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ Messages: [{ From: { Email: FROM, Name: "Aegyo Arena" }, To: [{ Email: RECIPIENTS[0] }], Subject: "Aegyo Arena — Mailjet probe", TextPart: "Digest Mailjet connectivity probe." }] }),
    });
    const body = await r.text().catch(() => "");
    return NextResponse.json({ probe: true, mailConfigured: true, from: FROM, to: RECIPIENTS[0], mailjetStatus: r.status, mailjetBody: body.slice(0, 600) });
  }

  const hours = Math.max(1, Number(url.searchParams.get("hours") ?? 24));
  const doSend = url.searchParams.get("send") !== "0";
  const since = new Date(Date.now() - hours * 3600_000);

  await ensureCommunity();

  // ── Metrics ──────────────────────────────────────────────────────────────
  const signups = await prisma.user.count({ where: { createdAt: { gte: since } } });

  let giveawayTotal = 0, giveawayWindow = 0;
  try {
    const t = await prisma.$queryRawUnsafe<{ c: number }[]>(`SELECT COUNT(*)::int c FROM "GiveawayEntry"`);
    giveawayTotal = Number(t[0]?.c ?? 0);
    const d = await prisma.$queryRawUnsafe<{ c: number }[]>(`SELECT COUNT(*)::int c FROM "GiveawayEntry" WHERE "createdAt" >= $1`, since);
    giveawayWindow = Number(d[0]?.c ?? 0);
  } catch { /* GiveawayEntry table not created yet */ }

  // ── Last 10 submissions (annotations + lyric submissions, any status) ──────
  const annSubs = await prisma.$queryRawUnsafe<AnnSub[]>(
    `SELECT "id","authorName","songTitle","songSlug","word","note","status","createdAt"
       FROM "CommunityAnnotation" WHERE "id" LIKE 'u-%' ORDER BY "createdAt" DESC LIMIT 10`,
  );
  const lyricSubs = await prisma.suggestedEdit.findMany({
    where: { entityType: "song", field: { startsWith: "lyrics" } },
    include: { user: { select: { email: true, displayName: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const songIds = [...new Set(lyricSubs.map((e) => e.entityId))];
  const songs = songIds.length
    ? await prisma.song.findMany({ where: { id: { in: songIds } }, select: { id: true, slug: true, title: true } })
    : [];
  const songById = new Map(songs.map((s) => [s.id, s]));

  const subs: Sub[] = [
    ...annSubs.map((a): Sub => ({
      type: "Annotation", title: a.songTitle, slug: a.songSlug, who: a.authorName,
      snippet: (a.word ? `“${a.word}” — ` : "") + a.note, status: a.status, createdAt: new Date(a.createdAt),
    })),
    ...lyricSubs.map((e): Sub => {
      const s = songById.get(e.entityId);
      return {
        type: "Lyrics", title: s?.title ?? e.entityId, slug: s?.slug ?? null,
        who: e.user?.displayName || e.user?.email || "a user", snippet: e.suggestedVal, status: e.status, createdAt: new Date(e.createdAt),
      };
    }),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  const totalPendAnn = await prisma.$queryRawUnsafe<{ c: number }[]>(
    `SELECT COUNT(*)::int c FROM "CommunityAnnotation" WHERE "status" = 'pending' AND "id" LIKE 'u-%'`,
  );
  const totalPendEdit = await prisma.suggestedEdit.count({ where: { status: "pending" } });

  const date = new Date().toISOString().slice(0, 10);
  const subject = `Aegyo Arena · daily digest — ${signups} sign-up${signups === 1 ? "" : "s"}, ${giveawayWindow} new entrant${giveawayWindow === 1 ? "" : "s"} (${date})`;

  // ── HTML body ────────────────────────────────────────────────────────────
  const statCard = (label: string, value: number | string) =>
    `<td style="padding:14px 16px;background:#f6f7f9;border-radius:8px;text-align:center;width:33%">
       <div style="font-size:26px;font-weight:800;color:#0f3460">${value}</div>
       <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-top:4px">${label}</div>
     </td>`;
  const statusColor = (s: string) => (s === "approved" ? "#16a34a" : s === "rejected" ? "#dc2626" : "#d97706");

  const rows: string[] = [];
  rows.push(`<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;color:#1b2027">`);
  rows.push(`<h1 style="font-size:20px;margin:0 0 2px">Aegyo Arena — daily digest</h1>`);
  rows.push(`<p style="color:#888;font-size:13px;margin:0 0 18px">${esc(date)} · last ${hours}h</p>`);
  rows.push(`<table style="width:100%;border-collapse:separate;border-spacing:8px 0;margin-bottom:6px"><tr>
      ${statCard("New sign-ups (24h)", signups)}
      ${statCard("Giveaway entrants (total)", giveawayTotal)}
      ${statCard("Giveaway entrants (24h)", giveawayWindow)}
    </tr></table>`);

  rows.push(`<h2 style="font-size:15px;margin:26px 0 10px;color:#111">Latest submissions <span style="color:#aaa;font-weight:400">(last ${subs.length})</span></h2>`);
  if (subs.length === 0) {
    rows.push(`<p style="font-size:14px;color:#555">No annotation or lyric submissions yet.</p>`);
  } else {
    for (const s of subs) {
      const link = s.slug ? `${SITE}/songs/${s.slug}` : `${SITE}/admin`;
      const badge = s.type === "Lyrics" ? "#7c3aed" : "#0ea5e9";
      rows.push(
        `<div style="border:1px solid #eee;border-radius:8px;padding:11px 14px;margin-bottom:9px">
           <div style="font-size:13px">
             <span style="display:inline-block;background:${badge};color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.04em">${s.type}</span>
             <a href="${link}" style="color:#0f3460;text-decoration:none;font-weight:700;margin-left:6px">${esc(s.title)}</a>
             <span style="color:${statusColor(s.status)};font-size:11px;font-weight:700;margin-left:6px">${esc(s.status)}</span>
           </div>
           <div style="font-size:11px;color:#999;margin:3px 0 6px">by ${esc(s.who)} · ${new Date(s.createdAt).toUTCString()}</div>
           <div style="font-size:13px;color:#333">${esc(clip(s.snippet, 240))}</div>
         </div>`,
      );
    }
  }

  rows.push(
    `<div style="margin-top:22px;padding-top:14px;border-top:1px solid #eee;font-size:13px;color:#666">
       <strong>${totalPendAnn[0]?.c ?? 0}</strong> annotation${(totalPendAnn[0]?.c ?? 0) === 1 ? "" : "s"} and <strong>${totalPendEdit}</strong> edit${totalPendEdit === 1 ? "" : "s"} awaiting review.
       <br/><a href="${SITE}/admin" style="color:#0f3460">Open the moderation dashboard →</a>
     </div></div>`,
  );
  const html = rows.join("");

  // ── Plain-text fallback ──────────────────────────────────────────────────
  const text = [
    `Aegyo Arena — daily digest (${date}, last ${hours}h)`,
    ``,
    `New sign-ups (24h):        ${signups}`,
    `Giveaway entrants (total): ${giveawayTotal}`,
    `Giveaway entrants (24h):   ${giveawayWindow}`,
    ``,
    `Latest submissions (last ${subs.length}):`,
    ...(subs.length ? subs.map((s) => `- [${s.type}/${s.status}] ${s.title} — by ${s.who}\n    ${clip(s.snippet, 160)}`) : ["  (none yet)"]),
    ``,
    `Pending review: ${totalPendAnn[0]?.c ?? 0} annotations, ${totalPendEdit} edits.`,
    `${SITE}/admin`,
  ].join("\n");

  let sent = 0;
  if (doSend) {
    for (const to of RECIPIENTS) {
      if (await sendMail({ to, subject, text, html, from: FROM })) sent++;
    }
  }

  return NextResponse.json({
    ok: true,
    mailConfigured: Boolean(process.env.MJ_APIKEY_PUBLIC && process.env.MJ_APIKEY_PRIVATE),
    windowHours: hours,
    stats: { signups24h: signups, giveawayTotal, giveawayWindow },
    submissions: subs.length,
    pendingTotals: { annotations: totalPendAnn[0]?.c ?? 0, edits: totalPendEdit },
    emailed: doSend ? sent : 0,
    recipients: doSend ? RECIPIENTS : [],
  });
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }

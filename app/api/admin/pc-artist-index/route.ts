import { NextRequest, NextResponse } from "next/server";
import { ingestArtistIndex, getArtistIndex, type ArtistIndexIn } from "@/lib/pc-artist-index-db";

export const dynamic = "force-dynamic";

// Secret-gated ingest for the per-idol Idol Market Index. Auth: Bearer
// ${IMAGE_REFRESH_SECRET}. POST { artists: [ { slug, name, group, groupSlug,
// topCard:{...}, topBundle:{...}, supply:{...}, signal, confidence } ] } upserts
// each idol by slug (idempotent). Live immediately — no deploy. GET = snapshot.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json().catch(() => ({}));
    const rows: ArtistIndexIn[] = Array.isArray(b?.artists) ? b.artists : Array.isArray(b) ? b : [];
    if (!rows.length) return NextResponse.json({ error: "Provide { artists: [...] }" }, { status: 400 });
    const n = await ingestArtistIndex(rows);
    return NextResponse.json({ ok: true, upserted: n });
  } catch (e) {
    console.error("pc-artist-index ingest error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await getArtistIndex();
  return NextResponse.json({ ok: true, count: rows.length, artists: rows.map((r) => ({ slug: r.slug, name: r.name, group: r.group })) });
}

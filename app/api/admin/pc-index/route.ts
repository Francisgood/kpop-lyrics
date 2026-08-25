import { NextRequest, NextResponse } from "next/server";
import { ingestCards, getAllCardsWithListings } from "@/lib/pc-index-db";
import type { PcCardSeed } from "@/lib/pc-index";

export const dynamic = "force-dynamic";

// Secret-gated ingest for the PC Index card/listing ledger. Auth: Bearer
// ${IMAGE_REFRESH_SECRET}. POST { cards: [ { sku, name, ..., listings:[...] } ] }
// upserts each card and replaces its listing snapshot (idempotent). GET returns a
// coverage snapshot.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await req.json().catch(() => ({}));
    const cards: PcCardSeed[] = Array.isArray(b?.cards) ? b.cards : Array.isArray(b) ? b : [];
    if (!cards.length) return NextResponse.json({ error: "Provide { cards: [...] }" }, { status: 400 });
    const res = await ingestCards(cards);
    return NextResponse.json({ ok: true, ...res });
  } catch (e) {
    console.error("pc-index ingest error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cards = await getAllCardsWithListings();
  return NextResponse.json({
    ok: true,
    cards: cards.map((c) => ({ sku: c.sku, name: c.name, listings: c.listings.length, sold: c.listings.filter((l) => l.status === "sold").length })),
  });
}

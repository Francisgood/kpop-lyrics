import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureRegistrationTable } from "@/lib/event-registrations";
import { deleteBeehiivSubscription } from "@/lib/beehiiv";

export const dynamic = "force-dynamic";

// Secret-gated read of the attendee list for a hosted event. Same Bearer secret
// as the other admin routes; nothing here is public.
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  return !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureRegistrationTable();
    const slug = new URL(req.url).searchParams.get("slug");
    const rows = slug
      ? await prisma.$queryRaw`SELECT "id","eventSlug","name","email","optIn","beehiivStatus","beehiivAt","confirmedAt","createdAt" FROM "EventRegistration" WHERE "eventSlug" = ${slug} ORDER BY "createdAt" ASC`
      : await prisma.$queryRaw`SELECT "id","eventSlug","name","email","optIn","beehiivStatus","beehiivAt","confirmedAt","createdAt" FROM "EventRegistration" ORDER BY "createdAt" ASC`;
    const list = rows as { optIn: boolean; beehiivStatus: string | null; confirmedAt: Date | null }[];
    return NextResponse.json({
      ok: true,
      count: list.length,
      optedIn: list.filter((r) => r.optIn).length,
      subscribed: list.filter((r) => r.beehiivStatus === "subscribed").length,
      confirmed: list.filter((r) => r.confirmedAt).length,
      registrations: list,
    });
  } catch (e) {
    console.error("event registrations read error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

/**
 * Remove a registration — for test rows and obvious junk, not for unsubscribes
 * (someone who wants off the list replies to the confirmation). Pass
 * `purgeBeehiiv` to drop the matching subscription as well, which is what undoes
 * a test sign-up cleanly.
 */
export async function DELETE(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureRegistrationTable();
    const b = await req.json().catch(() => ({}));
    const slug = String(b.slug ?? "").trim();
    const email = String(b.email ?? "").trim().toLowerCase();
    if (!slug || !email) return NextResponse.json({ error: "Provide slug and email." }, { status: 400 });

    const n = await prisma.$executeRaw`DELETE FROM "EventRegistration" WHERE "eventSlug" = ${slug} AND "email" = ${email}`;
    let beehiiv: string | undefined;
    if (b.purgeBeehiiv === true) {
      const r = await deleteBeehiivSubscription(email);
      beehiiv = r.skipped ? "not configured" : r.ok ? "removed" : `failed: ${r.error}`;
    }
    return NextResponse.json({ ok: true, deleted: Number(n), beehiiv });
  } catch (e) {
    console.error("event registration delete error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

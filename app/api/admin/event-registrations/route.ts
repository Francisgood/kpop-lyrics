import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureRegistrationTable } from "@/lib/event-registrations";

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

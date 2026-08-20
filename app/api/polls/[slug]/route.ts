import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPollSeed } from "@/lib/polls";
import { getPollState, reparentDeviceVotes, newDeviceToken } from "@/lib/polls-db";

export const dynamic = "force-dynamic";

// Poll + live counts + the caller's own vote. Bootstraps an anonymous device token
// (first-party cookie; also returned in the body so the client can mirror it to
// localStorage for webviews that drop cookies). If the caller is logged in and has
// prior anonymous votes on this device, they're re-parented to the profile (claim).
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seed = getPollSeed(slug);
  if (!seed) return NextResponse.json({ error: "Unknown poll" }, { status: 404 });

  const session = await getSession();
  const userId = session?.user.id ?? null;
  const voterName = session ? (session.user.displayName ?? session.user.email.split("@")[0]) : null;

  let deviceToken = req.cookies.get("aa_vid")?.value ?? req.nextUrl.searchParams.get("deviceId") ?? null;
  if (userId && deviceToken) { try { await reparentDeviceVotes(deviceToken, userId); } catch { /* claim is best-effort */ } }

  let setToken: string | null = null;
  if (!userId && !deviceToken) { deviceToken = newDeviceToken(); setToken = deviceToken; }

  try {
    const poll = await getPollState(seed, { userId, voterName, deviceToken });
    const res = NextResponse.json({ ok: true, poll, deviceToken });
    if (setToken) res.cookies.set("aa_vid", setToken, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  } catch (e) {
    console.error("poll GET error:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

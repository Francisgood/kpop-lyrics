import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPollSeed } from "@/lib/polls";
import { castVote, getCounts, checkIpRate, hashIp, newDeviceToken } from "@/lib/polls-db";

export const dynamic = "force-dynamic";

// One-tap vote. Idempotent per (poll, voter) so double-taps and webview retries
// return the original pick instead of double-counting. No CAPTCHA in the path
// (keeps the 5-second promise); casual abuse is deterred + flagged, not blocked.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seed = getPollSeed(slug);
  if (!seed) return NextResponse.json({ error: "Unknown poll" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const option = body?.option === "a" ? "a" : body?.option === "b" ? "b" : null;
  if (!option) return NextResponse.json({ error: "option must be 'a' or 'b'" }, { status: 400 });

  // Closed polls are read-only.
  if (seed.closeAt && new Date(seed.closeAt).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, closed: true, counts: await getCounts(slug) });
  }

  const session = await getSession();
  const userId = session?.user.id ?? null;
  let deviceToken = req.cookies.get("aa_vid")?.value ?? (typeof body?.deviceId === "string" ? body.deviceId : null);
  let setToken: string | null = null;
  if (!userId && !deviceToken) { deviceToken = newDeviceToken(); setToken = deviceToken; }

  const voterRef = userId ?? deviceToken!;
  const voterType: "device" | "profile" = userId ? "profile" : "device";

  // Integrity: flag (don't block) obvious bots + IP flooding; flagged votes still
  // count in the public split, and are excluded from the internal "clean" rollup.
  const ua = req.headers.get("user-agent") ?? "";
  const ip = (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "").trim() || null;
  const ipHash = hashIp(ip);
  const flags: string[] = [];
  if (/headless|bot|crawler|spider|python-requests|curl|wget|scrapy/i.test(ua)) flags.push("bot");
  if (!(await checkIpRate(ipHash))) flags.push("rl");

  try {
    const myVote = await castVote(slug, option, {
      voterRef, voterType, ipHash,
      source: req.headers.get("referer"),
      flags: flags.length ? flags.join(" ") : null,
    });
    const counts = await getCounts(slug);
    const res = NextResponse.json({ ok: true, myVote, counts, deviceToken });
    if (setToken) res.cookies.set("aa_vid", setToken, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return res;
  } catch (e) {
    console.error("poll vote error:", e);
    return NextResponse.json({ error: "Vote failed — try again." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { issueCode, hashIp, CODE_TTL_MINUTES } from "@/lib/email-code";
import { sendMail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Step 1 of passwordless registration: mail a 6-digit code to the address.
// Always answers { ok: true } — the response must not reveal whether an address
// already has an account, and must not reveal that a rate limit was hit either.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 190) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    const code = await issueCode(email, hashIp(ip));

    if (code) {
      await sendMail({
        to: email,
        subject: `${code} is your Aegyo Arena chat code`,
        text: `Your Aegyo Arena code is ${code}. It expires in ${CODE_TTL_MINUTES} minutes. If you didn't ask to join the chat, you can ignore this email.`,
        html: `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#222">
          <p>Here's your code to join the Aegyo Arena live chat:</p>
          <p style="font-size:30px;font-weight:800;letter-spacing:6px;color:#d6336c;margin:18px 0">${code}</p>
          <p>Type it into the chat bubble within <strong>${CODE_TTL_MINUTES} minutes</strong>. If you didn't ask to join, you can safely ignore this email.</p>
          <p style="color:#888;font-size:13px">— The Aegyo Arena Team 💜</p>
        </div>`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

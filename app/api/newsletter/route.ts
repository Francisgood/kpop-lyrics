import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, name } = body as { email?: string; name?: string };

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const apiKey    = process.env.MJ_APIKEY_PUBLIC;
  const apiSecret = process.env.MJ_APIKEY_PRIVATE;

  if (!apiKey || !apiSecret) {
    console.warn("[newsletter] Mailjet credentials not configured — logging subscription only");
    console.log(`[newsletter] New subscriber: ${email}`);
    return NextResponse.json({ ok: true });
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const headers = { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };

  // 1. Upsert contact
  const contactRes = await fetch("https://api.mailjet.com/v3/REST/contact", {
    method: "POST",
    headers,
    body: JSON.stringify({ Email: email, Name: name ?? "", IsExcludedFromCampaigns: false }),
  });

  // 400 from Mailjet means contact already exists — that's fine
  if (!contactRes.ok && contactRes.status !== 400) {
    const err = await contactRes.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as { ErrorMessage?: string }).ErrorMessage ?? "Mailjet error" },
      { status: 502 }
    );
  }

  // 2. Add to contact list (optional — only if MJ_LIST_ID env is set)
  const listId = process.env.MJ_LIST_ID;
  if (listId) {
    await fetch(`https://api.mailjet.com/v3/REST/contactslist/${listId}/managecontact`, {
      method: "POST",
      headers,
      body: JSON.stringify({ Email: email, Name: name ?? "", Action: "addnoforce" }),
    }).catch(() => null); // best-effort
  }

  return NextResponse.json({ ok: true });
}

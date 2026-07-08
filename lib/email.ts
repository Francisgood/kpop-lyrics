// Transactional email via Mailjet's Send API (the provider already integrated in
// this codebase). Beehiiv is the newsletter ESP and has no transactional-send API,
// so password-reset codes go through Mailjet. Degrades gracefully: if the keys are
// not set it logs and returns false rather than throwing, so flows don't break.

export async function sendMail(opts: { to: string; subject: string; text: string; html?: string; from?: string }): Promise<boolean> {
  const pub = process.env.MJ_APIKEY_PUBLIC;
  const priv = process.env.MJ_APIKEY_PRIVATE;
  const fromEmail = opts.from || process.env.MAIL_FROM || "no-reply@aegyoarena.com";
  const fromName = process.env.MAIL_FROM_NAME || "Aegyo Arena";

  if (!pub || !priv) {
    console.warn(`[email] not configured (set MJ_APIKEY_PUBLIC / MJ_APIKEY_PRIVATE) — skipped send to ${opts.to}`);
    return false;
  }

  try {
    const auth = Buffer.from(`${pub}:${priv}`).toString("base64");
    const res = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: fromEmail, Name: fromName },
            To: [{ Email: opts.to }],
            Subject: opts.subject,
            TextPart: opts.text,
            ...(opts.html ? { HTMLPart: opts.html } : {}),
          },
        ],
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error(`[email] send failed ${res.status}: ${t}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send error:", e);
    return false;
  }
}

// Transactional confirmation for a hosted-event registration. This is the
// "you're on the list" receipt every registrant gets, opt-in or not — it carries
// only what they need to turn up, and no marketing, because half the recipients
// deliberately left the mailing-list box unticked.
import type { HostedEvent } from "@/lib/hosted-events";
import { hostedEventUrl } from "@/lib/hosted-events";

const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Wall-clock stored as UTC, so read it back with the UTC getters. */
function longDate(iso: string): string {
  const d = new Date(iso);
  return `${DOW[d.getUTCDay()]}, ${MON[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function gcalStamp(iso: string) {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function calendarLink(e: HostedEvent): string {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${gcalStamp(e.startsAt)}/${gcalStamp(e.endsAt)}`,
    details: `${e.summary}\n\n${hostedEventUrl(e)}`,
    location: e.address,
    ctz: "America/New_York",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function mapsLink(e: HostedEvent): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.mapQuery)}`;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function registrationEmail(e: HostedEvent, name: string): { subject: string; text: string; html: string } {
  const first = name.trim().split(/\s+/)[0] || "there";
  const when = `${longDate(e.startsAt)} · ${e.timeText}`;
  const url = hostedEventUrl(e);
  const cal = calendarLink(e);
  const map = mapsLink(e);
  const phases = e.phases ?? [];

  const subject = `You're registered — ${e.title}`;

  const text = [
    `Hi ${first},`,
    ``,
    `You're on the list for ${e.title}.`,
    ``,
    `When:  ${when}`,
    `Where: ${e.venue}, ${e.address}`,
    `Cost:  Free`,
    ``,
    ...(phases.length ? [`The night runs in two halves:`, ...phases.map((p) => `  - ${p.name} (${p.length}) — ${p.blurb}`), ``] : []),
    `Add it to your calendar: ${cal}`,
    `Directions: ${map}`,
    `Full details: ${url}`,
    ``,
    `Nothing to print and nothing to bring — just turn up. If your plans change,`,
    `reply to this email and we'll take you off the list.`,
    ``,
    `See you under the arch,`,
    `Aegyo Arena`,
  ].join("\n");

  // Table-based and inline-styled: email clients are not browsers.
  const html = `
<div style="background:#f5f5f7;padding:28px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;">
    <tr><td style="background:#FF6FA8;padding:20px 26px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(27,32,39,.72);">An Aegyo Arena event</div>
      <div style="font-size:21px;font-weight:800;color:#1B2027;line-height:1.25;margin-top:6px;">${esc(e.title)}</div>
    </td></tr>
    <tr><td style="padding:26px;">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#22252b;">Hi ${esc(first)}, you're on the list.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e6e6ea;border-radius:8px;margin-bottom:18px;">
        <tr><td style="padding:14px 16px;border-bottom:1px solid #f0f0f3;">
          <div style="font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8a8a94;">When</div>
          <div style="font-size:15px;font-weight:700;color:#22252b;margin-top:3px;">${esc(when)}</div>
        </td></tr>
        <tr><td style="padding:14px 16px;border-bottom:1px solid #f0f0f3;">
          <div style="font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8a8a94;">Where</div>
          <div style="font-size:15px;font-weight:700;color:#22252b;margin-top:3px;">${esc(e.venue)}</div>
          <div style="font-size:13px;color:#6b6b74;margin-top:2px;">${esc(e.address)}</div>
        </td></tr>
        <tr><td style="padding:14px 16px;">
          <div style="font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8a8a94;">Cost</div>
          <div style="font-size:15px;font-weight:700;color:#22252b;margin-top:3px;">Free</div>
        </td></tr>
      </table>
      ${phases.length ? `
      <div style="font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#8a8a94;margin-bottom:8px;">The night in two halves</div>
      ${phases.map((p) => `
        <p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:#4a4a55;">
          <strong style="color:#22252b;">${esc(p.name)}</strong>
          <span style="color:#8a8a94;">· ${esc(p.length)}</span><br>${esc(p.blurb)}
        </p>`).join("")}` : ""}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 6px;">
        <tr>
          <td style="padding-right:8px;"><a href="${cal}" style="display:inline-block;background:#FF6FA8;color:#1B2027;font-weight:800;font-size:14px;text-decoration:none;padding:12px 20px;border-radius:5px;">Add to calendar</a></td>
          <td><a href="${map}" style="display:inline-block;border:1px solid #d9d9e0;color:#22252b;font-weight:700;font-size:14px;text-decoration:none;padding:11px 20px;border-radius:5px;">Get directions</a></td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#6b6b74;">
        Nothing to print and nothing to bring — just turn up. Full details are on
        <a href="${url}" style="color:#d6437d;">the event page</a>.
        If your plans change, reply to this email and we'll take you off the list.
      </p>
    </td></tr>
    <tr><td style="padding:16px 26px;background:#fafafb;font-size:12px;color:#8a8a94;">
      You're getting this because you registered for this event on aegyoarena.com.
    </td></tr>
  </table>
</div>`.trim();

  return { subject, text, html };
}

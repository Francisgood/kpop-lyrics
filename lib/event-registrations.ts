// Attendee registrations for the events we host ourselves (lib/hosted-events),
// plus the hand-off that turns a registration into a mailing-list subscriber and
// a confirmation email. Self-contained store, created additively on first use —
// same pattern as GiveawayEntry / ScannedEvent. Never touches other tables.
import { prisma } from "@/lib/prisma";
import { subscribeToBeehiiv, enrollInBeehiivAutomation, beehiivConfigured } from "@/lib/beehiiv";
import { sendMail } from "@/lib/email";
import { registrationEmail } from "@/lib/event-emails";
import type { HostedEvent } from "@/lib/hosted-events";

let tableReady = false;
export async function ensureRegistrationTable() {
  if (tableReady) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "EventRegistration" (
      "id"         TEXT PRIMARY KEY,
      "eventSlug"  TEXT NOT NULL,
      "name"       TEXT NOT NULL,
      "email"      TEXT NOT NULL,
      "optIn"      BOOLEAN NOT NULL DEFAULT false,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EventRegistration_slug_email_key" ON "EventRegistration" ("eventSlug", "email")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EventRegistration_eventSlug_idx" ON "EventRegistration" ("eventSlug")`);
  // Sync bookkeeping, added additively: which registrations reached beehiiv and
  // who has had their confirmation email, so a failed hand-off is visible and
  // replayable instead of silently lost.
  for (const col of [`"beehiivStatus" TEXT`, `"beehiivAt" TIMESTAMP`, `"confirmedAt" TIMESTAMP`]) {
    await prisma.$executeRawUnsafe(`ALTER TABLE "EventRegistration" ADD COLUMN IF NOT EXISTS ${col}`);
  }
  tableReady = true;
}

/**
 * Hand a registrant off to the mailing list and send their confirmation.
 *
 * Two separate decisions, deliberately: the beehiiv subscription happens ONLY
 * when they ticked the opt-in box, while the confirmation email is transactional
 * and goes to every registrant. Both legs are best-effort — a mail or API outage
 * must never cost someone their place — and the outcome is written back to the
 * row so `/api/admin/event-registrations/sync` can replay whatever failed.
 */
export async function onboardRegistrant(
  event: HostedEvent,
  reg: { name: string; email: string; optIn: boolean },
  opts: { resendConfirmation?: boolean } = {},
): Promise<{ beehiivStatus: string; confirmed: boolean; emailSent: boolean }> {
  const email = reg.email.trim().toLowerCase();
  let beehiivStatus = "declined"; // they didn't opt in — nothing to sync, and that's a state, not a failure

  if (reg.optIn) {
    if (!beehiivConfigured()) {
      beehiivStatus = "skipped";
    } else {
      const r = await subscribeToBeehiiv({
        email,
        source: `event-${event.slug}`,
        campaign: event.slug,
        sendWelcome: true,
        customFields: [
          { name: "first_name", value: reg.name.trim().split(/\s+/)[0] ?? "" },
          { name: "event_slug", value: event.slug },
          { name: "event_name", value: event.title },
          { name: "event_date", value: event.startsAt.slice(0, 10) },
          { name: "city", value: event.city },
        ],
      });
      beehiivStatus = r.ok ? "subscribed" : "failed";
      // Optional welcome journey; no-ops unless BEEHIIV_EVENT_AUTOMATION_ID is set.
      if (r.ok) await enrollInBeehiivAutomation(email);
    }
  }

  // Editing a registration (say, ticking the opt-in box on a second visit) must
  // not re-send the receipt, so the confirmation is sent once unless replayed
  // deliberately by the sync endpoint.
  const prior = await prisma.$queryRaw<{ confirmedAt: Date | null }[]>`
    SELECT "confirmedAt" FROM "EventRegistration" WHERE "eventSlug" = ${event.slug} AND "email" = ${email} LIMIT 1`;
  const alreadyConfirmed = !!prior[0]?.confirmedAt;

  let emailSent = false;
  if (!alreadyConfirmed || opts.resendConfirmation) {
    const mail = registrationEmail(event, reg.name);
    emailSent = await sendMail({ to: email, subject: mail.subject, text: mail.text, html: mail.html });
  }
  const confirmed = alreadyConfirmed || emailSent;

  try {
    await prisma.$executeRaw`
      UPDATE "EventRegistration"
      SET "beehiivStatus" = ${beehiivStatus},
          "beehiivAt" = ${beehiivStatus === "subscribed" ? new Date() : null},
          "confirmedAt" = COALESCE("confirmedAt", ${emailSent ? new Date() : null})
      WHERE "eventSlug" = ${event.slug} AND "email" = ${email}`;
  } catch (e) {
    console.error("event registration sync write failed:", e);
  }

  return { beehiivStatus, confirmed, emailSent };
}

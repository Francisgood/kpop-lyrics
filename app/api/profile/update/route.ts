/**
 * POST /api/profile/update
 *
 * Progressive profile collection for Daebak Rewards.
 * Each step enriches the Mailjet contact and unlocks the next CTA on the dashboard.
 *
 * Body: { step: "enroll" | "phone" | "webpush" | "zipcode" | "address", ...data }
 *
 * Steps:
 *  enroll  → rewardsEnrolled = true  → Mailjet: create contact + add to rewards list + send welcome email
 *  phone   → phone = value           → Mailjet: update contact property + trigger SMS onboarding
 *  webpush → webPushEnabled = true   → Mailjet: update property
 *  zipcode → zipCode = value         → Mailjet: update property → trigger local events sequence
 *  address → mailingAddress = value  → Mailjet: update property → trigger physical mail sequence
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPointTotal } from "@/lib/points";

const MJ_BASE = "https://api.mailjet.com/v3/REST";

function mjHeaders() {
  const pub = process.env.MJ_APIKEY_PUBLIC;
  const prv = process.env.MJ_APIKEY_PRIVATE;
  if (!pub || !prv) return null;
  return {
    Authorization: `Basic ${Buffer.from(`${pub}:${prv}`).toString("base64")}`,
    "Content-Type": "application/json",
  };
}

async function upsertMailjetContact(email: string, name: string) {
  const headers = mjHeaders();
  if (!headers) return;
  await fetch(`${MJ_BASE}/contact`, {
    method:  "POST",
    headers,
    body:    JSON.stringify({ Email: email, Name: name, IsExcludedFromCampaigns: false }),
  }).catch(() => null);
}

async function addToList(email: string, listId: string) {
  const headers = mjHeaders();
  if (!headers || !listId) return;
  await fetch(`${MJ_BASE}/contactslist/${listId}/managecontact`, {
    method:  "POST",
    headers,
    body:    JSON.stringify({ Email: email, Action: "addnoforce" }),
  }).catch(() => null);
}

async function setContactData(email: string, data: Record<string, string | number | boolean>) {
  const headers = mjHeaders();
  if (!headers) return;
  const payload = {
    Data: Object.entries(data).map(([Name, Value]) => ({ Name, Value })),
  };
  await fetch(`${MJ_BASE}/contactdata/${encodeURIComponent(email)}`, {
    method:  "PUT",
    headers,
    body:    JSON.stringify(payload),
  }).catch(() => null);
}

async function sendTransactionalEmail(
  toEmail: string,
  toName:  string,
  templateId: number,
  variables:  Record<string, string | number>,
) {
  const headers = mjHeaders();
  if (!headers) return;
  await fetch("https://api.mailjet.com/v3.1/send", {
    method:  "POST",
    headers,
    body:    JSON.stringify({
      Messages: [{
        To:         [{ Email: toEmail, Name: toName }],
        TemplateID: templateId,
        TemplateLanguage: true,
        Variables:  variables,
      }],
    }),
  }).catch(() => null);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in to update profile" }, { status: 401 });

  const user    = session.user;
  const body    = await req.json().catch(() => ({})) as Record<string, string | boolean>;
  const { step } = body;

  if (!step) return NextResponse.json({ error: "step required" }, { status: 400 });

  const displayName = user.displayName ?? user.email.split("@")[0];
  const rewardsListId = process.env.MJ_REWARDS_LIST_ID ?? process.env.MJ_LIST_ID ?? "";
  const welcomeTemplateId = Number(process.env.MJ_WELCOME_TEMPLATE_ID ?? 0);

  switch (step) {
    case "enroll": {
      if (user.rewardsEnrolled) {
        return NextResponse.json({ ok: true, already: true });
      }
      await prisma.user.update({
        where: { id: user.id },
        data:  { rewardsEnrolled: true },
      });
      const points = await getUserPointTotal(user.id);
      // Mailjet: create contact, add to rewards list, set contact data, send welcome
      await upsertMailjetContact(user.email, displayName);
      if (rewardsListId) await addToList(user.email, rewardsListId);
      await setContactData(user.email, {
        rewards_enrolled: true,
        rewards_step:     1,
        points_total:     points,
        tier:             points >= 4000 ? "legend" : points >= 2000 ? "superstar" : points >= 1000 ? "idol" : points >= 250 ? "rising_star" : "trainee",
      });
      if (welcomeTemplateId) {
        await sendTransactionalEmail(user.email, displayName, welcomeTemplateId, {
          displayName,
          points_total: points,
          dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://aegyoarena.com"}/dashboard`,
        });
      }
      return NextResponse.json({ ok: true, step: 1 });
    }

    case "phone": {
      const phone = (body.phone as string | undefined)?.trim();
      if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
      await prisma.user.update({ where: { id: user.id }, data: { phone } });
      await setContactData(user.email, { phone, rewards_step: 2 });
      return NextResponse.json({ ok: true, step: 2 });
    }

    case "webpush": {
      await prisma.user.update({ where: { id: user.id }, data: { webPushEnabled: true } });
      await setContactData(user.email, { web_push_enabled: true, rewards_step: 3 });
      return NextResponse.json({ ok: true, step: 3 });
    }

    case "zipcode": {
      const zipCode = (body.zipCode as string | undefined)?.trim();
      if (!zipCode) return NextResponse.json({ error: "zipCode required" }, { status: 400 });
      await prisma.user.update({ where: { id: user.id }, data: { zipCode } });
      await setContactData(user.email, { zip_code: zipCode, rewards_step: 4 });
      return NextResponse.json({ ok: true, step: 4 });
    }

    case "address": {
      const mailingAddress = (body.mailingAddress as string | undefined)?.trim();
      if (!mailingAddress) return NextResponse.json({ error: "mailingAddress required" }, { status: 400 });
      await prisma.user.update({ where: { id: user.id }, data: { mailingAddress } });
      await setContactData(user.email, { mailing_address: mailingAddress, rewards_step: 5 });
      return NextResponse.json({ ok: true, step: 5 });
    }

    default:
      return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  }
}

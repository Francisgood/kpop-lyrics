import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      streetAddress,
      email,
      gender,
      newsletter,
      referredBy,
    } = body as {
      firstName: string;
      lastName: string;
      phone: string;
      dateOfBirth: string;
      streetAddress: string;
      email: string;
      gender: string;
      newsletter: boolean;
      referredBy?: string;
    };

    // Server-side age validation
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      age--;
    }
    if (age < 18) {
      return NextResponse.json({ error: 'Must be 18 or older' }, { status: 400 });
    }

    // Generate a unique referral code (retry on collision)
    let referralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.sweepstakesEntry.findUnique({ where: { referralCode } });
      if (!existing) break;
      referralCode = generateReferralCode();
      attempts++;
    }

    // Create the entry
    const entry = await prisma.sweepstakesEntry.create({
      data: {
        firstName,
        lastName,
        phone,
        dateOfBirth: dob,
        streetAddress,
        email,
        gender,
        newsletter: !!newsletter,
        referralCode,
        referredBy: referredBy ?? null,
        referralCount: 0,
        totalEntries: 1,
      },
    });

    // Credit the referrer
    if (referredBy) {
      const referrer = await prisma.sweepstakesEntry.findUnique({
        where: { referralCode: referredBy },
      });
      if (referrer) {
        await prisma.sweepstakesEntry.update({
          where: { referralCode: referredBy },
          data: {
            referralCount: { increment: 1 },
            totalEntries: { increment: 10 },
          },
        });
      }
    }

    return NextResponse.json({
      referralCode: entry.referralCode,
      totalEntries: entry.totalEntries,
      referralCount: entry.referralCount,
    });
  } catch (err: unknown) {
    // Duplicate email
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Email already entered' }, { status: 409 });
    }
    console.error('[sweepstakes/enter]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

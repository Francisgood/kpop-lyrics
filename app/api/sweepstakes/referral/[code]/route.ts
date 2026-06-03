import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const entry = await prisma.sweepstakesEntry.findUnique({
    where: { referralCode: code },
    select: { referralCount: true, totalEntries: true, firstName: true },
  });

  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    referralCount: entry.referralCount,
    totalEntries: entry.totalEntries,
    firstName: entry.firstName,
  });
}

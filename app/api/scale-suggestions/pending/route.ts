// app/api/scale-suggestions/pending/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const pending = await prisma.scaleSuggestion.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { id: true, username: true } },
      subject: { select: { id: true, displayName: true } },
      entries: { orderBy: { order: 'asc' } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ pending });
}
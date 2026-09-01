// app/api/posts/pending/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const pending = await prisma.post.findMany({
  where: { status: 'PENDING' },
  include: { author: { select: { id: true, username: true } }, subject: true },
  orderBy: { createdAt: 'asc' },
});

  return NextResponse.json({ pending });
}
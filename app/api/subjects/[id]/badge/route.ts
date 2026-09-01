// app/api/subjects/[id]/badge/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const VALID_BADGES = ['UNFORGIVABLE', 'IMMORTAL', 'HUBRIS', 'CELESTIAL', null];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!user.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { extremeBadge } = body;

  if (!VALID_BADGES.includes(extremeBadge)) {
    return NextResponse.json({ error: 'Invalid badge value' }, { status: 400 });
  }

  const existingSubject = await prisma.subject.findUnique({ where: { id } });
  if (!existingSubject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  }

  const [subject] = await prisma.$transaction([
    prisma.subject.update({
      where: { id },
      data: { extremeBadge },
    }),
    prisma.auditLogEntry.create({
      data: {
        actorUserId: user.id,
        action: 'extreme_badge_set',
        targetType: 'Subject',
        targetId: id,
        reason: `badge=${extremeBadge}`,
      },
    }),
  ]);

  return NextResponse.json({ subject });
}
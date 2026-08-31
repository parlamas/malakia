// app/api/subjects/[id]/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const VALID_STATUSES = ['ADMIN_CONFIRMED', 'DISPUTED', 'UNVERIFIED'];

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
  const { verificationStatus, reason } = body;

  if (!VALID_STATUSES.includes(verificationStatus)) {
    return NextResponse.json({ error: 'Invalid verificationStatus' }, { status: 400 });
  }
  if (verificationStatus === 'DISPUTED' && !reason) {
    return NextResponse.json({ error: 'reason required when marking as DISPUTED' }, { status: 400 });
  }

  const existingSubject = await prisma.subject.findUnique({ where: { id } });
  if (!existingSubject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  }

  const [subject] = await prisma.$transaction([
    prisma.subject.update({
      where: { id },
      data: { verificationStatus },
    }),
    prisma.auditLogEntry.create({
      data: {
        actorUserId: user.id,
        action: `subject_marked_${verificationStatus.toLowerCase()}`,
        targetType: 'Subject',
        targetId: id,
        reason: reason ?? null,
      },
    }),
  ]);

  return NextResponse.json({ subject });
}
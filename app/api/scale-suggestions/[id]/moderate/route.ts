// app/api/scale-suggestions/[id]/moderate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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
  const { decision, rejectionReason } = body;

  if (!['PUBLISH', 'REJECT_LANGUAGE'].includes(decision)) {
    return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
  }
  if (decision === 'REJECT_LANGUAGE' && !rejectionReason) {
    return NextResponse.json({ error: 'rejectionReason required for rejection' }, { status: 400 });
  }

  const existing = await prisma.scaleSuggestion.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
  }
  if (existing.status !== 'PENDING') {
    return NextResponse.json({ error: `Suggestion is already ${existing.status}, not pending` }, { status: 409 });
  }

  const newStatus = decision === 'PUBLISH' ? 'PUBLISHED' : 'REJECTED_LANGUAGE';

  const [suggestion] = await prisma.$transaction([
    prisma.scaleSuggestion.update({
      where: { id },
      data: {
        status: newStatus,
        languageModeratedById: user.id,
        languageModeratedAt: new Date(),
        rejectionReason: decision === 'REJECT_LANGUAGE' ? rejectionReason : null,
      },
    }),
    prisma.auditLogEntry.create({
      data: {
        actorUserId: user.id,
        action: decision === 'PUBLISH' ? 'suggestion_approved' : 'suggestion_rejected_language',
        targetType: 'ScaleSuggestion',
        targetId: id,
        reason: decision === 'REJECT_LANGUAGE' ? rejectionReason : null,
      },
    }),
  ]);

  return NextResponse.json({ suggestion });
}
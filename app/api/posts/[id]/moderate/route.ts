//app/api/posts/[id]/moderate/route.ts

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
  const { decision, rejectionReason } = body; // decision: 'PUBLISH' | 'REJECT_LANGUAGE'

  if (!['PUBLISH', 'REJECT_LANGUAGE'].includes(decision)) {
    return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
  }
  if (decision === 'REJECT_LANGUAGE' && !rejectionReason) {
    return NextResponse.json({ error: 'rejectionReason required for rejection' }, { status: 400 });
  }

  const existingPost = await prisma.post.findUnique({ where: { id } });
  if (!existingPost) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  if (existingPost.status !== 'PENDING') {
    return NextResponse.json(
      { error: `Post is already ${existingPost.status}, not pending` },
      { status: 409 },
    );
  }

  const newStatus = decision === 'PUBLISH' ? 'PUBLISHED' : 'REJECTED_LANGUAGE';

  const [post] = await prisma.$transaction([
    prisma.post.update({
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
        action: decision === 'PUBLISH' ? 'post_approved' : 'post_rejected_language',
        targetType: 'Post',
        targetId: id,
        reason: decision === 'REJECT_LANGUAGE' ? rejectionReason : null,
      },
    }),
  ]);

  return NextResponse.json({ post });
}
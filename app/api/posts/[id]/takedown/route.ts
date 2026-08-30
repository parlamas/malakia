// app/api/posts/[id]/takedown/route.ts

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
  const { reason } = body;

  if (!reason) {
    return NextResponse.json({ error: 'reason required for takedown' }, { status: 400 });
  }

  const existingPost = await prisma.post.findUnique({ where: { id } });
  if (!existingPost) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  if (existingPost.status !== 'PUBLISHED') {
    return NextResponse.json(
      { error: `Only published posts can be taken down (current status: ${existingPost.status})` },
      { status: 409 },
    );
  }

  const [post] = await prisma.$transaction([
    prisma.post.update({
      where: { id },
      data: {
        status: 'REMOVED',
        rejectionReason: reason,
      },
    }),
    prisma.auditLogEntry.create({
      data: {
        actorUserId: user.id,
        action: 'post_removed',
        targetType: 'Post',
        targetId: id,
        reason,
      },
    }),
  ]);

  return NextResponse.json({ post });
}
// app/api/posts/[id]/edit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const MAX_NARRATIVE_LENGTH = 2000;
const MAX_JUSTIFICATION_LENGTH = 500;
const MAX_BEHAVIOR_LABEL_LENGTH = 200;

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
  const { behaviorLabel, narrative, publicCapacityJustification, evidenceUrl } = body;

  const existingPost = await prisma.post.findUnique({ where: { id } });
  if (!existingPost) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  if (behaviorLabel !== undefined && behaviorLabel.length > MAX_BEHAVIOR_LABEL_LENGTH) {
    return NextResponse.json({ error: `behaviorLabel must be ${MAX_BEHAVIOR_LABEL_LENGTH} characters or fewer` }, { status: 400 });
  }
  if (narrative !== undefined && narrative.length > MAX_NARRATIVE_LENGTH) {
    return NextResponse.json({ error: `narrative must be ${MAX_NARRATIVE_LENGTH} characters or fewer` }, { status: 400 });
  }
  if (publicCapacityJustification !== undefined && publicCapacityJustification.length > MAX_JUSTIFICATION_LENGTH) {
    return NextResponse.json({ error: `publicCapacityJustification must be ${MAX_JUSTIFICATION_LENGTH} characters or fewer` }, { status: 400 });
  }

  const [post] = await prisma.$transaction([
    prisma.post.update({
      where: { id },
      data: {
        ...(behaviorLabel !== undefined ? { behaviorLabel } : {}),
        ...(narrative !== undefined ? { narrative } : {}),
        ...(publicCapacityJustification !== undefined ? { publicCapacityJustification } : {}),
        ...(evidenceUrl !== undefined ? { evidenceUrl: evidenceUrl || null } : {}),
      },
    }),
    prisma.auditLogEntry.create({
      data: {
        actorUserId: user.id,
        action: 'post_edited_by_admin',
        targetType: 'Post',
        targetId: id,
        reason: 'Admin correction (e.g. spelling)',
      },
    }),
  ]);

  return NextResponse.json({ post });
}
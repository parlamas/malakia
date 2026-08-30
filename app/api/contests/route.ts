// app/api/contests/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const VALID_DISPUTE_TYPES = [
  'DENIES_OCCURRED',
  'DISPUTES_CLASSIFICATION',
  'DISPUTES_SCOPE',
  'PROVIDES_CONTEXT',
];

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await req.json();
  const { postId, disputeType, justification } = body;

  if (!postId || !disputeType || !justification) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!VALID_DISPUTE_TYPES.includes(disputeType)) {
    return NextResponse.json({ error: 'Invalid disputeType' }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  // Only published posts can be contested — a pending or already-removed
  // post has no public claim yet (or anymore) to dispute
  if (post.status !== 'PUBLISHED') {
    return NextResponse.json(
      { error: `Only published posts can be contested (current status: ${post.status})` },
      { status: 409 },
    );
  }

  // A user shouldn't be able to contest their own post
  if (post.authorUserId === user.id) {
    return NextResponse.json(
      { error: 'You cannot contest your own post' },
      { status: 403 },
    );
  }

  const contest = await prisma.contest.create({
    data: {
      postId,
      contestingUserId: user.id,
      disputeType,
      justification,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      actorUserId: user.id,
      action: 'contest_filed',
      targetType: 'Contest',
      targetId: contest.id,
      reason: `disputeType=${disputeType}, postId=${postId}`,
    },
  });

  return NextResponse.json({ contest }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'postId query parameter required' }, { status: 400 });
  }

  const contests = await prisma.contest.findMany({
    where: { postId },
    include: { contestingUser: { select: { id: true, username: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ contests });
}
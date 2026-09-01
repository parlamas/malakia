// app/api/reactions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await req.json();
  const { postId, scaleSuggestionId, contestId, reactionBody } = body;

if (!postId && !scaleSuggestionId && !contestId) {
  return NextResponse.json({ error: 'A reaction must reference a post, scale suggestion, or contest' }, { status: 400 });
}

if (!reactionBody) {
  return NextResponse.json({ error: 'reactionBody (text) is required' }, { status: 400 });
}

  if (scaleSuggestionId) {
    const suggestion = await prisma.scaleSuggestion.findUnique({ where: { id: scaleSuggestionId } });
    if (!suggestion) {
      return NextResponse.json({ error: 'Referenced scale suggestion not found' }, { status: 404 });
    }
  }
  if (postId) {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Referenced post not found' }, { status: 404 });
    }
  }
  if (contestId) {
    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest) {
      return NextResponse.json({ error: 'Referenced contest not found' }, { status: 404 });
    }
  }

  const reaction = await prisma.reaction.create({
  data: {
    userId: user.id,
    postId: postId || null,
    scaleSuggestionId: scaleSuggestionId || null,
    contestId: contestId || null,
    body: reactionBody,
  },
});

  return NextResponse.json({ reaction }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scaleSuggestionId = searchParams.get('scaleSuggestionId');
  const postId = searchParams.get('postId');
  const contestId = searchParams.get('contestId');

  if (!scaleSuggestionId && !postId && !contestId) {
    return NextResponse.json({ error: 'Provide scaleSuggestionId, postId, or contestId' }, { status: 400 });
  }

  const reactions = await prisma.reaction.findMany({
    where: {
      ...(scaleSuggestionId ? { scaleSuggestionId } : {}),
      ...(postId ? { postId } : {}),
      ...(contestId ? { contestId } : {}),
    },
    include: { user: { select: { id: true, username: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ reactions });
}
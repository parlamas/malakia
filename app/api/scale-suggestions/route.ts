// app/api/scale-suggestions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await req.json();
  const { subjectId, value, reasoning, replyToId } = body;

  if (!subjectId || value === undefined || value === null) {
    return NextResponse.json({ error: 'subjectId and value are required' }, { status: 400 });
  }

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < -1000 || numericValue > 1000) {
    return NextResponse.json({ error: 'value must be an integer between -1000 and 1000' }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  }

  const existingCount = await prisma.scaleSuggestion.count({ where: { subjectId } });

  if (existingCount > 0 && !replyToId) {
    return NextResponse.json(
      { error: 'A suggestion must reply to an existing one, unless it is the first for this subject' },
      { status: 400 },
    );
  }

  if (replyToId) {
    const target = await prisma.scaleSuggestion.findUnique({ where: { id: replyToId } });
    if (!target || target.subjectId !== subjectId) {
      return NextResponse.json({ error: 'replyToId must reference an existing suggestion on the same subject' }, { status: 400 });
    }
  }

  const suggestion = await prisma.scaleSuggestion.create({
    data: {
      subjectId,
      userId: user.id,
      value: numericValue,
      reasoning: reasoning || null,
      replyToId: replyToId || null,
    },
  });

  return NextResponse.json({ suggestion }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId');

  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId query parameter required' }, { status: 400 });
  }

  const suggestions = await prisma.scaleSuggestion.findMany({
    where: { subjectId },
    include: {
      user: { select: { id: true, username: true } },
      replyTo: { include: { user: { select: { id: true, username: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ suggestions });
}
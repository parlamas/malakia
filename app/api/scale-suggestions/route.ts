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
  const { subjectId, value, reasoning } = body;

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

  const suggestion = await prisma.scaleSuggestion.create({
    data: {
      subjectId,
      userId: user.id,
      value: numericValue,
      reasoning: reasoning || null,
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
    include: { user: { select: { id: true, username: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ suggestions });
}
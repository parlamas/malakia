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
  const { personId, value, reasoning } = body;

  if (!personId || value === undefined || value === null) {
    return NextResponse.json({ error: 'personId and value are required' }, { status: 400 });
  }

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < -100 || numericValue > 100) {
    return NextResponse.json({ error: 'value must be an integer between -100 and 100' }, { status: 400 });
  }

  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  const suggestion = await prisma.scaleSuggestion.create({
    data: {
      personId,
      userId: user.id,
      value: numericValue,
      reasoning: reasoning || null,
    },
  });

  return NextResponse.json({ suggestion }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const personId = searchParams.get('personId');

  if (!personId) {
    return NextResponse.json({ error: 'personId query parameter required' }, { status: 400 });
  }

  const suggestions = await prisma.scaleSuggestion.findMany({
    where: { personId },
    include: { user: { select: { id: true, username: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ suggestions });
}
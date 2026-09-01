// app/api/scale-suggestions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface EntryInput {
  side: 'NEGATIVE' | 'POSITIVE';
  magnitude: number;
  justification?: string | null;
}

const MAX_JUSTIFICATION_LENGTH = 500;
const MAX_PAIRS_PER_SIDE = 10;

function validateEntries(entries: EntryInput[]): string | null {
  if (!Array.isArray(entries)) return 'entries must be an array';

  const negatives = entries.filter((e) => e.side === 'NEGATIVE');
  const positives = entries.filter((e) => e.side === 'POSITIVE');

  if (negatives.length > MAX_PAIRS_PER_SIDE) return `No more than ${MAX_PAIRS_PER_SIDE} negative pairs are allowed`;
  if (positives.length > MAX_PAIRS_PER_SIDE) return `No more than ${MAX_PAIRS_PER_SIDE} positive pairs are allowed`;

  for (const e of entries) {
    if (e.side !== 'NEGATIVE' && e.side !== 'POSITIVE') return 'Invalid entry side';
    if (!Number.isInteger(e.magnitude) || e.magnitude < 0 || e.magnitude > 1000) {
      return 'Each magnitude must be an integer between 0 and 1000';
    }
    if (e.justification && e.justification.length > MAX_JUSTIFICATION_LENGTH) {
      return `Each justification must be ${MAX_JUSTIFICATION_LENGTH} characters or fewer`;
    }
  }

  const negSum = negatives.reduce((s, e) => s + e.magnitude, 0);
  const posSum = positives.reduce((s, e) => s + e.magnitude, 0);
  if (negSum > 1000) return 'The sum of negative entries cannot exceed 1000';
  if (posSum > 1000) return 'The sum of positive entries cannot exceed 1000';

  return null;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await req.json();
  const { subjectId, entries, replyToId, replyToPostId } = body;

  if (!subjectId) {
    return NextResponse.json({ error: 'subjectId is required' }, { status: 400 });
  }

  if (replyToId && replyToPostId) {
    return NextResponse.json({ error: 'A suggestion can target a prior suggestion or a post, not both' }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  }

  if (replyToId) {
    const target = await prisma.scaleSuggestion.findUnique({ where: { id: replyToId } });
    if (!target || target.subjectId !== subjectId) {
      return NextResponse.json({ error: 'replyToId must reference an existing suggestion on the same subject' }, { status: 400 });
    }
  }

  if (replyToPostId) {
    const target = await prisma.post.findUnique({ where: { id: replyToPostId } });
    if (!target || target.subjectId !== subjectId) {
      return NextResponse.json({ error: 'replyToPostId must reference an existing post on the same subject' }, { status: 400 });
    }
  }

  const entryList: EntryInput[] = Array.isArray(entries) ? entries.filter((e) => e && (e.magnitude || e.justification)) : [];

  if (entryList.length > 0) {
    const validationError = validateEntries(entryList);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
  }

  const suggestion = await prisma.$transaction(async (tx) => {
    const created = await tx.scaleSuggestion.create({
      data: {
        subjectId,
        userId: user.id,
        replyToId: replyToId || null,
        replyToPostId: replyToPostId || null,
      },
    });

    if (entryList.length === 0) {
      await tx.suggestionEntry.create({
        data: {
          suggestionId: created.id,
          side: 'ZERO',
          magnitude: 0,
          justification: null,
          order: 0,
        },
      });
    } else {
      let negOrder = 0;
      let posOrder = 0;
      for (const e of entryList) {
        await tx.suggestionEntry.create({
          data: {
            suggestionId: created.id,
            side: e.side,
            magnitude: e.magnitude,
            justification: e.justification || null,
            order: e.side === 'NEGATIVE' ? negOrder++ : posOrder++,
          },
        });
      }
    }

    return tx.scaleSuggestion.findUnique({
      where: { id: created.id },
      include: { entries: true },
    });
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
      entries: { orderBy: { order: 'asc' } },
      replyTo: { include: { user: { select: { id: true, username: true } } } },
      replyToPost: { include: { author: { select: { username: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ suggestions });
}
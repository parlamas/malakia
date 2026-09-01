// app/api/subjects/[id]/admin-judgment/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface EntryInput {
  side: 'NEGATIVE' | 'POSITIVE';
  magnitude: number;
  justification?: string | null;
}

function validateEntries(entries: EntryInput[]): string | null {
  if (!Array.isArray(entries)) return 'entries must be an array';

  const negatives = entries.filter((e) => e.side === 'NEGATIVE');
  const positives = entries.filter((e) => e.side === 'POSITIVE');

  for (const e of entries) {
    if (e.side !== 'NEGATIVE' && e.side !== 'POSITIVE') return 'Invalid entry side';
    if (!Number.isInteger(e.magnitude) || e.magnitude < 0 || e.magnitude > 1000) {
      return 'Each magnitude must be an integer between 0 and 1000';
    }
  }

  const negSum = negatives.reduce((s, e) => s + e.magnitude, 0);
  const posSum = positives.reduce((s, e) => s + e.magnitude, 0);
  if (negSum > 1000) return 'The sum of negative entries cannot exceed 1000';
  if (posSum > 1000) return 'The sum of positive entries cannot exceed 1000';

  return null;
}

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
  const { entries } = body;

  const existingSubject = await prisma.subject.findUnique({ where: { id } });
  if (!existingSubject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  }

  const entryList: EntryInput[] = Array.isArray(entries) ? entries.filter((e) => e && (e.magnitude || e.justification)) : [];

  if (entryList.length > 0) {
    const validationError = validateEntries(entryList);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
  }

  const judgment = await prisma.$transaction(async (tx) => {
    const existing = await tx.adminJudgment.findUnique({ where: { subjectId: id } });

    let judgmentRecord;
    if (existing) {
      await tx.adminJudgmentEntry.deleteMany({ where: { judgmentId: existing.id } });
      judgmentRecord = await tx.adminJudgment.update({
        where: { id: existing.id },
        data: { setByUserId: user.id },
      });
    } else {
      judgmentRecord = await tx.adminJudgment.create({
        data: { subjectId: id, setByUserId: user.id },
      });
    }

    if (entryList.length === 0) {
      await tx.adminJudgmentEntry.create({
        data: {
          judgmentId: judgmentRecord.id,
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
        await tx.adminJudgmentEntry.create({
          data: {
            judgmentId: judgmentRecord.id,
            side: e.side,
            magnitude: e.magnitude,
            justification: e.justification || null,
            order: e.side === 'NEGATIVE' ? negOrder++ : posOrder++,
          },
        });
      }
    }

    await tx.auditLogEntry.create({
      data: {
        actorUserId: user.id,
        action: 'admin_judgment_set',
        targetType: 'Subject',
        targetId: id,
        reason: `entries=${entryList.length}`,
      },
    });

    return tx.adminJudgment.findUnique({
      where: { id: judgmentRecord.id },
      include: { entries: { orderBy: { order: 'asc' } } },
    });
  });

  return NextResponse.json({ judgment });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const judgment = await prisma.adminJudgment.findUnique({
    where: { subjectId: id },
    include: { entries: { orderBy: { order: 'asc' } }, setBy: { select: { username: true } } },
  });
  return NextResponse.json({ judgment });
}
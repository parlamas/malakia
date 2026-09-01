// app/api/subjects/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const subjectType = searchParams.get('subjectType');

  const subjects = await prisma.subject.findMany({
    where: {
      ...(q ? { displayName: { contains: q, mode: 'insensitive' } } : {}),
      ...(subjectType ? { subjectType: subjectType as any } : {}),
    },
    select: {
      id: true,
      subjectType: true,
      displayName: true,
      disambiguators: true,
      description: true,
      roleTitle: true,
      verificationStatus: true,
      adminJudgment: {
        select: {
          entries: { select: { side: true, magnitude: true } },
        },
      },
      _count: {
        select: { posts: { where: { status: 'PUBLISHED' } } },
      },
    },
    orderBy: { displayName: 'asc' },
    take: 25,
  });

  return NextResponse.json({ subjects });
}
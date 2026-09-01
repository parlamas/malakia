// app/api/subjects/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        include: {
          behavior: true,
          author: { select: { id: true, username: true, image: true } },
          contests: {
            include: { contestingUser: { select: { id: true, username: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      adminJudgment: {
        include: { entries: { orderBy: { order: 'asc' } } },
      },
    },
  });

  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  }

  const base = {
    id: subject.id,
    subjectType: subject.subjectType,
    displayName: subject.displayName,
    description: subject.description,
    disambiguators: subject.disambiguators,
    associatedContext: subject.associatedContext,
    personaCategory: subject.personaCategory,
    roleTitle: subject.roleTitle,
    roleStartYear: subject.roleStartYear,
    roleStartMonth: subject.roleStartMonth,
    roleStartDay: subject.roleStartDay,
    roleStartCirca: subject.roleStartCirca,
    roleStartUnknown: subject.roleStartUnknown,
    roleEndYear: subject.roleEndYear,
    roleEndMonth: subject.roleEndMonth,
    roleEndDay: subject.roleEndDay,
    roleEndCirca: subject.roleEndCirca,
    roleEndUnknown: subject.roleEndUnknown,
    stillServing: subject.stillServing,
    approximatePeriod: subject.approximatePeriod,
    birthYear: subject.birthYear,
    birthMonth: subject.birthMonth,
    birthDay: subject.birthDay,
    birthCirca: subject.birthCirca,
    birthUnknown: subject.birthUnknown,
    isDeceased: subject.isDeceased,
    deathYear: subject.deathYear,
    deathMonth: subject.deathMonth,
    deathDay: subject.deathDay,
    deathCirca: subject.deathCirca,
    deathUnknown: subject.deathUnknown,
    photoUrl: subject.photoUrl,
    verificationStatus: subject.verificationStatus,
    extremeBadge: subject.extremeBadge,
    adminJudgment: subject.adminJudgment,
  };

  if (subject.verificationStatus === 'DISPUTED') {
    return NextResponse.json({
      subject: base,
      posts: [],
      notice: 'This record\'s eligibility has been disputed and its content is currently suppressed pending review.',
    });
  }

  return NextResponse.json({
    subject: base,
    posts: subject.posts,
  });
}
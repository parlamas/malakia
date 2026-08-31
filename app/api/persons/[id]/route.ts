// app/api/persons/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        include: {
          behavior: true,
          author: { select: { id: true, username: true } },
          contests: {
            include: { contestingUser: { select: { id: true, username: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  const basePersonInfo = {
    id: person.id,
    displayName: person.displayName,
    disambiguators: person.disambiguators,
    country: person.country,
    personaCategory: person.personaCategory,
    roleTitle: person.roleTitle,
    roleStartYear: person.roleStartYear,
    roleStartMonth: person.roleStartMonth,
    roleStartDay: person.roleStartDay,
    roleStartCirca: person.roleStartCirca,
    roleStartUnknown: person.roleStartUnknown,
    roleEndYear: person.roleEndYear,
    roleEndMonth: person.roleEndMonth,
    roleEndDay: person.roleEndDay,
    roleEndCirca: person.roleEndCirca,
    roleEndUnknown: person.roleEndUnknown,
    stillServing: person.stillServing,
    approximatePeriod: person.approximatePeriod,
    birthYear: person.birthYear,
    birthMonth: person.birthMonth,
    birthDay: person.birthDay,
    birthCirca: person.birthCirca,
    birthUnknown: person.birthUnknown,
    isDeceased: person.isDeceased,
    deathYear: person.deathYear,
    deathMonth: person.deathMonth,
    deathDay: person.deathDay,
    deathCirca: person.deathCirca,
    deathUnknown: person.deathUnknown,
    photoUrl: person.photoUrl,
    verificationStatus: person.verificationStatus,
    adminScaleValue: person.adminScaleValue,
  };

  if (person.verificationStatus === 'DISPUTED') {
    return NextResponse.json({
      person: basePersonInfo,
      record: null,
      posts: [],
      notice: 'This profile\'s public-persona eligibility has been disputed and its record is currently suppressed pending review.',
    });
  }

  const callousCount = person.posts.filter((p) => p.axis === 'CALLOUS').length;
  const civicCount = person.posts.filter((p) => p.axis === 'CIVIC').length;

  return NextResponse.json({
    person: basePersonInfo,
    record: {
      callousCount,
      civicCount,
      netScore: civicCount - callousCount,
    },
    posts: person.posts,
  });
}
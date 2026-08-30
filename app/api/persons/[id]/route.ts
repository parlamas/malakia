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
        orderBy: { conductDate: 'desc' },
      },
    },
  });

  if (!person) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  const callousCount = person.posts.filter((p) => p.axis === 'CALLOUS').length;
  const civicCount = person.posts.filter((p) => p.axis === 'CIVIC').length;

  return NextResponse.json({
    person: {
      id: person.id,
      displayName: person.displayName,
      disambiguators: person.disambiguators,
      country: person.country,
      personaCategory: person.personaCategory,
      roleTitle: person.roleTitle,
      roleStartDate: person.roleStartDate,
      roleEndDate: person.roleEndDate,
      verificationStatus: person.verificationStatus,
    },
    record: {
      // "record while in role" — never framed as current standing, per the
      // conduct-in-role scoping decision
      callousCount,
      civicCount,
      netScore: civicCount - callousCount,
    },
    posts: person.posts,
  });
}
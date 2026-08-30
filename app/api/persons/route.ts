// app/api/persons/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const country = searchParams.get('country');
  const personaCategory = searchParams.get('personaCategory');

  const persons = await prisma.person.findMany({
    where: {
      ...(q ? { displayName: { contains: q, mode: 'insensitive' } } : {}),
      ...(country ? { country } : {}),
      ...(personaCategory ? { personaCategory: personaCategory as any } : {}),
    },
    select: {
      id: true,
      displayName: true,
      disambiguators: true,
      country: true,
      personaCategory: true,
      roleTitle: true,
      roleStartDate: true,
      roleEndDate: true,
      verificationStatus: true,
      _count: {
        select: { posts: { where: { status: 'PUBLISHED' } } },
      },
    },
    orderBy: { displayName: 'asc' },
    take: 25,
  });

  return NextResponse.json({ persons });
}
// app/api/posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await req.json();
  const {
    axis,
    behaviorId,
    narrative,
    evidenceUrl,
    conductYear,
    conductMonth,
    conductDay,
    conductCirca,
    conductUnknown,
    conductEraNote,
    publicCapacityJustification,
    subject,
  } = body;

  if (!axis || !behaviorId || !narrative || !publicCapacityJustification || !subject) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (conductYear === null || conductYear === undefined) {
    return NextResponse.json({ error: 'A conduct year is required' }, { status: 400 });
  }

  const behavior = await prisma.behavior.findUnique({ where: { id: behaviorId } });
  if (!behavior || !behavior.active || behavior.axis !== axis) {
    return NextResponse.json({ error: 'Invalid behavior for this axis' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let person;
      if (subject.existingPersonId) {
        person = await tx.person.findUnique({ where: { id: subject.existingPersonId } });
        if (!person) {
          throw new HttpError(404, 'Referenced person not found');
        }
      } else {
        const {
          displayName, country, personaCategory, roleTitle,
          roleStartYear, roleStartMonth, roleStartDay, roleStartCirca, roleStartUnknown,
          roleEndYear, roleEndMonth, roleEndDay, roleEndCirca, roleEndUnknown, stillServing,
          approximatePeriod,
          birthYear, birthMonth, birthDay, birthCirca, birthUnknown,
          isDeceased, deathYear, deathMonth, deathDay, deathCirca, deathUnknown,
          roleEvidenceUrl, disambiguators, photoUrl,
        } = subject;

        if (!displayName || !country || !personaCategory || !roleTitle) {
          throw new HttpError(400, 'Missing required subject fields');
        }

        const possibleMatches = await tx.person.findMany({
          where: { displayName: { equals: displayName, mode: 'insensitive' }, country },
          take: 5,
        });
        if (possibleMatches.length > 0 && !subject.confirmNewPerson) {
          throw new DisambiguationNeeded(possibleMatches);
        }

        person = await tx.person.create({
          data: {
            displayName,
            disambiguators,
            country,
            personaCategory,
            roleTitle,
            roleStartYear: roleStartYear ?? null,
            roleStartMonth: roleStartMonth ?? null,
            roleStartDay: roleStartDay ?? null,
            roleStartCirca: !!roleStartCirca,
            roleStartUnknown: !!roleStartUnknown,
            roleEndYear: roleEndYear ?? null,
            roleEndMonth: roleEndMonth ?? null,
            roleEndDay: roleEndDay ?? null,
            roleEndCirca: !!roleEndCirca,
            roleEndUnknown: !!roleEndUnknown,
            stillServing: !!stillServing,
            approximatePeriod: approximatePeriod ?? null,
            birthYear: birthYear ?? null,
            birthMonth: birthMonth ?? null,
            birthDay: birthDay ?? null,
            birthCirca: !!birthCirca,
            birthUnknown: !!birthUnknown,
            isDeceased: !!isDeceased,
            deathYear: deathYear ?? null,
            deathMonth: deathMonth ?? null,
            deathDay: deathDay ?? null,
            deathCirca: !!deathCirca,
            deathUnknown: !!deathUnknown,
            roleEvidenceUrl,
            photoUrl,
            verificationStatus: 'UNVERIFIED',
          },
        });
      }

      const post = await tx.post.create({
        data: {
          authorUserId: user.id,
          subjectPersonId: person.id,
          axis,
          behaviorId,
          narrative,
          evidenceUrl,
          conductYear,
          conductMonth: conductMonth ?? null,
          conductDay: conductDay ?? null,
          conductCirca: !!conductCirca,
          conductUnknown: !!conductUnknown,
          conductEraNote: conductEraNote ?? null,
          publicCapacityJustification,
          status: 'PENDING',
        },
      });

      return { post, person };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof DisambiguationNeeded) {
      return NextResponse.json(
        { needsDisambiguation: true, possibleMatches: err.matches },
        { status: 409 },
      );
    }
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Post creation failed:', err);
    return NextResponse.json({ error: 'Something went wrong creating this record' }, { status: 500 });
  }
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

class DisambiguationNeeded extends Error {
  matches: unknown[];
  constructor(matches: unknown[]) {
    super('Disambiguation needed');
    this.matches = matches;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const personId = searchParams.get('personId');
  const axis = searchParams.get('axis') as 'CALLOUS' | 'CIVIC' | null;

  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      ...(personId ? { subjectPersonId: personId } : {}),
      ...(axis ? { axis } : {}),
    },
    include: { behavior: true, subject: true, contests: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ posts });
}
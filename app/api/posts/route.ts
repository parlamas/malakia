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
    conductDate,
    conductYear,
    conductMonth,
    conductDay,
    conductEraNote,
    publicCapacityJustification,
    subject,
  } = body;

  if (!axis || !behaviorId || !narrative || !publicCapacityJustification || !subject) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!conductDate && !conductYear) {
    return NextResponse.json({ error: 'Either a conduct date or a conduct year is required' }, { status: 400 });
  }

  const conductDateParsed = conductDate ? new Date(conductDate) : null;
  if (conductDate && isNaN(conductDateParsed!.getTime())) {
    return NextResponse.json({ error: 'Invalid conductDate' }, { status: 400 });
  }

  const behavior = await prisma.behavior.findUnique({ where: { id: behaviorId } });
  if (!behavior || !behavior.active || behavior.axis !== axis) {
    return NextResponse.json({ error: 'Invalid behavior for this axis' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Resolve or create the Person
      let person;
      if (subject.existingPersonId) {
        person = await tx.person.findUnique({ where: { id: subject.existingPersonId } });
        if (!person) {
          throw new HttpError(404, 'Referenced person not found');
        }
      } else {
        const {
          displayName, country, personaCategory, roleTitle,
          roleStartDate, roleEndDate, roleStartYear, roleEndYear, approximatePeriod,
          roleEvidenceUrl, disambiguators, photoUrl,
        } = subject;

        if (!displayName || !country || !personaCategory || !roleTitle) {
          throw new HttpError(400, 'Missing required subject fields');
        }

        const isHistorical = personaCategory === 'HISTORICAL_FIGURE';

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
            roleStartDate: roleStartDate ? new Date(roleStartDate) : null,
            roleEndDate: roleEndDate ? new Date(roleEndDate) : null,
            roleStartYear: isHistorical ? roleStartYear : null,
            roleEndYear: isHistorical ? roleEndYear : null,
            approximatePeriod: isHistorical ? approximatePeriod : null,
            roleEvidenceUrl,
            photoUrl,
            verificationStatus: 'UNVERIFIED',
          },
        });
      }

      const isHistoricalSubject = person.personaCategory === 'HISTORICAL_FIGURE';

      // Conduct-date-vs-tenure scoping removed — a post's conduct date is no
      // longer required to fall within the subject's tenure window. Conduct
      // before or after the qualifying role is now in scope, since events in
      // a person's life can be related regardless of when they held office.

      const post = await tx.post.create({
        data: {
          authorUserId: user.id,
          subjectPersonId: person.id,
          axis,
          behaviorId,
          narrative,
          evidenceUrl,
          conductDate: conductDateParsed,
          conductYear: isHistoricalSubject ? conductYear : (conductDateParsed ? null : conductYear),
          conductMonth: isHistoricalSubject ? conductMonth : (conductDateParsed ? null : conductMonth),
          conductDay: isHistoricalSubject ? conductDay : (conductDateParsed ? null : conductDay),
          conductEraNote: isHistoricalSubject ? conductEraNote : null,
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
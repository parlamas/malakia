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
    publicCapacityJustification,
    subject, // { existingPersonId? } OR { displayName, country, personaCategory, roleTitle, roleStartDate, roleEndDate, roleEvidenceUrl, disambiguators?, photoUrl? }
  } = body;

  if (!axis || !behaviorId || !narrative || !conductDate || !publicCapacityJustification || !subject) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const conductDateParsed = new Date(conductDate);
  if (isNaN(conductDateParsed.getTime())) {
    return NextResponse.json({ error: 'Invalid conductDate' }, { status: 400 });
  }

  // Resolve or create the Person
  let person;
  if (subject.existingPersonId) {
    person = await prisma.person.findUnique({ where: { id: subject.existingPersonId } });
    if (!person) {
      return NextResponse.json({ error: 'Referenced person not found' }, { status: 404 });
    }
  } else {
    const { displayName, country, personaCategory, roleTitle, roleStartDate, roleEndDate, roleEvidenceUrl, disambiguators, photoUrl } = subject;
    if (!displayName || !country || !personaCategory || !roleTitle || !roleStartDate) {
      return NextResponse.json({ error: 'Missing required subject fields' }, { status: 400 });
    }

    // Loose duplicate check — surface possible matches rather than silently creating a duplicate
    const possibleMatches = await prisma.person.findMany({
      where: { displayName: { equals: displayName, mode: 'insensitive' }, country },
      take: 5,
    });
    if (possibleMatches.length > 0 && !subject.confirmNewPerson) {
      return NextResponse.json(
        { needsDisambiguation: true, possibleMatches },
        { status: 409 },
      );
    }

    person = await prisma.person.create({
      data: {
        displayName,
        disambiguators,
        country,
        personaCategory,
        roleTitle,
        roleStartDate: new Date(roleStartDate),
        roleEndDate: roleEndDate ? new Date(roleEndDate) : null,
        roleEvidenceUrl,
        photoUrl,
        verificationStatus: 'UNVERIFIED',
      },
    });
  }

  // Conduct-date-vs-tenure validation — the load-bearing scope check
  if (conductDateParsed < person.roleStartDate) {
    return NextResponse.json(
      { error: 'Conduct date is before the subject\'s tenure began' },
      { status: 422 },
    );
  }
  if (person.roleEndDate && conductDateParsed > person.roleEndDate) {
    return NextResponse.json(
      { error: 'Conduct date is after the subject left the qualifying role — out of scope' },
      { status: 422 },
    );
  }

  const behavior = await prisma.behavior.findUnique({ where: { id: behaviorId } });
  if (!behavior || !behavior.active || behavior.axis !== axis) {
    return NextResponse.json({ error: 'Invalid behavior for this axis' }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      authorUserId: user.id,
      subjectPersonId: person.id,
      axis,
      behaviorId,
      narrative,
      evidenceUrl,
      conductDate: conductDateParsed,
      publicCapacityJustification,
      status: 'PENDING', // awaits language moderation
    },
  });

  return NextResponse.json({ post, person }, { status: 201 });
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
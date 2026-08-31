// app/api/persons/[id]/admin-scale/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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
  const { value } = body;

  if (value === undefined || value === null) {
    return NextResponse.json({ error: 'value is required' }, { status: 400 });
  }

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < -100 || numericValue > 100) {
    return NextResponse.json({ error: 'value must be an integer between -100 and 100' }, { status: 400 });
  }

  const existingPerson = await prisma.person.findUnique({ where: { id } });
  if (!existingPerson) {
    return NextResponse.json({ error: 'Person not found' }, { status: 404 });
  }

  const [person] = await prisma.$transaction([
    prisma.person.update({
      where: { id },
      data: { adminScaleValue: numericValue },
    }),
    prisma.auditLogEntry.create({
      data: {
        actorUserId: user.id,
        action: 'admin_scale_value_set',
        targetType: 'Person',
        targetId: id,
        reason: `value=${numericValue}`,
      },
    }),
  ]);

  return NextResponse.json({ person });
}
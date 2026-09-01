// app/api/user-reports/[id]/route.ts

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
  const { status, resolutionNote } = body;

  if (!['ACTIONED', 'DISMISSED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const existing = await prisma.userReport.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const report = await prisma.userReport.update({
    where: { id },
    data: {
      status,
      reviewedById: user.id,
      reviewedAt: new Date(),
      resolutionNote: resolutionNote || null,
    },
  });

  return NextResponse.json({ report });
}
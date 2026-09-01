// app/api/user-reports/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const MAX_REASON_LENGTH = 1000;

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await req.json();
  const { reportedUserId, reason } = body;

  if (!reportedUserId || !reason) {
    return NextResponse.json({ error: 'reportedUserId and reason are required' }, { status: 400 });
  }
  if (reason.length > MAX_REASON_LENGTH) {
    return NextResponse.json({ error: `reason must be ${MAX_REASON_LENGTH} characters or fewer` }, { status: 400 });
  }
  if (reportedUserId === user.id) {
    return NextResponse.json({ error: 'You cannot report yourself' }, { status: 400 });
  }

  const reportedUser = await prisma.user.findUnique({ where: { id: reportedUserId } });
  if (!reportedUser) {
    return NextResponse.json({ error: 'Reported user not found' }, { status: 404 });
  }

  const report = await prisma.userReport.create({
    data: {
      reporterUserId: user.id,
      reportedUserId,
      reason,
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const reports = await prisma.userReport.findMany({
    where: { status: 'PENDING' },
    include: {
      reporter: { select: { username: true } },
      reportedUser: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ reports });
}
// app/api/behaviors/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const axis = searchParams.get('axis');

  if (axis && !['CALLOUS', 'CIVIC'].includes(axis)) {
    return NextResponse.json({ error: 'Invalid axis' }, { status: 400 });
  }

  const behaviors = await prisma.behavior.findMany({
    where: {
      active: true,
      ...(axis ? { axis: axis as 'CALLOUS' | 'CIVIC' } : {}),
    },
    orderBy: { label: 'asc' },
  });

  return NextResponse.json({ behaviors });
}
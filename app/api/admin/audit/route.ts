//app/api/admin/audit/route.ts

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "../../../../lib/prisma"

export async function GET() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("auth_token")

  if (!cookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: { sub: string; tv: number }

  try {
    payload = jwt.verify(
      cookie.value,
      process.env.JWT_SECRET!
    ) as { sub: string; tv: number }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      tokenVersion: true,
      isAdmin: true,
    },
  })

  if (!user || user.tokenVersion !== payload.tv || !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const logs = await prisma.passwordAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: Number(process.env.ADMIN_AUDIT_LIMIT),
  })

  return NextResponse.json({ logs })
}

// app/api/auth/me/route.ts

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "../../../../lib/prisma"

export async function GET() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("auth_token")

  if (!cookie) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    const payload = jwt.verify(
      cookie.value,
      process.env.JWT_SECRET!
    ) as { sub: string; tv: number }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        tokenVersion: true,
        username: true,
      },
    })

    if (!user || user.tokenVersion !== payload.tv) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      username: user.username,
    })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}

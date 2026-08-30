// lib/auth.ts

import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("auth_token")

  if (!cookie) {
    return null
  }

  try {
    const payload = jwt.verify(
      cookie.value,
      process.env.JWT_SECRET!
    ) as { sub: string; tv: number }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        tokenVersion: true,
      },
    })

    if (!user || user.tokenVersion !== payload.tv) {
      return null
    }

    return user
  } catch {
    return null
  }
}
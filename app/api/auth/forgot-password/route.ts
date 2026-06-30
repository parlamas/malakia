// app/api/auth/forgot-password/route.ts

import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "../../../../lib/prisma"
import { sendPasswordResetEmail } from "../../../../lib/email"

const COOLDOWN_MINUTES = 10

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: true })
    }

    const identifier = email.toLowerCase()
    const since = new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000)

    const recent = await prisma.passwordResetRequest.findFirst({
      where: {
        identifier,
        createdAt: { gt: since },
      },
    })

    if (recent) {
      return NextResponse.json({ ok: true })
    }

    await prisma.passwordResetRequest.create({
      data: { identifier },
    })

    const user = await prisma.user.findUnique({
      where: { email: identifier },
    })

    if (!user) {
      return NextResponse.json({ ok: true })
    }

    await prisma.passwordResetToken.deleteMany({
      where: { identifier },
    })

    const token = crypto.randomBytes(32).toString("hex")

    const ip =
  request.headers.get("x-forwarded-for") ??
  request.headers.get("x-real-ip") ??
  "unknown"

await prisma.passwordResetToken.create({
  data: {
    identifier,
    token,
    expires: new Date(Date.now() + 60 * 60 * 1000),
    ip,
  },
})


    const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`

    await sendPasswordResetEmail(identifier, resetUrl)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

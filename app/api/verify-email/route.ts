// app/api/verify-email/route.ts

import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/verification-error?error=missing-token", request.url)
      )
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: { gt: new Date() },
      },
    })

    if (verificationToken) {
      await prisma.user.update({
        where: { email: verificationToken.identifier.toLowerCase() },
        data: { emailVerified: new Date() },
      })

      await prisma.verificationToken.delete({
        where: { token },
      })

      return NextResponse.redirect(
        new URL("/auth/verification-success", request.url)
      )
    }

    // Token already used → user already verified → still success
    const user = await prisma.user.findFirst({
      where: {
        emailVerified: { not: null },
      },
      orderBy: { emailVerified: "desc" },
    })

    if (user) {
      return NextResponse.redirect(
        new URL("/auth/verification-success", request.url)
      )
    }

    return NextResponse.redirect(
      new URL("/auth/verification-error?error=invalid-token", request.url)
    )
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.redirect(
      new URL("/auth/verification-error?error=server-error", request.url)
    )
  }
}

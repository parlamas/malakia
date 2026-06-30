// app/api/test-verification/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  console.log("=== TEST VERIFICATION STATUS ===")
  console.log("Email:", email)
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }
  
  // Check user
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  console.log("User found:", !!user)
  if (user) {
    console.log("User emailVerified:", user.emailVerified)
    console.log("User createdAt:", user.createdAt)
  }
  
  // Check verification tokens
  const tokens = await prisma.verificationToken.findMany({
    where: {
      identifier: email
    }
  })
  
  console.log("Verification tokens found:", tokens.length)
  
  return NextResponse.json({
    user: user ? {
      email: user.email,
      emailVerified: user.emailVerified?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      hasPassword: !!user.password
    } : null,
    verificationTokens: tokens.map(t => ({
      token: t.token.substring(0, 10) + '...',
      expires: t.expires.toISOString()
    }))
  })
}

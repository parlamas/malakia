// app/api/debug/token/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }
  
  // Check all tokens (including expired)
  const allTokens = await prisma.verificationToken.findMany({
    where: {
      token: {
        contains: token.substring(0, 10) // Match first 10 chars
      }
    }
  })
  
  const now = new Date()
  
  return NextResponse.json({
    now: now.toISOString(),
    tokenProvided: token.substring(0, 10) + '...',
    tokensFound: allTokens.map(t => ({
      token: t.token.substring(0, 10) + '...',
      identifier: t.identifier,
      expires: t.expires.toISOString(),
      isExpired: t.expires < now,
      expiresInMinutes: Math.round((t.expires.getTime() - now.getTime()) / 60000)
    }))
  })
}

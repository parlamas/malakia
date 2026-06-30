// app/api/debug/db/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    console.log("=== DATABASE DEBUG ===")
    
    // Test 1: Count users
    const userCount = await prisma.user.count()
    console.log("User count:", userCount)
    
    // Test 2: Count verification tokens
    const tokenCount = await prisma.verificationToken.count()
    console.log("VerificationToken count:", tokenCount)
    
    // Test 3: List some tokens
    const recentTokens = await prisma.verificationToken.findMany({
      take: 5,
      orderBy: { expires: 'desc' }
    })
    
    console.log("Recent tokens:", recentTokens.length)
    
    return NextResponse.json({
      success: true,
      userCount,
      tokenCount,
      recentTokens: recentTokens.map(t => ({
        identifier: t.identifier,
        token: t.token.substring(0, 10) + '...',
        expires: t.expires.toISOString()
      })),
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error("Database debug error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

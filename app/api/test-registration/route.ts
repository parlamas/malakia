// app/api/test-registration/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const testEmail = `test${Date.now()}@example.com`
    
    console.log('=== TEST REGISTRATION ===')
    console.log('Test email:', testEmail)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        username: `testuser${Date.now()}`,
        email: testEmail,
        password: '$2a$10$dummyhashfordemo', // Fake hash
        emailVerified: null,
      }
    })
    
    console.log('User created:', user.id)
    
    // Create verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    console.log('Token created:', token.substring(0, 10) + '...')
    console.log('Expires:', expires.toISOString())
    
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: testEmail,
        token,
        expires,
      }
    })
    
    console.log('VerificationToken created for:', verificationToken.identifier)
    
    // Check if token exists
    const foundToken = await prisma.verificationToken.findUnique({
      where: { token }
    })
    
    console.log('Token found in DB:', !!foundToken)
    
    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
      token: token.substring(0, 10) + '...',
      fullToken: token, // For testing
      expires: expires.toISOString(),
      tokenExists: !!foundToken,
      verificationToken: {
        identifier: verificationToken.identifier,
        expires: verificationToken.expires.toISOString()
      }
    })
    
  } catch (error) {
    console.error('Test registration error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

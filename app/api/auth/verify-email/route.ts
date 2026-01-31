// app/api/auth/verify-email/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    console.log('Verification request received')
    console.log('Token from URL:', token)
    
    if (!token) {
      console.error('Missing token parameter')
      return NextResponse.json(
        { error: 'Missing verification parameters' },
        { status: 400 }
      )
    }

    // Find the verification token
    console.log('Looking for token in database...')
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(), // Not expired
        }
      }
    })

    console.log('Found token:', verificationToken)

    if (!verificationToken) {
      console.error('Token not found or expired')
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    // Update user's email verification status
    console.log('Updating user:', verificationToken.identifier)
    const updatedUser = await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { 
        emailVerified: new Date(),
      }
    })

    console.log('User updated:', updatedUser.email)

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
    })

    console.log('Token deleted successfully')

    // Redirect to success page instead of returning JSON
    return NextResponse.redirect(
      new URL('/auth/verification-success', request.url)
    )

  } catch (error: any) {
    console.error('Verification error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    // Redirect to error page or show error
    return NextResponse.redirect(
      new URL('/auth/verification-error', request.url)
    )
  }
}
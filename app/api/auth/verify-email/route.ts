import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('REDIRECT ENDPOINT HIT - SHOULD NOT BE INTERCEPTED BY NEXTAUTH')
  
  return NextResponse.json({
    message: 'This is the redirect endpoint, not NextAuth!',
    url: request.url,
    intercepted: false
  })
}

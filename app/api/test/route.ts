import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('=== TEST ENDPOINT HIT ===')
  console.log('URL:', request.url)
  console.log('Method:', request.method)
  console.log('Headers:', Object.fromEntries(request.headers))
  
  return NextResponse.json({
    message: 'Test endpoint working',
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString()
  })
}

//proxy.ts

import { NextRequest, NextResponse } from "next/server"

const RATE_LIMIT = Number(process.env.RATE_LIMIT_MAX)
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS)

const ipMap = new Map<string, { count: number; ts: number }>()

export function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  const now = Date.now()
  const entry = ipMap.get(ip)

  if (!entry || now - entry.ts > WINDOW_MS) {
    ipMap.set(ip, { count: 1, ts: now })
    return NextResponse.next()
  }

  entry.count++

  if (entry.count > RATE_LIMIT) {
    return new NextResponse("Too many requests", { status: 429 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}


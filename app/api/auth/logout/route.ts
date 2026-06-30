// app/api/auth/logout/route.ts

import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear auth cookie (adjust name if yours differs)
  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  })

  return response
}

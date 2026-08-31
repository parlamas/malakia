// components/NavBar.tsx
"use client"

import { useEffect, useState } from "react"
import SignOutButton from "./SignOutButton"
import Link from "next/link"

export default function NavBar() {
  const [user, setUser] = useState<{
    authenticated: boolean
    username?: string
  } | null>(null)

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setUser(data)
      })
      .catch(() => {
        setUser({ authenticated: false })
      })
  }, [])

  return (
    <nav className="bg-[#f5f5dc] w-full">

      <div className="w-full h-16 flex items-center pl-6 pr-5 sm:pl-6 sm:pr-4 gap-2">

        {/* Burger — real left margin, separate from container padding */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-600 hover:text-blue-600 transition-colors p-2 flex-shrink-0"
style={{ marginLeft: '40px' }}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Brand text — both parts visible on mobile, "means CALLOUSNESS" just shrinks */}
        <div className="flex-1 flex justify-center items-baseline gap-1 sm:gap-2 whitespace-nowrap overflow-hidden">
          <span className="text-black font-bold text-base sm:text-lg tracking-wide">ΜΑΛΑΚΙΑ</span>
          <span className="text-black-500 font-bold text-xs sm:text-sm">means</span>
          <span className="text-red-600 font-bold text-xs sm:text-sm">CALLOUSNESS</span>
        </div>

        {/* Sign in / user — hidden on mobile, moves into burger menu instead */}
<div className="hidden sm:flex items-center flex-shrink-0" style={{ marginRight: '20px' }}>
  {user === null ? null : user.authenticated ? (
    <div className="flex items-center gap-4">
      <span className="text-black font-medium">
        {user.username}
      </span>
      <SignOutButton />
    </div>
  ) : (
    <Link
      href="/auth/signin"
      className="bg-[#8B4513] text-white rounded hover:bg-[#6f3610] transition-colors"
      style={{ paddingLeft: '32px', paddingRight: '32px', paddingTop: '8px', paddingBottom: '8px' }}
    >
      Sign In
    </Link>
  )}
</div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-[#f5f5dc]">
          <div className="pr-5 sm:pr-4 py-3 flex flex-col gap-3" style={{ paddingLeft: '40px' }}>
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/quotes"
              className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              Classic malakia quotes
            </Link>

            {/* Sign in / user — lives here on mobile since it's hidden from the bar itself */}
            <div className="sm:hidden pt-2 border-t border-gray-200">
              {user === null ? null : user.authenticated ? (
                <div className="flex items-center gap-4">
                  <span className="text-black font-medium text-sm">
                    {user.username}
                  </span>
                  <SignOutButton />
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-blue-600 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
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
      
      <div className="w-full h-16 flex items-center justify-between relative">
        
        <div style={{ width: '100px' }}></div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-black font-bold text-lg tracking-wide">ΜΑΛΑΚΙΑ</span>
          <span className="text-gray-500 text-sm">means CALLOUSNESS</span>
        </div>

        <div className="flex items-center gap-4 absolute left-[100px]">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 hover:text-blue-600 transition-colors p-2"
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

          <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </Link>

          <Link
            href="/quotes"
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm whitespace-nowrap"
          >
            Classic malakia quotes
          </Link>
        </div>

        <div className="flex items-center absolute right-[100px]">
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
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
        
        <div style={{ width: '100px' }}></div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-[#f5f5dc]">
          <div className="px-[100px] py-3">
            <div className="text-gray-500 text-sm">
              Menu is open
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
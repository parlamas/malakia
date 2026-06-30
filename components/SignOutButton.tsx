// components/SignOutButton.tsx

"use client"

import { useRouter } from "next/navigation"

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } finally {
      router.push("/auth/signin")
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
    >
      Sign Out
    </button>
  )
}

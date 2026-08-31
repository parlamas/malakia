// components/SignOutButton.tsx

"use client"

export default function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } finally {
      window.location.href = "/auth/signin"
    }
  }

  return (
    <button
      onClick={handleSignOut}
      className="bg-[#8B4513] text-white rounded hover:bg-[#6f3610] transition-colors"
      style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '8px', paddingBottom: '8px' }}
    >
      Sign Out
    </button>
  )
}
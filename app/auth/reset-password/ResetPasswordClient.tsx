//app/auth/reset-password/ResetPasswordClient.tsx

"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function ResetPasswordClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  if (!token) {
    return <div className="p-8 text-red-600">Invalid or missing token.</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess(true)
      setMessage("Password reset successful. Redirecting to sign in…")
    } else {
      setMessage(data.error || "Password reset failed.")
    }
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push("/auth/signin")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success, router])

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
  <ul className="text-sm text-gray-600 space-y-1">
    <li>• At least 8 characters</li>
    <li>• At least one uppercase letter</li>
    <li>• At least one lowercase letter</li>
    <li>• At least one number</li>
  </ul>

  <input
    type="password"
    required
    placeholder="New password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full border p-2"
    disabled={loading || success}
  />

  <button
    type="submit"
    disabled={loading || success}
    className="w-full bg-blue-500 text-white p-2 disabled:opacity-50"
  >
    {loading ? "Resetting…" : "Reset Password"}
  </button>
</form>

      {message && <p className="mt-4">{message}</p>}

      {success && (
        <p className="mt-2 text-sm">
          <a href="/auth/signin" className="text-blue-500 underline">
            Go to sign in now
          </a>
        </p>
      )}
    </div>
  )
}

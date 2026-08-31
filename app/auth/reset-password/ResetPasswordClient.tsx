//app/auth/reset-password/ResetPasswordClient.tsx

"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function ResetPasswordClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <main style={{ background: '#EDEAE2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <p style={{ color: '#7A2E2E', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16 }}>
          Invalid or missing token.
        </p>
      </main>
    )
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
    <main style={{ background: '#EDEAE2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontFamily: 'ui-monospace, "IBM Plex Mono", monospace', fontSize: 13, color: '#5F5E5A', letterSpacing: '0.03em', marginBottom: 6 }}>
          MALAKIA
        </p>
        <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 28, color: '#1C2024', margin: '0 0 20px' }}>
          Reset Password
        </h1>

        <form onSubmit={handleSubmit}>
          <ul style={{ fontSize: 13, color: '#5F5E5A', margin: '0 0 20px', paddingLeft: 18, lineHeight: 1.8 }}>
            <li>At least 8 characters</li>
            <li>At least one uppercase letter</li>
            <li>At least one lowercase letter</li>
            <li>At least one number</li>
          </ul>

          <label style={labelStyle}>
            New password
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              disabled={loading || success}
            />
          </label>

          <button
            type="submit"
            disabled={loading || success}
            style={{
              width: '100%',
              padding: '14px 0',
              marginTop: 24,
              background: (loading || success) ? '#B4B2A9' : '#1C2024',
              color: '#fff',
              border: 'none',
              fontFamily: 'Georgia, serif',
              fontSize: 16,
              cursor: (loading || success) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 20, fontSize: 14, color: success ? '#2F5D50' : '#7A2E2E' }}>
            {message}
          </p>
        )}

        {success && (
          <p style={{ marginTop: 10, fontSize: 14 }}>
            <Link href="/auth/signin" style={{ color: '#1C2024', fontWeight: 600, textDecoration: 'underline' }}>
              Go to sign in now
            </Link>
          </p>
        )}
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#5F5E5A',
  fontFamily: 'ui-monospace, "IBM Plex Mono", monospace',
  letterSpacing: '0.03em',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  marginTop: 6,
  border: '1px solid #B4B2A9',
  background: '#fff',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 15,
  color: '#1C2024',
  boxSizing: 'border-box',
};
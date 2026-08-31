// app/auth/forgot-password/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "If the email exists, a reset link was sent.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ background: '#EDEAE2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontFamily: 'ui-monospace, "IBM Plex Mono", monospace', fontSize: 13, color: '#5F5E5A', letterSpacing: '0.03em', marginBottom: 6 }}>
          MALAKIA
        </p>
        <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 28, color: '#1C2024', margin: '0 0 6px' }}>
          Forgot Password
        </h1>
        <p style={{ color: '#5F5E5A', marginBottom: 28, lineHeight: 1.5 }}>
          Enter your email and we'll send you a reset link.
        </p>

        {message && (
          <div style={{
            background: '#fff',
            border: '1px solid #B4B2A9',
            color: '#1C2024',
            padding: '12px 14px',
            marginBottom: 20,
            fontSize: 14,
          }}>
            {message}
          </div>
        )}

        <label style={labelStyle}>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 0',
            marginTop: 24,
            background: loading ? '#B4B2A9' : '#1C2024',
            color: '#fff',
            border: 'none',
            fontFamily: 'Georgia, serif',
            fontSize: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #D8D4C8' }}>
          <p style={{ color: '#5F5E5A', fontSize: 14 }}>
            Remembered it?{" "}
            <Link href="/auth/signin" style={{ color: '#1C2024', fontWeight: 600, textDecoration: 'underline' }}>
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
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
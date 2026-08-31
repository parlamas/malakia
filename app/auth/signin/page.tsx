//app/auth/signin/page.tsx

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === "email_not_verified") {
        setError("Please verify your email before signing in.");
      } else {
        setError(data.error || "Sign-in failed");
      }
      return;
    }

    router.push("/");
    router.refresh();
  } catch {
    setError("An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};


  return (
    <main style={{ background: '#EDEAE2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontFamily: 'ui-monospace, "IBM Plex Mono", monospace', fontSize: 13, color: '#5F5E5A', letterSpacing: '0.03em', marginBottom: 6 }}>
          MALAKIA
        </p>
        <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 28, color: '#1C2024', margin: '0 0 6px' }}>
          Sign In
        </h1>
        <p style={{ color: '#5F5E5A', marginBottom: 28, lineHeight: 1.5 }}>
          Enter your credentials to access your account.
        </p>

        {error && (
          <div style={{
            background: '#F3E8E6',
            border: '1px solid #7A2E2E',
            color: '#7A2E2E',
            padding: '12px 14px',
            marginBottom: 20,
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <label style={labelStyle}>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
            disabled={loading}
          />
        </label>

        <label style={{ ...labelStyle, marginTop: 18 }}>
          Password
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
            disabled={loading}
          />
        </label>

        <div style={{ textAlign: 'right', marginTop: 10 }}>
          <Link href="/auth/forgot-password" style={{ fontSize: 13, color: '#5F5E5A' }}>
            Forgot your password?
          </Link>
        </div>

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
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #D8D4C8' }}>
          <p style={{ color: '#5F5E5A', fontSize: 14 }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" style={{ color: '#1C2024', fontWeight: 600, textDecoration: 'underline' }}>
              Sign up
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
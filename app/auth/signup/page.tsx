// app/auth/signup/page.tsx

"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          email,
          password,
          confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresVerification) {
          setSuccessMessage(data.message);
          setFirstName("");
          setLastName("");
          setUsername("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        } else {
          alert("Account created successfully! Please sign in.");
          router.push("/auth/signin");
        }
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ background: '#EDEAE2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 460, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontFamily: 'ui-monospace, "IBM Plex Mono", monospace', fontSize: 13, color: '#5F5E5A', letterSpacing: '0.03em', marginBottom: 6 }}>
          MALAKIA
        </p>
        <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 28, color: '#1C2024', margin: '0 0 24px' }}>
          Create Account
        </h1>

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

        {successMessage && (
          <div style={{
            background: '#E7EEEA',
            border: '1px solid #2F5D50',
            color: '#2F5D50',
            padding: '12px 14px',
            marginBottom: 20,
            fontSize: 14,
          }}>
            {successMessage}
            <div style={{ marginTop: 10 }}>
              <Link href="/auth/signin" style={{ color: '#1C2024', fontWeight: 600, fontSize: 13, textDecoration: 'underline' }}>
                Go to Sign In →
              </Link>
            </div>
          </div>
        )}

        {!successMessage && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={labelStyle}>
                First Name
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={inputStyle}
                  required
                  disabled={loading}
                />
              </label>
              <label style={labelStyle}>
                Last Name
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={inputStyle}
                  required
                  disabled={loading}
                />
              </label>
            </div>

            <label style={{ ...labelStyle, marginTop: 16 }}>
              Username
              <input
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                required
                disabled={loading}
              />
            </label>

            <label style={{ ...labelStyle, marginTop: 16 }}>
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

            <label style={{ ...labelStyle, marginTop: 16 }}>
              Password
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
                minLength={6}
                disabled={loading}
              />
            </label>

            <label style={{ ...labelStyle, marginTop: 16 }}>
              Confirm Password
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                required
                minLength={6}
                disabled={loading}
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
              {loading ? 'Creating Account…' : 'Sign Up'}
            </button>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid #D8D4C8' }}>
          <p style={{ color: '#5F5E5A', fontSize: 14 }}>
            Already have an account?{" "}
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
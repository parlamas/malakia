// app/profile/page.tsx
"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [username, setUsername] = useState('');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setAuthStatus(d.authenticated ? 'authenticated' : 'unauthenticated');
        if (d.authenticated) {
          setUsername(d.username ?? '');
          setCurrentImage(d.image ?? null);
        }
      })
      .catch(() => setAuthStatus('unauthenticated'));
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload/profile-photo', { method: 'POST', body: formData });
    const data = await res.json();

    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? 'Upload failed.');
      return;
    }

    setCurrentImage(data.url);
    setSuccess(true);
  }

  if (authStatus === 'checking') {
    return (
      <main style={pageStyle}>
        <p style={{ color: '#5F5E5A', fontFamily: 'Inter, system-ui, sans-serif' }}>Loading…</p>
      </main>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <main style={pageStyle}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#1C2024', marginBottom: 16 }}>
            You need to sign in to view your profile.
          </p>
          <Link href="/auth/signin" style={{ color: '#1C2024', textDecoration: 'underline' }}>
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontFamily: 'ui-monospace, "IBM Plex Mono", monospace', fontSize: 13, color: '#5F5E5A', letterSpacing: '0.03em' }}>
          MY PROFILE
        </p>
        <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 28, color: '#1C2024', margin: '8px 0 24px' }}>
          {username}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {currentImage ? (
            <img
              src={currentImage}
              alt={username}
              style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '1px solid #B4B2A9' }}
            />
          ) : (
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              background: '#E8E4DA', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Georgia, serif', fontSize: 40, color: '#5F5E5A',
            }}>
              {username.charAt(0).toUpperCase()}
            </div>
          )}

          <label style={{ fontSize: 13, color: '#5F5E5A' }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              style={{ display: 'block', marginTop: 6 }}
            />
          </label>

          {uploading && <p style={{ fontSize: 13, color: '#5F5E5A' }}>Uploading…</p>}
          {success && <p style={{ fontSize: 13, color: '#2F5D50' }}>Photo updated.</p>}
          {error && <p style={{ fontSize: 13, color: '#7A2E2E' }}>{error}</p>}
        </div>
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  background: '#EDEAE2',
  minHeight: '100vh',
  padding: '4rem 1.5rem',
};
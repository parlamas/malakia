// app/page.tsx
"use client"

import Link from "next/link";

export default function Home() {
  return (
    <main style={{ background: '#EDEAE2', minHeight: '100vh' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '4rem 1.5rem 3rem', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'ui-monospace, "IBM Plex Mono", monospace',
          fontSize: 13,
          letterSpacing: '0.05em',
          color: '#5F5E5A',
        }}>
          ΜΑΛΑΚΙΑ = CALLOUSNESS
        </p>
        <h1 style={{
          fontFamily: 'Georgia, "Iowan Old Style", serif',
          fontSize: 34,
          color: '#1C2024',
          margin: '10px 0 16px',
          lineHeight: 1.3,
        }}>
          A public ethics barometer for people, institutions, and ideas.
        </h1>
        <p style={{ color: '#5F5E5A', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
          Citizens file specific, dated conduct by persons, institutions, organizations, businesses, nations, regimes, administrations, practices, traditions, and ideologies — weighed as negatives and positives that net out to a single verdict: civic-minded, callous, or controversial.
        </p>
      </div>

      {/* The dipole */}
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <Link href="/submit" style={{ ...dipolePanel, background: '#7A2E2E' }}>
          <span style={dipoleLabel}>DENOUNCE</span>
          <span style={dipoleTitle}>Callousness</span>
          <span style={dipoleSub}>File conduct that dismissed, humiliated, or harmed.</span>
        </Link>
        <Link href="/submit" style={{ ...dipolePanel, background: '#2F5D50' }}>
          <span style={dipoleLabel}>COMMEND</span>
          <span style={dipoleTitle}>Civic-mindedness</span>
          <span style={dipoleSub}>File conduct that protected, helped, or stood on principle.</span>
        </Link>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ color: '#5F5E5A', fontSize: 14, lineHeight: 1.6 }}>
          Every record carries a permanent, timestamped ID, is open to reply and reaction from other users, and can be reported for unacceptable language. Only language is moderated — not the truth of what's filed. See the{' '}
          <Link href="/quotes" style={{ color: '#1C2024', textDecoration: 'underline' }}>
            classic malakia quotes
          </Link>{' '}
          for where the word comes from.
        </p>
      </div>
    </main>
  );
}

const dipolePanel: React.CSSProperties = {
  flex: '1 1 320px',
  minHeight: 220,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '2rem 1.5rem',
  textDecoration: 'none',
  color: '#fff',
};

const dipoleLabel: React.CSSProperties = {
  fontFamily: 'ui-monospace, "IBM Plex Mono", monospace',
  fontSize: 12,
  letterSpacing: '0.08em',
  opacity: 0.8,
  marginBottom: 8,
};

const dipoleTitle: React.CSSProperties = {
  fontFamily: 'Georgia, "Iowan Old Style", serif',
  fontSize: 30,
  marginBottom: 10,
};

const dipoleSub: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 14,
  maxWidth: 280,
  lineHeight: 1.5,
  opacity: 0.9,
};
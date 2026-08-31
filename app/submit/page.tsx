// app/submit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DateSelect from '@/components/DateSelect';

type Axis = 'CALLOUS' | 'CIVIC';

interface Behavior {
  id: string;
  label: string;
  description: string;
}

interface PersonMatch {
  id: string;
  displayName: string;
  disambiguators: string | null;
  country: string;
  roleTitle: string;
}

const PERSONA_CATEGORIES = [
  { value: 'ELECTED_OFFICIAL', label: 'Elected official' },
  { value: 'APPOINTED_OFFICIAL', label: 'Appointed official' },
  { value: 'JOURNALIST', label: 'Journalist' },
  { value: 'GOVERNMENT_MEMBER', label: 'Government member (judiciary, legislature, law enforcement)' },
];

export default function SubmitPage() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  const [axis, setAxis] = useState<Axis>('CALLOUS');
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [behaviorId, setBehaviorId] = useState('');
  const [narrative, setNarrative] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [conductDate, setConductDate] = useState('');
  const [justification, setJustification] = useState('');

  const [personQuery, setPersonQuery] = useState('');
  const [matches, setMatches] = useState<PersonMatch[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const [newPerson, setNewPerson] = useState({
    displayName: '',
    country: '',
    personaCategory: 'ELECTED_OFFICIAL',
    roleTitle: '',
    roleStartDate: '',
    roleEndDate: '',
    roleEvidenceUrl: '',
    disambiguators: '',
  });

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setAuthStatus(data.authenticated ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => setAuthStatus('unauthenticated'));
  }, []);

  useEffect(() => {
    fetch(`/api/behaviors?axis=${axis}`)
      .then((r) => r.json())
      .then((data) => {
        setBehaviors(data.behaviors ?? []);
        setBehaviorId('');
      });
  }, [axis]);

  useEffect(() => {
    if (personQuery.length < 2) {
      setMatches([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/persons?q=${encodeURIComponent(personQuery)}`)
        .then((r) => r.json())
        .then((data) => setMatches(data.persons ?? []));
    }, 300);
    return () => clearTimeout(t);
  }, [personQuery]);

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    setErrorMessage('');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload/person-photo', { method: 'POST', body: formData });
    const data = await res.json();
    setUploadingPhoto(false);
    if (res.ok) {
      setPhotoUrl(data.url);
    } else {
      setErrorMessage(data.error ?? 'Photo upload failed.');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const subject = selectedPersonId
      ? { existingPersonId: selectedPersonId }
      : {
          displayName: newPerson.displayName,
          country: newPerson.country,
          personaCategory: newPerson.personaCategory,
          roleTitle: newPerson.roleTitle,
          roleStartDate: newPerson.roleStartDate,
          roleEndDate: newPerson.roleEndDate || null,
          roleEvidenceUrl: newPerson.roleEvidenceUrl || null,
          disambiguators: newPerson.disambiguators || null,
          photoUrl: photoUrl || null,
        };

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        axis,
        behaviorId,
        narrative,
        evidenceUrl: evidenceUrl || null,
        conductDate,
        publicCapacityJustification: justification,
        subject,
      }),
    });

    const data = await res.json();

    if (res.status === 409 && data.needsDisambiguation) {
      setMatches(data.possibleMatches);
      setErrorMessage('A similar record already exists — select it above, or confirm this is a different person.');
      setStatus('error');
      return;
    }

    if (!res.ok) {
      setErrorMessage(data.error ?? 'Something went wrong.');
      setStatus('error');
      return;
    }

    setStatus('success');
  }

  const axisColor = axis === 'CALLOUS' ? '#7A2E2E' : '#2F5D50';
  const axisBg = axis === 'CALLOUS' ? '#F3E8E6' : '#E7EEEA';

  if (authStatus === 'checking') {
    return (
      <main style={{ background: '#EDEAE2', minHeight: '100vh', padding: '4rem 1.5rem' }}>
        <p style={{ color: '#5F5E5A', fontFamily: 'Inter, system-ui, sans-serif', textAlign: 'center' }}>Loading…</p>
      </main>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <main style={{ background: '#EDEAE2', minHeight: '100vh', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <p style={{ fontFamily: 'ui-monospace, "IBM Plex Mono", monospace', fontSize: 13, color: '#5F5E5A', letterSpacing: '0.03em' }}>
            SIGN-IN REQUIRED
          </p>
          <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 26, color: '#1C2024', marginTop: 8, marginBottom: 16 }}>
            You need to sign in to file a record.
          </h1>
          <p style={{ color: '#5F5E5A', marginBottom: 24, lineHeight: 1.6 }}>
            Filing requires an account — you're responsible for what you post, and moderation is applied to signed-in users only.
          </p>
          <Link
            href="/auth/signin"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: '#1C2024',
              color: '#fff',
              textDecoration: 'none',
              fontFamily: 'Georgia, serif',
              fontSize: 15,
            }}
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (status === 'success') {
    return (
      <main style={{ background: '#EDEAE2', minHeight: '100vh', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <p style={{ fontFamily: 'ui-monospace, "IBM Plex Mono", monospace', fontSize: 13, color: '#5F5E5A', letterSpacing: '0.03em' }}>
            FILING RECEIVED
          </p>
          <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 28, color: '#1C2024', marginTop: 8 }}>
            Your record has been submitted for language review.
          </h1>
          <p style={{ color: '#5F5E5A', marginTop: 12, lineHeight: 1.6 }}>
            It will appear publicly once it clears the language check. Nothing about the substance of your claim is reviewed — you're responsible for what you've filed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: '#EDEAE2', minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontFamily: 'ui-monospace, "IBM Plex Mono", monospace', fontSize: 13, color: '#5F5E5A', letterSpacing: '0.03em' }}>
          MALAKIA — PUBLIC RECORD
        </p>
        <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 30, color: '#1C2024', marginTop: 8, marginBottom: 4 }}>
          File a record
        </h1>
        <p style={{ color: '#5F5E5A', marginBottom: 32, lineHeight: 1.6 }}>
          Records apply only to public officials, journalists, and government members, for conduct during their time in that role.
        </p>

        {/* Axis toggle — two filing tabs */}
        <div style={{ display: 'flex', marginBottom: 32 }}>
          {(['CALLOUS', 'CIVIC'] as Axis[]).map((a) => {
            const active = axis === a;
            const color = a === 'CALLOUS' ? '#7A2E2E' : '#2F5D50';
            return (
              <button
                key={a}
                type="button"
                onClick={() => setAxis(a)}
                style={{
                  flex: 1,
                  padding: '14px 0',
                  fontFamily: 'Georgia, serif',
                  fontSize: 16,
                  border: `1px solid ${color}`,
                  borderBottom: active ? `1px solid ${color}` : 'none',
                  background: active ? color : 'transparent',
                  color: active ? '#fff' : color,
                  cursor: 'pointer',
                  transform: active ? 'translateY(0)' : 'translateY(4px)',
                  boxShadow: active ? '0 -2px 6px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {a === 'CALLOUS' ? 'Denounce — callousness' : 'Commend — civic-mindedness'}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Subject */}
          <fieldset style={{ border: 'none', padding: 0, marginBottom: 28 }}>
            <legend style={sectionLabel}>Subject</legend>

            {!selectedPersonId && (
              <>
                <input
                  type="text"
                  placeholder="Search for the person by name"
                  value={personQuery}
                  onChange={(e) => setPersonQuery(e.target.value)}
                  style={inputStyle}
                />
                {matches.length > 0 && (
                  <div style={{ border: '1px solid #B4B2A9', marginTop: 6 }}>
                    {matches.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          setSelectedPersonId(m.id);
                          setMatches([]);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 12px',
                          background: '#fff',
                          border: 'none',
                          borderBottom: '1px solid #E8E4DA',
                          cursor: 'pointer',
                          fontSize: 14,
                        }}
                      >
                        {m.displayName} — {m.roleTitle}, {m.country}
                        {m.disambiguators ? ` (${m.disambiguators})` : ''}
                      </button>
                    ))}
                  </div>
                )}

                <p style={{ fontSize: 13, color: '#5F5E5A', margin: '10px 0' }}>
                  Not listed? Enter their details below to create a new record.
                </p>

                <div style={grid2}>
                  <input placeholder="Full name" value={newPerson.displayName}
                    onChange={(e) => setNewPerson({ ...newPerson, displayName: e.target.value })} style={inputStyle} />
                  <input placeholder="Country" value={newPerson.country}
                    onChange={(e) => setNewPerson({ ...newPerson, country: e.target.value })} style={inputStyle} />
                </div>

                <select value={newPerson.personaCategory}
                  onChange={(e) => setNewPerson({ ...newPerson, personaCategory: e.target.value })}
                  style={{ ...inputStyle, marginTop: 10 }}>
                  {PERSONA_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>

                <input placeholder="Role or title (e.g. Mayor of Aarhus)" value={newPerson.roleTitle}
                  onChange={(e) => setNewPerson({ ...newPerson, roleTitle: e.target.value })}
                  style={{ ...inputStyle, marginTop: 10 }} />

                <div style={grid2}>
                  <label style={dateLabel}>
                    Role start date
                    <DateSelect
                      value={newPerson.roleStartDate}
                      onChange={(v) => setNewPerson({ ...newPerson, roleStartDate: v })}
                    />
                  </label>
                  <label style={dateLabel}>
                    Role end date (leave blank if still serving)
                    <DateSelect
                      value={newPerson.roleEndDate}
                      onChange={(v) => setNewPerson({ ...newPerson, roleEndDate: v })}
                    />
                  </label>
                </div>

                <input placeholder="Link supporting their public role (optional)" value={newPerson.roleEvidenceUrl}
                  onChange={(e) => setNewPerson({ ...newPerson, roleEvidenceUrl: e.target.value })}
                  style={{ ...inputStyle, marginTop: 10 }} />

                <label style={dateLabel}>
                  Photo of this person (optional)
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file);
                    }}
                    style={{ ...inputStyle, padding: '8px', marginTop: 4 }}
                  />
                  {uploadingPhoto && <span style={{ fontSize: 12, color: '#5F5E5A' }}>Uploading…</span>}
                  {photoUrl && !uploadingPhoto && <span style={{ fontSize: 12, color: '#2F5D50' }}>Photo attached</span>}
                </label>
              </>
            )}

            {selectedPersonId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', border: '1px solid #B4B2A9' }}>
                <span style={{ fontSize: 14 }}>Filing against selected record</span>
                <button type="button" onClick={() => setSelectedPersonId(null)} style={{ background: 'none', border: 'none', color: '#7A2E2E', cursor: 'pointer', fontSize: 13 }}>
                  Change
                </button>
              </div>
            )}
          </fieldset>

          {/* Conduct */}
          <fieldset style={{ border: 'none', padding: 0, marginBottom: 28 }}>
            <legend style={sectionLabel}>Conduct</legend>

            <select value={behaviorId} onChange={(e) => setBehaviorId(e.target.value)} style={inputStyle} required>
              <option value="">Select the behavior that fits</option>
              {behaviors.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>

            <label style={dateLabel}>
              Date the conduct occurred
              <DateSelect value={conductDate} onChange={setConductDate} required />
            </label>

            <textarea
              placeholder="Describe what happened, specifically"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              style={{ ...inputStyle, height: 100, marginTop: 10, resize: 'vertical' }}
              required
            />

            <input
              placeholder="Link to supporting evidence (optional)"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              style={{ ...inputStyle, marginTop: 10 }}
            />
          </fieldset>

          {/* Justification */}
          <fieldset style={{ border: 'none', padding: 0, marginBottom: 28 }}>
            <legend style={sectionLabel}>Public-capacity justification</legend>
            <p style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 8 }}>
              Explain why this falls within the subject's public role — not their private life.
            </p>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              style={{ ...inputStyle, height: 70, resize: 'vertical' }}
              required
            />
          </fieldset>

          {errorMessage && (
            <p style={{ color: '#7A2E2E', fontSize: 14, marginBottom: 16 }}>{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            style={{
              width: '100%',
              padding: '14px 0',
              background: axisColor,
              color: '#fff',
              border: 'none',
              fontFamily: 'Georgia, serif',
              fontSize: 16,
              cursor: 'pointer',
              opacity: status === 'submitting' ? 0.6 : 1,
            }}
          >
            {status === 'submitting' ? 'Filing…' : 'File this record'}
          </button>
        </form>
      </div>
    </main>
  );
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'ui-monospace, "IBM Plex Mono", monospace',
  fontSize: 12,
  letterSpacing: '0.05em',
  color: '#5F5E5A',
  marginBottom: 10,
  padding: 0,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #B4B2A9',
  background: '#fff',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 14,
  boxSizing: 'border-box',
};

const grid2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 10,
};

const dateLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#5F5E5A',
  marginTop: 10,
};
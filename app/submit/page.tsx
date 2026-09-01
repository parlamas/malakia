// app/submit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FlexibleDateSelect, { FlexibleDate } from '@/components/FlexibleDateSelect';

type Axis = 'CALLOUS' | 'CIVIC';
type SubjectType = 'PERSON' | 'INSTITUTION' | 'ORGANIZATION' | 'BUSINESS' | 'NATION' | 'REGIME' | 'ADMINISTRATION' | 'PRACTICE' | 'TRADITION' | 'IDEOLOGY';

interface Behavior {
  id: string;
  label: string;
  description: string;
}

interface SubjectMatch {
  id: string;
  subjectType: SubjectType;
  displayName: string;
  disambiguators: string | null;
  description: string | null;
  roleTitle: string | null;
}

const SUBJECT_TYPES: { value: SubjectType; label: string }[] = [
  { value: 'PERSON', label: 'Person' },
  { value: 'INSTITUTION', label: 'Institution' },
  { value: 'ORGANIZATION', label: 'Organization' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'NATION', label: 'Nation' },
  { value: 'REGIME', label: 'Regime' },
  { value: 'ADMINISTRATION', label: 'Administration' },
  { value: 'PRACTICE', label: 'Practice' },
  { value: 'TRADITION', label: 'Tradition' },
  { value: 'IDEOLOGY', label: 'Ideology' },
];

const PERSONA_CATEGORIES = [
  { value: 'ELECTED_OFFICIAL', label: 'Elected official' },
  { value: 'APPOINTED_OFFICIAL', label: 'Appointed official' },
  { value: 'JOURNALIST', label: 'Journalist' },
  { value: 'GOVERNMENT_MEMBER', label: 'Government member (judiciary, legislature, law enforcement)' },
  { value: 'HISTORICAL_FIGURE', label: 'Historical or classical figure (any era)' },
];

const HAS_TENURE_FIELDS: SubjectType[] = ['PERSON', 'INSTITUTION', 'ORGANIZATION', 'BUSINESS', 'NATION', 'REGIME', 'ADMINISTRATION'];
const HAS_BIRTH_DEATH: SubjectType[] = ['PERSON'];

const emptyFlexDate: FlexibleDate = { year: null, month: null, day: null, circa: false, unknown: false };

export default function SubmitPage() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  const [axis, setAxis] = useState<Axis>('CALLOUS');
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [behaviorId, setBehaviorId] = useState('');
  const [narrative, setNarrative] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [conductDate, setConductDate] = useState<FlexibleDate>(emptyFlexDate);
  const [conductEraNote, setConductEraNote] = useState('');
  const [justification, setJustification] = useState('');

  const [subjectQuery, setSubjectQuery] = useState('');
  const [matches, setMatches] = useState<SubjectMatch[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const [subjectType, setSubjectType] = useState<SubjectType | ''>('');

  const [newSubject, setNewSubject] = useState({
    displayName: '',
    description: '',
    disambiguators: '',
    associatedContext: '',
    personaCategory: 'ELECTED_OFFICIAL',
    roleTitle: '',
    roleEvidenceUrl: '',
  });
  const [roleStart, setRoleStart] = useState<FlexibleDate>(emptyFlexDate);
  const [roleEnd, setRoleEnd] = useState<FlexibleDate>(emptyFlexDate);
  const [stillServing, setStillServing] = useState(false);
  const [approximatePeriod, setApproximatePeriod] = useState('');

  const [birthDate, setBirthDate] = useState<FlexibleDate>(emptyFlexDate);
  const [isDeceased, setIsDeceased] = useState(false);
  const [deathDate, setDeathDate] = useState<FlexibleDate>(emptyFlexDate);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'error' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const isCreatingNew = !selectedSubjectId;
  const showTenureFields = isCreatingNew && subjectType && HAS_TENURE_FIELDS.includes(subjectType);
  const showBirthDeath = isCreatingNew && subjectType && HAS_BIRTH_DEATH.includes(subjectType);
  const isHistoricalPerson = isCreatingNew && subjectType === 'PERSON' && newSubject.personaCategory === 'HISTORICAL_FIGURE';

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setAuthStatus(data.authenticated ? 'authenticated' : 'unauthenticated'))
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
    if (subjectQuery.length < 2) {
      setMatches([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/subjects?q=${encodeURIComponent(subjectQuery)}`)
        .then((r) => r.json())
        .then((data) => setMatches(data.subjects ?? []));
    }, 300);
    return () => clearTimeout(t);
  }, [subjectQuery]);

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload/person-photo', { method: 'POST', body: formData });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // response had no JSON body (e.g. a raw 500) — fall through with empty data
      }
      if (res.ok) {
        setPhotoUrl(data.url);
      } else {
        setErrorMessage(data.error ?? `Photo upload failed (status ${res.status}).`);
      }
    } catch (err) {
      setErrorMessage('Photo upload failed — network or server error.');
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const subject = selectedSubjectId
      ? { existingSubjectId: selectedSubjectId }
      : {
          subjectType,
          displayName: newSubject.displayName,
          description: newSubject.description || null,
          disambiguators: newSubject.disambiguators || null,
          associatedContext: newSubject.associatedContext || null,
          personaCategory: subjectType === 'PERSON' ? newSubject.personaCategory : null,
          roleTitle: newSubject.roleTitle || null,
          roleStartYear: showTenureFields ? roleStart.year : null,
          roleStartMonth: showTenureFields ? roleStart.month : null,
          roleStartDay: showTenureFields ? roleStart.day : null,
          roleStartCirca: showTenureFields ? roleStart.circa : false,
          roleStartUnknown: showTenureFields ? roleStart.unknown : false,
          roleEndYear: showTenureFields && !stillServing ? roleEnd.year : null,
          roleEndMonth: showTenureFields && !stillServing ? roleEnd.month : null,
          roleEndDay: showTenureFields && !stillServing ? roleEnd.day : null,
          roleEndCirca: showTenureFields && !stillServing ? roleEnd.circa : false,
          roleEndUnknown: showTenureFields && !stillServing ? roleEnd.unknown : false,
          stillServing: showTenureFields ? stillServing : false,
          approximatePeriod: isHistoricalPerson ? (approximatePeriod || null) : null,
          birthYear: showBirthDeath ? birthDate.year : null,
          birthMonth: showBirthDeath ? birthDate.month : null,
          birthDay: showBirthDeath ? birthDate.day : null,
          birthCirca: showBirthDeath ? birthDate.circa : false,
          birthUnknown: showBirthDeath ? birthDate.unknown : false,
          isDeceased: showBirthDeath ? isDeceased : false,
          deathYear: showBirthDeath && isDeceased ? deathDate.year : null,
          deathMonth: showBirthDeath && isDeceased ? deathDate.month : null,
          deathDay: showBirthDeath && isDeceased ? deathDate.day : null,
          deathCirca: showBirthDeath && isDeceased ? deathDate.circa : false,
          deathUnknown: showBirthDeath && isDeceased ? deathDate.unknown : false,
          roleEvidenceUrl: newSubject.roleEvidenceUrl || null,
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
        conductYear: conductDate.year,
        conductMonth: conductDate.month,
        conductDay: conductDate.day,
        conductCirca: conductDate.circa,
        conductUnknown: conductDate.unknown,
        conductEraNote: conductEraNote || null,
        publicCapacityJustification: justification,
        subject,
      }),
    });

    const data = await res.json();

    if (res.status === 409 && data.needsDisambiguation) {
      setMatches(data.possibleMatches);
      setErrorMessage('A similar record already exists — select it above, or confirm this is a different subject.');
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
          MALAKIA — POLITICAL ETHICS BAROMETER
        </p>
        <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 30, color: '#1C2024', marginTop: 8, marginBottom: 4 }}>
          File a record
        </h1>
        <p style={{ color: '#5F5E5A', marginBottom: 8, lineHeight: 1.6 }}>
  Records may concern persons, institutions, organizations, businesses, nations, regimes, administrations, practices, traditions, or ideologies.
</p>
<p style={{ color: '#5F5E5A', fontSize: 12, marginBottom: 32 }}>
  Fields marked * are required.
</p>

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
          <fieldset style={{ border: 'none', padding: 0, marginBottom: 28 }}>
            <legend style={sectionLabel}>Subject</legend>
            <p style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 14, marginTop: -4 }}>
              Who or what is this record about? The category you pick below determines which details we ask for next.
            </p>

            {!selectedSubjectId && (
              <>
                <label style={dateLabel}>
                  Category *
                  <select
                    value={subjectType}
                    onChange={(e) => setSubjectType(e.target.value as SubjectType)}
                    style={{ ...inputStyle, marginTop: 4 }}
                    required
                  >
                    <option value="">Select a category</option>
                    {SUBJECT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </label>

                {subjectType && (
                  <>
                    <p style={{ fontSize: 12, color: '#5F5E5A', margin: '14px 0 4px' }}>
                      First, check this doesn't already exist:
                    </p>
                    <input
                      type="text"
                      placeholder="Search by name…"
                      value={subjectQuery}
                      onChange={(e) => setSubjectQuery(e.target.value)}
                      style={inputStyle}
                    />
                    {matches.length > 0 && (
                      <div style={{ border: '1px solid #B4B2A9', marginTop: 6 }}>
                        {matches.map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => {
                              setSelectedSubjectId(m.id);
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
                            {m.displayName}{m.roleTitle ? ` — ${m.roleTitle}` : ''}
                            {m.disambiguators ? ` (${m.disambiguators})` : ''}
                          </button>
                        ))}
                      </div>
                    )}

                    <p style={{ fontSize: 13, color: '#5F5E5A', margin: '10px 0' }}>
                      Not listed? Enter details below to create a new record. It only needs to be created once — after that, anyone can file against it.
                    </p>

                    <label style={dateLabel}>
  Name *
  <input
    placeholder="Full name or official name"
    value={newSubject.displayName}
    onChange={(e) => setNewSubject({ ...newSubject, displayName: e.target.value })}
    style={{ ...inputStyle, marginTop: 4 }}
    required
  />
</label>

                    <label style={dateLabel}>
                      Short description (optional) — helps a reader who doesn't know who or what this is
                      <textarea
                        placeholder="e.g. A sovereign state in Central Europe"
                        value={newSubject.description}
                        onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                        style={{ ...inputStyle, height: 70, marginTop: 4, resize: 'vertical' }}
                      />
                    </label>

                    {subjectType === 'PERSON' && (
                      <>
                        <label style={dateLabel}>
                          Persona category — what kind of public role do they hold?
                          <select value={newSubject.personaCategory}
                            onChange={(e) => setNewSubject({ ...newSubject, personaCategory: e.target.value })}
                            style={{ ...inputStyle, marginTop: 4 }}>
                            {PERSONA_CATEGORIES.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </label>

                        <input placeholder="Role or title (e.g. Mayor of Aarhus, or Philosopher)" value={newSubject.roleTitle}
                          onChange={(e) => setNewSubject({ ...newSubject, roleTitle: e.target.value })}
                          style={{ ...inputStyle, marginTop: 10 }} />
                      </>
                    )}

                    {isHistoricalPerson && (
                      <label style={dateLabel}>
                        Approximate period (optional, e.g. "5th century BCE Athens") — use this if exact dates aren't known
                        <input
                          value={approximatePeriod}
                          onChange={(e) => setApproximatePeriod(e.target.value)}
                          style={{ ...inputStyle, marginTop: 4 }}
                        />
                      </label>
                    )}

                    <label style={dateLabel}>
                      Associated context (optional) — jurisdiction, country, or region this subject is tied to
                      <input
                        placeholder="e.g. Denmark, or the European Union"
                        value={newSubject.associatedContext}
                        onChange={(e) => setNewSubject({ ...newSubject, associatedContext: e.target.value })}
                        style={{ ...inputStyle, marginTop: 4 }}
                      />
                    </label>

                    {showTenureFields && (
                      <>
                        <label style={dateLabel}>
                          {subjectType === 'PERSON' ? 'Role start date — when they took this role' : 'Founding / formation date'}
                          <FlexibleDateSelect value={roleStart} onChange={setRoleStart} yearRequired />
                        </label>

                        <label style={{ ...dateLabel, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="checkbox" checked={stillServing} onChange={(e) => setStillServing(e.target.checked)} />
                          {subjectType === 'PERSON' ? 'Still serving in this role' : 'Still exists / active'}
                        </label>

                        {!stillServing && (
                          <label style={dateLabel}>
                            {subjectType === 'PERSON' ? 'Role end date — when they left this role' : 'Dissolution / end date'}
                            <FlexibleDateSelect value={roleEnd} onChange={setRoleEnd} />
                          </label>
                        )}
                      </>
                    )}

                    {showBirthDeath && (
                      <>
                        <label style={dateLabel}>
                          Date of birth (optional)
                          <FlexibleDateSelect value={birthDate} onChange={setBirthDate} />
                        </label>

                        <label style={{ ...dateLabel, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="checkbox" checked={isDeceased} onChange={(e) => setIsDeceased(e.target.checked)} />
                          Deceased
                        </label>

                        {isDeceased && (
                          <label style={dateLabel}>
                            Date of death
                            <FlexibleDateSelect value={deathDate} onChange={setDeathDate} />
                          </label>
                        )}
                      </>
                    )}

                    <label style={dateLabel}>
                      Link supporting who/what this subject is (optional) — e.g. a biography or reference page, not evidence of the conduct below
                      <input
                        placeholder="https://…"
                        value={newSubject.roleEvidenceUrl}
                        onChange={(e) => setNewSubject({ ...newSubject, roleEvidenceUrl: e.target.value })}
                        style={{ ...inputStyle, marginTop: 4 }}
                      />
                    </label>

                    <label style={dateLabel}>
                      Photo or image (optional) — shown on this subject's profile page
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
              </>
            )}

            {selectedSubjectId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', border: '1px solid #B4B2A9' }}>
                <span style={{ fontSize: 14 }}>Filing against selected record</span>
                <button type="button" onClick={() => setSelectedSubjectId(null)} style={{ background: 'none', border: 'none', color: '#7A2E2E', cursor: 'pointer', fontSize: 13 }}>
                  Change
                </button>
              </div>
            )}
          </fieldset>

          <fieldset style={{ border: 'none', padding: 0, marginBottom: 28 }}>
            <legend style={sectionLabel}>Conduct</legend>
            <p style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 14, marginTop: -4 }}>
              What specifically happened? This is the incident or pattern of behavior you're filing.
            </p>

            <label style={dateLabel}>
  Behavior * — pick the category that best fits what happened
              <select value={behaviorId} onChange={(e) => setBehaviorId(e.target.value)} style={{ ...inputStyle, marginTop: 4 }} required>
                <option value="">Select the behavior that fits</option>
                {behaviors.map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </label>

            <label style={dateLabel}>
  Date the conduct occurred *
  <FlexibleDateSelect value={conductDate} onChange={setConductDate} yearRequired />
</label>

            <label style={dateLabel}>
              Note on dating (optional) — e.g. "circa", "shortly before his trial"
              <input
                value={conductEraNote}
                onChange={(e) => setConductEraNote(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>

            <label style={dateLabel}>
  What happened, specifically *
              <textarea
                placeholder="Describe the incident or conduct in your own words"
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                style={{ ...inputStyle, height: 100, marginTop: 4, resize: 'vertical' }}
                required
              />
            </label>

            <label style={dateLabel}>
              Link to evidence of this specific incident (optional) — a news article, document, or recording
              <input
                placeholder="https://…"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>
          </fieldset>

          <fieldset style={{ border: 'none', padding: 0, marginBottom: 28 }}>
            <legend style={sectionLabel}>Justification *</legend>
            <p style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 8 }}>
              Not what happened — why it counts as {axis === 'CALLOUS' ? 'callous' : 'civic-minded'} conduct, or why it falls within this subject's public role.
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

const dateLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#5F5E5A',
  marginTop: 10,
};
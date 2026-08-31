// app/persons/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Behavior {
  label: string;
  description: string;
}

interface Contest {
  id: string;
  disputeType: string;
  justification: string;
  contestingUser: { username: string };
  createdAt: string;
}

interface Post {
  id: string;
  axis: 'CALLOUS' | 'CIVIC';
  narrative: string;
  evidenceUrl: string | null;
  conductYear: number;
  conductMonth: number | null;
  conductDay: number | null;
  conductCirca: boolean;
  conductUnknown: boolean;
  conductEraNote: string | null;
  publicCapacityJustification: string;
  behavior: Behavior;
  author: { username: string };
  contests: Contest[];
}

interface PersonData {
  id: string;
  displayName: string;
  disambiguators: string | null;
  country: string;
  personaCategory: string;
  roleTitle: string;
  roleStartYear: number | null;
  roleStartMonth: number | null;
  roleStartDay: number | null;
  roleStartCirca: boolean;
  roleStartUnknown: boolean;
  roleEndYear: number | null;
  roleEndMonth: number | null;
  roleEndDay: number | null;
  roleEndCirca: boolean;
  roleEndUnknown: boolean;
  stillServing: boolean;
  approximatePeriod: string | null;
  birthYear: number | null;
  birthMonth: number | null;
  birthDay: number | null;
  birthCirca: boolean;
  birthUnknown: boolean;
  isDeceased: boolean;
  deathYear: number | null;
  deathMonth: number | null;
  deathDay: number | null;
  deathCirca: boolean;
  deathUnknown: boolean;
  photoUrl: string | null;
  verificationStatus: 'UNVERIFIED' | 'ADMIN_CONFIRMED' | 'DISPUTED';
  adminScaleValue: number | null;
}

interface PersonRecord {
  person: PersonData;
  record: { callousCount: number; civicCount: number; netScore: number } | null;
  posts: Post[];
  notice?: string;
}

interface ScaleSuggestion {
  id: string;
  value: number;
  reasoning: string | null;
  createdAt: string;
  user: { username: string };
}

const PERSONA_LABELS: Record<string, string> = {
  ELECTED_OFFICIAL: 'Elected official',
  APPOINTED_OFFICIAL: 'Appointed official',
  JOURNALIST: 'Journalist',
  GOVERNMENT_MEMBER: 'Government member',
  HISTORICAL_FIGURE: 'Historical or classical figure',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatFlexible(
  year: number | null,
  month: number | null,
  day: number | null,
  circa: boolean,
  unknown: boolean,
): string | null {
  if (year === null) return null;
  const era = year < 0 ? 'BCE' : 'CE';
  const absYear = Math.abs(year);
  const prefix = circa ? 'circa ' : '';

  if (unknown || !month) {
    return `${prefix}${absYear} ${era}`;
  }
  const monthName = MONTH_NAMES[month - 1] ?? '';
  if (day) {
    return `${prefix}${day} ${monthName} ${absYear} ${era}`;
  }
  return `${prefix}${monthName} ${absYear} ${era}`;
}

function formatTenure(p: PersonData): string {
  if (p.approximatePeriod) return p.approximatePeriod;
  const start = formatFlexible(p.roleStartYear, p.roleStartMonth, p.roleStartDay, p.roleStartCirca, p.roleStartUnknown);
  if (!start) return 'Period not specified';
  if (p.stillServing) return `${start} – present`;
  const end = formatFlexible(p.roleEndYear, p.roleEndMonth, p.roleEndDay, p.roleEndCirca, p.roleEndUnknown);
  return end ? `${start} – ${end}` : start;
}

function formatBirthDeath(p: PersonData): string | null {
  const parts: string[] = [];
  const birth = formatFlexible(p.birthYear, p.birthMonth, p.birthDay, p.birthCirca, p.birthUnknown);
  if (birth) parts.push(`Born: ${birth}`);
  if (p.isDeceased) {
    const death = formatFlexible(p.deathYear, p.deathMonth, p.deathDay, p.deathCirca, p.deathUnknown);
    parts.push(death ? `Died: ${death}` : 'Died: date unknown');
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

function formatConductDate(post: Post): string {
  const base = formatFlexible(post.conductYear, post.conductMonth, post.conductDay, post.conductCirca, post.conductUnknown) ?? 'Date not specified';
  return post.conductEraNote ? `${base} (${post.conductEraNote})` : base;
}

export default function PersonProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PersonRecord | null>(null);
  const [status, setStatus] = useState<'loading' | 'notfound' | 'ready'>('loading');

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [suggestions, setSuggestions] = useState<ScaleSuggestion[]>([]);

  const [suggestionValue, setSuggestionValue] = useState('');
  const [suggestionReasoning, setSuggestionReasoning] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);

  const [adminValueInput, setAdminValueInput] = useState('');
  const [savingAdminValue, setSavingAdminValue] = useState(false);
  const [adminValueError, setAdminValueError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        setIsAuthenticated(!!d.authenticated);
        setIsAdmin(!!d.isAdmin);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/persons/${id}`)
      .then((r) => {
        if (r.status === 404) {
          setStatus('notfound');
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setData(d);
          setStatus('ready');
          setAdminValueInput(d.person.adminScaleValue !== null ? String(d.person.adminScaleValue) : '');
        }
      });
  }, [id]);

  useEffect(() => {
    fetch(`/api/scale-suggestions?personId=${id}`)
      .then((r) => r.json())
      .then((d) => setSuggestions(d.suggestions ?? []));
  }, [id, suggestionSuccess]);

  async function handleSubmitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    setSuggestionError('');
    setSubmittingSuggestion(true);

    const numeric = Number(suggestionValue);
    if (!Number.isInteger(numeric) || numeric < -100 || numeric > 100) {
      setSuggestionError('Enter a whole number between -100 and 100.');
      setSubmittingSuggestion(false);
      return;
    }

    const res = await fetch('/api/scale-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId: id, value: numeric, reasoning: suggestionReasoning || null }),
    });

    setSubmittingSuggestion(false);

    if (!res.ok) {
      const d = await res.json();
      setSuggestionError(d.error ?? 'Something went wrong.');
      return;
    }

    setSuggestionValue('');
    setSuggestionReasoning('');
    setSuggestionSuccess((s) => !s); // toggles to re-trigger the suggestions fetch
  }

  async function handleSaveAdminValue() {
    setAdminValueError('');
    const numeric = Number(adminValueInput);
    if (!Number.isInteger(numeric) || numeric < -100 || numeric > 100) {
      setAdminValueError('Enter a whole number between -100 and 100.');
      return;
    }
    setSavingAdminValue(true);
    const res = await fetch(`/api/persons/${id}/admin-scale`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: numeric }),
    });
    setSavingAdminValue(false);
    if (!res.ok) {
      const d = await res.json();
      setAdminValueError(d.error ?? 'Something went wrong.');
      return;
    }
    const d = await res.json();
    setData((prev) => prev ? { ...prev, person: { ...prev.person, adminScaleValue: d.person.adminScaleValue } } : prev);
  }

  if (status === 'loading') {
    return (
      <main style={pageStyle}>
        <p style={{ color: '#5F5E5A', fontFamily: 'Inter, system-ui, sans-serif' }}>Loading record…</p>
      </main>
    );
  }

  if (status === 'notfound' || !data) {
    return (
      <main style={pageStyle}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#1C2024' }}>No record found.</p>
      </main>
    );
  }

  const { person, record, posts, notice } = data;
  const tenure = formatTenure(person);
  const birthDeath = formatBirthDeath(person);

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={monoLabel}>PUBLIC RECORD</p>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginTop: 8 }}>
          {person.photoUrl && (
            <img
              src={person.photoUrl}
              alt={person.displayName}
              style={{ width: 96, height: 96, objectFit: 'cover', border: '1px solid #B4B2A9', flexShrink: 0 }}
            />
          )}
          <div>
            <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 32, color: '#1C2024', margin: '0 0 4px' }}>
              {person.displayName}
            </h1>
            <p style={{ color: '#5F5E5A', margin: '0 0 4px' }}>
              {PERSONA_LABELS[person.personaCategory] ?? person.personaCategory} — {person.roleTitle}, {person.country}
            </p>
            <p style={{ ...monoLabel, marginTop: 0 }}>{tenure}</p>
            {birthDeath && <p style={{ ...monoLabel, marginTop: 0 }}>{birthDeath}</p>}
          </div>
        </div>

        {person.verificationStatus === 'UNVERIFIED' && (
          <span style={badgeStyle('#B8860B', '#FBF1DC')}>Persona status not yet confirmed</span>
        )}
        {person.verificationStatus === 'ADMIN_CONFIRMED' && (
          <span style={badgeStyle('#2F5D50', '#E7EEEA')}>Persona confirmed</span>
        )}

        {notice && (
          <div style={{ background: '#F3E8E6', border: '1px solid #7A2E2E', padding: '14px 16px', marginTop: 24 }}>
            <p style={{ color: '#7A2E2E', fontSize: 14, margin: 0 }}>{notice}</p>
          </div>
        )}

        {record && (
          <div style={{ display: 'flex', gap: 16, marginTop: 28, marginBottom: 12 }}>
            <div style={{ ...tallyCard, borderColor: '#7A2E2E' }}>
              <p style={{ ...monoLabel, marginTop: 0 }}>CALLOUS</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#7A2E2E', margin: 0 }}>{record.callousCount}</p>
            </div>
            <div style={{ ...tallyCard, borderColor: '#2F5D50' }}>
              <p style={{ ...monoLabel, marginTop: 0 }}>CIVIC</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#2F5D50', margin: 0 }}>{record.civicCount}</p>
            </div>
          </div>
        )}

        {record && (
          <p style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 24 }}>
            Record for {person.roleTitle}, {tenure}.
          </p>
        )}

        {/* Scale: admin value + user suggestions */}
        <div style={{ border: '1px solid #B4B2A9', background: '#fff', padding: '20px', marginBottom: 32 }}>
          <p style={monoLabel}>CIVIC-MINDEDNESS SCALE (−100 CALLOUS · +100 CIVIC-MINDED)</p>

          <div style={{ margin: '10px 0 16px' }}>
            {person.adminScaleValue !== null ? (
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: person.adminScaleValue >= 0 ? '#2F5D50' : '#7A2E2E', margin: 0 }}>
                {person.adminScaleValue > 0 ? '+' : ''}{person.adminScaleValue}
                <span style={{ fontSize: 13, color: '#5F5E5A', fontFamily: 'Inter, system-ui, sans-serif', marginLeft: 10 }}>
                  admin-assigned
                </span>
              </p>
            ) : (
              <p style={{ color: '#5F5E5A', fontSize: 14, margin: 0 }}>Not yet assigned an admin value.</p>
            )}
          </div>

          {isAdmin && (
            <div style={{ borderTop: '1px solid #E8E4DA', paddingTop: 14, marginBottom: 20 }}>
              <label style={{ ...monoLabel, display: 'block', marginBottom: 6 }}>Set admin value</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  min={-100}
                  max={100}
                  value={adminValueInput}
                  onChange={(e) => setAdminValueInput(e.target.value)}
                  style={{ ...inputStyle, width: 100 }}
                />
                <button
                  onClick={handleSaveAdminValue}
                  disabled={savingAdminValue}
                  style={{ padding: '10px 18px', background: '#1C2024', color: '#fff', border: 'none', fontFamily: 'Georgia, serif', cursor: 'pointer' }}
                >
                  {savingAdminValue ? 'Saving…' : 'Save'}
                </button>
              </div>
              {adminValueError && <p style={{ color: '#7A2E2E', fontSize: 13, marginTop: 6 }}>{adminValueError}</p>}
            </div>
          )}

          <div style={{ borderTop: '1px solid #E8E4DA', paddingTop: 16 }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#1C2024', marginBottom: 10 }}>
              User-suggested values
            </p>

            {suggestions.length === 0 && (
              <p style={{ color: '#5F5E5A', fontSize: 13, marginBottom: 16 }}>No suggestions yet.</p>
            )}

            {suggestions.map((s) => (
              <div key={s.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #E8E4DA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: s.value >= 0 ? '#2F5D50' : '#7A2E2E' }}>
                    {s.value > 0 ? '+' : ''}{s.value}
                  </span>
                  <span style={{ fontSize: 12, color: '#5F5E5A' }}>
                    {s.user.username} · {new Date(s.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {s.reasoning && (
                  <p style={{ fontSize: 13, color: '#1C2024', marginTop: 4, marginBottom: 0 }}>{s.reasoning}</p>
                )}
              </div>
            ))}

            {isAuthenticated ? (
              <form onSubmit={handleSubmitSuggestion} style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input
                    type="number"
                    min={-100}
                    max={100}
                    placeholder="Your value (-100 to 100)"
                    value={suggestionValue}
                    onChange={(e) => setSuggestionValue(e.target.value)}
                    style={{ ...inputStyle, width: 180 }}
                    required
                  />
                </div>
                <textarea
                  placeholder="Your reasoning (optional)"
                  value={suggestionReasoning}
                  onChange={(e) => setSuggestionReasoning(e.target.value)}
                  style={{ ...inputStyle, height: 60, resize: 'vertical', marginBottom: 8 }}
                />
                {suggestionError && <p style={{ color: '#7A2E2E', fontSize: 13, marginBottom: 8 }}>{suggestionError}</p>}
                <button
                  type="submit"
                  disabled={submittingSuggestion}
                  style={{ padding: '10px 18px', background: '#1C2024', color: '#fff', border: 'none', fontFamily: 'Georgia, serif', cursor: 'pointer' }}
                >
                  {submittingSuggestion ? 'Submitting…' : 'Submit suggestion'}
                </button>
              </form>
            ) : (
              <p style={{ fontSize: 13, color: '#5F5E5A', marginTop: 16 }}>Sign in to suggest a value.</p>
            )}
          </div>
        </div>

        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1C2024', marginBottom: 16 }}>
          Filed records
        </h2>

        {posts.length === 0 && (
          <p style={{ color: '#5F5E5A' }}>No published records for this person yet.</p>
        )}

        {posts.map((post) => {
          const color = post.axis === 'CALLOUS' ? '#7A2E2E' : '#2F5D50';
          return (
            <div key={post.id} style={{ border: '1px solid #B4B2A9', background: '#fff', padding: '16px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color, fontFamily: 'Georgia, serif', fontSize: 15 }}>{post.behavior.label}</span>
                <span style={monoLabel}>{formatConductDate(post)}</span>
              </div>
              <p style={{ marginTop: 10, marginBottom: 10, lineHeight: 1.6, color: '#1C2024' }}>{post.narrative}</p>
              <p style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 8 }}>
                Public-capacity justification: {post.publicCapacityJustification}
              </p>
              {post.evidenceUrl && (
                <a href={post.evidenceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#1C2024' }}>
                  View supporting evidence
                </a>
              )}
              <p style={{ fontSize: 12, color: '#5F5E5A', marginTop: 10 }}>Filed by {post.author.username}</p>

              {post.contests.length > 0 && (
                <div style={{ marginTop: 12, borderTop: '1px solid #E8E4DA', paddingTop: 12 }}>
                  <p style={monoLabel}>{post.contests.length} CONTEST{post.contests.length > 1 ? 'S' : ''} FILED</p>
                  {post.contests.map((c) => (
                    <div key={c.id} style={{ marginTop: 8 }}>
                      <p style={{ fontSize: 13, color: '#1C2024', margin: 0 }}>
                        <strong>{c.disputeType.replace(/_/g, ' ').toLowerCase()}</strong> — {c.justification}
                      </p>
                      <p style={{ fontSize: 12, color: '#5F5E5A', margin: '2px 0 0' }}>by {c.contestingUser.username}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  background: '#EDEAE2',
  minHeight: '100vh',
  padding: '3rem 1.5rem',
};

const monoLabel: React.CSSProperties = {
  fontFamily: 'ui-monospace, "IBM Plex Mono", monospace',
  fontSize: 12,
  letterSpacing: '0.05em',
  color: '#5F5E5A',
  margin: '4px 0',
};

const tallyCard: React.CSSProperties = {
  flex: 1,
  border: '1px solid',
  background: '#fff',
  padding: '14px 18px',
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

function badgeStyle(color: string, bg: string): React.CSSProperties {
  return {
    display: 'inline-block',
    fontSize: 12,
    color,
    background: bg,
    padding: '3px 10px',
    marginTop: 6,
    fontFamily: 'Inter, system-ui, sans-serif',
  };
}
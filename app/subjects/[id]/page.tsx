// app/subjects/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BalanceScale from '@/components/BalanceScale';

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

interface SubjectData {
  id: string;
  subjectType: string;
  displayName: string;
  description: string | null;
  disambiguators: string | null;
  associatedContext: string | null;
  personaCategory: string | null;
  roleTitle: string | null;
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

interface SubjectRecord {
  subject: SubjectData;
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

const SUBJECT_TYPE_LABELS: Record<string, string> = {
  PERSON: 'Person',
  INSTITUTION: 'Institution',
  ORGANIZATION: 'Organization',
  BUSINESS: 'Business',
  NATION: 'Nation',
  PRACTICE: 'Practice',
  TRADITION: 'Tradition',
  IDEOLOGY: 'Ideology',
};

const PERSONA_LABELS: Record<string, string> = {
  ELECTED_OFFICIAL: 'Elected official',
  APPOINTED_OFFICIAL: 'Appointed official',
  JOURNALIST: 'Journalist',
  GOVERNMENT_MEMBER: 'Government member',
  HISTORICAL_FIGURE: 'Historical or classical figure',
};

const HAS_TENURE_FIELDS = ['PERSON', 'INSTITUTION', 'ORGANIZATION', 'BUSINESS', 'NATION'];
const HAS_BIRTH_DEATH = ['PERSON'];

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

function formatTenure(s: SubjectData): string | null {
  if (!HAS_TENURE_FIELDS.includes(s.subjectType)) return null;
  if (s.approximatePeriod) return s.approximatePeriod;
  const start = formatFlexible(s.roleStartYear, s.roleStartMonth, s.roleStartDay, s.roleStartCirca, s.roleStartUnknown);
  if (!start) return null;
  if (s.stillServing) return `${start} – present`;
  const end = formatFlexible(s.roleEndYear, s.roleEndMonth, s.roleEndDay, s.roleEndCirca, s.roleEndUnknown);
  return end ? `${start} – ${end}` : start;
}

function formatBirthDeath(s: SubjectData): string | null {
  if (!HAS_BIRTH_DEATH.includes(s.subjectType)) return null;
  const parts: string[] = [];
  const birth = formatFlexible(s.birthYear, s.birthMonth, s.birthDay, s.birthCirca, s.birthUnknown);
  if (birth) parts.push(`Born: ${birth}`);
  if (s.isDeceased) {
    const death = formatFlexible(s.deathYear, s.deathMonth, s.deathDay, s.deathCirca, s.deathUnknown);
    parts.push(death ? `Died: ${death}` : 'Died: date unknown');
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

function formatConductDate(post: Post): string {
  const base = formatFlexible(post.conductYear, post.conductMonth, post.conductDay, post.conductCirca, post.conductUnknown) ?? 'Date not specified';
  return post.conductEraNote ? `${base} (${post.conductEraNote})` : base;
}

export default function SubjectProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SubjectRecord | null>(null);
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
    fetch(`/api/subjects/${id}`)
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
          setAdminValueInput(d.subject.adminScaleValue !== null ? String(d.subject.adminScaleValue) : '');
        }
      });
  }, [id]);

  useEffect(() => {
    fetch(`/api/scale-suggestions?subjectId=${id}`)
      .then((r) => r.json())
      .then((d) => setSuggestions(d.suggestions ?? []));
  }, [id, suggestionSuccess]);

  async function handleSubmitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    setSuggestionError('');
    setSubmittingSuggestion(true);

    const numeric = Number(suggestionValue);
    if (!Number.isInteger(numeric) || numeric < -1000 || numeric > 1000) {
      setSuggestionError('Enter a whole number between -1000 and 1000.');
      setSubmittingSuggestion(false);
      return;
    }

    const res = await fetch('/api/scale-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId: id, value: numeric, reasoning: suggestionReasoning || null }),
    });

    setSubmittingSuggestion(false);

    if (!res.ok) {
      const d = await res.json();
      setSuggestionError(d.error ?? 'Something went wrong.');
      return;
    }

    setSuggestionValue('');
    setSuggestionReasoning('');
    setSuggestionSuccess((s) => !s);
  }

  async function handleSaveAdminValue() {
    setAdminValueError('');
    const numeric = Number(adminValueInput);
    if (!Number.isInteger(numeric) || numeric < -1000 || numeric > 1000) {
      setAdminValueError('Enter a whole number between -1000 and 1000.');
      return;
    }
    setSavingAdminValue(true);
    const res = await fetch(`/api/subjects/${id}/admin-scale`, {
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
    setData((prev) => prev ? { ...prev, subject: { ...prev.subject, adminScaleValue: d.subject.adminScaleValue } } : prev);
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

  const { subject, posts, notice } = data;
  const tenure = formatTenure(subject);
  const birthDeath = formatBirthDeath(subject);

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={monoLabel}>{SUBJECT_TYPE_LABELS[subject.subjectType] ?? subject.subjectType} RECORD</p>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginTop: 8 }}>
          {subject.photoUrl && (
            <img
              src={subject.photoUrl}
              alt={subject.displayName}
              style={{ width: 96, height: 96, objectFit: 'cover', border: '1px solid #B4B2A9', flexShrink: 0 }}
            />
          )}
          <div>
            <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 32, color: '#1C2024', margin: '0 0 4px' }}>
              {subject.displayName}
            </h1>
            {subject.subjectType === 'PERSON' && subject.personaCategory && (
              <p style={{ color: '#5F5E5A', margin: '0 0 4px' }}>
                {PERSONA_LABELS[subject.personaCategory] ?? subject.personaCategory}
                {subject.roleTitle ? ` — ${subject.roleTitle}` : ''}
              </p>
            )}
            {subject.description && (
              <p style={{ color: '#5F5E5A', margin: '0 0 4px' }}>{subject.description}</p>
            )}
            {subject.associatedContext && (
              <p style={{ color: '#5F5E5A', margin: '0 0 4px', fontSize: 13 }}>{subject.associatedContext}</p>
            )}
            {tenure && <p style={{ ...monoLabel, marginTop: 0 }}>{tenure}</p>}
            {birthDeath && <p style={{ ...monoLabel, marginTop: 0 }}>{birthDeath}</p>}
          </div>
        </div>

        {subject.verificationStatus === 'UNVERIFIED' && (
          <span style={badgeStyle('#B8860B', '#FBF1DC')}>Status not yet confirmed</span>
        )}
        {subject.verificationStatus === 'ADMIN_CONFIRMED' && (
          <span style={badgeStyle('#2F5D50', '#E7EEEA')}>Confirmed</span>
        )}

        {notice && (
          <div style={{ background: '#F3E8E6', border: '1px solid #7A2E2E', padding: '14px 16px', marginTop: 24 }}>
            <p style={{ color: '#7A2E2E', fontSize: 14, margin: 0 }}>{notice}</p>
          </div>
        )}

        {/* Scale: admin value + user suggestions */}
        <div style={{ border: '1px solid #B4B2A9', background: '#fff', padding: '20px', marginTop: 28, marginBottom: 32 }}>
          <p style={monoLabel}>ETHICS SCALE (−1000 CALLOUS · +1000 CIVIC-MINDED)</p>

          <div style={{ margin: '10px 0 16px' }}>
            {subject.adminScaleValue !== null ? (
              <>
                <BalanceScale value={subject.adminScaleValue} />
                <p style={{ fontSize: 13, color: '#5F5E5A', textAlign: 'center', marginTop: 4 }}>admin-assigned</p>
              </>
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
                  min={-1000}
                  max={1000}
                  value={adminValueInput}
                  onChange={(e) => setAdminValueInput(e.target.value)}
                  style={{ ...inputStyle, width: 120 }}
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
                    min={-1000}
                    max={1000}
                    placeholder="Your value (-1000 to 1000)"
                    value={suggestionValue}
                    onChange={(e) => setSuggestionValue(e.target.value)}
                    style={{ ...inputStyle, width: 200 }}
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
          <p style={{ color: '#5F5E5A' }}>No published records for this subject yet.</p>
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
                Justification: {post.publicCapacityJustification}
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
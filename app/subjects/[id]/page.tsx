// app/subjects/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BalanceScale from '@/components/BalanceScale';
import { computeDisplayId, labelEntries, computeNetValue, computeLabel, JudgmentEntryLike } from '@/lib/displayId';

const MAX_JUSTIFICATION_LENGTH = 500;
const MAX_REPORT_REASON_LENGTH = 1000;

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
  authorUserId: string;
  author: { username: string; image: string | null };
  createdAt: string;
  contests: Contest[];
}

interface JudgmentEntryData {
  id: string;
  side: 'NEGATIVE' | 'POSITIVE' | 'ZERO';
  magnitude: number;
  justification: string | null;
  order: number;
}

interface AdminJudgmentData {
  id: string;
  createdAt: string;
  updatedAt: string;
  entries: JudgmentEntryData[];
  setBy?: { username: string };
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
  adminJudgment: AdminJudgmentData | null;
}

interface SubjectRecord {
  subject: SubjectData;
  posts: Post[];
  notice?: string;
}

interface ScaleSuggestion {
  id: string;
  userId: string;
  createdAt: string;
  user: { username: string; image: string | null };
  entries: JudgmentEntryData[];
  replyTo: { createdAt: string; user: { username: string } } | null;
  replyToPost: { id: string; createdAt: string; author: { username: string } } | null;
}

interface ReactionItem {
  id: string;
  body: string;
  createdAt: string;
  user: { username: string; image: string | null };
}

interface DraftPair {
  magnitude: string;
  justification: string;
}

type ReplyTarget =
  | { type: 'admin' }
  | { type: 'suggestion'; id: string }
  | { type: 'post'; id: string };

const SUBJECT_TYPE_LABELS: Record<string, string> = {
  PERSON: 'Person',
  INSTITUTION: 'Institution',
  ORGANIZATION: 'Organization',
  BUSINESS: 'Business',
  NATION: 'Nation',
  REGIME: 'Regime',
  ADMINISTRATION: 'Administration',
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

const HAS_TENURE_FIELDS = ['PERSON', 'INSTITUTION', 'ORGANIZATION', 'BUSINESS', 'NATION', 'REGIME', 'ADMINISTRATION'];
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

function Avatar({ username, image, size = 20 }: { username: string; image: string | null; size?: number }) {
  if (image) {
    return (
      <img
        src={image}
        alt={username}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', verticalAlign: 'middle' }}
      />
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#E8E4DA',
        color: '#5F5E5A',
        fontSize: size * 0.5,
        fontFamily: 'Georgia, serif',
        verticalAlign: 'middle',
      }}
    >
      {username.charAt(0).toUpperCase()}
    </span>
  );
}

function JudgmentBreakdown({
  entries,
  adminEntries,
}: {
  entries: JudgmentEntryData[];
  adminEntries?: JudgmentEntryData[];
}) {
  const labeled = labelEntries(entries as JudgmentEntryLike[]);
  const ownNet = computeNetValue(entries as JudgmentEntryLike[]);
  const baselineNet = adminEntries ? computeNetValue(adminEntries as JudgmentEntryLike[]) : 0;
  const combinedNet = adminEntries ? baselineNet + ownNet : ownNet;
  const label = computeLabel(combinedNet);
  const negatives = labeled.filter((e) => e.side === 'NEGATIVE');
  const positives = labeled.filter((e) => e.side === 'POSITIVE');
  const zero = labeled.filter((e) => e.side === 'ZERO');

  const labelColor = label === 'Civic' ? '#2F5D50' : label === 'Callous' ? '#7A2E2E' : '#B8860B';

  return (
    <div>
      <BalanceScale value={combinedNet} />
      <p style={{ textAlign: 'center', fontWeight: 'bold', color: labelColor, fontFamily: 'Georgia, serif', fontSize: 16, marginTop: 4 }}>
        {label}
      </p>
      {adminEntries && (
        <p style={{ textAlign: 'center', fontSize: 11, color: '#5F5E5A', marginTop: 2 }}>
          combined with admin baseline
        </p>
      )}

      {zero.length > 0 && (
        <p style={{ fontSize: 13, color: '#5F5E5A', textAlign: 'center' }}>No content submitted (Z).</p>
      )}

      {(negatives.length > 0 || positives.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: '#7A2E2E', fontWeight: 'bold', marginBottom: 6 }}>NEGATIVE</p>
            {negatives.length === 0 && <p style={{ fontSize: 12, color: '#5F5E5A' }}>None</p>}
            {negatives.map((e) => (
              <div key={e.label} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: '#7A2E2E', margin: 0 }}>
                  <strong>{e.label}</strong> — {e.magnitude}
                </p>
                {e.justification && <p style={{ fontSize: 12, color: '#1C2024', margin: '2px 0 0' }}>{e.justification}</p>}
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#2F5D50', fontWeight: 'bold', marginBottom: 6 }}>POSITIVE</p>
            {positives.length === 0 && <p style={{ fontSize: 12, color: '#5F5E5A' }}>None</p>}
            {positives.map((e) => (
              <div key={e.label} style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: '#2F5D50', margin: 0 }}>
                  <strong>{e.label}</strong> — {e.magnitude}
                </p>
                {e.justification && <p style={{ fontSize: 12, color: '#1C2024', margin: '2px 0 0' }}>{e.justification}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MAX_PAIRS_PER_SIDE = 10;

function PairEditor({
  side,
  pairs,
  onChange,
  color,
}: {
  side: 'NEGATIVE' | 'POSITIVE';
  pairs: DraftPair[];
  onChange: (pairs: DraftPair[]) => void;
  color: string;
}) {
  function updatePair(index: number, field: keyof DraftPair, value: string) {
    const next = [...pairs];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }
  function addPair() {
    if (pairs.length >= MAX_PAIRS_PER_SIDE) return;
    onChange([...pairs, { magnitude: '', justification: '' }]);
  }
  function removePair(index: number) {
    onChange(pairs.filter((_, i) => i !== index));
  }

  return (
    <div>
      <p style={{ fontSize: 11, color, fontWeight: 'bold', marginBottom: 6 }}>
        {side === 'NEGATIVE' ? 'NEGATIVE (sum ≤ 1000)' : 'POSITIVE (sum ≤ 1000)'}
      </p>
      {pairs.map((p, i) => (
        <div key={i} style={{ marginBottom: 8, border: '1px solid #E8E4DA', padding: 8 }}>
          <input
            type="number"
            min={0}
            max={1000}
            placeholder="Magnitude (0-1000)"
            value={p.magnitude}
            onChange={(e) => updatePair(i, 'magnitude', e.target.value)}
            style={{ ...pairInputStyle, marginBottom: 6 }}
          />
          <textarea
            placeholder="Justification"
            value={p.justification}
            maxLength={MAX_JUSTIFICATION_LENGTH}
            onChange={(e) => updatePair(i, 'justification', e.target.value)}
            style={{ ...pairInputStyle, height: 44, resize: 'vertical' }}
          />
          <p style={{ fontSize: 10, color: '#5F5E5A', textAlign: 'right', margin: '2px 0 0' }}>
            {p.justification.length}/{MAX_JUSTIFICATION_LENGTH}
          </p>
          <button type="button" onClick={() => removePair(i)} style={{ fontSize: 11, color: '#7A2E2E', background: 'none', border: 'none', cursor: 'pointer' }}>
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addPair}
        disabled={pairs.length >= MAX_PAIRS_PER_SIDE}
        style={{
          fontSize: 12,
          padding: '6px 12px',
          background: 'transparent',
          border: `1px solid ${color}`,
          color,
          cursor: pairs.length >= MAX_PAIRS_PER_SIDE ? 'not-allowed' : 'pointer',
          opacity: pairs.length >= MAX_PAIRS_PER_SIDE ? 0.5 : 1,
        }}
      >
        + Add {side === 'NEGATIVE' ? 'negative' : 'positive'} pair ({pairs.length}/{MAX_PAIRS_PER_SIDE})
      </button>
    </div>
  );
}

function pairsToEntries(pairs: DraftPair[], side: 'NEGATIVE' | 'POSITIVE') {
  return pairs
    .filter((p) => p.magnitude || p.justification)
    .map((p) => ({
      side,
      magnitude: p.magnitude ? Number(p.magnitude) : 0,
      justification: p.justification || null,
    }));
}

function ReportUserControl({
  userId,
  username,
  reportingUserId,
  setReportingUserId,
  reportReason,
  setReportReason,
  reportSubmitting,
  reportError,
  reportedSuccessfully,
  onSubmit,
}: {
  userId: string;
  username: string;
  reportingUserId: string | null;
  setReportingUserId: (id: string | null) => void;
  reportReason: string;
  setReportReason: (v: string) => void;
  reportSubmitting: boolean;
  reportError: string;
  reportedSuccessfully: Set<string>;
  onSubmit: (userId: string) => void;
}) {
  if (reportedSuccessfully.has(userId)) {
    return <span style={{ fontSize: 11, color: '#2F5D50' }}>Reported</span>;
  }

  if (reportingUserId !== userId) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setReportingUserId(userId); }}
        style={{ fontSize: 11, color: '#7A2E2E', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
      >
        Report {username}
      </button>
    );
  }

  return (
    <div style={{ marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
      <textarea
        placeholder={`Why are you reporting ${username}?`}
        value={reportReason}
        maxLength={MAX_REPORT_REASON_LENGTH}
        onChange={(e) => setReportReason(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', border: '1px solid #B4B2A9', fontSize: 12, boxSizing: 'border-box' }}
      />
      {reportError && <p style={{ color: '#7A2E2E', fontSize: 11, margin: '4px 0' }}>{reportError}</p>}
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button
          onClick={() => onSubmit(userId)}
          disabled={reportSubmitting}
          style={{ fontSize: 11, padding: '4px 10px', background: '#7A2E2E', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {reportSubmitting ? 'Submitting…' : 'Submit report'}
        </button>
        <button
          onClick={() => setReportingUserId(null)}
          style={{ fontSize: 11, padding: '4px 10px', background: 'transparent', color: '#5F5E5A', border: '1px solid #B4B2A9', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function SubjectProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SubjectRecord | null>(null);
  const [status, setStatus] = useState<'loading' | 'notfound' | 'ready'>('loading');

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [suggestions, setSuggestions] = useState<ScaleSuggestion[]>([]);

  const [suggestionNegatives, setSuggestionNegatives] = useState<DraftPair[]>([]);
  const [suggestionPositives, setSuggestionPositives] = useState<DraftPair[]>([]);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget>({ type: 'admin' });
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);

  const [adminNegatives, setAdminNegatives] = useState<DraftPair[]>([]);
  const [adminPositives, setAdminPositives] = useState<DraftPair[]>([]);
  const [savingAdminJudgment, setSavingAdminJudgment] = useState(false);
  const [adminJudgmentError, setAdminJudgmentError] = useState('');

  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'saving'>('idle');
  const [verifyError, setVerifyError] = useState('');

  const [reactionsBySuggestion, setReactionsBySuggestion] = useState<Record<string, ReactionItem[]>>({});
  const [reactionDrafts, setReactionDrafts] = useState<Record<string, { body: string }>>({});
  const [reactionSubmitting, setReactionSubmitting] = useState<Record<string, boolean>>({});
  const [reactionErrors, setReactionErrors] = useState<Record<string, string>>({});

  const [reportingUserId, setReportingUserId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportedSuccessfully, setReportedSuccessfully] = useState<Set<string>>(new Set());

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
        }
      });
  }, [id]);

  useEffect(() => {
    fetch(`/api/scale-suggestions?subjectId=${id}`)
      .then((r) => r.json())
      .then((d) => setSuggestions(d.suggestions ?? []));
  }, [id, suggestionSuccess]);

  useEffect(() => {
    suggestions.forEach((s) => {
      fetch(`/api/reactions?scaleSuggestionId=${s.id}`)
        .then((r) => r.json())
        .then((d) => setReactionsBySuggestion((prev) => ({ ...prev, [s.id]: d.reactions ?? [] })));
    });
  }, [suggestions]);

  async function handleReactToSuggestion(suggestionId: string) {
    const draft = reactionDrafts[suggestionId] || { body: '' };
    if (!draft.body) {
      setReactionErrors((prev) => ({ ...prev, [suggestionId]: 'Write a reaction first.' }));
      return;
    }
    setReactionSubmitting((prev) => ({ ...prev, [suggestionId]: true }));
    setReactionErrors((prev) => ({ ...prev, [suggestionId]: '' }));

    const res = await fetch('/api/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scaleSuggestionId: suggestionId,
        reactionBody: draft.body,
      }),
    });

    setReactionSubmitting((prev) => ({ ...prev, [suggestionId]: false }));

    if (!res.ok) {
      const d = await res.json();
      setReactionErrors((prev) => ({ ...prev, [suggestionId]: d.error ?? 'Something went wrong.' }));
      return;
    }

    setReactionDrafts((prev) => ({ ...prev, [suggestionId]: { body: '' } }));
    const refreshed = await fetch(`/api/reactions?scaleSuggestionId=${suggestionId}`).then((r) => r.json());
    setReactionsBySuggestion((prev) => ({ ...prev, [suggestionId]: refreshed.reactions ?? [] }));
  }

  async function handleSubmitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    setSuggestionError('');

    const entries = [
      ...pairsToEntries(suggestionNegatives, 'NEGATIVE'),
      ...pairsToEntries(suggestionPositives, 'POSITIVE'),
    ];

    setSubmittingSuggestion(true);

    const res = await fetch('/api/scale-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: id,
        entries,
        replyToId: replyTarget.type === 'suggestion' ? replyTarget.id : null,
        replyToPostId: replyTarget.type === 'post' ? replyTarget.id : null,
      }),
    });

    setSubmittingSuggestion(false);

    if (!res.ok) {
      const d = await res.json();
      setSuggestionError(d.error ?? 'Something went wrong.');
      return;
    }

    setSuggestionNegatives([]);
    setSuggestionPositives([]);
    setReplyTarget({ type: 'admin' });
    setSuggestionSuccess((s) => !s);
  }

  async function handleSaveAdminJudgment() {
    setAdminJudgmentError('');
    const entries = [
      ...pairsToEntries(adminNegatives, 'NEGATIVE'),
      ...pairsToEntries(adminPositives, 'POSITIVE'),
    ];
    setSavingAdminJudgment(true);
    const res = await fetch(`/api/subjects/${id}/admin-judgment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
    setSavingAdminJudgment(false);
    if (!res.ok) {
      const d = await res.json();
      setAdminJudgmentError(d.error ?? 'Something went wrong.');
      return;
    }
    const d = await res.json();
    setData((prev) => prev ? { ...prev, subject: { ...prev.subject, adminJudgment: d.judgment } } : prev);
    setAdminNegatives([]);
    setAdminPositives([]);
  }

  async function handleSetVerification(newStatus: 'ADMIN_CONFIRMED' | 'DISPUTED' | 'UNVERIFIED') {
    setVerifyError('');
    let reason: string | null = null;
    if (newStatus === 'DISPUTED') {
      reason = window.prompt('Reason for disputing this record\'s eligibility:');
      if (!reason) return;
    }
    setVerifyStatus('saving');
    const res = await fetch(`/api/subjects/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus: newStatus, reason }),
    });
    setVerifyStatus('idle');
    if (!res.ok) {
      const d = await res.json();
      setVerifyError(d.error ?? 'Something went wrong.');
      return;
    }
    const d = await res.json();
    setData((prev) => prev ? { ...prev, subject: { ...prev.subject, verificationStatus: d.subject.verificationStatus } } : prev);
  }

  async function handleReportUser(reportedUserId: string) {
    if (!reportReason.trim()) {
      setReportError('Enter a reason before reporting.');
      return;
    }
    setReportSubmitting(true);
    setReportError('');

    const res = await fetch('/api/user-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportedUserId, reason: reportReason }),
    });

    setReportSubmitting(false);

    if (!res.ok) {
      const d = await res.json();
      setReportError(d.error ?? 'Something went wrong.');
      return;
    }

    setReportedSuccessfully((prev) => new Set(prev).add(reportedUserId));
    setReportingUserId(null);
    setReportReason('');
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
  const adminEntries = subject.adminJudgment?.entries ?? [];

  function describeTarget(t: ReplyTarget): string {
    if (t.type === 'admin') return "the admin's verdict";
    if (t.type === 'suggestion') {
      const s = suggestions.find((s) => s.id === t.id);
      return s ? computeDisplayId('S', s.user.username, s.createdAt) : 'a suggestion';
    }
    const p = posts.find((p) => p.id === t.id);
    return p ? computeDisplayId('P', p.author.username, p.createdAt) : 'a post';
  }

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
          <span style={confirmedBadgeStyle(adminEntries.length > 0 ? computeNetValue(adminEntries as JudgmentEntryLike[]) : null)}>
            {(() => {
              if (adminEntries.length === 0) return 'CONFIRMED';
              const net = computeNetValue(adminEntries as JudgmentEntryLike[]);
              const label = computeLabel(net);
              return `CONFIRMED — ${label.toUpperCase()}`;
            })()}
          </span>
        )}
        {subject.verificationStatus === 'DISPUTED' && (
          <span style={badgeStyle('#7A2E2E', '#F3E8E6')}>Disputed</span>
        )}

        {isAdmin && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSetVerification('ADMIN_CONFIRMED')}
              disabled={verifyStatus === 'saving'}
              style={{ padding: '6px 14px', background: '#2F5D50', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}
            >
              Confirm
            </button>
            <button
              onClick={() => handleSetVerification('DISPUTED')}
              disabled={verifyStatus === 'saving'}
              style={{ padding: '6px 14px', background: '#7A2E2E', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}
            >
              Dispute
            </button>
            <button
              onClick={() => handleSetVerification('UNVERIFIED')}
              disabled={verifyStatus === 'saving'}
              style={{ padding: '6px 14px', background: 'transparent', color: '#5F5E5A', border: '1px solid #B4B2A9', fontSize: 12, cursor: 'pointer' }}
            >
              Reset to unverified
            </button>
            {verifyError && <span style={{ color: '#7A2E2E', fontSize: 12 }}>{verifyError}</span>}
          </div>
        )}

        {notice && (
          <div style={{ background: '#F3E8E6', border: '1px solid #7A2E2E', padding: '14px 16px', marginTop: 24 }}>
            <p style={{ color: '#7A2E2E', fontSize: 14, margin: 0 }}>{notice}</p>
          </div>
        )}

        <div
          style={{
            border: replyTarget.type === 'admin' ? '2px solid #B8860B' : '1px solid #B4B2A9',
            background: '#fff',
            padding: '20px',
            marginTop: 28,
            marginBottom: 32,
            cursor: isAuthenticated ? 'pointer' : 'default',
          }}
          onClick={() => isAuthenticated && setReplyTarget({ type: 'admin' })}
        >
          <p style={monoLabel}>
            ETHICS JUDGMENT — ADMIN
            {replyTarget.type === 'admin' && isAuthenticated && ' — replying to this'}
          </p>

          {subject.adminJudgment ? (
            <JudgmentBreakdown entries={subject.adminJudgment.entries} />
          ) : (
            <p style={{ color: '#5F5E5A', fontSize: 14 }}>Not yet judged by an admin.</p>
          )}

          {isAdmin && (
            <div style={{ borderTop: '1px solid #E8E4DA', marginTop: 20, paddingTop: 16 }} onClick={(e) => e.stopPropagation()}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: '#1C2024', marginBottom: 10 }}>
                Set admin judgment (replaces the current one)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <PairEditor side="NEGATIVE" pairs={adminNegatives} onChange={setAdminNegatives} color="#7A2E2E" />
                <PairEditor side="POSITIVE" pairs={adminPositives} onChange={setAdminPositives} color="#2F5D50" />
              </div>
              {adminJudgmentError && <p style={{ color: '#7A2E2E', fontSize: 13, marginTop: 10 }}>{adminJudgmentError}</p>}
              <button
                onClick={handleSaveAdminJudgment}
                disabled={savingAdminJudgment}
                style={{ marginTop: 12, padding: '10px 18px', background: '#1C2024', color: '#fff', border: 'none', fontFamily: 'Georgia, serif', cursor: 'pointer' }}
              >
                {savingAdminJudgment ? 'Saving…' : 'Save judgment'}
              </button>
            </div>
          )}
        </div>

        <div style={{ border: '1px solid #B4B2A9', background: '#fff', padding: '20px', marginBottom: 32 }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: '#1C2024', marginBottom: 4 }}>
            User-suggested judgments
          </p>
          <p style={{ fontSize: 11, color: '#5F5E5A', marginBottom: 10 }}>
            All record IDs use UTC for date and time. Each scale reflects the admin baseline combined with the suggestion's own entries.
          </p>

          {suggestions.length === 0 && (
            <p style={{ color: '#5F5E5A', fontSize: 13, marginBottom: 16 }}>No suggestions yet.</p>
          )}

          {suggestions.map((s) => {
            const suggestionDisplayId = computeDisplayId('S', s.user.username, s.createdAt);
            const draft = reactionDrafts[s.id] || { body: '' };
            const reactions = reactionsBySuggestion[s.id] || [];
            const isSelectedAsReplyTarget = replyTarget.type === 'suggestion' && replyTarget.id === s.id;

            let targetLabel: string | null = null;
            if (s.replyTo) {
              targetLabel = computeDisplayId('S', s.replyTo.user.username, s.replyTo.createdAt);
            } else if (s.replyToPost) {
              targetLabel = computeDisplayId('P', s.replyToPost.author.username, s.replyToPost.createdAt);
            } else {
              targetLabel = "the admin's verdict";
            }

            return (
              <div
                key={s.id}
                style={{
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: '1px solid #E8E4DA',
                  background: isSelectedAsReplyTarget ? '#FFF9E6' : 'transparent',
                  border: isSelectedAsReplyTarget ? '1px solid #B8860B' : 'none',
                  padding: isSelectedAsReplyTarget ? '10px' : '0 0 16px 0',
                  cursor: isAuthenticated ? 'pointer' : 'default',
                }}
                onClick={() => isAuthenticated && setReplyTarget({ type: 'suggestion', id: s.id })}
              >
                <p style={{ fontWeight: 'bold', color: '#1D4ED8', fontSize: 11, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar username={s.user.username} image={s.user.image} />
                  {s.user.username}'s suggestion — {suggestionDisplayId} — reacting to {targetLabel}
                  {isSelectedAsReplyTarget && ' — replying to this'}
                </p>
                <JudgmentBreakdown entries={s.entries} adminEntries={adminEntries} />
                <div style={{ marginTop: 6 }} onClick={(e) => e.stopPropagation()}>
                  <p style={{ fontSize: 12, color: '#5F5E5A', margin: 0, display: 'inline' }}>
                    Filed {new Date(s.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  {isAuthenticated && (
                    <span style={{ marginLeft: 8 }}>
                      <ReportUserControl
                        userId={s.userId}
                        username={s.user.username}
                        reportingUserId={reportingUserId}
                        setReportingUserId={setReportingUserId}
                        reportReason={reportReason}
                        setReportReason={setReportReason}
                        reportSubmitting={reportSubmitting}
                        reportError={reportError}
                        reportedSuccessfully={reportedSuccessfully}
                        onSubmit={handleReportUser}
                      />
                    </span>
                  )}
                </div>

                {reactions.map((r) => (
                  <div key={r.id} style={{ marginLeft: 20, marginTop: 10, paddingLeft: 12, borderLeft: '2px solid #B4B2A9' }} onClick={(e) => e.stopPropagation()}>
                    <p style={{ fontWeight: 'bold', color: '#1D4ED8', fontSize: 11, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar username={r.user.username} image={r.user.image} />
                      {r.user.username} reacts to {suggestionDisplayId}
                    </p>
                    <p style={{ fontSize: 13, color: '#1C2024', marginTop: 4 }}>{r.body}</p>
                    <p style={{ fontSize: 11, color: '#5F5E5A' }}>
                      {computeDisplayId('R', r.user.username, r.createdAt)}
                    </p>
                  </div>
                ))}

                {isAuthenticated && (
                  <div style={{ marginLeft: 20, marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                    <textarea
                      placeholder="Your reaction"
                      maxLength={MAX_JUSTIFICATION_LENGTH}
                      value={draft.body}
                      onChange={(e) => setReactionDrafts((prev) => ({ ...prev, [s.id]: { body: e.target.value } }))}
                      style={{ ...inputStyle, height: 50, resize: 'vertical', marginBottom: 6 }}
                    />
                    {reactionErrors[s.id] && <p style={{ color: '#7A2E2E', fontSize: 12, marginBottom: 6 }}>{reactionErrors[s.id]}</p>}
                    <button
                      onClick={() => handleReactToSuggestion(s.id)}
                      disabled={reactionSubmitting[s.id]}
                      style={{ padding: '6px 14px', background: '#1C2024', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer' }}
                    >
                      {reactionSubmitting[s.id] ? 'Submitting…' : 'React'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {isAuthenticated ? (
            <form onSubmit={handleSubmitSuggestion} style={{ marginTop: 16 }}>
              <p style={{ fontSize: 12, color: '#2F5D50', marginBottom: 8 }}>
                Click on what you wish to target. Currently: <strong>{describeTarget(replyTarget)}</strong>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 10 }}>
                <PairEditor side="NEGATIVE" pairs={suggestionNegatives} onChange={setSuggestionNegatives} color="#7A2E2E" />
                <PairEditor side="POSITIVE" pairs={suggestionPositives} onChange={setSuggestionPositives} color="#2F5D50" />
              </div>
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
            <p style={{ fontSize: 13, color: '#5F5E5A', marginTop: 16 }}>Sign in to suggest a judgment.</p>
          )}
        </div>

        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1C2024', marginBottom: 16 }}>
          Filed records
        </h2>

        {posts.length === 0 && (
          <p style={{ color: '#5F5E5A' }}>No published records for this subject yet.</p>
        )}

        {posts.map((post) => {
          const color = post.axis === 'CALLOUS' ? '#7A2E2E' : '#2F5D50';
          const postDisplayId = computeDisplayId('P', post.author.username, post.createdAt);
          const isSelectedAsReplyTarget = replyTarget.type === 'post' && replyTarget.id === post.id;
          return (
            <div
              key={post.id}
              style={{
                border: isSelectedAsReplyTarget ? '1px solid #B8860B' : '1px solid #B4B2A9',
                background: isSelectedAsReplyTarget ? '#FFF9E6' : '#fff',
                padding: '16px 20px',
                marginBottom: 16,
                cursor: isAuthenticated ? 'pointer' : 'default',
              }}
              onClick={() => isAuthenticated && setReplyTarget({ type: 'post', id: post.id })}
            >
              <p style={{ fontWeight: 'bold', color: '#1D4ED8', fontSize: 11, marginBottom: 6 }}>
                {postDisplayId}
                {isSelectedAsReplyTarget && ' — replying to this'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color, fontFamily: 'Georgia, serif', fontSize: 15 }}>{post.behavior.label}</span>
                <span style={monoLabel}>{formatConductDate(post)}</span>
              </div>
              <p style={{ marginTop: 10, marginBottom: 10, lineHeight: 1.6, color: '#1C2024' }}>{post.narrative}</p>
              <p style={{ fontSize: 13, color: '#5F5E5A', marginBottom: 8 }}>
                Justification: {post.publicCapacityJustification}
              </p>
              {post.evidenceUrl && (
                <a href={post.evidenceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#1C2024' }} onClick={(e) => e.stopPropagation()}>
                  View supporting evidence
                </a>
              )}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                <Avatar username={post.author.username} image={post.author.image} size={18} />
                <p style={{ fontSize: 12, color: '#5F5E5A', margin: 0, display: 'inline' }}>Filed by {post.author.username}</p>
                {isAuthenticated && (
                  <ReportUserControl
                    userId={post.authorUserId}
                    username={post.author.username}
                    reportingUserId={reportingUserId}
                    setReportingUserId={setReportingUserId}
                    reportReason={reportReason}
                    setReportReason={setReportReason}
                    reportSubmitting={reportSubmitting}
                    reportError={reportError}
                    reportedSuccessfully={reportedSuccessfully}
                    onSubmit={handleReportUser}
                  />
                )}
              </div>

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

const pairInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #B4B2A9',
  background: '#fff',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 13,
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

function confirmedBadgeStyle(netValue: number | null): React.CSSProperties {
  const color = netValue === null ? '#5F5E5A' : netValue > 0 ? '#2F5D50' : netValue < 0 ? '#7A2E2E' : '#B8860B';
  return {
    display: 'inline-block',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Georgia, serif',
    letterSpacing: '0.03em',
    color: '#fff',
    background: color,
    padding: '6px 16px',
    marginTop: 8,
  };
}
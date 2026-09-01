// app/admin/moderate/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface PendingPost {
  id: string;
  axis: 'CALLOUS' | 'CIVIC';
  behaviorLabel: string;
  narrative: string;
  evidenceUrl: string | null;
  conductYear: number;
  conductMonth: number | null;
  conductDay: number | null;
  conductEraNote: string | null;
  publicCapacityJustification: string;
  author: { username: string };
  subject: { displayName: string; roleTitle: string | null; associatedContext: string | null };
}

interface JudgmentEntry {
  side: 'NEGATIVE' | 'POSITIVE' | 'ZERO';
  magnitude: number;
  justification: string | null;
}

interface PendingSuggestion {
  id: string;
  createdAt: string;
  user: { username: string };
  subject: { id: string; displayName: string };
  entries: JudgmentEntry[];
}

interface PendingUserReport {
  id: string;
  reason: string;
  createdAt: string;
  reporter: { username: string };
  reportedUser: { id: string; username: string };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatConductDate(post: PendingPost): string {
  const era = post.conductYear < 0 ? 'BCE' : 'CE';
  const absYear = Math.abs(post.conductYear);
  let base: string;
  if (post.conductMonth) {
    const monthName = MONTH_NAMES[post.conductMonth - 1] ?? '';
    base = post.conductDay ? `${post.conductDay} ${monthName} ${absYear} ${era}` : `${monthName} ${absYear} ${era}`;
  } else {
    base = `${absYear} ${era}`;
  }
  return post.conductEraNote ? `${base} (${post.conductEraNote})` : base;
}

export default function ModerationQueuePage() {
  const [pending, setPending] = useState<PendingPost[]>([]);
  const [pendingSuggestions, setPendingSuggestions] = useState<PendingSuggestion[]>([]);
  const [pendingUserReports, setPendingUserReports] = useState<PendingUserReport[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'forbidden'>('loading');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingSuggestionId, setRejectingSuggestionId] = useState<string | null>(null);
  const [suggestionRejectionReason, setSuggestionRejectionReason] = useState('');
  const [reportResolutionNotes, setReportResolutionNotes] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    setStatus('loading');
    const res = await fetch('/api/posts/pending');
    if (res.status === 403) {
      setStatus('forbidden');
      return;
    }
    const data = await res.json();
    setPending(data.pending ?? []);

    const suggestionsRes = await fetch('/api/scale-suggestions/pending');
    if (suggestionsRes.ok) {
      const suggestionsData = await suggestionsRes.json();
      setPendingSuggestions(suggestionsData.pending ?? []);
    }

    const reportsRes = await fetch('/api/user-reports');
    if (reportsRes.ok) {
      const reportsData = await reportsRes.json();
      setPendingUserReports(reportsData.reports ?? []);
    }

    setStatus('ready');
  }

  async function approve(id: string) {
    setActionError(null);
    const res = await fetch(`/api/posts/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'PUBLISH' }),
    });
    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? 'Could not approve.');
      return;
    }
    setPending((p) => p.filter((post) => post.id !== id));
  }

  async function reject(id: string) {
    if (!rejectionReason.trim()) {
      setActionError('Enter a reason before rejecting.');
      return;
    }
    setActionError(null);
    const res = await fetch(`/api/posts/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'REJECT_LANGUAGE', rejectionReason }),
    });
    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? 'Could not reject.');
      return;
    }
    setPending((p) => p.filter((post) => post.id !== id));
    setRejectingId(null);
    setRejectionReason('');
  }

  async function approveSuggestion(id: string) {
    setActionError(null);
    const res = await fetch(`/api/scale-suggestions/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'PUBLISH' }),
    });
    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? 'Could not approve.');
      return;
    }
    setPendingSuggestions((p) => p.filter((s) => s.id !== id));
  }

  async function rejectSuggestion(id: string) {
    if (!suggestionRejectionReason.trim()) {
      setActionError('Enter a reason before rejecting.');
      return;
    }
    setActionError(null);
    const res = await fetch(`/api/scale-suggestions/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'REJECT_LANGUAGE', rejectionReason: suggestionRejectionReason }),
    });
    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? 'Could not reject.');
      return;
    }
    setPendingSuggestions((p) => p.filter((s) => s.id !== id));
    setRejectingSuggestionId(null);
    setSuggestionRejectionReason('');
  }

  async function resolveUserReport(id: string, resolution: 'ACTIONED' | 'DISMISSED') {
    setActionError(null);
    const res = await fetch(`/api/user-reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: resolution, resolutionNote: reportResolutionNotes[id] || null }),
    });
    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? 'Could not resolve report.');
      return;
    }
    setPendingUserReports((p) => p.filter((r) => r.id !== id));
  }

  if (status === 'loading') {
    return (
      <main style={pageStyle}>
        <p style={{ color: '#5F5E5A', fontFamily: 'Inter, system-ui, sans-serif' }}>Loading queue…</p>
      </main>
    );
  }

  if (status === 'forbidden') {
    return (
      <main style={pageStyle}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1C2024' }}>Admin access required.</p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 720, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={monoLabel}>MODERATION QUEUE</p>
        <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 28, color: '#1C2024', margin: '8px 0 4px' }}>
          Language review
        </h1>
        <p style={{ color: '#5F5E5A', marginBottom: 32 }}>
          Review for language only — profanity, doxxing, threats, direct criminal accusation. Not for truth or substance.
        </p>

        {actionError && (
          <p style={{ color: '#7A2E2E', fontSize: 14, marginBottom: 16 }}>{actionError}</p>
        )}

        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1C2024', marginBottom: 12 }}>Pending posts</h2>

        {pending.length === 0 && (
          <p style={{ color: '#5F5E5A', marginBottom: 24 }}>Nothing waiting for review.</p>
        )}

        {pending.map((post) => {
          const color = post.axis === 'CALLOUS' ? '#7A2E2E' : '#2F5D50';
          return (
            <div key={post.id} style={{ border: '1px solid #B4B2A9', background: '#fff', padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color, fontFamily: 'Georgia, serif', fontSize: 15 }}>{post.behaviorLabel}</span>
                <span style={monoLabel}>{formatConductDate(post)}</span>
              </div>

              <p style={{ fontSize: 13, color: '#5F5E5A', marginTop: 6 }}>
                Re: {post.subject.displayName}
                {post.subject.roleTitle ? ` — ${post.subject.roleTitle}` : ''}
                {post.subject.associatedContext ? `, ${post.subject.associatedContext}` : ''}
              </p>

              <p style={{ marginTop: 10, marginBottom: 10, lineHeight: 1.6, color: '#1C2024' }}>{post.narrative}</p>

              <p style={{ fontSize: 13, color: '#5F5E5A' }}>
                Justification: {post.publicCapacityJustification}
              </p>

              {post.evidenceUrl && (
                <a href={post.evidenceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#1C2024' }}>
                  View supporting evidence
                </a>
              )}

              <p style={{ fontSize: 12, color: '#5F5E5A', margin: '10px 0' }}>Filed by {post.author.username}</p>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button onClick={() => approve(post.id)} style={approveBtn}>Publish</button>
                <button onClick={() => setRejectingId(rejectingId === post.id ? null : post.id)} style={rejectBtn}>
                  Reject for language
                </button>
              </div>

              {rejectingId === post.id && (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    placeholder="Reason for rejection"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #B4B2A9', fontSize: 13, boxSizing: 'border-box' }}
                  />
                  <button onClick={() => reject(post.id)} style={{ ...rejectBtn, marginTop: 8 }}>
                    Confirm rejection
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1C2024', margin: '32px 0 12px' }}>Pending suggestions</h2>

        {pendingSuggestions.length === 0 && (
          <p style={{ color: '#5F5E5A', marginBottom: 24 }}>Nothing waiting for review.</p>
        )}

        {pendingSuggestions.map((s) => {
          const negatives = s.entries.filter((e) => e.side === 'NEGATIVE');
          const positives = s.entries.filter((e) => e.side === 'POSITIVE');
          return (
            <div key={s.id} style={{ border: '1px solid #B4B2A9', background: '#fff', padding: '18px 20px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#5F5E5A' }}>
                Re: {s.subject.displayName} — by {s.user.username}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 10 }}>
                <div>
                  <p style={{ fontSize: 11, color: '#7A2E2E', fontWeight: 'bold' }}>NEGATIVE</p>
                  {negatives.length === 0 && <p style={{ fontSize: 12, color: '#5F5E5A' }}>None</p>}
                  {negatives.map((e, i) => (
                    <p key={i} style={{ fontSize: 12, color: '#1C2024' }}>{e.magnitude} — {e.justification ?? '(no justification)'}</p>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#2F5D50', fontWeight: 'bold' }}>POSITIVE</p>
                  {positives.length === 0 && <p style={{ fontSize: 12, color: '#5F5E5A' }}>None</p>}
                  {positives.map((e, i) => (
                    <p key={i} style={{ fontSize: 12, color: '#1C2024' }}>{e.magnitude} — {e.justification ?? '(no justification)'}</p>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button onClick={() => approveSuggestion(s.id)} style={approveBtn}>Publish</button>
                <button onClick={() => setRejectingSuggestionId(rejectingSuggestionId === s.id ? null : s.id)} style={rejectBtn}>
                  Reject for language
                </button>
              </div>

              {rejectingSuggestionId === s.id && (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    placeholder="Reason for rejection"
                    value={suggestionRejectionReason}
                    onChange={(e) => setSuggestionRejectionReason(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #B4B2A9', fontSize: 13, boxSizing: 'border-box' }}
                  />
                  <button onClick={() => rejectSuggestion(s.id)} style={{ ...rejectBtn, marginTop: 8 }}>
                    Confirm rejection
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1C2024', margin: '32px 0 12px' }}>Pending user reports</h2>

        {pendingUserReports.length === 0 && (
          <p style={{ color: '#5F5E5A' }}>Nothing waiting for review.</p>
        )}

        {pendingUserReports.map((r) => (
          <div key={r.id} style={{ border: '1px solid #B4B2A9', background: '#fff', padding: '18px 20px', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#5F5E5A' }}>
              {r.reporter.username} reported {r.reportedUser.username}
            </p>
            <p style={{ marginTop: 8, color: '#1C2024' }}>{r.reason}</p>
            <textarea
              placeholder="Resolution note (optional)"
              value={reportResolutionNotes[r.id] || ''}
              onChange={(e) => setReportResolutionNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #B4B2A9', fontSize: 13, boxSizing: 'border-box', marginTop: 10 }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button onClick={() => resolveUserReport(r.id, 'ACTIONED')} style={approveBtn}>Mark actioned</button>
              <button onClick={() => resolveUserReport(r.id, 'DISMISSED')} style={rejectBtn}>Dismiss</button>
            </div>
          </div>
        ))}
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

const approveBtn: React.CSSProperties = {
  padding: '8px 16px',
  background: '#2F5D50',
  color: '#fff',
  border: 'none',
  fontSize: 13,
  cursor: 'pointer',
};

const rejectBtn: React.CSSProperties = {
  padding: '8px 16px',
  background: 'transparent',
  color: '#7A2E2E',
  border: '1px solid #7A2E2E',
  fontSize: 13,
  cursor: 'pointer',
};
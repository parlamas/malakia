// app/admin/moderate/page.tsx

'use client';

import { useEffect, useState } from 'react';

interface PendingPost {
  id: string;
  axis: 'CALLOUS' | 'CIVIC';
  narrative: string;
  evidenceUrl: string | null;
  conductDate: string;
  publicCapacityJustification: string;
  behavior: { label: string };
  author: { username: string };
  subject: { displayName: string; roleTitle: string; country: string };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ModerationQueuePage() {
  const [pending, setPending] = useState<PendingPost[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'forbidden'>('loading');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
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

        {pending.length === 0 && (
          <p style={{ color: '#5F5E5A' }}>Nothing waiting for review.</p>
        )}

        {pending.map((post) => {
          const color = post.axis === 'CALLOUS' ? '#7A2E2E' : '#2F5D50';
          return (
            <div key={post.id} style={{ border: '1px solid #B4B2A9', background: '#fff', padding: '18px 20px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color, fontFamily: 'Georgia, serif', fontSize: 15 }}>{post.behavior.label}</span>
                <span style={monoLabel}>{formatDate(post.conductDate)}</span>
              </div>

              <p style={{ fontSize: 13, color: '#5F5E5A', marginTop: 6 }}>
                Re: {post.subject.displayName} — {post.subject.roleTitle}, {post.subject.country}
              </p>

              <p style={{ marginTop: 10, marginBottom: 10, lineHeight: 1.6, color: '#1C2024' }}>{post.narrative}</p>

              <p style={{ fontSize: 13, color: '#5F5E5A' }}>
                Public-capacity justification: {post.publicCapacityJustification}
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
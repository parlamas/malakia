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
  conductDate: string;
  publicCapacityJustification: string;
  behavior: Behavior;
  author: { username: string };
  contests: Contest[];
}

interface PersonRecord {
  person: {
    id: string;
    displayName: string;
    disambiguators: string | null;
    country: string;
    personaCategory: string;
    roleTitle: string;
    roleStartDate: string;
    roleEndDate: string | null;
    verificationStatus: 'UNVERIFIED' | 'ADMIN_CONFIRMED' | 'DISPUTED';
  };
  record: { callousCount: number; civicCount: number; netScore: number } | null;
  posts: Post[];
  notice?: string;
}

const PERSONA_LABELS: Record<string, string> = {
  ELECTED_OFFICIAL: 'Elected official',
  APPOINTED_OFFICIAL: 'Appointed official',
  JOURNALIST: 'Journalist',
  GOVERNMENT_MEMBER: 'Government member',
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function PersonProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PersonRecord | null>(null);
  const [status, setStatus] = useState<'loading' | 'notfound' | 'ready'>('loading');

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
        }
      });
  }, [id]);

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
  const tenure = person.roleEndDate
    ? `${formatDate(person.roleStartDate)} – ${formatDate(person.roleEndDate)}`
    : `${formatDate(person.roleStartDate)} – present`;

  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={monoLabel}>PUBLIC RECORD</p>
        <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 32, color: '#1C2024', margin: '8px 0 4px' }}>
          {person.displayName}
        </h1>
        <p style={{ color: '#5F5E5A', margin: '0 0 4px' }}>
          {PERSONA_LABELS[person.personaCategory] ?? person.personaCategory} — {person.roleTitle}, {person.country}
        </p>
        <p style={{ ...monoLabel, marginTop: 0 }}>{tenure}</p>

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
          <div style={{ display: 'flex', gap: 16, marginTop: 28, marginBottom: 32 }}>
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
          <p style={{ fontSize: 13, color: '#5F5E5A', marginTop: -20, marginBottom: 32 }}>
            Record while serving as {person.roleTitle}, {tenure}. Not a claim about current conduct.
          </p>
        )}

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
                <span style={monoLabel}>{formatDate(post.conductDate)}</span>
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
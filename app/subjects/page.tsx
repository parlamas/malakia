// app/subjects/page.tsx
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SubjectResult {
  id: string;
  subjectType: string;
  displayName: string;
  disambiguators: string | null;
  description: string | null;
  roleTitle: string | null;
  verificationStatus: string;
  adminScaleValue: number | null;
  _count: { posts: number };
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

export default function SubjectsDirectoryPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/subjects${query ? `?q=${encodeURIComponent(query)}` : ''}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data.subjects ?? []);
          setLoading(false);
        });
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <main style={{ background: '#EDEAE2', minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <p style={{ fontFamily: 'ui-monospace, "IBM Plex Mono", monospace', fontSize: 13, color: '#5F5E5A', letterSpacing: '0.03em' }}>
          PUBLIC RECORDS
        </p>
        <h1 style={{ fontFamily: 'Georgia, "Iowan Old Style", serif', fontSize: 30, color: '#1C2024', margin: '8px 0 20px' }}>
          Browse records
        </h1>

        <input
          type="text"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1px solid #B4B2A9',
            background: '#fff',
            fontSize: 15,
            fontFamily: 'Inter, system-ui, sans-serif',
            marginBottom: 24,
            boxSizing: 'border-box',
          }}
        />

        {loading && <p style={{ color: '#5F5E5A' }}>Searching…</p>}

        {!loading && results.length === 0 && (
          <p style={{ color: '#5F5E5A' }}>
            {query ? 'No matching records.' : 'No records yet.'}
          </p>
        )}

        {results.map((s) => (
          <Link
            key={s.id}
            href={`/subjects/${s.id}`}
            style={{
              display: 'block',
              padding: '14px 18px',
              background: '#fff',
              border: '1px solid #B4B2A9',
              marginBottom: 10,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: '#1C2024' }}>{s.displayName}</span>
              <span style={{ fontSize: 12, color: '#5F5E5A' }}>{s._count.posts} record{s._count.posts !== 1 ? 's' : ''}</span>
            </div>
            <p style={{ fontSize: 13, color: '#5F5E5A', margin: '4px 0 0' }}>
              {SUBJECT_TYPE_LABELS[s.subjectType] ?? s.subjectType}
              {s.roleTitle ? ` — ${s.roleTitle}` : ''}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
// lib/displayId.ts

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

function formatDateTimeParts(date: Date): { dateStr: string; timeStr: string } {
  const dateStr =
    String(date.getUTCFullYear()) +
    pad(date.getUTCMonth() + 1, 2) +
    pad(date.getUTCDate(), 2);
  const timeStr =
    pad(date.getUTCHours(), 2) +
    pad(date.getUTCMinutes(), 2) +
    pad(date.getUTCSeconds(), 2);
  return { dateStr, timeStr };
}

export function computeDisplayId(prefix: 'P' | 'S' | 'R', username: string, createdAt: string | Date): string {
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const { dateStr, timeStr } = formatDateTimeParts(date);
  return `${prefix}${dateStr}-${username}-${timeStr}`;
}

export interface JudgmentEntryLike {
  side: 'NEGATIVE' | 'POSITIVE' | 'ZERO';
  magnitude: number;
  justification: string | null;
  order: number;
}

export interface LabeledEntry extends JudgmentEntryLike {
  label: string; // e.g. "-A", "+B", "Z"
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Assigns -A/-B.../+A/+B.../Z labels to a list of entries, in `order`.
export function labelEntries(entries: JudgmentEntryLike[]): LabeledEntry[] {
  const sorted = [...entries].sort((a, b) => a.order - b.order);
  let negIndex = 0;
  let posIndex = 0;
  return sorted.map((e) => {
    if (e.side === 'ZERO') {
      return { ...e, label: 'Z' };
    }
    if (e.side === 'NEGATIVE') {
      const label = `-${LETTERS[negIndex] ?? '?'}`;
      negIndex++;
      return { ...e, label };
    }
    const label = `+${LETTERS[posIndex] ?? '?'}`;
    posIndex++;
    return { ...e, label };
  });
}

// Net value: sum of positive magnitudes minus sum of negative magnitudes.
export function computeNetValue(entries: JudgmentEntryLike[]): number {
  return entries.reduce((sum, e) => {
    if (e.side === 'POSITIVE') return sum + e.magnitude;
    if (e.side === 'NEGATIVE') return sum - e.magnitude;
    return sum;
  }, 0);
}

export function computeLabel(netValue: number): 'Civic' | 'Callous' | 'Controversial' {
  if (netValue > 0) return 'Civic';
  if (netValue < 0) return 'Callous';
  return 'Controversial';
}
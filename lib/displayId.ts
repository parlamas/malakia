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
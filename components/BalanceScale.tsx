// components/BalanceScale.tsx
"use client"

interface BalanceScaleProps {
  value: number; // -1000 to +1000
  leftLabel?: string;
  rightLabel?: string;
}

export default function BalanceScale({
  value,
  leftLabel = 'CALLOUS',
  rightLabel = 'CIVIC-MINDED',
}: BalanceScaleProps) {
  const clamped = Math.max(-1000, Math.min(1000, value));
  const maxAngle = 25; // degrees at full tilt
  const angleDeg = (clamped / 1000) * maxAngle;

  const pivotX = 200;
  const pivotY = 90;

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <svg viewBox="0 0 400 260" width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}>
        {/* Static stand */}
        <polygon points="150,240 250,240 200,190" fill="#8B4513" />
        <rect x="196" y={pivotY} width="8" height={190 - pivotY} fill="#8B4513" />
        <circle cx={pivotX} cy={pivotY} r="8" fill="#B8860B" />

        {/* Rotating beam + chains + pans, all as one group so they tilt together */}
        <g
          style={{
            transformOrigin: `${pivotX}px ${pivotY}px`,
            transform: `rotate(${angleDeg}deg)`,
            transition: 'transform 0.9s cubic-bezier(0.34, 1.2, 0.64, 1)',
          }}
        >
          {/* Beam */}
          <line x1={pivotX - 120} y1={pivotY} x2={pivotX + 120} y2={pivotY} stroke="#8B4513" strokeWidth="6" strokeLinecap="round" />

          {/* Left chain + pan (callous side) */}
          <line x1={pivotX - 120} y1={pivotY} x2={pivotX - 120} y2={pivotY + 55} stroke="#5F5E5A" strokeWidth="2" />
          <path
            d={`M ${pivotX - 155} ${pivotY + 55} Q ${pivotX - 120} ${pivotY + 80} ${pivotX - 85} ${pivotY + 55}`}
            fill="none" stroke="#7A2E2E" strokeWidth="4" strokeLinecap="round"
          />
          <ellipse cx={pivotX - 120} cy={pivotY + 58} rx="36" ry="8" fill="#7A2E2E" opacity="0.85" />

          {/* Right chain + pan (civic side) */}
          <line x1={pivotX + 120} y1={pivotY} x2={pivotX + 120} y2={pivotY + 55} stroke="#5F5E5A" strokeWidth="2" />
          <path
            d={`M ${pivotX + 85} ${pivotY + 55} Q ${pivotX + 120} ${pivotY + 80} ${pivotX + 155} ${pivotY + 55}`}
            fill="none" stroke="#2F5D50" strokeWidth="4" strokeLinecap="round"
          />
          <ellipse cx={pivotX + 120} cy={pivotY + 58} rx="36" ry="8" fill="#2F5D50" opacity="0.85" />
        </g>

        {/* Labels */}
        <text x={pivotX - 120} y={pivotY + 100} textAnchor="middle" fontSize="12" fontFamily="ui-monospace, monospace" fill="#7A2E2E" letterSpacing="0.05em">
          {leftLabel}
        </text>
        <text x={pivotX + 120} y={pivotY + 100} textAnchor="middle" fontSize="12" fontFamily="ui-monospace, monospace" fill="#2F5D50" letterSpacing="0.05em">
          {rightLabel}
        </text>
      </svg>

      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: 22,
        color: clamped >= 0 ? '#2F5D50' : '#7A2E2E',
        marginTop: 8,
      }}>
        {clamped > 0 ? '+' : ''}{clamped}
      </p>
    </div>
  );
}
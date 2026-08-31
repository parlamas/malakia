// components/FlexibleDateSelect.tsx
"use client"

import { useState, useEffect } from "react";

export interface FlexibleDate {
  year: number | null;
  month: number | null;
  day: number | null;
  circa: boolean;
  unknown: boolean;
}

interface FlexibleDateSelectProps {
  value: FlexibleDate;
  onChange: (value: FlexibleDate) => void;
  yearRequired?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function FlexibleDateSelect({ value, onChange, yearRequired }: FlexibleDateSelectProps) {
  const [era, setEra] = useState<'BCE' | 'CE'>(value.year !== null && value.year < 0 ? 'BCE' : 'CE');
  const [yearAbs, setYearAbs] = useState<string>(value.year !== null ? String(Math.abs(value.year)) : '');
  const [month, setMonth] = useState<string>(value.month !== null ? String(value.month) : '');
  const [day, setDay] = useState<string>(value.day !== null ? String(value.day) : '');
  const [circa, setCirca] = useState<boolean>(value.circa);
  const [unknown, setUnknown] = useState<boolean>(value.unknown);

  useEffect(() => {
    const yearNum = yearAbs ? parseInt(yearAbs, 10) : null;
    const signedYear = yearNum !== null ? (era === 'BCE' ? -yearNum : yearNum) : null;
    onChange({
      year: signedYear,
      month: month ? parseInt(month, 10) : null,
      day: day ? parseInt(day, 10) : null,
      circa,
      unknown,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [era, yearAbs, month, day, circa, unknown]);

  const selectStyle: React.CSSProperties = {
    padding: '10px 8px',
    border: '1px solid #B4B2A9',
    background: '#fff',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        <input
          type="number"
          placeholder="Year"
          value={yearAbs}
          onChange={(e) => setYearAbs(e.target.value)}
          style={selectStyle}
          min={1}
          required={yearRequired}
        />
        <select value={era} onChange={(e) => setEra(e.target.value as 'BCE' | 'CE')} style={selectStyle}>
          <option value="BCE">BCE</option>
          <option value="CE">CE</option>
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} style={selectStyle} disabled={unknown}>
          <option value="">Month (unknown)</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select value={day} onChange={(e) => setDay(e.target.value)} style={selectStyle} disabled={unknown}>
          <option value="">Day (unknown)</option>
          {DAYS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <label style={{ fontSize: 12, color: '#5F5E5A', display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="checkbox"
            checked={circa}
            onChange={(e) => setCirca(e.target.checked)}
          />
          Approximate (circa)
        </label>
        <label style={{ fontSize: 12, color: '#5F5E5A', display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            type="checkbox"
            checked={unknown}
            onChange={(e) => {
              setUnknown(e.target.checked);
              if (e.target.checked) {
                setMonth('');
                setDay('');
              }
            }}
          />
          Month/day not known
        </label>
      </div>
    </div>
  );
}
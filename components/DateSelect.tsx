// components/DateSelect.tsx
"use client"

import { useState, useEffect } from "react";

interface DateSelectProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  required?: boolean;
  style?: React.CSSProperties;
}

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

export default function DateSelect({ value, onChange, required, style }: DateSelectProps) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  // Parse incoming value (e.g. from an existing record) into parts
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      setYear(y ?? '');
      setMonth(m ?? '');
      setDay(d ?? '');
    }
  }, [value]);

  function emit(y: string, m: string, d: string) {
    if (y && m && d) {
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange('');
    }
  }

  const selectStyle: React.CSSProperties = {
    padding: '10px 8px',
    border: '1px solid #B4B2A9',
    background: '#fff',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
    ...style,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
      <select
        value={month}
        onChange={(e) => { setMonth(e.target.value); emit(year, e.target.value, day); }}
        style={selectStyle}
        required={required}
      >
        <option value="">Month</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      <select
        value={day}
        onChange={(e) => { setDay(e.target.value); emit(year, month, e.target.value); }}
        style={selectStyle}
        required={required}
      >
        <option value="">Day</option>
        {DAYS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Year"
        value={year}
        onChange={(e) => { setYear(e.target.value); emit(e.target.value, month, day); }}
        style={selectStyle}
        min={1900}
        max={2100}
        required={required}
      />
    </div>
  );
}
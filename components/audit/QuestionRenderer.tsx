'use client';

import { Question } from '@/lib/questions';

interface Props {
  question: Question;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
}

const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'rgba(26,32,64,0.6)',
  border: '1px solid rgba(212,168,67,0.2)',
  borderRadius: 8,
  color: '#F5F5F5',
  fontSize: 15,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

export default function QuestionRenderer({ question, value, onChange }: Props) {
  const { type, options, min = 1, max = 5, placeholder, helperText } = question;

  if (type === 'scale') {
    const numVal = typeof value === 'number' ? value : (min === 0 ? 0 : Math.round((min + max) / 2));
    const pct = ((numVal - min) / (max - min)) * 100;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#8B9BAE' }}>{min === 0 ? '0 hrs' : min === 1 ? 'Low' : min}</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#D4A843' }}>{numVal}{min === 0 ? ' hrs' : max === 5 ? '/5' : ''}</span>
          <span style={{ fontSize: 13, color: '#8B9BAE' }}>{max === 40 ? '40+ hrs' : max === 5 ? 'High' : max}</span>
        </div>
        <div style={{ position: 'relative', padding: '8px 0' }}>
          <div style={{ height: 4, background: 'rgba(139,155,174,0.2)', borderRadius: 2, position: 'relative', overflow: 'visible' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #D4A843, #f0c866)', borderRadius: 2, transition: 'width 0.1s' }} />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={numVal}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0, height: 20, cursor: 'pointer', zIndex: 1 }}
          />
          <div style={{ position: 'absolute', top: -8, left: `calc(${pct}% - 10px)`, width: 20, height: 20, background: '#D4A843', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(212,168,67,0.2)', pointerEvents: 'none', transition: 'left 0.1s' }} />
        </div>
        {helperText && <div style={{ fontSize: 12, color: '#8B9BAE', marginTop: 16 }}>{helperText}</div>}
      </div>
    );
  }

  if (type === 'select') {
    return (
      <select
        value={value as string || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputBase, padding: '14px 16px', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%238B9BAE\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
      >
        <option value="" disabled>Select an option…</option>
        {options?.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (type === 'radio') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {options?.map((opt) => (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '14px 20px', background: value === opt ? 'rgba(212,168,67,0.08)' : 'rgba(26,32,64,0.4)', border: `1px solid ${value === opt ? 'rgba(212,168,67,0.4)' : 'rgba(212,168,67,0.12)'}`, borderRadius: 10, transition: 'all 0.2s', userSelect: 'none' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${value === opt ? '#D4A843' : 'rgba(139,155,174,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 0.2s' }}>
              {value === opt && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4A843' }} />}
            </div>
            <input type="radio" name={question.id} value={opt} checked={value === opt} onChange={() => onChange(opt)} style={{ display: 'none' }} />
            <span style={{ fontSize: 15, color: value === opt ? '#F5F5F5' : '#8B9BAE' }}>{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <textarea
        value={value as string || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{ ...inputBase, padding: '14px 16px', resize: 'vertical', minHeight: 120 }}
      />
    );
  }

  // Default: text input
  return (
    <input
      type="text"
      value={value as string || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputBase, padding: '14px 16px' }}
    />
  );
}

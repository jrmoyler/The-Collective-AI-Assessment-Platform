'use client';

import { Question } from '@/lib/questions';

interface Props {
  question: Question;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  invalid?: boolean;
}

// "1 = Very inefficient, 5 = Highly optimized" → ["Very inefficient", "Highly optimized"]
function scaleEnds(helper?: string): [string, string] {
  const m = helper?.match(/1\s*=\s*([^,]+),\s*5\s*=\s*(.+)/);
  return m ? [m[1].trim(), m[2].trim()] : ['Low', 'High'];
}

export default function QuestionRenderer({ question, value, onChange, invalid }: Props) {
  const { id, type, options, min = 1, max = 5, placeholder, helperText } = question;
  const describedBy = invalid ? `${id}-err` : undefined;

  // Hours per week, 0–40. The shown value is always the recorded value.
  if (type === 'scale' && min === 0) {
    const v = typeof value === 'number' ? value : 0;
    const p = ((v - min) / (max - min)) * 100;
    return (
      <div className="hours">
        <div className="val" aria-hidden="true"><b>{v === max ? `${max}+` : v}</b><span>hours a week</span></div>
        <input
          type="range" min={min} max={max} step={1} value={v}
          aria-labelledby={`${id}-label`} aria-valuetext={`${v} hours a week`} aria-describedby={describedBy} aria-invalid={invalid || undefined}
          style={{ ['--p' as string]: `${p}%` }}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="ticks" aria-hidden="true"><span>0</span><span>10</span><span>20</span><span>30</span><span>40+</span></div>
        {helperText && <div className="helper" style={{ marginTop: 10 }}>{helperText}</div>}
      </div>
    );
  }

  // 1–5 rating as five keys. Nothing is chosen until the visitor chooses.
  if (type === 'scale') {
    const [lo, hi] = scaleEnds(helperText);
    const v = typeof value === 'number' ? value : undefined;
    const keys = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const move = (dir: number, group: HTMLElement) => { const next = Math.min(max, Math.max(min, (v ?? (dir > 0 ? min - 1 : max + 1)) + dir)); onChange(next); (group.querySelectorAll('button')[next - min] as HTMLButtonElement)?.focus(); };
    return (
      <div>
        <div className="scale5" role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={describedBy} aria-invalid={invalid || undefined}
          onKeyDown={(e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); move(1, e.currentTarget); } if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); move(-1, e.currentTarget); } }}>
          {keys.map((k) => (
            <button key={k} type="button" role="radio" aria-checked={v === k} aria-label={`${k}${k === min ? `, ${lo}` : k === max ? `, ${hi}` : ''}`}
              tabIndex={v === k || (v === undefined && k === min) ? 0 : -1}
              className={v !== undefined && k < v ? 'under' : undefined}
              onClick={() => onChange(k)}>
              {k}
            </button>
          ))}
        </div>
        <div className="ends" aria-hidden="true"><span>{lo}</span><span>{hi}</span></div>
      </div>
    );
  }

  // Short option lists render as choices you can see all at once; long lists stay a menu.
  if ((type === 'select' && (options?.length ?? 0) <= 7) || type === 'radio') {
    return (
      <div className={`choices${(options?.length ?? 0) > 4 ? ' two' : ''}`} role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={describedBy} aria-invalid={invalid || undefined}>
        {options?.map((opt) => (
          <button key={opt} type="button" role="radio" aria-checked={value === opt} className="choice" onClick={() => onChange(opt)}>
            <i aria-hidden="true" />{opt}
          </button>
        ))}
      </div>
    );
  }

  if (type === 'select') {
    return (
      <select className="field" value={(value as string) || ''} aria-labelledby={`${id}-label`} aria-describedby={describedBy} aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>Choose one</option>
        {options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }

  if (type === 'textarea') {
    return (
      <textarea className="field" value={(value as string) || ''} placeholder={placeholder} rows={4}
        aria-labelledby={`${id}-label`} aria-describedby={describedBy} aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)} />
    );
  }

  const isEmail = id.includes('email');
  const isUrl = id.includes('website');
  return (
    <input className="field" type={isEmail ? 'email' : isUrl ? 'url' : 'text'} value={(value as string) || ''} placeholder={placeholder}
      autoComplete={isEmail ? 'email' : id.includes('contact_name') ? 'name' : id.includes('company_name') ? 'organization' : isUrl ? 'url' : 'off'}
      aria-labelledby={`${id}-label`} aria-describedby={describedBy} aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)} />
  );
}

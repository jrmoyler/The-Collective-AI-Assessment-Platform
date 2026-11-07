'use client';

import { useEffect, useState } from 'react';
import SilkField from '@/components/SilkField';

const STEPS = [
  'Reading your business impact answers',
  'Scoring problem clarity and sponsorship',
  'Scoring data readiness',
  'Scoring culture and leadership',
  'Scoring technology fit',
  'Scoring governance',
  'Estimating hours AI could hand back',
  'Choosing agents and the division to call first',
];

export default function LoadingAssessment() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(x + 1, STEPS.length - 1)), 1600);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <SilkField intensity={1} />
      <div className="veilgrad" />
      <section className="analyzing" aria-live="polite" aria-busy="true">
        <div className="box">
          <div className="kicker">The Collective is reading your answers</div>
          <h1>Building your readiness report.</h1>
          <p className="muted" style={{ marginTop: 14 }}>This usually takes 10 to 30 seconds. Keep this tab open.</p>
          <ol>
            {STEPS.map((s, k) => (
              <li key={s} className={k < i ? 'done' : k === i ? 'on' : ''}><i aria-hidden="true">{k < i ? '✓' : ''}</i>{s}</li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

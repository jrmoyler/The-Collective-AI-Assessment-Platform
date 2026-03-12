'use client';

import { useEffect, useState } from 'react';

const steps = [
  'Analyzing your business impact metrics...',
  'Evaluating problem definition clarity...',
  'Assessing data readiness indicators...',
  'Measuring organizational readiness...',
  'Reviewing technology infrastructure...',
  'Calculating ethics & governance score...',
  'Running time-savings projections...',
  'Generating personalized recommendations...',
  'Finalizing your AI readiness report...',
];

export default function LoadingAssessment() {
  const [stepIdx, setStepIdx] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, steps.length - 1));
    }, 1800);

    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);

    return () => {
      clearInterval(stepInterval);
      clearInterval(dotInterval);
    };
  }, []);

  const progress = ((stepIdx + 1) / steps.length) * 100;

  return (
    <div style={{ backgroundColor: '#0B0F1C', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F5F5', padding: 40 }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {/* Animated rings */}
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 48px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(212,168,67,0.15)', animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }} />
          <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '2px solid rgba(212,168,67,0.25)', animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite 0.5s' }} />
          <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', border: '2px solid rgba(212,168,67,0.4)', animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite 1s' }} />
          <div style={{ position: 'absolute', inset: 24, borderRadius: '50%', background: 'rgba(212,168,67,0.1)', border: '2px solid #D4A843', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 28 }}>🤖</span>
          </div>
          <style>{`
            @keyframes ping {
              75%, 100% { transform: scale(1.3); opacity: 0; }
            }
          `}</style>
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
          Analyzing Your Responses
        </h2>
        <p style={{ color: '#8B9BAE', marginBottom: 48, lineHeight: 1.6 }}>
          Our senior AI consultant is reviewing your audit data and calculating your personalized readiness score.
        </p>

        {/* Progress bar */}
        <div style={{ background: 'rgba(139,155,174,0.15)', borderRadius: 4, height: 4, marginBottom: 32, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #D4A843, #f0c866)', transition: 'width 1.5s ease', borderRadius: 4 }} />
        </div>

        {/* Current step */}
        <div style={{ background: 'rgba(26,32,64,0.6)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 10, padding: '16px 24px', marginBottom: 32 }}>
          <div style={{ fontSize: 14, color: '#D4A843', fontWeight: 600 }}>
            {steps[stepIdx]}{dots}
          </div>
        </div>

        {/* Completed steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {steps.slice(0, stepIdx).map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(139,155,174,0.6)', textAlign: 'left' }}>
              <span style={{ color: '#D4A843', flexShrink: 0 }}>✓</span>
              <span>{step.replace('...', '')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

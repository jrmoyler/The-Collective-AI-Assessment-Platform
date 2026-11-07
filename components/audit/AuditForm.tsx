'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { sections, questions } from '@/lib/questions';
import { AuditAnswers } from '@/types';
import QuestionRenderer from './QuestionRenderer';
import LoadingAssessment from './LoadingAssessment';
import SilkField from '@/components/SilkField';

const STORAGE_KEY = 'collective_audit_answers';
const SECTION_KEY = 'collective_audit_section';
type Answers = Partial<AuditAnswers>;

const isHours = (id: string) => questions.find((q) => q.id === id)?.min === 0;

export default function AuditForm() {
  const router = useRouter();
  const [current, setCurrent] = useState(1);
  const [reached, setReached] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const headRef = useRef<HTMLHeadingElement>(null);
  const restored = useRef(false);

  // Resume where the visitor left off.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setAnswers(JSON.parse(saved));
      const sec = Number(localStorage.getItem(SECTION_KEY));
      if (sec >= 1 && sec <= sections.length) { setCurrent(sec); setReached(sec); }
    } catch {}
    restored.current = true;
  }, []);

  useEffect(() => {
    if (!restored.current) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); localStorage.setItem(SECTION_KEY, String(current)); } catch {}
  }, [answers, current]);

  const total = sections.length;
  const sectionQs = questions.filter((q) => q.section === current);
  const valueOf = (id: string) => {
    const v = answers[id as keyof AuditAnswers];
    // Hour sliders show 0 by default, so 0 counts as an answer.
    return v === undefined && isHours(id) ? 0 : v;
  };
  const answered = questions.filter((q) => { const v = valueOf(q.id); return v !== undefined && v !== ''; }).length;
  const progress = Math.round((answered / questions.length) * 100);

  const validate = () => {
    const errs: Record<string, string> = {};
    sectionQs.forEach((q) => {
      const v = valueOf(q.id);
      if (q.required && (v === undefined || v === null || String(v).trim() === '')) errs[q.id] = 'Answer this one to continue.';
      if (q.id === 'q25_contact_email' && v && !/^\S+@\S+\.\S+$/.test(String(v))) errs[q.id] = 'That email does not look right.';
      if (q.id === 'q24_website' && v && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(String(v))) errs[q.id] = 'Use a full web address, like yourcompany.com.';
    });
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) document.getElementById(`q-${first}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    return !first;
  };

  const goTo = (n: number) => {
    setCurrent(n); setReached((r) => Math.max(r, n)); setErrors({});
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(() => headRef.current?.focus({ preventScroll: true }), 350);
  };

  const submit = async () => {
    setLoading(true); setSubmitError('');
    // Hour sliders left at 0 are sent as 0, not missing.
    const full: Answers = { ...answers };
    questions.forEach((q) => { if (isHours(q.id) && full[q.id as keyof AuditAnswers] === undefined) (full as Record<string, unknown>)[q.id] = 0; });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch('/api/assess', { signal: controller.signal, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: full }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.assessment) throw new Error(data.error || 'The analysis did not come back.');
      sessionStorage.setItem('audit_result', JSON.stringify(data.assessment));
      sessionStorage.setItem('audit_answers', JSON.stringify(full));
      try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(SECTION_KEY); } catch {}
      router.push('/results');
    } catch (err) {
      setLoading(false);
      setSubmitError(`${err instanceof Error ? err.message : 'Something went wrong.'} Your answers are saved on this device. Try again in a moment.`);
    } finally { clearTimeout(timeout); }
  };

  const next = () => {
    if (!validate()) return;
    if (current < total) goTo(current + 1); else submit();
  };

  const set = (id: string, v: string | number) => {
    setAnswers((a) => ({ ...a, [id]: v }));
    if (errors[id]) setErrors((e) => { const n = { ...e }; delete n[id]; return n; });
  };

  if (loading) return <LoadingAssessment />;

  const section = sections[current - 1];
  const sectionDone = sectionQs.filter((q) => { const v = valueOf(q.id); return v !== undefined && v !== ''; }).length;

  return (
    <main className="flow">
      <SilkField intensity={0.55} />
      <div className="veilgrad" />
      <div className="flow-bar" role="progressbar" aria-label="Questions answered" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progress}%` }} /></div>
      <div className="flow-grid" style={{ position: 'relative', zIndex: 1 }}>
        <aside className="rail" aria-label="Sections">
          <ol>
            {sections.map((s) => (
              <li key={s.id} className={s.id === current ? 'on' : s.id < reached || s.id < current ? 'done' : ''}>
                <button type="button" disabled={s.id > reached} onClick={() => goTo(s.id)} aria-current={s.id === current ? 'step' : undefined}>
                  <span className="dot">{s.id < current || (s.id < reached && s.id !== current) ? '✓' : s.id}</span>
                  <span>{s.title.replace(' & ', ' and ')}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="note"><b>{answered} / {questions.length}</b>answered, saved on this device</div>
        </aside>

        <div className="flow-main">
          <nav className="mobile-sections" aria-label="Audit sections">{sections.map((s) => <button key={s.id} type="button" disabled={s.id > reached} aria-current={s.id === current ? 'step' : undefined} aria-label={`Section ${s.id}: ${s.title}`} onClick={() => goTo(s.id)}>{String(s.id).padStart(2, '0')}</button>)}</nav>
          <header className="qhead">
            <div className="audit-status"><span className="kicker">Section {current} of {total}</span><span className="mono">{progress}% complete · saved locally</span></div>
            <h1 ref={headRef} tabIndex={-1} style={{ outline: 'none' }}>{section.title.replace(' & ', ' and ')}</h1>
            <p>{section.description}</p>
          </header>

          <ol className="qlist">
            {sectionQs.map((q) => {
              const n = questions.findIndex((x) => x.id === q.id) + 1;
              return (
                <li key={q.id} id={`q-${q.id}`} className={`q${errors[q.id] ? ' err' : ''}`}>
                  <span className="qn">{String(n).padStart(2, '0')}</span>
                  <div className="qlabel" id={`${q.id}-label`}>{q.label}{!q.required && <span className="opt">Optional</span>}</div>
                  <div className="ctl"><QuestionRenderer question={q} value={valueOf(q.id) as string | number | undefined} onChange={(v) => set(q.id, v)} invalid={!!errors[q.id]} /></div>
                  {errors[q.id] && <div className="qerr" id={`${q.id}-err`} role="alert">{errors[q.id]}</div>}
                </li>
              );
            })}
          </ol>

          {submitError && <div className="banner" role="alert">{submitError}</div>}

          <nav className="flow-nav" aria-label="Audit navigation">
            {current > 1 ? <button type="button" className="btn" onClick={() => goTo(current - 1)}>← Back</button> : <span />}
            <span className="count">{sectionDone} of {sectionQs.length} in this section</span>
            <button type="button" className="btn btn-gold" onClick={next}>{current === total ? 'Get my readiness report' : 'Continue'}</button>
          </nav>
          <div style={{ height: 40 }} />
        </div>
      </div>
    </main>
  );
}

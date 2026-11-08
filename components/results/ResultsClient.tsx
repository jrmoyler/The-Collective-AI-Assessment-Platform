'use client';

import { useEffect, useRef, useState } from 'react';
import SceneHost from '@/components/SceneHost';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AssessmentResult, AuditAnswers } from '@/types';
import { SITE, divisionUrl, pickDivisions } from '@/lib/links';
import { Tile } from '@/components/Marks';
import SilkField from '@/components/SilkField';

const DIMS = [
  { key: 'strategy', label: 'Strategy', desc: 'Problem clarity, outcomes and an executive sponsor' },
  { key: 'data', label: 'Data', desc: 'Where your data lives, how clean it is, who governs it' },
  { key: 'culture', label: 'Culture', desc: 'Team openness, internal capacity, leadership alignment' },
  { key: 'tech', label: 'Technology', desc: 'Stack compatibility, operations maturity, room to scale' },
  { key: 'governance', label: 'Governance', desc: 'Privacy, bias and responsible-AI policies' },
] as const;

function Pentagon({ s }: { s: Record<string, number> }) {
  const cx = 210, cy = 210, R = 150;
  const pt = (i: number, r: number) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const; };
  const poly = (r: number) => DIMS.map((_, i) => pt(i, r).join(',')).join(' ');
  const shape = DIMS.map((d, i) => pt(i, (Math.max(4, s[d.key]) / 100) * R).join(',')).join(' ');
  return (
    <svg className="pent" viewBox="0 0 420 420" role="img" aria-label={`Readiness shape: ${DIMS.map((d) => `${d.label} ${s[d.key]}`).join(', ')}`}>
      {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} className={`ring${f === 1 ? '' : ' tick'}`} points={poly(R * f)} />)}
      {DIMS.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} className="axis" x1={cx} y1={cy} x2={x} y2={y} />; })}
      <polygon className="shape" points={shape} />
      {DIMS.map((d, i) => { const [x, y] = pt(i, (Math.max(4, s[d.key]) / 100) * R); return <circle key={d.key} className="dot" cx={x} cy={y} r={4} />; })}
      {DIMS.map((d, i) => {
        const [x, y] = pt(i, R + 24); const anchor = x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle';
        return <text key={d.key} className="lbl" x={x} y={y + 3} textAnchor={anchor}>{d.label} {s[d.key]}</text>;
      })}
    </svg>
  );
}

export default function ResultsClient() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [answers, setAnswers] = useState<Partial<AuditAnswers> | null>(null);
  const [shown, setShown] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const res = sessionStorage.getItem('audit_result');
    if (!res) { router.replace('/audit'); return; }
    try { setResult(JSON.parse(res)); const ans = sessionStorage.getItem('audit_answers'); if (ans) setAnswers(JSON.parse(ans)); }
    catch { router.replace('/audit'); }
  }, [router]);

  useEffect(() => {
    if (!result || !root.current) return;
    requestAnimationFrame(() => setShown(true));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
    root.current.querySelectorAll('.rv2').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [result]);

  if (!result) return <main className="analyzing"><div className="kicker">Loading your report</div></main>;

  const s = result.readiness_scores as unknown as Record<string, number>;
  const { gap, picks } = pickDivisions(result.readiness_scores);
  const gapLabel = DIMS.find((d) => d.key === gap)?.label ?? 'Strategy';
  const company = answers?.q25_company_name || '';
  const first = (answers?.q25_contact_name || '').split(' ')[0];
  const high = result.priority === 'High';
  const calendlyBase = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/collectiveai/strategy-call';
  const calendlyUrl = `${calendlyBase}?name=${encodeURIComponent(answers?.q25_contact_name || '')}&email=${encodeURIComponent(answers?.q25_contact_email || '')}&a1=${encodeURIComponent(company)}&a2=${result.overall_readiness}`;
  const C = 2 * Math.PI * 96;

  return (
    <div className="report" ref={root}>
      <SilkField intensity={0.7} />
      <div className="veilgrad" />
      <main className="sheet" style={{ position: 'relative', zIndex: 1 }}>
        <section className="rhead" id="report-summary">
          <div>
            <div className="kicker">AI readiness report{company ? ` for ${company}` : ''}</div>
            <h1>{first ? `${first}, here is` : 'Here is'} where you stand.</h1>
            <p className="lede" style={{ marginTop: 22 }}>Five scores out of 100, the hours AI could realistically hand back each week, and the division to call first.</p>
          </div>
          <div className="scorecard">
            <div className="dial">
              <svg viewBox="0 0 220 220" aria-hidden="true">
                <circle className="trk" cx="110" cy="110" r="96" />
                <circle className="val" cx="110" cy="110" r="96" strokeDasharray={C} strokeDashoffset={shown ? C * (1 - result.overall_readiness / 100) : C} />
              </svg>
              <div className="num"><div><b>{result.overall_readiness}</b><span>Overall readiness</span></div></div>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <span className={`chip ${result.priority}`}>{result.priority} readiness</span>
              <p className="muted" style={{ fontSize: '.95rem', maxWidth: '30ch' }}>{high ? 'Ready to put agents into production now.' : result.priority === 'Medium' ? 'One or two gaps to close before a first project.' : 'Foundations first; the value comes after.'}</p>
            </div>
          </div>
        </section>

        <nav className="report-nav" aria-label="Report chapters"><a href="#report-summary">01 / Overview</a><a href="#report-dimensions">02 / Dimensions</a><a href="#report-division">03 / Your team</a><a href="#report-next">04 / Next step</a></nav>
        <div className="stats rv2">
          <div><span className="k">Hours back per week</span><b>{result.time_savings_estimate.hours_per_week}<small>hrs</small></b><p>{result.time_savings_estimate.processes.join(' · ')}</p></div>
          <div><span className="k">Projected gain</span><b style={{ fontSize: '1.5rem', lineHeight: 1.2 }}>{result.roi_proxy}</b></div>
          <div><span className="k">Start with</span><b style={{ fontSize: '1.5rem', lineHeight: 1.2 }}>{gapLabel}</b><p>Your lowest score, and the gap most likely to stall a first project.</p></div>
        </div>

        <div className="verdict rv2" style={{ marginTop: 14 }}>
          <div className="kicker">Consultant read</div>
          <div style={{ display: 'grid', gap: 14 }}>
            <p>{result.personalized_summary}</p>
            <p style={{ fontSize: '.98rem', color: '#BFDCCF' }}>{result.time_savings_estimate.explanation}</p>
          </div>
        </div>

        <section className="sec2" id="report-dimensions" style={{ marginTop: 40 }}>
          <div className="kicker">Five dimensions</div>
          <h2>Your readiness, by dimension</h2>
          <figure className="crystal-band rv2"><SceneHost scene="crystal" still="/img/readiness-crystal" scores={s} /><figcaption>Your readiness crystal: each facet extends to one of your five scores. A live scene, drawn in your browser</figcaption></figure>
          <div className="dims">
            <div className="rv2"><Pentagon s={s} /></div>
            <ul className="bars rv2">
              {DIMS.map((d) => {
                const v = s[d.key]; const low = d.key === gap;
                return (
                  <li key={d.key}>
                    <div className="top"><b>{d.label}{low && <span className="kicker" style={{ marginLeft: 10, fontSize: '.66rem' }}>Lowest</span>}</b><span className={low ? 'low' : ''}>{v}</span></div>
                    <div className="trk"><i className={low ? 'low' : ''} style={{ ['--v' as string]: v / 100 }} /></div>
                    <p>{d.desc}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="sec2" id="report-division">
          <div className="kicker">Where to get help first</div>
          <h2>{gapLabel} is your lowest score. Start here.</h2>
          <div className="routecards rv2">
            {picks.map((d) => (
              <a key={d.slug} className="routecard" href={divisionUrl(d.slug)} target="_blank" rel="noopener">
                <Tile mark={d.slug} size={52} />
                <div><b>{d.name}</b><p>{d.why}</p><em>Open {d.name} ↗</em></div>
              </a>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 16, fontSize: '.92rem' }}>Every Collective AI division shares one intelligence layer. <a href={`${SITE.divisions}/`} target="_blank" rel="noopener" style={{ color: 'var(--champagne)' }}>See all eleven ↗</a></p>
        </section>

        <section className="sec2">
          <div className="kicker">Agents that fit</div>
          <h2>Where agents would start for you</h2>
          <ol className="agents rv2">
            {result.recommended_agents.map((a, i) => <li key={a}><span>{String(i + 1).padStart(2, '0')}</span>{a}</li>)}
          </ol>
        </section>

        <section className="sec2" id="report-next" style={{ borderTop: 0, paddingTop: 0 }}>
          <div className="nextstep rv2">
            <div className="kicker" style={{ color: 'var(--champagne)' }}>Next step</div>
            <h2>{high ? 'You qualify for a direct strategy call.' : 'Talk it through with The Collective.'}</h2>
            <p>{high ? 'Thirty minutes with the team to pick your first two workflows and how to measure them. Your answers come with you, so there is no intake form.' : `Thirty minutes on closing your ${gapLabel.toLowerCase()} gap and what a first project would look like once it is closed.`}</p>
            <div className="actions">
              <a className="btn btn-gold" href={calendlyUrl} target="_blank" rel="noopener" style={{ padding: '15px 22px' }}>Book the strategy call</a>
              <a className="btn" href={SITE.hub} style={{ borderColor: 'rgba(254,243,199,.35)' }}>Other ways to work with us</a>
            </div>
            <span className="small">Free, no obligation, 30 minutes</span>
          </div>
          <div className="actions" style={{ marginTop: 24 }}>
            <button type="button" className="btn" onClick={() => window.print()}>Save as PDF</button>
            <Link className="btn" href="/audit" onClick={() => { sessionStorage.removeItem('audit_result'); sessionStorage.removeItem('audit_answers'); }}>Retake the audit</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

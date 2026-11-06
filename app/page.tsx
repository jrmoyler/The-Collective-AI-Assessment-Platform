import Link from 'next/link';
import { SITE, divisionUrl } from '@/lib/links';
import { Tile } from '@/components/Marks';
import SilkField from '@/components/SilkField';

// Five readiness dimensions, as drawn on the results page. Illustrative shape only: no numbers claimed.
const DIMS = ['Strategy', 'Data', 'Culture', 'Technology', 'Governance'];
const SHAPE = [0.78, 0.46, 0.64, 0.58, 0.36];

function Pentagon() {
  const cx = 210, cy = 210, R = 150;
  const pt = (i: number, r: number) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const poly = (r: number) => Array.from({ length: 5 }, (_, i) => pt(i, r).join(',')).join(' ');
  const shape = SHAPE.map((v, i) => pt(i, v * R).join(',')).join(' ');
  return (
    <svg className="pent" viewBox="0 0 420 420" role="img" aria-label="Five readiness dimensions drawn as a pentagon: strategy, data, culture, technology, governance">
      {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} className={`ring${f === 1 ? '' : ' tick'}`} points={poly(R * f)} />)}
      {DIMS.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} className="axis" x1={cx} y1={cy} x2={x} y2={y} />; })}
      <polygon className="shape" points={shape} />
      {SHAPE.map((v, i) => { const [x, y] = pt(i, v * R); return <circle key={i} className="dot" cx={x} cy={y} r={3.5} />; })}
      {DIMS.map((d, i) => {
        const [x, y] = pt(i, R + 22);
        const anchor = x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle';
        return <text key={d} className="lbl" x={x} y={y + 3} textAnchor={anchor}>{d}</text>;
      })}
      <text className="cap" x={cx} y={408} textAnchor="middle">illustrative shape · your scores draw your own</text>
    </svg>
  );
}

const SECTIONS = [
  ['01', 'Business impact and commercial metrics', 'Targets, time spent on repetitive work, lead volume and conversion.'],
  ['02', 'Problem definition and use-case clarity', 'How specific the AI use cases are, who sponsors them, the outcome timeline.'],
  ['03', 'Data readiness', 'Where the data lives, how clean it is, who governs it.'],
  ['04', 'Organizational and cultural readiness', 'Team openness, internal capacity, leadership alignment.'],
  ['05', 'Technology and infrastructure fit', 'Stack compatibility, operations maturity, room to scale.'],
  ['06', 'Ethics, governance and compliance', 'Responsible-AI policies and the regulatory ground you stand on.'],
];

const ROUTES: [string, string, string][] = [
  ['Strategy', 'the-collective', 'The Collective'],
  ['Data', 'binary-loom', 'Binary Loom'],
  ['Culture', 'hybrid-living', 'Hybrid Living'],
  ['Technology', 'zenflow', 'ZenFlow'],
  ['Governance', 'juris-guard', 'Juris Guard'],
];

export default function Home() {
  return (
    <>
    <SilkField />
    <div className="veilgrad" />
    <main className="sheet" style={{ position: 'relative', zIndex: 1 }}>
      <div className="sheet-head"><span className="mono"><b>T-01</b> · AI Readiness Audit</span><span className="mono">Run by The Collective · Collective AI Inc</span></div>

      <div className="block">
        <div className="margin"><b>§ 01</b>The audit<small>Twenty-five questions. About six minutes. Five scores.</small></div>
        <div className="body">
          <div className="hero-tc">
            <div>
              <h1>Where does your business <span className="accent">actually</span> stand with AI?</h1>
              <p className="lede" style={{ marginTop: 24 }}>Twenty-five questions about how your business runs today. You get five readiness scores, an estimate of the hours AI could give back each week, and the Collective AI division to call first.</p>
              <div className="actions" style={{ marginTop: 30 }}>
                <Link className="btn btn-gold btn-lg" href="/audit">Take the free audit →</Link>
                <span className="mono">No card · no commitment</span>
              </div>
              <div className="memo" style={{ marginTop: 36 }}>
                <span>The AI Readiness Audit</span>
                <em>Free</em>
                <b>25 questions · about 6 minutes · 5 scores</b>
                <span>Your report appears the moment you finish.</span>
              </div>
            </div>
            <Pentagon />
          </div>
        </div>
      </div>

      <div className="block">
        <div className="margin"><b>§ 02</b>You get<small>Everything appears the moment you finish.</small></div>
        <div className="body">
          <h2>What comes back</h2>
          <ul className="rows">
            <li><span className="k">SCORE</span><div><strong>Five readiness scores and one overall</strong><p>Strategy, data, culture, technology, governance. Each scored on what you told us, not on an industry average.</p></div></li>
            <li><span className="k">HOURS</span><div><strong>Hours per week AI could give back</strong><p>An estimate built from how much of your week is repetitive work. Treat it as a starting point for the conversation, not a promise.</p></div></li>
            <li><span className="k">AGENTS</span><div><strong>Which agents and workflows fit</strong><p>Specific to your industry, size and answers. Not a generic list.</p></div></li>
            <li><span className="k">ROADMAP</span><div><strong>Prioritized next steps</strong><p>Ordered from where you are today, with the lowest score first.</p></div></li>
            <li><span className="k">ROUTE</span><div><strong>The division to call first</strong><p>Your weakest dimension maps to the Collective AI division built to fix it. See the routing below.</p></div></li>
            <li><span className="k">CALL</span><div><strong>A strategy call, if it fits</strong><p>High-readiness organizations get a direct invitation to a 30-minute call with The Collective.</p></div></li>
          </ul>
        </div>
      </div>

      <div className="block">
        <div className="margin"><b>§ 03</b>Routing<small>Lowest score decides who you talk to.</small></div>
        <div className="body">
          <h2>Your weakest score picks the division</h2>
          <ol className="routes">
            {ROUTES.map(([dim, slug, name]) => (
              <li key={slug}><span className="dimn">{dim} is lowest →</span><a href={divisionUrl(slug)}><Tile mark={slug} size={30} />{name}</a></li>
            ))}
          </ol>
          <p className="muted" style={{ fontSize: '.92rem' }}>Data and technology gaps often route to two divisions at once; the results page shows both.</p>
        </div>
      </div>

      <div className="block">
        <div className="margin"><b>§ 04</b>The ground covered<small>Six sections. The same ground a first consulting meeting covers.</small></div>
        <div className="body">
          <h2>Six sections, twenty-five questions</h2>
          <ul className="rows">
            {SECTIONS.map(([n, t, d]) => <li key={n}><span className="k">{n}</span><div><strong>{t}</strong><p>{d}</p></div></li>)}
          </ul>
        </div>
      </div>

      <div className="block">
        <div className="margin"><b>§ 05</b>Who built it<small>The Collective, Columbus, Ohio.</small></div>
        <div className="body">
          <h2>Built from the frameworks we use with clients</h2>
          <p className="lede">The Collective is the AI strategy consulting division of Collective AI Inc. This audit is the first thing we run in a real engagement, opened up so you can run it yourself. Your answers are stored encrypted and used for one follow-up, if you ask for one.</p>
          <div className="actions" style={{ marginTop: 28 }}>
            <Link className="btn btn-gold btn-lg" href="/audit">Take the free audit →</Link>
            <a className="btn" href={divisionUrl('the-collective')}>About The Collective ↗</a>
            <a className="btn" href={SITE.main}>Collective AI Inc ↗</a>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

import Link from 'next/link';
import { SITE, divisionUrl } from '@/lib/links';
import { Tile } from '@/components/Marks';

const DIVS = [
  ['zenflow', 'ZenFlow'], ['the-collective', 'The Collective'], ['hybrid-living', 'Hybrid Living'],
  ['nexus-labs', 'Nexus Labs'], ['terra-axis', 'Terra Axis'], ['binary-loom', 'Binary Loom'],
  ['obsidian-arc', 'Obsidian Arc'], ['kinetic-edge', 'Kinetic Edge'], ['quantum-ledger', 'Quantum Ledger'], ['juris-guard', 'Juris Guard'], ['signal-velocity', 'Signal Velocity'],
];

/** Sticky header: parent wordmark, the division that runs the tool, and the one call to action. */
export function ParentStrip() {
  return (
    <header className="nav">
      <a className="brand" href={SITE.main}>
        <Tile mark="parent" size={34} />
        <span><b>Collective AI Inc</b><small>Architecting a Humane Future</small></span>
      </a>
      <span className="runby">
        <Tile mark="the-collective" size={26} />
        <span>Run by <a href={divisionUrl('the-collective')}>The Collective</a></span>
      </span>
      <span className="nav-cta">
        <a className="btn hide-m" href={SITE.hub}>Start here</a>
        <Link className="btn btn-gold" href="/audit">Take the audit</Link>
      </span>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="tblock">
        <div>
          <div className="big"><Tile mark="parent" size={40} /><span><b>Collective AI Inc</b><i>Architecting a Humane Future</i></span></div>
          <p className="muted" style={{ fontSize: '.9rem', marginTop: 14, maxWidth: '38ch' }}>
            The AI Readiness Audit is run by The Collective, the consulting division of Collective AI Inc., Columbus, Ohio.
          </p>
        </div>
        <div>
          <span className="lab">Elsewhere</span>
          <ul>
            <li><a href={SITE.main}>Main site</a></li>
            <li><a href={SITE.hub}>Start here</a></li>
            <li><a href={`${SITE.divisions}/`}>Division directory</a></li>
          </ul>
        </div>
        <div>
          <span className="lab">Divisions</span>
          <ul>{DIVS.map(([s, n]) => <li key={s}><a href={divisionUrl(s)}>{n}</a></li>)}</ul>
        </div>
      </div>
      <div className="legal"><span>© {new Date().getFullYear()} Collective AI Inc, an Ohio C-Corporation</span><span>Sheet T-01, AI Readiness Audit</span></div>
    </footer>
  );
}

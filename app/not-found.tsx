import Link from 'next/link';
export default function NotFound() {
  return <main className="analyzing"><div className="box"><span className="kicker">404: a different direction</span><h1>This page is outside the plan.</h1><p className="lede" style={{ marginTop: 20 }}>Return to the audit introduction or continue with your readiness assessment.</p><div className="actions" style={{ marginTop: 30 }}><Link className="btn btn-gold" href="/">Audit overview</Link><Link className="btn" href="/audit">Take the audit</Link></div></div></main>;
}

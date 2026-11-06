import { SITE } from '@/lib/links';

const strip: React.CSSProperties = {
  background: '#050A18', borderBottom: '1px solid rgba(212,168,67,0.12)', fontSize: 13,
  padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px 18px',
};
const link: React.CSSProperties = { color: '#8B9BAE', textDecoration: 'none' };

const Star = () => (
  <svg viewBox="0 0 20 20" width="11" height="11" aria-hidden="true" style={{ color: '#D4A843', flexShrink: 0 }}>
    <path fill="currentColor" d="M10 0 L12.4 7.6 L20 10 L12.4 12.4 L10 20 L7.6 12.4 L0 10 L7.6 7.6 Z" />
  </svg>
);

export function ParentStrip() {
  return (
    <div style={strip}>
      <a href={SITE.main} style={{ ...link, color: '#F5F5F5', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Star /> A Collective AI Inc. tool, run by The Collective
      </a>
      <span style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <a href={`${SITE.divisions}/`} style={link}>All divisions</a>
        <a href={SITE.hub} style={link}>Not sure? Start here</a>
      </span>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(212,168,67,0.12)', padding: '36px 20px', color: '#8B9BAE', fontSize: 14 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
        <div style={{ maxWidth: 420 }}>
          <a href={SITE.main} style={{ color: '#F5F5F5', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Star /> Collective AI Inc.
          </a>
          <p style={{ margin: '10px 0 0', lineHeight: 1.6 }}>
            The AI Readiness Audit is run by The Collective, the consulting division of Collective AI Inc., Columbus, Ohio.
          </p>
          <p style={{ margin: '8px 0 0', fontStyle: 'italic', color: '#D4A843' }}>Architecting a Humane Future</p>
        </div>
        <nav aria-label="Collective AI" style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <a href={SITE.main} style={link}>Collective AI home</a>
          <a href={`${SITE.divisions}/`} style={link}>The divisions</a>
          <a href={`${SITE.divisions}/the-collective/`} style={link}>The Collective</a>
          <a href={SITE.hub} style={link}>Start here</a>
        </nav>
      </div>
      <p style={{ maxWidth: 1100, margin: '28px auto 0', fontSize: 13 }}>&copy; {new Date().getFullYear()} Collective AI Inc.</p>
    </footer>
  );
}

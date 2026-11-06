import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ backgroundColor: '#0B0F1C', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #D4A843', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#D4A843' }}>C</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: '#F5F5F5' }}>THE COLLECTIVE</div>
            <div style={{ fontSize: 10, color: '#8B9BAE', letterSpacing: '0.15em' }}>COLLECTIVE AI</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{ color: '#8B9BAE', fontSize: 14 }}>AI Strategy. Built to Last.</span>
          <Link href="/audit" style={{ background: '#D4A843', color: '#0B0F1C', padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Start Free Audit
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 40px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 20, padding: '6px 18px', fontSize: 13, color: '#D4A843', marginBottom: 32, fontWeight: 600, letterSpacing: '0.05em' }}>
          FREE 6-MINUTE ASSESSMENT
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
          How Many Hours Is Your<br />
          <span style={{ background: 'linear-gradient(135deg, #D4A843, #f0c866)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Team Leaving on the Table?
          </span>
        </h1>
        <p style={{ fontSize: 20, color: '#8B9BAE', maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.6 }}>
          Twenty-five questions about how your business runs today. You get five readiness scores, an estimate of the hours AI could give back, and a list of where to start.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/audit" style={{ background: '#D4A843', color: '#0B0F1C', padding: '18px 48px', borderRadius: 10, fontWeight: 800, fontSize: 18, textDecoration: 'none', display: 'inline-block', boxShadow: '0 0 40px rgba(212,168,67,0.25)' }}>
            Take the Free AI Readiness Audit →
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B9BAE', fontSize: 14 }}>
            <span>✓</span> No credit card. No commitment.
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid rgba(212,168,67,0.1)', borderBottom: '1px solid rgba(212,168,67,0.1)', padding: '60px 40px', background: 'rgba(26,32,64,0.3)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, textAlign: 'center' }}>
          {[
            { stat: '25', label: 'Questions', sub: 'Across six sections of your business' },
            { stat: '~6 min', label: 'To finish', sub: 'Most people are done in one sitting' },
            { stat: '5', label: 'Readiness scores', sub: 'Strategy, data, culture, tech, governance' },
            { stat: 'Free', label: 'No card needed', sub: 'Your report appears as soon as you finish' },
          ].map((item) => (
            <div key={item.stat}>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#D4A843', marginBottom: 8 }}>{item.stat}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: '#8B9BAE' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>What You&apos;ll Walk Away With</h2>
          <p style={{ color: '#8B9BAE', fontSize: 18 }}>A 25-question audit. An AI-powered analysis. A concrete action plan.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { icon: '📊', title: 'Your AI Readiness Score', desc: 'A composite score across 5 dimensions: strategy, data, culture, technology, and governance.' },
            { icon: '⏱️', title: 'Hours Saved Per Week', desc: 'An estimate of the hours AI could save each week, based on how you answered.' },
            { icon: '🤖', title: 'Recommended AI Agents', desc: 'Specific AI agents and workflows tailored to your business problems and industry.' },
            { icon: '📈', title: 'ROI Projection', desc: 'A rough efficiency and return estimate for a business like yours. Treat it as a starting point.' },
            { icon: '🗺️', title: 'Implementation Roadmap', desc: 'Prioritized steps from where you are today, plus the Collective AI division best suited to your weakest score.' },
            { icon: '📞', title: 'Strategy Call (if qualified)', desc: 'High-readiness organizations get a direct invitation to a 30-minute strategy call with our team.' },
          ].map((item) => (
            <div key={item.title} style={{ background: 'rgba(26,32,64,0.5)', border: '1px solid rgba(212,168,67,0.12)', borderRadius: 12, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{item.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ color: '#8B9BAE', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Audit Process */}
      <section style={{ background: 'rgba(26,32,64,0.2)', padding: '80px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>6 Sections. 25 Questions. About 6 Minutes.</h2>
          <p style={{ color: '#8B9BAE', fontSize: 18, marginBottom: 60 }}>The same ground a consultant covers in a first meeting, in six sections.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { num: '01', title: 'Business Impact & Commercial Metrics', desc: 'ROI targets, time spent on repetitive tasks, lead volume and conversion rates' },
              { num: '02', title: 'Problem Definition & Use-Case Clarity', desc: 'Specificity of AI use cases, executive sponsorship, outcome timeline' },
              { num: '03', title: 'Data Readiness', desc: 'Centralization, quality, governance policies' },
              { num: '04', title: 'Organizational & Cultural Readiness', desc: 'Team openness, internal capacity, leadership alignment' },
              { num: '05', title: 'Technology & Infrastructure Fit', desc: 'Stack compatibility, MLOps maturity, scalability' },
              { num: '06', title: 'Ethics, Governance & Compliance', desc: 'Responsible AI policies, regulatory environment' },
            ].map((section) => (
              <div key={section.num} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', textAlign: 'left', background: 'rgba(11,15,28,0.5)', border: '1px solid rgba(212,168,67,0.1)', borderRadius: 10, padding: '20px 24px' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'rgba(212,168,67,0.3)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{section.num}</div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{section.title}</div>
                  <div style={{ color: '#8B9BAE', fontSize: 14 }}>{section.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Built by The Collective</h2>
          <p style={{ color: '#8B9BAE', maxWidth: 560, margin: '0 auto', fontSize: 16, lineHeight: 1.7 }}>
            Columbus, Ohio&apos;s AI strategy practice. We built this audit from the same frameworks we use with mid-market enterprises. Not a quiz. A diagnostic tool.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {[
            { icon: '🔒', text: 'Your data is encrypted and never shared' },
            { icon: '🚫', text: 'No spam. One follow-up only.' },
            { icon: '⚡', text: 'Instant AI-powered results' },
            { icon: '🎯', text: 'Tailored to your industry and size' },
          ].map((item) => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(26,32,64,0.4)', borderRadius: 10, border: '1px solid rgba(139,155,174,0.1)' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: '#8B9BAE' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center', borderTop: '1px solid rgba(212,168,67,0.1)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 48, fontWeight: 800, marginBottom: 20 }}>
            Start Your Audit.<br />
            <span style={{ background: 'linear-gradient(135deg, #D4A843, #f0c866)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Get Your Score in Minutes.
            </span>
          </h2>
          <p style={{ color: '#8B9BAE', fontSize: 18, marginBottom: 40 }}>
            AI that augments humans. Not replaces them. Let&apos;s find out if you&apos;re ready.
          </p>
          <Link href="/audit" style={{ background: '#D4A843', color: '#0B0F1C', padding: '20px 60px', borderRadius: 10, fontWeight: 800, fontSize: 20, textDecoration: 'none', display: 'inline-block', boxShadow: '0 0 60px rgba(212,168,67,0.3)' }}>
            Take the Free AI Readiness Audit →
          </Link>
          <div style={{ marginTop: 20, color: '#8B9BAE', fontSize: 14 }}>About 6 minutes · Instant results · No credit card required</div>
        </div>
      </section>

    </main>
  );
}

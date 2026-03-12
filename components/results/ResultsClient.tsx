'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssessmentResult, AuditAnswers } from '@/types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from 'recharts';

function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#D4A843' : '#6b7280';
  const dim = size === 'lg' ? 160 : size === 'md' ? 100 : 64;
  const fontSize = size === 'lg' ? 40 : size === 'md' ? 26 : 18;

  return (
    <div style={{ position: 'relative', width: dim, height: dim }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(139,155,174,0.15)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 276.5} 276.5`}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 1.5s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize, fontWeight: 900, color }}>{score}</div>
        <div style={{ fontSize: dim / 12, color: '#8B9BAE', fontWeight: 600 }}>/100</div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: 'High' | 'Medium' | 'Low' }) {
  const styles: Record<string, React.CSSProperties> = {
    High: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' },
    Medium: { background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843' },
    Low: { background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.3)', color: '#6b7280' },
  };
  return (
    <span style={{ ...styles[priority], padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em' }}>
      {priority} Priority
    </span>
  );
}

export default function ResultsClient() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [answers, setAnswers] = useState<Partial<AuditAnswers> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const res = sessionStorage.getItem('audit_result');
    const ans = sessionStorage.getItem('audit_answers');
    if (!res) {
      router.push('/audit');
      return;
    }
    setResult(JSON.parse(res));
    if (ans) setAnswers(JSON.parse(ans));
    setMounted(true);
  }, [router]);

  if (!result || !mounted) {
    return (
      <div style={{ backgroundColor: '#0B0F1C', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#D4A843', fontSize: 18 }}>Loading your results...</div>
      </div>
    );
  }

  const radarData = [
    { subject: 'Strategy', value: result.readiness_scores.strategy },
    { subject: 'Data', value: result.readiness_scores.data },
    { subject: 'Culture', value: result.readiness_scores.culture },
    { subject: 'Tech', value: result.readiness_scores.tech },
    { subject: 'Governance', value: result.readiness_scores.governance },
  ];

  const barData = [
    { name: 'Strategy', score: result.readiness_scores.strategy },
    { name: 'Data', score: result.readiness_scores.data },
    { name: 'Culture', score: result.readiness_scores.culture },
    { name: 'Technology', score: result.readiness_scores.tech },
    { name: 'Governance', score: result.readiness_scores.governance },
  ];

  const isHighPriority = result.priority === 'High';
  const calendlyBase = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/collectiveai/strategy-call';
  const contactName = (answers?.q25_contact_name as string) || '';
  const contactEmail = (answers?.q25_contact_email as string) || '';
  const companyName = (answers?.q25_company_name as string) || '';

  const calendlyUrl = isHighPriority
    ? `${calendlyBase}?name=${encodeURIComponent(contactName)}&email=${encodeURIComponent(contactEmail)}&a1=${encodeURIComponent(companyName)}&a2=${result.overall_readiness}`
    : calendlyBase;

  const getBarColor = (score: number) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#D4A843';
    return '#6b7280';
  };

  return (
    <div style={{ backgroundColor: '#0B0F1C', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Nav */}
      <div style={{ borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #D4A843', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#D4A843' }}>C</div>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}>THE COLLECTIVE</span>
        </div>
        <div style={{ fontSize: 13, color: '#8B9BAE' }}>Your AI Readiness Report</div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px' }}>
        {/* High Priority Banner */}
        {isHighPriority && (
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(212,168,67,0.08))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '20px 28px', marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>🎯 You&apos;re a high-priority AI implementation candidate</div>
              <div style={{ color: '#8B9BAE', fontSize: 14 }}>Your readiness profile qualifies you for a direct strategy call with The Collective team.</div>
            </div>
            <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" style={{ background: '#D4A843', color: '#0B0F1C', padding: '14px 28px', borderRadius: 8, fontWeight: 800, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Book Strategy Call →
            </a>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          {companyName && <div style={{ fontSize: 13, color: '#D4A843', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 8 }}>{companyName.toUpperCase()}</div>}
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 20 }}>Your AI Readiness Report</h1>
          <PriorityBadge priority={result.priority} />
        </div>

        {/* Main score + time savings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
          {/* Overall Score */}
          <div style={{ background: 'rgba(26,32,64,0.6)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 16, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8B9BAE', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 24 }}>OVERALL AI READINESS</div>
            <ScoreBadge score={result.overall_readiness} size="lg" />
            <div style={{ marginTop: 24, fontSize: 15, color: '#8B9BAE', lineHeight: 1.6, maxWidth: 280 }}>
              {result.overall_readiness >= 75 ? 'High readiness — you have the foundations to move quickly.' : result.overall_readiness >= 50 ? 'Moderate readiness — targeted improvements will unlock significant ROI.' : 'Early stage — foundational work will determine your implementation success.'}
            </div>
          </div>

          {/* Time Savings */}
          <div style={{ background: 'rgba(26,32,64,0.6)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 16, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8B9BAE', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 24 }}>ESTIMATED TIME SAVINGS</div>
            <div style={{ fontSize: 72, fontWeight: 900, color: '#D4A843', lineHeight: 1 }}>{result.time_savings_estimate.hours_per_week}</div>
            <div style={{ fontSize: 18, color: '#8B9BAE', marginBottom: 16 }}>hours / week</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>{result.time_savings_estimate.hours_per_week * 52} hours / year</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {result.time_savings_estimate.processes.map((p) => (
                <span key={p} style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#D4A843', fontWeight: 600 }}>{p}</span>
              ))}
            </div>
          </div>

          {/* ROI Proxy */}
          <div style={{ background: 'rgba(26,32,64,0.6)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 16, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8B9BAE', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 24 }}>PROJECTED ROI</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#10b981', marginBottom: 12 }}>{result.roi_proxy}</div>
            <div style={{ fontSize: 14, color: '#8B9BAE', lineHeight: 1.6, marginBottom: 24 }}>
              {result.time_savings_estimate.explanation}
            </div>
            <div style={{ fontSize: 13, color: '#D4A843', fontWeight: 600 }}>Based on industry benchmarks for {answers?.q22_company_size || 'your company size'}</div>
          </div>
        </div>

        {/* Personalized Summary */}
        <div style={{ background: 'rgba(26,32,64,0.4)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 12, padding: '28px 32px', marginBottom: 40 }}>
          <div style={{ fontSize: 13, color: '#D4A843', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12 }}>CONSULTANT ASSESSMENT</div>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: '#F5F5F5' }}>{result.personalized_summary}</p>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 40 }}>
          {/* Radar Chart */}
          <div style={{ background: 'rgba(26,32,64,0.6)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 16, padding: 32 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Readiness Dimensions</div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(139,155,174,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8B9BAE', fontSize: 13 }} />
                <Radar
                  name="Readiness"
                  dataKey="value"
                  stroke="#D4A843"
                  fill="#D4A843"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div style={{ background: 'rgba(26,32,64,0.6)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 16, padding: 32 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Dimension Scores</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#8B9BAE', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#8B9BAE', fontSize: 13 }} width={80} />
                <Tooltip
                  formatter={(val) => [`${val}/100`, 'Score']}
                  contentStyle={{ background: '#1A2040', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8 }}
                  labelStyle={{ color: '#F5F5F5' }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Dimension Breakdown</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { key: 'strategy', label: 'Strategy', score: result.readiness_scores.strategy, icon: '🎯', desc: 'Problem clarity & use case definition' },
              { key: 'data', label: 'Data', score: result.readiness_scores.data, icon: '🗄️', desc: 'Quality, access & governance' },
              { key: 'culture', label: 'Culture', score: result.readiness_scores.culture, icon: '🏢', desc: 'Team openness & leadership alignment' },
              { key: 'tech', label: 'Technology', score: result.readiness_scores.tech, icon: '⚙️', desc: 'Stack compatibility & scalability' },
              { key: 'governance', label: 'Governance', score: result.readiness_scores.governance, icon: '🔒', desc: 'Ethics, compliance & policies' },
            ].map(({ key, label, score, icon, desc }) => {
              const color = score >= 75 ? '#10b981' : score >= 50 ? '#D4A843' : '#6b7280';
              return (
                <div key={key} style={{ background: 'rgba(26,32,64,0.5)', border: '1px solid rgba(212,168,67,0.1)', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{label}</div>
                    </div>
                    <ScoreBadge score={score} size="sm" />
                  </div>
                  <div style={{ fontSize: 12, color: '#8B9BAE', marginBottom: 12 }}>{desc}</div>
                  <div style={{ height: 4, background: 'rgba(139,155,174,0.15)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 2, transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Agents */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Recommended AI Agents for Your Business</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {result.recommended_agents.map((agent, i) => (
              <div key={i} style={{ background: 'rgba(26,32,64,0.5)', border: '1px solid rgba(212,168,67,0.12)', borderRadius: 10, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{agent}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ background: 'linear-gradient(135deg, rgba(26,32,64,0.8), rgba(11,15,28,0.9))', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#D4A843', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 16 }}>NEXT STEP</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            {isHighPriority ? 'Book Your Strategy Call' : 'Speak with an AI Consultant'}
          </h2>
          <p style={{ color: '#8B9BAE', fontSize: 17, maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.6 }}>
            {isHighPriority
              ? 'Your readiness score puts you in the top tier of AI implementation candidates. Let\'s map out your first 90 days.'
              : 'A 30-minute call with The Collective team will identify your highest-leverage AI opportunities and the fastest path to ROI.'}
          </p>
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: '#D4A843', color: '#0B0F1C', padding: '18px 48px', borderRadius: 10, fontWeight: 800, fontSize: 18, textDecoration: 'none', display: 'inline-block', boxShadow: '0 0 40px rgba(212,168,67,0.25)' }}
          >
            Book Your 30-min Strategy Call →
          </a>
          <div style={{ marginTop: 16, color: '#8B9BAE', fontSize: 13 }}>Free · No obligation · 30 minutes</div>
        </div>

        {/* Retake link */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <a href="/audit" style={{ color: '#8B9BAE', fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 4 }}>Retake the audit</a>
        </div>
      </div>
    </div>
  );
}

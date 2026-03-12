'use client';

import { useState, useCallback } from 'react';
import { Submission } from '@/types';

function getPriorityStyle(priority: string): React.CSSProperties {
  if (priority === 'High') return { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' };
  if (priority === 'Medium') return { background: 'rgba(212,168,67,0.1)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.3)' };
  return { background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.3)' };
}

function LoginForm({ onLogin }: { onLogin: (u: string, p: string) => void }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');

  return (
    <div style={{ backgroundColor: '#0B0F1C', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5F5F5' }}>
      <div style={{ background: 'rgba(26,32,64,0.6)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 16, padding: 48, width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #D4A843', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#D4A843', margin: '0 auto 16px' }}>C</div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: '#8B9BAE', fontSize: 14 }}>The Collective — Collective AI</p>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, color: '#8B9BAE', marginBottom: 8, fontWeight: 600 }}>USERNAME</label>
          <input value={u} onChange={e => setU(e.target.value)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(11,15,28,0.8)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, color: '#F5F5F5', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: 'block', fontSize: 13, color: '#8B9BAE', marginBottom: 8, fontWeight: 600 }}>PASSWORD</label>
          <input type="password" value={p} onChange={e => setP(e.target.value)} onKeyDown={e => e.key === 'Enter' && onLogin(u, p)} style={{ width: '100%', padding: '12px 16px', background: 'rgba(11,15,28,0.8)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, color: '#F5F5F5', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>
        <button onClick={() => onLogin(u, p)} style={{ width: '100%', background: '#D4A843', color: '#0B0F1C', padding: '14px', borderRadius: 8, fontWeight: 800, fontSize: 16, cursor: 'pointer', border: 'none' }}>
          Access Dashboard →
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [creds, setCreds] = useState({ user: '', pass: '' });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'overall_score' | 'created_at' | 'time_savings_hours'>('overall_score');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');

  const fetchData = useCallback(async (user: string, pass: string) => {
    setLoading(true);
    const token = Buffer.from(`${user}:${pass}`).toString('base64');
    const res = await fetch('/api/submissions', { headers: { Authorization: `Basic ${token}` } });
    if (!res.ok) {
      setAuthError('Invalid credentials');
      setLoading(false);
      return;
    }
    const data = await res.json();
    setSubmissions(data.submissions || []);
    setLoading(false);
  }, []);

  const handleLogin = async (user: string, pass: string) => {
    setCreds({ user, pass });
    setAuthed(true);
    setAuthError('');
    await fetchData(user, pass);
  };

  const markContacted = async (id: string, contacted: boolean) => {
    const token = Buffer.from(`${creds.user}:${creds.pass}`).toString('base64');
    await fetch('/api/update-contacted', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${token}` },
      body: JSON.stringify({ id, contacted }),
    });
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, contacted } : s));
  };

  const exportCSV = () => {
    const headers = ['Company', 'Contact', 'Email', 'Industry', 'Size', 'Score', 'Priority', 'Hours Saved', 'Contacted', 'Date'];
    const rows = filtered.map(s => [
      s.company_name, (s as Submission & {contact_name?: string}).contact_name || '', s.email, s.industry, s.size,
      s.overall_score, s.priority, s.time_savings_hours,
      s.contacted ? 'Yes' : 'No', new Date(s.created_at).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `collective-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const getOutreachTemplate = (s: Submission) => {
    return `Subject: AI Readiness Follow-Up — ${s.company_name}

Hi ${(s as Submission & {contact_name?: string}).contact_name || 'there'},

Following up on your AI Readiness Audit — your score of ${s.overall_score}/100 puts you in the ${s.priority.toLowerCase()} priority tier, with an estimated ${s.time_savings_hours} hours/week in potential savings.

${s.personalized_summary}

I'd like to schedule a 30-minute strategy call to walk through your personalized recommendations. Would this week or next work?

— The Collective Team
Collective AI | Columbus, Ohio`;
  };

  const filtered = submissions
    .filter(s => filter === 'All' || s.priority === filter)
    .filter(s =>
      !search ||
      s.company_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'overall_score') return b.overall_score - a.overall_score;
      if (sortBy === 'time_savings_hours') return b.time_savings_hours - a.time_savings_hours;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (!authed || authError) {
    return (
      <div>
        {authError && (
          <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '12px 24px', borderRadius: 8, zIndex: 100, fontSize: 14 }}>
            {authError}
          </div>
        )}
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  const highCount = submissions.filter(s => s.priority === 'High').length;
  const medCount = submissions.filter(s => s.priority === 'Medium').length;
  const avgScore = submissions.length ? Math.round(submissions.reduce((a, s) => a + s.overall_score, 0) / submissions.length) : 0;
  const contactedCount = submissions.filter(s => s.contacted).length;

  return (
    <div style={{ backgroundColor: '#0B0F1C', minHeight: '100vh', color: '#F5F5F5' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(212,168,67,0.15)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #D4A843', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#D4A843' }}>C</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>THE COLLECTIVE</div>
            <div style={{ fontSize: 11, color: '#8B9BAE', letterSpacing: '0.1em' }}>ADMIN DASHBOARD</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={() => fetchData(creds.user, creds.pass)} style={{ background: 'rgba(139,155,174,0.1)', border: '1px solid rgba(139,155,174,0.2)', color: '#8B9BAE', padding: '8px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
            ↻ Refresh
          </button>
          <button onClick={exportCSV} style={{ background: '#D4A843', color: '#0B0F1C', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 13, border: 'none', fontFamily: 'inherit' }}>
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 40 }}>
          {[
            { label: 'Total Leads', value: submissions.length, color: '#F5F5F5' },
            { label: 'High Priority', value: highCount, color: '#10b981' },
            { label: 'Medium Priority', value: medCount, color: '#D4A843' },
            { label: 'Avg Score', value: `${avgScore}/100`, color: '#D4A843' },
            { label: 'Contacted', value: `${contactedCount}/${submissions.length}`, color: '#8B9BAE' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(26,32,64,0.5)', border: '1px solid rgba(212,168,67,0.1)', borderRadius: 12, padding: '24px 28px' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#8B9BAE', fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            placeholder="Search company or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '10px 16px', background: 'rgba(26,32,64,0.5)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 8, color: '#F5F5F5', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            {(['All', 'High', 'Medium', 'Low'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 18px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: filter === f ? '#D4A843' : 'rgba(139,155,174,0.1)', color: filter === f ? '#0B0F1C' : '#8B9BAE' }}>
                {f}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'overall_score' | 'created_at' | 'time_savings_hours')} style={{ padding: '10px 16px', background: 'rgba(26,32,64,0.5)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 8, color: '#F5F5F5', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            <option value="overall_score">Sort: Score</option>
            <option value="time_savings_hours">Sort: Hours Saved</option>
            <option value="created_at">Sort: Date</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#8B9BAE' }}>Loading submissions...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#8B9BAE', background: 'rgba(26,32,64,0.3)', borderRadius: 12 }}>
            {submissions.length === 0 ? 'No submissions yet. Share your audit link to start collecting leads.' : 'No results match your filters.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(s => (
              <div key={s.id} style={{ background: 'rgba(26,32,64,0.5)', border: '1px solid rgba(212,168,67,0.1)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', cursor: 'pointer', flexWrap: 'wrap' }} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{s.company_name}</div>
                    <div style={{ fontSize: 13, color: '#8B9BAE' }}>{s.email} · {s.industry}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: s.overall_score >= 75 ? '#10b981' : s.overall_score >= 50 ? '#D4A843' : '#6b7280' }}>{s.overall_score}</div>
                      <div style={{ fontSize: 10, color: '#8B9BAE' }}>SCORE</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#D4A843' }}>{s.time_savings_hours}</div>
                      <div style={{ fontSize: 10, color: '#8B9BAE' }}>HRS/WK</div>
                    </div>
                    <span style={{ ...getPriorityStyle(s.priority), padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{s.priority}</span>
                    <div style={{ fontSize: 12, color: '#8B9BAE' }}>{new Date(s.created_at).toLocaleDateString()}</div>
                    <button
                      onClick={e => { e.stopPropagation(); markContacted(s.id, !s.contacted); }}
                      style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', fontFamily: 'inherit', background: s.contacted ? 'rgba(16,185,129,0.1)' : 'rgba(139,155,174,0.1)', color: s.contacted ? '#10b981' : '#8B9BAE', borderColor: s.contacted ? 'rgba(16,185,129,0.3)' : 'rgba(139,155,174,0.2)' }}
                    >
                      {s.contacted ? '✓ Contacted' : 'Mark Contacted'}
                    </button>
                    <span style={{ color: '#8B9BAE', fontSize: 16 }}>{expanded === s.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expanded === s.id && (
                  <div style={{ borderTop: '1px solid rgba(212,168,67,0.1)', padding: '24px', background: 'rgba(11,15,28,0.3)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                      {/* Scores */}
                      <div>
                        <div style={{ fontSize: 12, color: '#D4A843', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 14 }}>DIMENSION SCORES</div>
                        {s.scores && Object.entries(s.scores).map(([key, val]) => (
                          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 13, color: '#8B9BAE', textTransform: 'capitalize' }}>{key}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 80, height: 4, background: 'rgba(139,155,174,0.15)', borderRadius: 2 }}>
                                <div style={{ height: '100%', width: `${val}%`, background: (val as number) >= 75 ? '#10b981' : (val as number) >= 50 ? '#D4A843' : '#6b7280', borderRadius: 2 }} />
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, width: 32, textAlign: 'right' }}>{val}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <div>
                        <div style={{ fontSize: 12, color: '#D4A843', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 14 }}>CONSULTANT ASSESSMENT</div>
                        <p style={{ fontSize: 14, color: '#8B9BAE', lineHeight: 1.6, marginBottom: 16 }}>{s.personalized_summary}</p>
                        <div style={{ fontSize: 12, color: '#D4A843', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>ROI</div>
                        <p style={{ fontSize: 14, color: '#8B9BAE' }}>{s.roi_proxy}</p>
                      </div>

                      {/* Agents */}
                      <div>
                        <div style={{ fontSize: 12, color: '#D4A843', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 14 }}>RECOMMENDED AGENTS</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                          {(s.recommended_agents || []).map((a: string) => (
                            <span key={a} style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 16, padding: '4px 12px', fontSize: 12, color: '#D4A843' }}>{a}</span>
                          ))}
                        </div>
                        {/* Outreach button */}
                        <button
                          onClick={() => {
                            const template = getOutreachTemplate(s);
                            const subject = `AI Readiness Follow-Up — ${s.company_name}`;
                            const mailtoUrl = `mailto:${s.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(template)}`;
                            window.open(mailtoUrl);
                          }}
                          style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)', color: '#D4A843', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
                        >
                          ✉ Send Outreach Email
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

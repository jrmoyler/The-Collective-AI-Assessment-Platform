import { AuditAnswers, AssessmentResult, ReadinessScores } from '@/types';

// Deterministic scoring from the published rubric. It runs on every submission: the
// AI analysis adds the written summary and agent picks on top, and if that call is
// unavailable or comes back malformed the visitor still gets a complete result.

const n = (v: unknown, lo: number, hi: number, dflt: number) => {
  const x = Number(v);
  return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : dflt;
};
// 1–5 scale → 0–100
const pct = (v: unknown) => ((n(v, 1, 5, 3) - 1) / 4) * 100;
const clamp = (x: number) => Math.round(Math.min(100, Math.max(0, x)));

const SPONSOR_NONE = 'No executive sponsor yet';
const GOV_LEVEL: Record<string, number> = {
  'Yes, documented and enforced': 100,
  'Partially — informal processes': 55,
  'No, not yet': 10,
};
const ROI_LEVEL: Record<string, number> = {
  'Not sure yet': 30,
  '10-25% efficiency gain': 70,
  '25-50% efficiency gain': 80,
  '50-100% efficiency gain': 75,
  '100%+ / transformative ROI': 55,
};

export function scoreAnswers(a: Partial<AuditAnswers>): AssessmentResult {
  const problemText = String(a.q7_problems_identified || '').trim();
  const problemScore = problemText.length > 160 ? 85 : problemText.length > 60 ? 65 : problemText.length > 10 ? 40 : 15;
  const sponsor = a.q9_executive_sponsor && a.q9_executive_sponsor !== SPONSOR_NONE ? 90 : 20;

  const strategy = clamp(problemScore * 0.3 + pct(a.q8_outcome_clarity) * 0.3 + sponsor * 0.25 + (ROI_LEVEL[a.q5_roi_target || ''] ?? 40) * 0.15);
  const data = clamp(pct(a.q10_data_centralized) * 0.4 + pct(a.q11_data_quality) * 0.4 + (GOV_LEVEL[a.q12_data_governance || ''] ?? 30) * 0.2);
  const culture = clamp(pct(a.q13_team_openness) * 0.4 + pct(a.q14_internal_resources) * 0.25 + pct(a.q15_leadership_alignment) * 0.35);
  const tech = clamp(pct(a.q16_tech_compatibility) * 0.4 + pct(a.q17_mlops_readiness) * 0.25 + pct(a.q18_scalability) * 0.35);
  const regulated = a.q20_regulated_industry && a.q20_regulated_industry !== 'No, not regulated';
  // In a regulated industry, weak policies cost more.
  const governance = clamp(pct(a.q19_ethics_policies) * (regulated ? 0.85 : 0.7) + (regulated ? 0 : 30) + (GOV_LEVEL[a.q12_data_governance || ''] ?? 30) * (regulated ? 0.15 : 0));

  const scores: ReadinessScores = { strategy, data, culture, tech, governance };
  const overall = clamp(strategy * 0.25 + data * 0.25 + culture * 0.2 + tech * 0.2 + governance * 0.1);

  const reported = n(a.q1_marketing_hours, 0, 40, 0) + n(a.q2_lead_hours, 0, 40, 0) + n(a.q3_sales_admin_hours, 0, 40, 0);
  const ready = (culture + data) / 2;
  const share = ready > 70 ? 0.6 : ready >= 40 ? 0.45 : 0.25;
  const hours = Math.round(Math.min(30, Math.max(reported > 0 ? 5 : 0, reported * share)));

  const byHours: [number, string][] = [
    [n(a.q1_marketing_hours, 0, 40, 0), 'Content creation and email campaigns'],
    [n(a.q2_lead_hours, 0, 40, 0), 'Lead qualification and follow-up'],
    [n(a.q3_sales_admin_hours, 0, 40, 0), 'CRM updates and proposal generation'],
  ];
  const processes = byHours.sort((x, y) => y[0] - x[0]).filter(([h]) => h > 0).map(([, p]) => p);
  if (processes.length === 0) processes.push('Reporting', 'Scheduling');

  const agents: string[] = [];
  if (n(a.q2_lead_hours, 0, 40, 0) >= 3) agents.push('Lead Qualification Agent');
  if (n(a.q1_marketing_hours, 0, 40, 0) >= 3) agents.push('Content Generation Agent', 'Email Sequence Agent');
  if (n(a.q3_sales_admin_hours, 0, 40, 0) >= 3) agents.push('CRM Update Automation Agent', 'Sales Proposal Generator');
  agents.push('Reporting & Analytics Agent', 'Meeting Scheduler Agent');

  const priority: AssessmentResult['priority'] = overall >= 65 ? 'High' : overall >= 40 ? 'Medium' : 'Low';
  const names: Record<keyof ReadinessScores, string> = { strategy: 'strategy', data: 'data', culture: 'culture', tech: 'technology', governance: 'governance' };
  const ordered = (Object.keys(scores) as (keyof ReadinessScores)[]).sort((x, y) => scores[x] - scores[y]);
  const low = names[ordered[0]], high = names[ordered[ordered.length - 1]];
  const who = [a.q25_company_name, a.q23_industry && a.q23_industry !== 'Other' ? `a ${a.q23_industry.toLowerCase()} business` : ''].filter(Boolean)[0] || 'Your business';

  return {
    readiness_scores: scores,
    overall_readiness: overall,
    time_savings_estimate: {
      hours_per_week: hours,
      processes: processes.slice(0, 3),
      explanation: reported > 0
        ? `You reported about ${reported} hours a week of repetitive marketing, lead and sales admin work. At your current data and culture readiness, roughly ${Math.round(share * 100)}% of that is realistic to hand to agents in the first phase.`
        : 'You reported little repetitive marketing or sales work, so the near-term gain is in reporting and scheduling rather than outreach.',
    },
    priority,
    recommended_agents: Array.from(new Set(agents)).slice(0, 4),
    roi_proxy: overall >= 65 ? 'Potential 25-40% efficiency gain' : overall >= 40 ? 'Potential 15-25% efficiency gain' : 'Potential 5-15% efficiency gain once the foundations are in place',
    personalized_summary: `${who} is strongest on ${high} and weakest on ${low}. ${overall >= 65 ? 'The foundations are in place to put agents into production now; the work is choosing the first two workflows and measuring them.' : overall >= 40 ? `Start by closing the ${low} gap; it is the one most likely to stall a first AI project.` : `Before any agent goes live, the ${low} gap needs a plan. Most of the early value is in getting that foundation right.`}`,
  };
}

/** Keep the AI's analysis only where it is well-formed; fall back field by field. */
export function mergeAssessment(ai: unknown, base: AssessmentResult): AssessmentResult {
  if (!ai || typeof ai !== 'object') return base;
  const x = ai as Partial<AssessmentResult>;
  const s = x.readiness_scores;
  const okScores = s && (['strategy', 'data', 'culture', 'tech', 'governance'] as const).every((k) => Number.isFinite(Number(s[k])));
  const scores = okScores ? { strategy: clamp(Number(s!.strategy)), data: clamp(Number(s!.data)), culture: clamp(Number(s!.culture)), tech: clamp(Number(s!.tech)), governance: clamp(Number(s!.governance)) } : base.readiness_scores;
  const overall = Number.isFinite(Number(x.overall_readiness)) ? clamp(Number(x.overall_readiness)) : base.overall_readiness;
  const t = x.time_savings_estimate;
  return {
    readiness_scores: scores,
    overall_readiness: overall,
    time_savings_estimate: t && Number.isFinite(Number(t.hours_per_week))
      ? { hours_per_week: Math.round(Math.min(30, Math.max(0, Number(t.hours_per_week)))), processes: Array.isArray(t.processes) && t.processes.length ? t.processes.slice(0, 4).map(String) : base.time_savings_estimate.processes, explanation: typeof t.explanation === 'string' && t.explanation ? t.explanation : base.time_savings_estimate.explanation }
      : base.time_savings_estimate,
    priority: x.priority === 'High' || x.priority === 'Medium' || x.priority === 'Low' ? x.priority : overall >= 65 ? 'High' : overall >= 40 ? 'Medium' : 'Low',
    recommended_agents: Array.isArray(x.recommended_agents) && x.recommended_agents.length ? x.recommended_agents.slice(0, 5).map(String) : base.recommended_agents,
    roi_proxy: typeof x.roi_proxy === 'string' && x.roi_proxy ? x.roi_proxy : base.roi_proxy,
    personalized_summary: typeof x.personalized_summary === 'string' && x.personalized_summary ? x.personalized_summary : base.personalized_summary,
  };
}

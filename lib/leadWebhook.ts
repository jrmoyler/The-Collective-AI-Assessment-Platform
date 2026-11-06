import { AuditAnswers, AssessmentResult } from '@/types';

// Sends a finished audit to the Collective AI Leads table through the Airtable
// "Inbound Lead Webhook" automation. The URL lives only in the AIRTABLE_LEAD_WEBHOOK
// environment variable. A failure here never blocks the visitor's results.
export async function forwardLead(answers: AuditAnswers, a: AssessmentResult): Promise<void> {
  const url = process.env.AIRTABLE_LEAD_WEBHOOK;
  if (!url) return;
  const s = a.readiness_scores;
  const notes = [
    `via AI Readiness Assessment. Company: ${answers.q25_company_name || 'n/a'}.`,
    `Overall ${a.overall_readiness}/100, priority ${a.priority}.`,
    `Strategy ${s.strategy}, Data ${s.data}, Culture ${s.culture}, Tech ${s.tech}, Governance ${s.governance}.`,
    `About ${a.time_savings_estimate?.hours_per_week ?? '?'} hrs/week. Industry: ${answers.q23_industry || 'n/a'}, size: ${answers.q22_company_size || 'n/a'}.`,
    answers.q24_website ? `Site: ${answers.q24_website}.` : '',
  ].filter(Boolean).join(' ');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: answers.q25_contact_name || '',
        email: answers.q25_contact_email || '',
        phone: '',
        source: 'Manual',
        division: 'The Collective',
        interest: 'AI Readiness Assessment',
        notes,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) console.error('Lead webhook returned', res.status);
  } catch (err) {
    console.error('Lead webhook failed:', err);
  } finally {
    clearTimeout(timer);
  }
}

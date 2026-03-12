import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServiceClient } from '@/lib/supabase';
import { AuditAnswers, AssessmentResult } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const answers: AuditAnswers = body.answers;

    if (!answers) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

    const systemPrompt = `You are The Collective's senior AI consultant at Collective AI, a premier AI strategy practice based in Columbus, Ohio. 

Your role is to analyze an organization's AI readiness audit responses and produce a precise, actionable assessment.

CRITICAL: Return ONLY a valid JSON object. No markdown. No explanation. No preamble. Just the JSON.

The JSON must have this exact structure:
{
  "readiness_scores": {
    "strategy": <number 0-100>,
    "data": <number 0-100>,
    "culture": <number 0-100>,
    "tech": <number 0-100>,
    "governance": <number 0-100>
  },
  "overall_readiness": <number 0-100>,
  "time_savings_estimate": {
    "hours_per_week": <number>,
    "processes": ["process1", "process2", "process3"],
    "explanation": "<2-3 sentences explaining the time savings calculation>"
  },
  "priority": "<High|Medium|Low>",
  "recommended_agents": ["agent1", "agent2", "agent3", "agent4"],
  "roi_proxy": "<string like 'Potential 20-35% efficiency gain'>",
  "personalized_summary": "<2-3 sentences, specific to this company's situation, consultative tone, no fluff>"
}

SCORING LOGIC:
- strategy score: Based on q7 (problem clarity), q8 (outcome clarity), q9 (executive sponsorship), q5 (ROI target)
- data score: Based on q10 (data centralization), q11 (data quality), q12 (governance)
- culture score: Based on q13 (team openness), q14 (internal resources), q15 (leadership alignment)
- tech score: Based on q16 (tech compatibility), q17 (mlops), q18 (scalability)
- governance score: Based on q19 (ethics policies), q20 (regulated industry - higher governance needed = lower score if policies are low)
- overall_readiness: Weighted average (strategy 25%, data 25%, culture 20%, tech 20%, governance 10%)

TIME SAVINGS LOGIC:
- Base hours = q1 + q2 + q3 (reported hours on repetitive tasks)
- Savings multiplier: (culture_score + data_score) / 200 gives a ratio
- If both culture and data are high (>70): 55-70% of reported hours can be saved
- If medium readiness (40-70): 35-55% savings
- If low readiness (<40): 15-35% savings potential (less ready = less savings achievable now)
- Minimum estimate: 5 hrs/week, Maximum realistic: 30 hrs/week for SMBs
- Always be specific about which processes: choose from lead qualification, content creation, email campaigns, CRM updates, proposal generation, sales follow-up, reporting, scheduling

PRIORITY THRESHOLDS:
- High: overall_readiness >= 65 (these are your best leads — ready to implement, executive sponsor, clear problems)
- Medium: overall_readiness 40-64
- Low: overall_readiness < 40

RECOMMENDED AGENTS: Be specific and relevant to their industry and problems. Examples:
- Lead Qualification Agent
- Content Generation Agent  
- CRM Update Automation Agent
- Email Sequence Agent
- Sales Proposal Generator
- Reporting & Analytics Agent
- Customer Onboarding Agent
- Meeting Scheduler Agent

PERSONALIZED SUMMARY: Reference their specific industry, company size, and top problems. Be direct. No "great news" or "exciting opportunity" opener. Start with an observation or finding.`;

    const userMessage = `Analyze this AI readiness audit submission:

BUSINESS METRICS:
- Marketing hours/week: ${answers.q1_marketing_hours}
- Lead qualification hours/week: ${answers.q2_lead_hours}
- Sales admin hours/week: ${answers.q3_sales_admin_hours}
- Lead volume & conversion: ${answers.q4_lead_volume}
- ROI target: ${answers.q5_roi_target}
- Process efficiency rating: ${answers.q6_process_efficiency}/5

PROBLEM DEFINITION:
- Problems identified: ${answers.q7_problems_identified}
- Outcome clarity: ${answers.q8_outcome_clarity}/5
- Executive sponsor: ${answers.q9_executive_sponsor}

DATA READINESS:
- Data centralization: ${answers.q10_data_centralized}/5
- Data quality: ${answers.q11_data_quality}/5
- Data governance: ${answers.q12_data_governance}

ORGANIZATIONAL READINESS:
- Team openness to AI: ${answers.q13_team_openness}/5
- Internal AI resources: ${answers.q14_internal_resources}/5
- Leadership alignment: ${answers.q15_leadership_alignment}/5

TECHNOLOGY FIT:
- Tech stack compatibility: ${answers.q16_tech_compatibility}/5
- MLOps readiness: ${answers.q17_mlops_readiness}/5
- Scalability: ${answers.q18_scalability}/5

ETHICS & CONTEXT:
- Ethics/governance policies: ${answers.q19_ethics_policies}/5
- Regulated industry: ${answers.q20_regulated_industry}
- Main concerns: ${answers.q21_concerns || 'Not specified'}
- Company size: ${answers.q22_company_size}
- Industry: ${answers.q23_industry}
- Company: ${answers.q25_company_name}

Return ONLY the JSON assessment object.`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    let assessment: AssessmentResult;
    try {
      const cleaned = responseText.replace(/```json\n?|\n?```/g, '').trim();
      assessment = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json({ error: 'Failed to parse assessment' }, { status: 500 });
    }

    // Store in Supabase
    try {
      const supabase = getServiceClient();
      const { error } = await supabase.from('assessments').insert({
        company_name: answers.q25_company_name,
        email: answers.q25_contact_email,
        contact_name: answers.q25_contact_name,
        website: answers.q24_website || '',
        industry: answers.q23_industry,
        size: answers.q22_company_size,
        answers: answers,
        scores: assessment.readiness_scores,
        time_savings_hours: assessment.time_savings_estimate.hours_per_week,
        overall_score: assessment.overall_readiness,
        priority: assessment.priority,
        recommended_agents: assessment.recommended_agents,
        roi_proxy: assessment.roi_proxy,
        personalized_summary: assessment.personalized_summary,
        contacted: false,
      });

      if (error) {
        console.error('Supabase insert error:', error);
        // Don't fail the request if DB fails — return assessment anyway
      }
    } catch (dbError) {
      console.error('DB error:', dbError);
    }

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json({ error: 'Assessment failed' }, { status: 500 });
  }
}

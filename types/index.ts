export interface AuditAnswers {
  // Section 1 - Business Impact
  q1_marketing_hours: number;
  q2_lead_hours: number;
  q3_sales_admin_hours: number;
  q4_lead_volume: string;
  q5_roi_target: string;
  q6_process_efficiency: number;

  // Section 2 - Problem Definition
  q7_problems_identified: string;
  q8_outcome_clarity: number;
  q9_executive_sponsor: string;

  // Section 3 - Data Readiness
  q10_data_centralized: number;
  q11_data_quality: number;
  q12_data_governance: string;

  // Section 4 - Organizational Readiness
  q13_team_openness: number;
  q14_internal_resources: number;
  q15_leadership_alignment: number;

  // Section 5 - Technology Fit
  q16_tech_compatibility: number;
  q17_mlops_readiness: number;
  q18_scalability: number;

  // Section 6 - Ethics & Contact
  q19_ethics_policies: number;
  q20_regulated_industry: string;
  q21_concerns: string;
  q22_company_size: string;
  q23_industry: string;
  q24_website: string;
  q25_contact_name: string;
  q25_contact_email: string;
  q25_company_name: string;
}

export interface ReadinessScores {
  strategy: number;
  data: number;
  culture: number;
  tech: number;
  governance: number;
}

export interface TimeSavingsEstimate {
  hours_per_week: number;
  processes: string[];
  explanation: string;
}

export interface AssessmentResult {
  readiness_scores: ReadinessScores;
  overall_readiness: number;
  time_savings_estimate: TimeSavingsEstimate;
  priority: 'High' | 'Medium' | 'Low';
  recommended_agents: string[];
  roi_proxy: string;
  personalized_summary: string;
}

export interface Submission {
  id: string;
  created_at: string;
  company_name: string;
  email: string;
  website: string;
  industry: string;
  size: string;
  answers: AuditAnswers;
  scores: ReadinessScores;
  time_savings_hours: number;
  overall_score: number;
  priority: 'High' | 'Medium' | 'Low';
  contacted: boolean;
  recommended_agents: string[];
  roi_proxy: string;
  personalized_summary: string;
}

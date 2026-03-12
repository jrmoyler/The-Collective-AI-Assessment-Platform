-- Collective AI Assessment Platform — Supabase Schema
-- Run this in your Supabase SQL Editor

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contact info
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  size TEXT,
  
  -- Raw answers (JSONB for flexibility)
  answers JSONB,
  
  -- AI Assessment Results
  scores JSONB,                     -- { strategy, data, culture, tech, governance }
  time_savings_hours FLOAT,
  overall_score INTEGER,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  recommended_agents TEXT[],
  roi_proxy TEXT,
  personalized_summary TEXT,
  
  -- CRM fields
  contacted BOOLEAN DEFAULT FALSE,
  contacted_at TIMESTAMPTZ,
  notes TEXT
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_assessments_overall_score ON assessments(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_priority ON assessments(priority);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_email ON assessments(email);

-- Enable Row Level Security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from anon (form submissions)
CREATE POLICY "Allow public inserts" ON assessments
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy: Only service role can read/update (admin dashboard uses service role key)
CREATE POLICY "Service role full access" ON assessments
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Sample view for analytics
CREATE OR REPLACE VIEW assessment_analytics AS
SELECT
  COUNT(*) as total_submissions,
  COUNT(*) FILTER (WHERE priority = 'High') as high_priority,
  COUNT(*) FILTER (WHERE priority = 'Medium') as medium_priority,
  COUNT(*) FILTER (WHERE priority = 'Low') as low_priority,
  ROUND(AVG(overall_score)) as avg_score,
  ROUND(AVG(time_savings_hours), 1) as avg_hours_saved,
  COUNT(*) FILTER (WHERE contacted = true) as contacted_count,
  DATE_TRUNC('month', created_at) as month
FROM assessments
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

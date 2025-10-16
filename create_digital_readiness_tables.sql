-- Digital Readiness Assessment Database Schema
-- This script creates tables for the digital readiness assessment system

-- Main assessments table
CREATE TABLE IF NOT EXISTS digital_readiness_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic Information
    full_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100) NOT NULL, -- retail, services, manufacturing, food
    city_location VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    -- Assessment Data (stored as JSONB for flexibility)
    goals JSONB, -- Array of selected goals
    digital_status VARCHAR(50), -- none, whatsapp, basic_website, social_only, active_no_results
    budget VARCHAR(50), -- below_2k, 2k_10k, 10k_25k, 25k_plus
    challenge VARCHAR(50), -- no_leads, too_many_platforms, dont_know, competitors_ahead, no_time
    timeline VARCHAR(50), -- immediately, 1_3_months, 3_6_months, exploring
    
    -- Advanced Assessment Data
    brand_help VARCHAR(20), -- yes, no, improve
    team_size VARCHAR(20), -- just_me, 2_5, 5_10, 10_plus
    product_count VARCHAR(20), -- less_10, 10_50, 50_200, 200_plus
    domain_status VARCHAR(50), -- no_idea, need_everything, have_domain, have_both
    
    -- Scores and Recommendations
    digital_readiness_score INTEGER DEFAULT 0 CHECK (digital_readiness_score >= 0 AND digital_readiness_score <= 100),
    solution_match_score INTEGER DEFAULT 0 CHECK (solution_match_score >= 60 AND solution_match_score <= 95),
    recommended_product VARCHAR(100), -- disblay, topiko_basic, topiko_pro, marketing, brandpreneuring, hebt
    recommendation_data JSONB, -- Full recommendation object
    
    -- Audit Data
    audit_completed BOOLEAN DEFAULT FALSE,
    audit_data JSONB, -- Stores audit questions and answers
    audit_score INTEGER,
    
    -- Lead Management
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to VARCHAR(255),
    
    -- Tracking and Analytics
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    referrer TEXT,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    contacted_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment progress tracking table
CREATE TABLE IF NOT EXISTS assessment_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    assessment_id UUID REFERENCES digital_readiness_assessments(id) ON DELETE CASCADE,
    
    -- Progress Tracking
    current_screen INTEGER DEFAULT 1,
    total_screens INTEGER DEFAULT 4,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    
    -- Form Data (for recovery)
    form_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON digital_readiness_assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON digital_readiness_assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_mobile ON digital_readiness_assessments(mobile_number);
CREATE INDEX IF NOT EXISTS idx_assessments_email ON digital_readiness_assessments(email);
CREATE INDEX IF NOT EXISTS idx_assessments_business_type ON digital_readiness_assessments(business_type);
CREATE INDEX IF NOT EXISTS idx_assessments_recommended_product ON digital_readiness_assessments(recommended_product);
CREATE INDEX IF NOT EXISTS idx_assessments_digital_score ON digital_readiness_assessments(digital_readiness_score);
CREATE INDEX IF NOT EXISTS idx_assessments_solution_score ON digital_readiness_assessments(solution_match_score);
CREATE INDEX IF NOT EXISTS idx_assessments_utm_source ON digital_readiness_assessments(utm_source);

CREATE INDEX IF NOT EXISTS idx_progress_session_id ON assessment_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_progress_assessment_id ON assessment_progress(assessment_id);
CREATE INDEX IF NOT EXISTS idx_progress_last_activity ON assessment_progress(last_activity);

-- Enable Row Level Security
ALTER TABLE digital_readiness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for assessments table
CREATE POLICY "Allow anonymous inserts" ON digital_readiness_assessments
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on own records" ON digital_readiness_assessments
    FOR UPDATE TO anon
    USING (session_id = current_setting('request.session_id', true))
    WITH CHECK (session_id = current_setting('request.session_id', true));

CREATE POLICY "Service role can read all assessments" ON digital_readiness_assessments
    FOR SELECT TO service_role
    USING (true);

CREATE POLICY "Service role can update all assessments" ON digital_readiness_assessments
    FOR UPDATE TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for progress table
CREATE POLICY "Allow anonymous inserts on progress" ON assessment_progress
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous updates on own progress" ON assessment_progress
    FOR UPDATE TO anon
    USING (session_id = current_setting('request.session_id', true))
    WITH CHECK (session_id = current_setting('request.session_id', true));

CREATE POLICY "Service role can read all progress" ON assessment_progress
    FOR SELECT TO service_role
    USING (true);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON digital_readiness_assessments 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_progress_updated_at 
    BEFORE UPDATE ON assessment_progress 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE digital_readiness_assessments IS 'Stores complete digital readiness assessment data with scores and recommendations';
COMMENT ON TABLE assessment_progress IS 'Tracks user progress through the assessment for session recovery';

COMMENT ON COLUMN digital_readiness_assessments.goals IS 'JSONB array of selected goals (e.g., ["more_customers", "brand_recognition"])';
COMMENT ON COLUMN digital_readiness_assessments.recommendation_data IS 'Complete recommendation object from the recommendation engine';
COMMENT ON COLUMN digital_readiness_assessments.audit_data IS 'Audit questions and answers in JSONB format';
COMMENT ON COLUMN digital_readiness_assessments.digital_readiness_score IS 'Honest digital maturity score (0-100)';
COMMENT ON COLUMN digital_readiness_assessments.solution_match_score IS 'How well our solutions fit their needs (60-95)';

-- Sample data insert (for testing - remove in production)
/*
INSERT INTO digital_readiness_assessments (
    full_name, business_name, business_type, city_location, mobile_number,
    goals, digital_status, budget, challenge, timeline,
    digital_readiness_score, solution_match_score, recommended_product,
    recommendation_data, status
) VALUES (
    'John Doe',
    'Doe Retail Store',
    'retail',
    'Mumbai, Maharashtra',
    '+919876543210',
    '["more_customers", "showcase_products"]'::jsonb,
    'none',
    '2k_10k',
    'no_leads',
    'immediately',
    35,
    87,
    'topiko_basic',
    '{"primary_recommendation": {"product_id": "topiko_basic", "confidence": 87}}'::jsonb,
    'new'
);
*/
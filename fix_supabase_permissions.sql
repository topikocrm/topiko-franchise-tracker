-- Fix Supabase Permissions and Policies for Digital Readiness Assessment

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON digital_readiness_assessments;
DROP POLICY IF EXISTS "Allow anonymous updates on own records" ON digital_readiness_assessments;
DROP POLICY IF EXISTS "Allow anonymous inserts on progress" ON assessment_progress;
DROP POLICY IF EXISTS "Allow anonymous updates on own progress" ON assessment_progress;

-- Create more permissive policies for anonymous users
CREATE POLICY "Enable anonymous inserts for assessments" ON digital_readiness_assessments
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Enable anonymous select for assessments" ON digital_readiness_assessments
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "Enable anonymous updates for assessments" ON digital_readiness_assessments
    FOR UPDATE TO anon
    USING (true)
    WITH CHECK (true);

-- Service role policies (for admin dashboard)
CREATE POLICY "Service role full access to assessments" ON digital_readiness_assessments
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Fix assessment_progress table - add unique constraint for session_id
ALTER TABLE assessment_progress ADD CONSTRAINT unique_session_id UNIQUE (session_id);

-- Create policies for progress table
CREATE POLICY "Enable anonymous inserts for progress" ON assessment_progress
    FOR INSERT TO anon
    WITH CHECK (true);

CREATE POLICY "Enable anonymous select for progress" ON assessment_progress
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "Enable anonymous updates for progress" ON assessment_progress
    FOR UPDATE TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access to progress" ON assessment_progress
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Ensure authenticated users can also access
CREATE POLICY "Enable authenticated inserts for assessments" ON digital_readiness_assessments
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable authenticated select for assessments" ON digital_readiness_assessments
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable authenticated updates for assessments" ON digital_readiness_assessments
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable authenticated inserts for progress" ON assessment_progress
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable authenticated select for progress" ON assessment_progress
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Enable authenticated updates for progress" ON assessment_progress
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON digital_readiness_assessments TO anon, authenticated;
GRANT ALL ON assessment_progress TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure the service_role has full access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Add sample data for testing (optional)
INSERT INTO digital_readiness_assessments (
    full_name, business_name, business_type, city_location, mobile_number, email,
    goals, digital_status, budget, challenge, timeline,
    digital_readiness_score, solution_match_score, recommended_product,
    recommendation_data, status
) VALUES 
(
    'Test User',
    'Sample Business', 
    'retail',
    'Mumbai, Maharashtra',
    '+919876543210',
    'test@example.com',
    '["more_customers", "showcase"]'::jsonb,
    'basic_social',
    '2k_10k', 
    'no_leads',
    'immediately',
    65,
    82,
    'topiko_basic',
    '{"primary_recommendation": {"product_id": "topiko_basic", "product_name": "Topiko Basic", "price": 6999, "confidence": 82, "reason": "Good fit for retail business with growth goals"}, "secondary_recommendations": [{"product_id": "marketing", "confidence": 75}, {"product_id": "brandpreneuring", "confidence": 68}]}'::jsonb,
    'new'
) ON CONFLICT DO NOTHING;
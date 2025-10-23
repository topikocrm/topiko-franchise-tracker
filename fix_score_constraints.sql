-- Fix the score constraints to allow 0 for initial records
-- This allows assessments to be created before scores are calculated

-- Drop the existing constraint
ALTER TABLE digital_readiness_assessments 
DROP CONSTRAINT IF EXISTS digital_readiness_assessments_solution_match_score_check;

-- Add new constraint that allows 0 (for initial records) or 60-95 (for calculated scores)
ALTER TABLE digital_readiness_assessments 
ADD CONSTRAINT digital_readiness_assessments_solution_match_score_check 
CHECK (solution_match_score = 0 OR (solution_match_score >= 60 AND solution_match_score <= 95));

-- Also update digital readiness score constraint for consistency
ALTER TABLE digital_readiness_assessments 
DROP CONSTRAINT IF EXISTS digital_readiness_assessments_digital_readiness_score_check;

ALTER TABLE digital_readiness_assessments 
ADD CONSTRAINT digital_readiness_assessments_digital_readiness_score_check 
CHECK (digital_readiness_score >= 0 AND digital_readiness_score <= 100);

-- Add a comment explaining the logic
COMMENT ON COLUMN digital_readiness_assessments.solution_match_score IS 'Solution match score: 0 for initial records, 60-95 for calculated scores';
COMMENT ON COLUMN digital_readiness_assessments.digital_readiness_score IS 'Digital readiness score: 0-100, calculated after assessment completion';
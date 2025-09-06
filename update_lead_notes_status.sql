-- Update the status column to use new business-focused statuses
ALTER TABLE lead_notes 
DROP CONSTRAINT IF EXISTS lead_notes_status_check;

ALTER TABLE lead_notes 
ADD CONSTRAINT lead_notes_status_check 
CHECK (status IN ('not_contacted', 'interested', 'demo_scheduled', 'not_interested', 'future_prospect', 'completed'));

-- Update existing records to use new status values
UPDATE lead_notes 
SET status = CASE 
    WHEN status = 'pending' THEN 'not_contacted'
    WHEN status = 'cancelled' THEN 'not_interested'
    ELSE status
END;

-- Set default value to 'not_contacted'
ALTER TABLE lead_notes 
ALTER COLUMN status SET DEFAULT 'not_contacted';
-- Create lead_notes table for tracking follow-ups and notes for each lead
CREATE TABLE IF NOT EXISTS lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES franchise_leads(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255) DEFAULT 'Admin',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    
    -- Indexes for performance
    CONSTRAINT fk_lead_notes_lead FOREIGN KEY (lead_id) REFERENCES franchise_leads(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX idx_lead_notes_follow_up_date ON lead_notes(follow_up_date);
CREATE INDEX idx_lead_notes_status ON lead_notes(status);
CREATE INDEX idx_lead_notes_created_at ON lead_notes(created_at DESC);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security needs)
CREATE POLICY "Enable all operations for lead_notes" ON lead_notes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Add some comments for documentation
COMMENT ON TABLE lead_notes IS 'Stores follow-up notes and reminders for franchise leads';
COMMENT ON COLUMN lead_notes.lead_id IS 'Reference to the franchise_leads table';
COMMENT ON COLUMN lead_notes.note IS 'The actual note or comment about the lead';
COMMENT ON COLUMN lead_notes.follow_up_date IS 'When to follow up with this lead';
COMMENT ON COLUMN lead_notes.status IS 'Status of the follow-up: pending, completed, or cancelled';
COMMENT ON COLUMN lead_notes.created_by IS 'Who created this note (admin name or email)';
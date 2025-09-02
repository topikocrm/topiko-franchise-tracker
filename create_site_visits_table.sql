-- Create site_visits table for tracking website traffic
CREATE TABLE IF NOT EXISTS site_visits (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    page_url TEXT,
    page_title VARCHAR(255),
    referrer TEXT,
    user_agent TEXT,
    screen_resolution VARCHAR(50),
    viewport_size VARCHAR(50),
    language VARCHAR(10),
    platform VARCHAR(100),
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_site_visits_session_id ON site_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_site_visits_utm_source ON site_visits(utm_source);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows inserting (for anonymous users tracking)
CREATE POLICY "Allow anonymous inserts" ON site_visits
    FOR INSERT TO anon
    WITH CHECK (true);

-- Create a policy that allows service role to read all data
CREATE POLICY "Service role can read all" ON site_visits
    FOR SELECT TO service_role
    USING (true);
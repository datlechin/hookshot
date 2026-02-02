-- Add session_id column to endpoints table for privacy
ALTER TABLE endpoints ADD COLUMN session_id TEXT;

-- Create index for efficient session-based queries
CREATE INDEX IF NOT EXISTS idx_endpoints_session ON endpoints(session_id, created_at DESC);

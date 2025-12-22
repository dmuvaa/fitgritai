-- ============================================================================
-- COACH CONTEXT SNAPSHOT
-- ============================================================================
-- Caches pre-computed user context for fast chat responses
-- Updated when user profile, logs, or plans change
-- Read instantly during chat instead of rebuilding every request

CREATE TABLE IF NOT EXISTS coach_context_snapshot (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  data JSONB, -- Structured context data for programmatic access
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups and maintenance queries
CREATE INDEX IF NOT EXISTS idx_coach_context_snapshot_updated_at 
  ON coach_context_snapshot(updated_at DESC);

-- ============================================================================
-- WORKER COLUMNS FOR coach_actions
-- ============================================================================
-- Add columns for reliable job processing with retries and locking

ALTER TABLE coach_actions
ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
ADD COLUMN IF NOT EXISTS attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_attempts INT DEFAULT 3,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS locked_by TEXT;

-- Create index for idempotency checks
CREATE INDEX IF NOT EXISTS idx_coach_actions_idempotency_key 
  ON coach_actions(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Create index for worker job polling
CREATE INDEX IF NOT EXISTS idx_coach_actions_worker_queue 
  ON coach_actions(status, created_at) 
  WHERE status = 'queued' AND locked_at IS NULL;

-- Update status constraint to include 'processing' for worker jobs
-- Statuses: pending (needs confirmation), queued (ready), processing (locked), completed, failed, cancelled
DO $$
BEGIN
  ALTER TABLE coach_actions 
    DROP CONSTRAINT IF EXISTS coach_actions_status_check;
  
  ALTER TABLE coach_actions 
    ADD CONSTRAINT coach_actions_status_check 
    CHECK (status IN ('pending', 'queued', 'processing', 'completed', 'failed', 'cancelled'));
EXCEPTION
  WHEN others THEN
    NULL;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE coach_context_snapshot ENABLE ROW LEVEL SECURITY;

-- Users can see their own context snapshot
CREATE POLICY "Users can view their own context snapshot"
  ON coach_context_snapshot
  FOR SELECT
  USING (user_id = auth.uid());

-- Service role can manage all snapshots (for worker updates)
-- Note: Service role bypasses RLS by default

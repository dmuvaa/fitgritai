-- ============================================================================
-- PLAN GENERATION JOBS
-- ============================================================================
-- Tracks asynchronous plan generation jobs with real-time status updates

CREATE TABLE IF NOT EXISTS plan_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'checking_profile', 'checking_previous_workouts', 'creating_plan', 'complete', 'failed')),
  request_payload JSONB NOT NULL, -- Stores user's schedule: { startDate, schedule: [{ day, focus }] }
  result_payload JSONB, -- Stores generated plans on completion
  error_message TEXT,
  progress_data JSONB, -- Stores intermediate progress: { currentDay, totalDays, currentWeek, totalWeeks }
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for efficient job lookups
CREATE INDEX IF NOT EXISTS idx_plan_generation_jobs_user_id ON plan_generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_generation_jobs_status ON plan_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_plan_generation_jobs_created_at ON plan_generation_jobs(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_plan_generation_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_plan_generation_jobs_updated_at
  BEFORE UPDATE ON plan_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_plan_generation_jobs_updated_at();

-- RLS Policies
ALTER TABLE plan_generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own plan generation jobs"
  ON plan_generation_jobs FOR ALL 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());


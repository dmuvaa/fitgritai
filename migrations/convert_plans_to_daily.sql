-- Migration: Convert personalized_plans from week-based to day-based storage
-- This allows for granular day-by-day plans instead of monolithic week blobs
-- 
-- Note: This migration assumes the table is empty (all rows have been deleted).
-- If you have existing data, you'll need to migrate it separately.

-- Step 1: Add new columns for day-based storage
ALTER TABLE personalized_plans
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS focus TEXT,
  ADD COLUMN IF NOT EXISTS workout_content JSONB,
  ADD COLUMN IF NOT EXISTS nutrition_guidance JSONB,
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;

-- Step 2: Create index on (user_id, date) for fast lookups
CREATE INDEX IF NOT EXISTS idx_personalized_plans_user_date 
  ON personalized_plans(user_id, date);

-- Step 3: Add unique constraint to prevent duplicate plans for the same day
-- This ensures one plan per user per date per plan_type
-- Drop constraint first if it exists (to allow re-running the migration)
ALTER TABLE personalized_plans
  DROP CONSTRAINT IF EXISTS unique_user_date_plan;

ALTER TABLE personalized_plans
  ADD CONSTRAINT unique_user_date_plan 
  UNIQUE (user_id, date, plan_type);

-- Note: The week_number and content columns are kept for backward compatibility
-- You can drop them later after verifying everything works correctly:
-- ALTER TABLE personalized_plans DROP COLUMN week_number;
-- ALTER TABLE personalized_plans DROP COLUMN content;


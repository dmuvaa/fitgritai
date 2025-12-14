-- Add target_duration column to workout_exercises table
-- This column stores the target duration in seconds for cardio/HIIT exercises

ALTER TABLE public.workout_exercises
ADD COLUMN IF NOT EXISTS target_duration integer;

-- Add comment to document the column
COMMENT ON COLUMN public.workout_exercises.target_duration IS 'Target duration in seconds for cardio/HIIT exercises';

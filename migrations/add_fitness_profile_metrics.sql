-- Adds structured benchmark & body metric tracking to user_fitness_profile

ALTER TABLE user_fitness_profile
  ADD COLUMN IF NOT EXISTS exercise_benchmarks JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS body_metrics JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN user_fitness_profile.exercise_benchmarks IS
  'Array of strength benchmark objects: [{ exercise, current_weight, current_reps, target_weight, target_date }]';

COMMENT ON COLUMN user_fitness_profile.body_metrics IS
  'Body measurement snapshot (e.g., waist_size_cm, body_fat_percentage, current_weight_kg)';


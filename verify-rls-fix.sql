-- Verify RLS policies after fix
-- Run this after applying fix-rls-policies.sql

-- Check that all policies now have WITH CHECK clauses
SELECT 
  n.nspname AS schema, 
  c.relname AS table_name, 
  p.polname AS policy_name,
  CASE p.polcmd 
    WHEN 'r' THEN 'SELECT' 
    WHEN 'a' THEN 'INSERT' 
    WHEN 'w' THEN 'UPDATE' 
    WHEN 'd' THEN 'DELETE' 
    WHEN '*' THEN 'ALL'
    ELSE p.polcmd 
  END AS applies_to,
  p.polpermissive AS permissive,
  pg_get_expr(p.polqual, p.polrelid) AS using_expr,
  pg_get_expr(p.polwithcheck, p.polrelid) AS with_check_expr
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('workout_sessions', 'workout_exercises', 'workout_sets', 'rest_timers', 'user_workout_templates', 'workout_templates')
ORDER BY schema, table_name, policy_name;

-- Check RLS status
SELECT 
  n.nspname AS schema, 
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled, 
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname = 'public'
  AND c.relname IN ('workout_sessions', 'workout_exercises', 'workout_sets', 'rest_timers', 'user_workout_templates', 'workout_templates')
ORDER BY table_name;

-- Test query to verify policies work
-- This should return data if you're authenticated
SELECT COUNT(*) as workout_sessions_count FROM workout_sessions;
SELECT COUNT(*) as workout_exercises_count FROM workout_exercises;
SELECT COUNT(*) as workout_sets_count FROM workout_sets;



























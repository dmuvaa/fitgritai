-- Migration: Create email_preferences table with notification preferences
-- Run this in Supabase SQL Editor

-- Create the email_preferences table
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email toggles
  daily_reminders BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT true,
  achievement_emails BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  
  -- In-app notifications
  in_app_notifications BOOLEAN DEFAULT true,
  
  -- Reminder intervals (1-3 selections from: 24_hours, 48_hours, 3_days, 1_week, 1_month)
  logging_reminder_intervals TEXT[] DEFAULT ARRAY['24_hours']::TEXT[],
  insights_delivery_intervals TEXT[] DEFAULT ARRAY['1_week']::TEXT[],
  
  -- Optional quiet hours
  quiet_hours_start TIME DEFAULT NULL,
  quiet_hours_end TIME DEFAULT NULL,
  
  -- Tracking for cron jobs
  reminder_time TIME DEFAULT NULL,
  timezone TEXT DEFAULT 'UTC',
  last_logging_reminder_sent_at TIMESTAMPTZ DEFAULT NULL,
  last_insights_sent_at TIMESTAMPTZ DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user
  CONSTRAINT email_preferences_user_id_unique UNIQUE (user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences (user_id);

-- Enable RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Comment for documentation
COMMENT ON TABLE email_preferences IS 'User notification and email preferences';
COMMENT ON COLUMN email_preferences.logging_reminder_intervals IS 'Array of intervals: 24_hours, 48_hours, 3_days, 1_week, 1_month (1-3 selections)';
COMMENT ON COLUMN email_preferences.insights_delivery_intervals IS 'Array of intervals for AI insights delivery';

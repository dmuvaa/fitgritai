-- ============================================================================
-- COACH CONVERSATIONS & MESSAGES
-- ============================================================================
-- Stores conversation threads and messages between user and AI coach

-- Coach Conversations (one per conversation thread)
CREATE TABLE IF NOT EXISTS coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT, -- Optional: AI-generated or user-set title
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coach Messages (individual messages in a conversation)
CREATE TABLE IF NOT EXISTS coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES coach_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB, -- Store any additional context (e.g., suggested actions, reasoning)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coach Actions (audit trail of what the AI actually changed)
CREATE TABLE IF NOT EXISTS coach_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES coach_conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES coach_messages(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- e.g. 'GENERATE_PLANS', 'UPDATE_PLAN', 'LOG_WORKOUT', 'LOG_MEAL', 'ADJUST_GOALS'
  target_table TEXT, -- e.g. 'personalized_plans', 'workout_sessions', 'meal_logs'
  target_id UUID, -- ID of the affected record
  payload JSONB NOT NULL, -- Parameters used, before/after snapshot, error details, etc.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_conversations_user_id ON coach_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_conversations_updated_at ON coach_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_messages_conversation_id ON coach_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_coach_messages_user_id ON coach_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_messages_created_at ON coach_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_actions_user_id ON coach_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_coach_actions_conversation_id ON coach_actions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_coach_actions_action_type ON coach_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_coach_actions_created_at ON coach_actions(created_at DESC);

-- Updated_at trigger for conversations
CREATE OR REPLACE FUNCTION update_coach_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coach_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coach_conversations_on_message
  AFTER INSERT ON coach_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_conversations_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_actions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY "Users see their own coach conversations"
  ON coach_conversations
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can only see their own messages
CREATE POLICY "Users see their own coach messages"
  ON coach_messages
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can only see their own actions
CREATE POLICY "Users see their own coach actions"
  ON coach_actions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


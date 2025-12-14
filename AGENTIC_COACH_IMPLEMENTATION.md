# Agentic AI Coach Implementation Summary

## What Was Built

A fully agentic AI coach that can **read**, **think**, **act**, and **explain** - not just chat.

### Key Features

1. **Comprehensive Context Loading**
   - User profile, fitness profile, goals
   - Recent logs (weight, meals, activities, moods, workouts)
   - Current personalized plans
   - Workout sessions
   - Conversation history

2. **Agentic Actions**
   - Generate/regenerate personalized plans
   - Update plans (replace exercises, adjust volume)
   - Log workouts from natural language
   - Log meals from natural language
   - Log weight and mood
   - Adjust goals

3. **Action Logging & Transparency**
   - All actions logged to `coach_actions` table
   - Full audit trail with parameters, reasoning, results
   - Users can see what the AI changed

4. **Confirmation Flow**
   - Dangerous actions require user confirmation
   - Simple logging happens automatically

## Files Created

1. **`migrations/create_coach_tables.sql`**
   - `coach_conversations` - Conversation threads
   - `coach_messages` - Individual messages
   - `coach_actions` - Action audit trail
   - RLS policies for security

2. **`app/api/coach/chat/route.ts`**
   - Main agentic coach endpoint
   - Context loading
   - Action detection and execution
   - Action logging

3. **`app/api/coach/README.md`**
   - Comprehensive documentation
   - Example flows
   - API reference

## How to Use

### Step 1: Run Database Migration

```sql
-- Run the migration file
\i migrations/create_coach_tables.sql
```

Or apply it via Supabase dashboard.

### Step 2: Use the New Endpoint

Instead of `/api/chat`, use `/api/coach/chat`:

```typescript
const response = await fetch('/api/coach/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'My knees hurt on squats, what should I do?',
    userId: user.id,
    conversationId: conversationId, // optional
  }),
})

const data = await response.json()
// data.message - The coach's response
// data.action - Action taken (if any)
// data.actionResult - Result of action
// data.requiresConfirmation - Whether action needs confirmation
```

### Step 3: Handle Confirmation (if needed)

If `requiresConfirmation` is true, show a confirmation UI:

```typescript
if (data.requiresConfirmation) {
  // Show confirmation dialog
  // On confirm, call the endpoint again with confirmation
}
```

## Example Use Cases

### Use Case 1: Pain/Injury Response

**User:** "My knees hurt on squats and I only have dumbbells at home now."

**Coach:**
1. Reads fitness profile, current plans, equipment
2. Thinks: "Knee pain → avoid squats, use dumbbells → split squats, RDLs"
3. Acts: Updates plan to replace squats
4. Explains: "I've updated this week's plan: replaced back squats with dumbbell split squats and RDLs."

### Use Case 2: Workout Logging

**User:** "Today I did 3x8 squats at 80kg and 20 minutes of cycling."

**Coach:**
1. Parses workout details
2. Acts: Logs workout automatically
3. Explains: "I've logged your workout. Great work!"

### Use Case 3: Plan Regeneration

**User:** "I can now train 5 days instead of 3 and I have access to a barbell gym."

**Coach:**
1. Reads current profile
2. Thinks: "Need to regenerate with new schedule and equipment"
3. Asks: "Want me to rebuild the next 4 weeks?"
4. On confirm: Regenerates plans
5. Explains: "I've generated your new 5-day split. Here's Week 1..."

## Action Types

- `GENERATE_PLANS` - Regenerate personalized plans
- `UPDATE_PLAN` - Modify existing plans
- `LOG_WORKOUT` - Log workout from text
- `LOG_MEAL` - Log meal from text
- `LOG_WEIGHT` - Log weight
- `LOG_MOOD` - Log mood
- `ADJUST_GOALS` - Update goals
- `NONE` - No action needed

## Next Steps

1. **Run Migration** - Apply the SQL migration to create tables
2. **Update Frontend** - Switch chat components to use `/api/coach/chat`
3. **Test Actions** - Try the example use cases above
4. **Add Confirmation UI** - For actions requiring confirmation
5. **Future Enhancements:**
   - Function calling for better action parsing
   - Plan PATCH endpoint for direct plan updates
   - Better natural language parsing
   - Action history UI

## Migration Notes

The old `/api/chat` endpoint still works for backward compatibility. Gradually migrate to `/api/coach/chat` for agentic features.


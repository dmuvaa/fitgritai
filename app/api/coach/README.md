# Agentic AI Coach API

## Overview

The Agentic AI Coach is a sophisticated fitness coaching system that doesn't just respond - it **acts** on behalf of users. Unlike traditional chatbots, it can:

1. **Read** comprehensive user context (profile, goals, logs, plans, workouts)
2. **Think** about what actions are needed
3. **Act** by calling APIs to modify plans, log data, update goals
4. **Explain** what was changed and why

## Architecture

### Database Tables

1. **coach_conversations** - Conversation threads
2. **coach_messages** - Individual messages in conversations
3. **coach_actions** - Audit trail of all actions taken by the AI

### API Endpoint

`POST /api/coach/chat`

**Request:**
```json
{
  "message": "My knees hurt on squats and I only have dumbbells at home now. What should I do this week?",
  "userId": "user-id",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "message": "I've updated this week's plan: replaced back squats with dumbbell split squats and RDLs...",
  "action": {
    "type": "UPDATE_PLAN",
    "requiresConfirmation": false,
    "parameters": {...},
    "reasoning": "Knee pain → avoid deep heavy squats"
  },
  "actionResult": {
    "success": true,
    "message": "Plan updated successfully"
  },
  "conversationId": "conv-id",
  "requiresConfirmation": false
}
```

## Agentic Actions

The coach can execute these actions:

### 1. GENERATE_PLANS
Regenerates personalized workout/meal plans based on updated preferences.

**When triggered:**
- User mentions equipment change
- User wants to change schedule/preferences
- User requests a new plan

**Example:**
```
User: "I can now train 5 days instead of 3 and I have access to a barbell gym."
Coach: "Let's do Upper/Lower/Push/Pull/Legs. Want me to rebuild the next 4 weeks?"
→ Calls /api/personalized-plans/generate-from-data
```

### 2. UPDATE_PLAN
Modifies specific workouts or meals in existing plans.

**When triggered:**
- User mentions pain/injury
- User wants to replace exercises
- User missed workouts and needs rescheduling

**Example:**
```
User: "My shoulder hurts when I press overhead."
Coach: "I'll replace all overhead presses with landmine press for the next 2 weeks."
→ Updates personalized_plans table
```

### 3. LOG_WORKOUT
Creates workout session entries from natural language.

**When triggered:**
- User describes a workout they did
- User mentions exercises performed

**Example:**
```
User: "Today I did 3x8 squats at 80kg and 20 minutes of cycling."
Coach: "Got it! I've logged your workout."
→ Calls /api/logs/activity
```

### 4. LOG_MEAL
Creates meal log entries from natural language.

**When triggered:**
- User describes a meal they ate

**Example:**
```
User: "Ate chicken and rice for lunch, maybe ~700 calories"
Coach: "I've logged your meal."
→ Calls /api/logs/meals
```

### 5. LOG_WEIGHT
Creates weight log entries.

**When triggered:**
- User mentions weight change

### 6. LOG_MOOD
Creates mood log entries.

**When triggered:**
- User mentions how they feel

### 7. ADJUST_GOALS
Updates user goals based on progress or requests.

**When triggered:**
- User wants to change calorie targets
- User wants to adjust macros

## Context Loading

The coach loads comprehensive context before responding:

1. **User Profile** - Basic info, weight, height, goals
2. **Fitness Profile** - Goals, fitness level, equipment, injuries
3. **User Goals** - Calorie targets, macros, BMR/TDEE
4. **Recent Logs** - Last 30 days of all logs
5. **Personalized Plans** - Current workout/meal plans
6. **Workout Sessions** - Recent completed workouts
7. **Conversation History** - Last 10 messages for context

## Action Detection

The AI uses structured JSON output to indicate actions:

```json
{
  "action": {
    "type": "GENERATE_PLANS",
    "requiresConfirmation": true,
    "parameters": {
      "workout_days": ["Monday", "Wednesday", "Friday"],
      "equipment": ["dumbbells"]
    },
    "reasoning": "User wants to switch from 3 to 5 days with new equipment"
  }
}
```

## Confirmation Flow

Some actions require user confirmation:

- **Always ask for confirmation:**
  - Modifying or regenerating plans
  - Significant changes to goals
  - Actions affecting multiple weeks

- **Execute immediately:**
  - Logging workouts/meals/weight/mood
  - Small goal adjustments

## Action Logging

All actions are logged to `coach_actions` table with:
- Action type
- Parameters used
- Result/error
- Reasoning
- Status (pending/completed/failed)

This provides full transparency and auditability.

## Example Flows

### Flow 1: Pain/Injury Response
```
User: "My knees hurt on squats and I only have dumbbells at home now."
Coach: [Reads profile, plans, recent workouts]
       [Thinks: Knee pain → avoid squats, use dumbbells → split squats, RDLs]
       [Acts: UPDATE_PLAN to replace squats]
       "I've updated this week's plan: replaced back squats with dumbbell 
        split squats and RDLs. Focus on slow tempo and stop if pain >3/10."
```

### Flow 2: Workout Logging
```
User: "Today I did 3x8 squats at 80kg and 20 minutes of cycling."
Coach: [Parses workout details]
       [Acts: LOG_WORKOUT]
       "I've logged your workout: 3 sets of squats at 80kg and 20 minutes 
        of cycling. Great work!"
```

### Flow 3: Plan Regeneration
```
User: "I can now train 5 days instead of 3 and I have access to a barbell gym."
Coach: [Reads current profile]
       [Thinks: Need to regenerate with new schedule and equipment]
       [Asks: "Want me to rebuild the next 4 weeks?"]
User: "Yes"
Coach: [Acts: GENERATE_PLANS]
       "I've generated your new 5-day Upper/Lower/Push/Pull/Legs split. 
        Here's Week 1..."
```

## Migration from Old Chat

The old `/api/chat` endpoint still works for backward compatibility, but new features should use `/api/coach/chat` for agentic capabilities.

## Future Enhancements

1. **Function Calling** - Use OpenRouter's native function calling instead of JSON parsing
2. **Plan PATCH Endpoint** - Direct plan modification endpoint
3. **Natural Language Parsing** - Better extraction of workout/meal details from text
4. **Multi-step Actions** - Chain multiple actions together
5. **Action History UI** - Show users what the coach has changed


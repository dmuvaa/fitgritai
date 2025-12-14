import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export const dynamic = "force-dynamic"

/**
 * Agentic AI Coach Chat Endpoint
 * 
 * This endpoint makes the AI coach truly agentic by:
 * 1. Loading comprehensive user context (profile, goals, logs, plans, workouts)
 * 2. Detecting when the AI should ACT (not just respond)
 * 3. Executing actions (regenerate plans, update plans, log workouts/meals)
 * 4. Logging all actions for transparency
 * 5. Explaining what was changed
 */

interface CoachAction {
  type: 'GENERATE_PLANS' | 'UPDATE_PLAN' | 'LOG_WORKOUT' | 'LOG_MEAL' | 'LOG_WEIGHT' | 'LOG_MOOD' | 'ADJUST_GOALS' | 'UPDATE_BENCHMARK' | 'NONE'
  requiresConfirmation: boolean
  parameters?: Record<string, any>
  reasoning?: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationId, confirmAction } = await request.json()

    if (!message || !userId) {
      return NextResponse.json({ error: "Message and userId are required" }, { status: 400 })
    }

    const supabase = await getSupabaseForRequest(request)

    // Verify authentication first
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      console.error("[Coach] Authentication failed:", authError?.message)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure userId matches authenticated user
    const authenticatedUserId = authData.user.id
    if (userId !== authenticatedUserId) {
      console.error("[Coach] User ID mismatch:", { provided: userId, authenticated: authenticatedUserId })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // If confirming an action, check for pending actions first
    if (confirmAction || message.toLowerCase().trim() === 'yes' || message.toLowerCase().trim() === 'confirm') {
      const { data: pendingActions } = await supabase
        .from("coach_actions")
        .select("*")
        .eq("user_id", authenticatedUserId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)

      if (pendingActions && pendingActions.length > 0) {
        const pendingAction = pendingActions[0]
        // Execute the pending action
        const action = pendingAction.payload as any
        // This will be handled in the action execution section below
      }
    }

    // ============================================================================
    // STEP 1: LOAD COMPREHENSIVE USER CONTEXT
    // ============================================================================
    console.log("[Coach] Loading user context for:", authenticatedUserId)

    // Get or create conversation
    let convId = conversationId
    if (!convId) {
      const { data: newConv } = await supabase
        .from("coach_conversations")
        .insert({ user_id: authenticatedUserId })
        .select()
        .single()
      convId = newConv?.id
    }

    // Load user profile (may not exist if user hasn't completed onboarding)
    const { data: profile } = await supabase.from("users").select("*").eq("id", authenticatedUserId).maybeSingle()

    // Create a basic profile object from auth user if profile doesn't exist
    const userProfile = profile || {
      id: authenticatedUserId,
      email: authData.user.email,
      name: authData.user.user_metadata?.name || authData.user.email?.split("@")[0] || "User",
      height: 0,
      starting_weight: 0,
      current_weight: 0,
      goal_weight: 0,
    }

    // Load fitness profile
    const { data: fitnessProfile } = await supabase
      .from("user_fitness_profile")
      .select("*")
      .eq("user_id", authenticatedUserId)
      .maybeSingle()

    // Load user goals
    const { data: goals } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", authenticatedUserId)
      .maybeSingle()

    // Load recent logs (last 30 days)
    // Forward auth header for internal fetch
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    const fetchHeaders: Record<string, string> = {}
    if (authHeader) fetchHeaders['authorization'] = authHeader
    if (cookieHeader) fetchHeaders['cookie'] = cookieHeader

    const logsResponse = await fetch(`${request.nextUrl.origin}/api/logs/all?days=30`, {
      headers: fetchHeaders,
    })
    const logs = await logsResponse.json()

    // Load personalized plans
    const plansResponse = await fetch(`${request.nextUrl.origin}/api/personalized-plans`, {
      headers: fetchHeaders,
    })
    const plansData = await plansResponse.json()
    const plans = plansData.plans || []

    // Load recent workout sessions
    const { data: workoutSessions } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", authenticatedUserId)
      .order("completed_at", { ascending: false })
      .limit(20)

    // Load recent coach messages for context
    const { data: recentMessages } = await supabase
      .from("coach_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: false })
      .limit(10)

    // ============================================================================
    // STEP 2: BUILD COMPREHENSIVE CONTEXT SUMMARY
    // ============================================================================
    const currentWeight = userProfile.current_weight || userProfile.starting_weight || 0
    const weightLost = (userProfile.starting_weight || 0) - currentWeight
    const progressPercentage = userProfile.goal_weight && userProfile.starting_weight
      ? Math.round(
        ((userProfile.starting_weight - currentWeight) / (userProfile.starting_weight - userProfile.goal_weight)) * 100,
      )
      : 0

    // Analyze trends
    const recentWeights = logs.weight?.slice(0, 7) || []
    const weightTrend =
      recentWeights.length > 1
        ? recentWeights[0].weight - recentWeights[recentWeights.length - 1].weight
        : 0

    const recentMeals = logs.meals?.filter(
      (meal: any) => new Date(meal.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ) || []
    const totalCalories = recentMeals.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0)
    const avgDailyCalories = recentMeals.length > 0 ? Math.round(totalCalories / 7) : 0

    // Summarize workout completion
    const completedWorkouts = workoutSessions?.filter((w: any) => w.status === 'completed') || []
    const recentWorkouts = completedWorkouts.slice(0, 7)
    const workoutCompletionRate = plans.length > 0
      ? Math.round((completedWorkouts.length / (plans.length * 7)) * 100)
      : 0

    // Build context summary
    // Format exercise benchmarks for context
    const exerciseBenchmarks = fitnessProfile?.exercise_benchmarks || []
    const benchmarksSummary = exerciseBenchmarks.length > 0
      ? exerciseBenchmarks.map((b: any) =>
        `  - ${b.exercise}: ${b.current_weight}kg x ${b.current_reps} reps${b.target_weight ? ` (Target: ${b.target_weight}kg by ${b.target_date || 'N/A'})` : ''}`
      ).join('\n')
      : '  - No benchmarks recorded'

    // Format body metrics
    const bodyMetrics = fitnessProfile?.body_metrics || {}
    const bodyMetricsSummary = Object.keys(bodyMetrics).length > 0
      ? `  - Waist: ${bodyMetrics.waist_size_cm || 'N/A'}cm
  - Body Fat: ${bodyMetrics.body_fat_percentage || 'N/A'}%`
      : '  - No body metrics recorded'

    // Format strength levels
    const strengthLevels = fitnessProfile?.strength_levels || {}
    const strengthLevelsSummary = Object.keys(strengthLevels).length > 0
      ? Object.entries(strengthLevels).map(([category, level]) => `  - ${category}: ${level}`).join('\n')
      : '  - No strength levels assessed'

    // Format food preferences
    const foodPreferences = fitnessProfile ? {
      dietary_restrictions: fitnessProfile.dietary_restrictions || [],
      food_allergies: fitnessProfile.food_allergies || [],
      disliked_foods: fitnessProfile.disliked_foods || [],
      preferred_foods: fitnessProfile.preferred_foods || [],
      accessible_foods: fitnessProfile.accessible_foods || [],
    } : null

    const foodPreferencesSummary = foodPreferences
      ? `  - Dietary Restrictions: ${foodPreferences.dietary_restrictions.length > 0 ? foodPreferences.dietary_restrictions.join(', ') : 'None'}
  - Food Allergies: ${foodPreferences.food_allergies.length > 0 ? foodPreferences.food_allergies.join(', ') : 'None'}
  - Disliked Foods: ${foodPreferences.disliked_foods.length > 0 ? foodPreferences.disliked_foods.join(', ') : 'None'}
  - Preferred Foods: ${foodPreferences.preferred_foods.length > 0 ? foodPreferences.preferred_foods.join(', ') : 'Not specified'}
  - Accessible Foods: ${foodPreferences.accessible_foods.length > 0 ? foodPreferences.accessible_foods.join(', ') : 'Not specified'}`
      : '  - No food preferences set'

    // Format recent workout details (last 3 with max 4 exercises each)
    const recentWorkoutDetails = workoutSessions?.slice(0, 3).map((w: any) => {
      const exercises = (w.exercises || []).slice(0, 4)
      const exerciseList = exercises.length > 0
        ? exercises.map((e: any) => `${e.name || e.exercise_name}: ${e.sets}x${e.reps}`).join(', ')
        : w.workout_name || 'General'
      const date = w.completed_at ? new Date(w.completed_at).toLocaleDateString() : '?'
      return `  - ${date}: ${exerciseList}`
    }).join('\n') || '  - No recent workouts'

    const contextSummary = `
USER PROFILE:
- Name: ${userProfile.name || 'User'}
- Height: ${userProfile.height || 0}cm
- Starting Weight: ${userProfile.starting_weight || 0}kg
- Current Weight: ${currentWeight}kg
- Goal Weight: ${userProfile.goal_weight || 0}kg
- Weight Lost: ${weightLost.toFixed(1)}kg
- Progress Toward Goal: ${progressPercentage}%

FITNESS PROFILE:
${fitnessProfile ? `
- Primary Goals: ${Array.isArray(fitnessProfile.primary_goals) ? fitnessProfile.primary_goals.join(', ') : 'Not set'}
- Fitness Level: ${fitnessProfile.fitness_level || 'Not set'}
- Workout Days: ${Array.isArray(fitnessProfile.workout_days) ? fitnessProfile.workout_days.join(', ') : 'Not set'}
- Available Equipment: ${Array.isArray(fitnessProfile.available_equipment) ? fitnessProfile.available_equipment.join(', ') : 'None'}
- Workout Duration Preference: ${fitnessProfile.workout_duration || 'Not set'} minutes
- Injuries/Limitations: ${fitnessProfile.injuries_limitations || 'None'}
- Preferred Activities: ${Array.isArray(fitnessProfile.preferred_activities) ? fitnessProfile.preferred_activities.join(', ') : 'Not specified'}
- Disliked Exercises: ${Array.isArray(fitnessProfile.disliked_exercises) ? fitnessProfile.disliked_exercises.join(', ') : 'None'}
` : '- No fitness profile created yet'}

EXERCISE BENCHMARKS (Current PRs/Working Weights):
${benchmarksSummary}

BODY METRICS:
${bodyMetricsSummary}

STRENGTH LEVELS BY CATEGORY:
${strengthLevelsSummary}

FOOD PREFERENCES:
${foodPreferencesSummary}

GOALS:
${goals ? `
- Daily Calorie Target: ${goals.daily_calorie_goal || 'Not set'} kcal
- Daily Protein Target: ${goals.daily_protein_goal || 'Not set'}g
- Daily Carbs Target: ${goals.daily_carbs_goal || 'Not set'}g
- Daily Fat Target: ${goals.daily_fat_goal || 'Not set'}g
- BMR: ${goals.calculated_bmr || 'Not calculated'} kcal
- TDEE: ${goals.calculated_tdee || 'Not calculated'} kcal
- Weekly Weight Goal: ${goals.weekly_weight_goal || 'Not set'}kg/week
` : '- No goals set yet'}

RECENT ACTIVITY SUMMARY (Last 30 days):
- Weight Logs: ${logs.weight?.length || 0} entries
- Meal Logs: ${logs.meals?.length || 0} entries
- Activity Logs: ${logs.activities?.length || 0} entries
- Mood Logs: ${logs.moods?.length || 0} entries
- Completed Workouts: ${completedWorkouts.length} sessions
- Workout Completion Rate: ${workoutCompletionRate}%

DETAILED LOG ENTRIES (Last 7 days):
${(() => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        // Weight logs - limit to 5
        const recentWeightLogs = (logs.weight || [])
          .filter((w: any) => new Date(w.date) >= sevenDaysAgo)
          .slice(0, 5)
          .map((w: any) => `  ${w.date}: ${w.weight}kg`)
          .join('\n') || '  None'

        // Meal logs - limit to 5, simplified format
        const recentMealLogs = (logs.meals || [])
          .filter((m: any) => new Date(m.date) >= sevenDaysAgo)
          .slice(0, 5)
          .map((m: any) => `  ${m.date}: ${m.calories || '?'}kcal, ${m.protein || '?'}g protein`)
          .join('\n') || '  None'

        // Activity logs - limit to 3
        const recentActivityLogs = (logs.activities || [])
          .filter((a: any) => new Date(a.date) >= sevenDaysAgo)
          .slice(0, 3)
          .map((a: any) => `  ${a.date}: ${a.workout_type || 'Activity'}`)
          .join('\n') || '  None'

        // Mood logs - limit to 3
        const recentMoodLogs = (logs.moods || [])
          .filter((m: any) => new Date(m.date) >= sevenDaysAgo)
          .slice(0, 3)
          .map((m: any) => `  ${m.date}: ${m.mood}/10`)
          .join('\n') || '  None'

        return `Weight:\n${recentWeightLogs}\nMeals:\n${recentMealLogs}\nActivities:\n${recentActivityLogs}\nMood:\n${recentMoodLogs}`
      })()}

RECENT WORKOUT SESSIONS (with exercises):
${recentWorkoutDetails}

CURRENT PLANS:
- Active Workout Plans: ${plans.filter((p: any) => p.plan_type === 'workout').length} weeks
- Active Meal Plans: ${plans.filter((p: any) => p.plan_type === 'meal').length} weeks
- Current Week Number: ${plans.length > 0 ? Math.min(...plans.map((p: any) => p.week_number)) : 'No plans'}

RECENT TRENDS:
- 7-Day Weight Trend: ${weightTrend > 0 ? '+' : ''}${Math.round(weightTrend * 10) / 10}kg
- Average Daily Calories (Last 7 Days): ${avgDailyCalories} kcal
- Recent Workouts Completed: ${recentWorkouts.length} in last 7 days
`


    // ============================================================================
    // STEP 3: SYSTEM PROMPT WITH AGENTIC CAPABILITIES
    // ============================================================================
    const systemPrompt = `You are FitGrit AI, an agentic fitness coach. You don't just give advice - you ACT on behalf of the user when appropriate. You have access to comprehensive user data including their exercise benchmarks, body metrics, strength levels, food preferences, and workout history.

YOUR CAPABILITIES (TOOLS YOU CAN USE):
1. GENERATE_PLANS - Regenerate personalized workout/meal plans based on updated preferences
2. UPDATE_PLAN - Modify specific workouts or meals in existing plans (e.g., replace exercises, adjust volume)
3. LOG_WORKOUT - Create workout session entries from natural language descriptions
4. LOG_MEAL - Create meal log entries from natural language descriptions
5. LOG_WEIGHT - Create weight log entries
6. LOG_MOOD - Create mood log entries
7. ADJUST_GOALS - Update user goals based on progress or requests
8. UPDATE_BENCHMARK - Update user's exercise benchmarks when they report new PRs or working weights

WHEN TO ACT:
- User mentions pain/injury → UPDATE_PLAN to replace problematic exercises (consider their injuries_limitations)
- User mentions equipment change → GENERATE_PLANS or UPDATE_PLAN (reference their available_equipment)
- User describes a workout they did → LOG_WORKOUT with exercise details
- User describes a meal they ate → LOG_MEAL (respect their dietary_restrictions and food_allergies)
- User mentions weight change → LOG_WEIGHT
- User mentions missing workouts → UPDATE_PLAN to reschedule
- User wants to change schedule/preferences → GENERATE_PLANS
- User reports new PR or improved lift → UPDATE_BENCHMARK
- User asks about their strength levels → Reference their exercise_benchmarks and strength_levels data

WHEN TO ASK FOR CONFIRMATION:
- Modifying or regenerating plans (always ask: "Should I update your plan now?")
- Significant changes to goals
- Actions that affect multiple weeks of plans
- Updating exercise benchmarks

RESPONSE FORMAT:
When you decide to act, respond with this JSON structure at the start of your message:
\`\`\`json
{
  "action": {
    "type": "ACTION_TYPE",
    "requiresConfirmation": true/false,
    "parameters": {...},
    "reasoning": "Why you're doing this"
  }
}
\`\`\`

Then follow with your natural language explanation.

If no action is needed, use:
\`\`\`json
{"action": {"type": "NONE"}}
\`\`\`

COACHING STYLE:
- Be direct, honest, supportive, and encouraging
- Reference SPECIFIC data from their profile (mention their exact benchmarks, equipment, goals by name)
- When discussing exercises, consider their available equipment and injury limitations
- When suggesting meals, respect their dietary restrictions, allergies, and food preferences
- Identify patterns and trends in their workout completion and progress
- Track their progress toward benchmark targets and celebrate PRs
- Give actionable, personalized advice based on their fitness level
- When you act, explain what you changed and why
- Keep responses concise but helpful
- If they seem stuck or demotivated, acknowledge it and offer practical solutions`


    // ============================================================================
    // STEP 4: CALL OPENROUTER WITH STRUCTURED OUTPUT
    // ============================================================================
    const messages = [
      { role: "system", content: systemPrompt + "\n\n" + contextSummary },
      ...(recentMessages
        ?.slice()
        .reverse()
        .slice(-8)
        .map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })) || []),
      { role: "user", content: message },
    ]

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "FitGrit AI Coach",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: messages,
        max_tokens: 5000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API error:", response.status, errorText)
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const aiResponse = await response.json()

    // Debug log the OpenRouter response structure
    console.log("[Coach] OpenRouter response structure:", {
      hasChoices: !!aiResponse.choices,
      choicesLength: aiResponse.choices?.length,
      firstChoice: aiResponse.choices?.[0] ? {
        hasMessage: !!aiResponse.choices[0].message,
        messageContent: aiResponse.choices[0].message?.content?.slice(0, 100) || 'EMPTY',
        finishReason: aiResponse.choices[0].finish_reason,
      } : 'NO_CHOICES',
      error: aiResponse.error,
    })

    // Handle potential error in response
    if (aiResponse.error) {
      console.error("[Coach] OpenRouter error in response:", aiResponse.error)
      throw new Error(`OpenRouter returned error: ${aiResponse.error.message || JSON.stringify(aiResponse.error)}`)
    }

    const aiMessageContent =
      aiResponse.choices?.[0]?.message?.content ||
      "I'm having trouble processing that right now. Please try again."

    // ============================================================================
    // STEP 5: PARSE ACTION FROM RESPONSE
    // ============================================================================
    let action: CoachAction | null = null
    let finalMessage = aiMessageContent

    // Try to extract JSON action from response
    const jsonMatch = aiMessageContent.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1])
        if (parsed.action) {
          action = parsed.action
          // Remove JSON from final message
          finalMessage = aiMessageContent.replace(/```json\s*[\s\S]*?\s*```/g, '').trim()
        }
      } catch (e) {
        console.error("[Coach] Failed to parse action JSON:", e)
      }
    }

    // ============================================================================
    // STEP 6: EXECUTE ACTION (if not requiring confirmation)
    // ============================================================================
    let actionResult: any = null
    let actionError: string | null = null

    // Check if we should execute a pending action (user confirmed)
    const shouldExecutePending = confirmAction || (message.toLowerCase().trim() === 'yes' || message.toLowerCase().trim() === 'confirm')

    if (action && action.type !== 'NONE' && (!action.requiresConfirmation || shouldExecutePending)) {
      console.log("[Coach] Executing action:", action.type, action.parameters)

      try {
        switch (action.type) {
          case 'GENERATE_PLANS': {
            // Call the generate-from-data endpoint
            // Get auth header from request
            const authHeader = request.headers.get('authorization');
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
            };
            if (authHeader) {
              headers['authorization'] = authHeader;
            }

            const generateResponse = await fetch(`${request.nextUrl.origin}/api/personalized-plans/generate-from-data`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                // The endpoint will get userId from auth
                ...(action.parameters || {}),
              }),
            })
            const generateData = await generateResponse.json()
            if (!generateResponse.ok) {
              throw new Error(generateData.error || 'Failed to generate plans')
            }
            actionResult = {
              success: true,
              message: `Generated ${generateData.plans?.length || 0} new plans`,
              plans: generateData.plans,
            }
            break
          }

          case 'LOG_WORKOUT': {
            // Extract workout details from parameters or parse from message
            const workoutParams = action.parameters || {}
            const today = new Date().toISOString().split('T')[0]

            // Use activity_logs endpoint for simple workout logging
            const authHeader = request.headers.get('authorization');
            const workoutHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
            };
            if (authHeader) {
              workoutHeaders['authorization'] = authHeader;
            }

            const workoutResponse = await fetch(`${request.nextUrl.origin}/api/logs/activity`, {
              method: 'POST',
              headers: workoutHeaders,
              body: JSON.stringify({
                workout_type: workoutParams.workout_type || workoutParams.type || 'Other',
                description: workoutParams.description || message,
                duration: workoutParams.duration,
                workout_time: workoutParams.workout_time || new Date().toISOString(),
                exercises: workoutParams.exercises,
                notes: workoutParams.notes,
                date: workoutParams.date || today,
              }),
            })
            const workoutData = await workoutResponse.json()
            if (!workoutResponse.ok) {
              throw new Error(workoutData.error || 'Failed to log workout')
            }
            actionResult = {
              success: true,
              message: 'Workout logged successfully',
              workout: workoutData,
            }
            break
          }

          case 'LOG_MEAL': {
            // Extract meal details from parameters
            const mealParams = action.parameters || {}
            const today = new Date().toISOString().split('T')[0]

            const mealHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
            };
            if (authHeader) {
              mealHeaders['authorization'] = authHeader;
            }

            const mealResponse = await fetch(`${request.nextUrl.origin}/api/logs/meals`, {
              method: 'POST',
              headers: mealHeaders,
              body: JSON.stringify({
                meal_type: mealParams.meal_type || 'Other',
                description: mealParams.description || message,
                date: mealParams.date || today,
                meal_time: mealParams.meal_time,
                calories: mealParams.calories,
                protein: mealParams.protein,
                carbs: mealParams.carbs,
                fat: mealParams.fat,
                foods: mealParams.foods,
              }),
            })
            const mealData = await mealResponse.json()
            if (!mealResponse.ok) {
              throw new Error(mealData.error || 'Failed to log meal')
            }
            actionResult = {
              success: true,
              message: 'Meal logged successfully',
              meal: mealData,
            }
            break
          }

          case 'LOG_WEIGHT': {
            const weightParams = action.parameters || {}
            const today = new Date().toISOString().split('T')[0]

            const weightHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
            };
            if (authHeader) {
              weightHeaders['authorization'] = authHeader;
            }

            const weightResponse = await fetch(`${request.nextUrl.origin}/api/logs/weight`, {
              method: 'POST',
              headers: weightHeaders,
              body: JSON.stringify({
                weight: weightParams.weight,
                date: weightParams.date || today,
                notes: weightParams.notes,
              }),
            })
            const weightData = await weightResponse.json()
            if (!weightResponse.ok) {
              throw new Error(weightData.error || 'Failed to log weight')
            }
            actionResult = {
              success: true,
              message: 'Weight logged successfully',
              weight: weightData,
            }
            break
          }

          case 'LOG_MOOD': {
            const moodParams = action.parameters || {}
            const today = new Date().toISOString().split('T')[0]

            const { data: moodData, error: moodError } = await supabase
              .from('mood_logs')
              .insert({
                user_id: authenticatedUserId,
                mood: moodParams.mood || moodParams.rating,
                notes: moodParams.notes,
                date: moodParams.date || today,
              })
              .select()
              .single()

            if (moodError) {
              throw new Error(moodError.message || 'Failed to log mood')
            }
            actionResult = {
              success: true,
              message: 'Mood logged successfully',
              mood: moodData,
            }
            break
          }

          case 'UPDATE_PLAN': {
            // This would require a PATCH endpoint for plans
            // For now, we'll need to implement this
            actionResult = {
              success: false,
              message: 'Plan update feature requires confirmation. Please use the personalized plans section to modify plans.',
            }
            break
          }

          case 'ADJUST_GOALS': {
            const goalParams = action.parameters || {}
            const { data: goalData, error: goalError } = await supabase
              .from('user_goals')
              .upsert({
                user_id: authenticatedUserId,
                ...goalParams,
              }, {
                onConflict: 'user_id',
              })
              .select()
              .single()

            if (goalError) {
              throw new Error(goalError.message || 'Failed to update goals')
            }
            actionResult = {
              success: true,
              message: 'Goals updated successfully',
              goals: goalData,
            }
            break
          }

          case 'UPDATE_BENCHMARK': {
            // Update exercise benchmarks in user_fitness_profile
            const benchmarkParams = action.parameters || {}

            // Get current fitness profile
            const { data: currentProfile, error: profileFetchError } = await supabase
              .from('user_fitness_profile')
              .select('exercise_benchmarks')
              .eq('user_id', authenticatedUserId)
              .maybeSingle()

            if (profileFetchError) {
              throw new Error(profileFetchError.message || 'Failed to fetch current benchmarks')
            }

            // Parse existing benchmarks
            const existingBenchmarks = currentProfile?.exercise_benchmarks || []

            // Update or add the new benchmark
            const exerciseName = benchmarkParams.exercise || benchmarkParams.exercise_name
            const updatedBenchmarks = [...existingBenchmarks]
            const existingIndex = updatedBenchmarks.findIndex(
              (b: any) => b.exercise?.toLowerCase() === exerciseName?.toLowerCase()
            )

            const newBenchmark = {
              exercise: exerciseName,
              current_weight: benchmarkParams.weight || benchmarkParams.current_weight,
              current_reps: benchmarkParams.reps || benchmarkParams.current_reps,
              target_weight: benchmarkParams.target_weight,
              target_date: benchmarkParams.target_date,
            }

            if (existingIndex >= 0) {
              // Update existing benchmark
              updatedBenchmarks[existingIndex] = { ...updatedBenchmarks[existingIndex], ...newBenchmark }
            } else {
              // Add new benchmark
              updatedBenchmarks.push(newBenchmark)
            }

            // Save updated benchmarks
            const { error: updateError } = await supabase
              .from('user_fitness_profile')
              .update({
                exercise_benchmarks: updatedBenchmarks,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', authenticatedUserId)

            if (updateError) {
              throw new Error(updateError.message || 'Failed to update benchmark')
            }

            actionResult = {
              success: true,
              message: `Updated ${exerciseName} benchmark: ${newBenchmark.current_weight}kg x ${newBenchmark.current_reps} reps`,
              benchmark: newBenchmark,
            }
            break
          }

          default:
            actionResult = { success: false, message: `Action ${action.type} not yet implemented` }
        }
      } catch (error: any) {
        actionError = error.message || String(error)
        console.error("[Coach] Action execution error:", error)
      }

      // Log the action
      await supabase.from("coach_actions").insert({
        user_id: authenticatedUserId,
        conversation_id: convId,
        action_type: action.type,
        target_table: action.parameters?.targetTable,
        target_id: action.parameters?.targetId,
        payload: {
          parameters: action.parameters,
          reasoning: action.reasoning,
          result: actionResult,
          error: actionError,
        },
        status: actionError ? 'failed' : 'completed',
        error_message: actionError,
        completed_at: actionError ? null : new Date().toISOString(),
      })
    } else if (action && action.requiresConfirmation) {
      // Log pending action that requires confirmation
      await supabase.from("coach_actions").insert({
        user_id: authenticatedUserId,
        conversation_id: convId,
        action_type: action.type,
        target_table: action.parameters?.targetTable,
        target_id: action.parameters?.targetId,
        payload: {
          parameters: action.parameters,
          reasoning: action.reasoning,
        },
        status: 'pending',
      })
    }

    // ============================================================================
    // STEP 7: SAVE MESSAGES TO CONVERSATION
    // ============================================================================
    await supabase.from("coach_messages").insert([
      {
        conversation_id: convId,
        user_id: authenticatedUserId,
        role: "user",
        content: message,
      },
      {
        conversation_id: convId,
        user_id: authenticatedUserId,
        role: "assistant",
        content: finalMessage,
        metadata: {
          action: action,
          actionResult: actionResult,
          actionError: actionError,
        },
      },
    ])

    // ============================================================================
    // STEP 8: ENHANCE MESSAGE WITH ACTION RESULT (if action was executed)
    // ============================================================================
    let enhancedMessage = finalMessage

    if (actionResult && actionResult.success) {
      // Append action success to message
      enhancedMessage = `${finalMessage}\n\n✅ ${actionResult.message || 'Action completed successfully.'}`
    } else if (actionError) {
      // Append error to message
      enhancedMessage = `${finalMessage}\n\n⚠️ I tried to complete that action but encountered an error: ${actionError}`
    } else if (action?.requiresConfirmation) {
      // Add confirmation prompt
      enhancedMessage = `${finalMessage}\n\n❓ Should I proceed with this change? Please confirm.`
    }

    // ============================================================================
    // STEP 9: RETURN RESPONSE
    // ============================================================================
    return NextResponse.json({
      message: enhancedMessage,
      action: action,
      actionResult: actionResult,
      actionError: actionError,
      conversationId: convId,
      requiresConfirmation: action?.requiresConfirmation || false,
    })
  } catch (error) {
    console.error("Coach API error:", error)
    return NextResponse.json(
      {
        message: "I'm having some technical difficulties right now. But remember: consistency beats perfection. Keep logging and stay active!",
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}


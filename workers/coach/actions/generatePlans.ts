import { SupabaseClient } from "@supabase/supabase-js"
import dayjs from "dayjs"

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
}

// Simple week number calculation (no plugin needed)
function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Generate personalized workout plans directly in the worker
 * Creates a full week of workouts in one plan row
 */
export async function handleGeneratePlans(
    job: CoachAction,
    supabase: SupabaseClient,
    appOrigin: string
): Promise<any> {
    const { user_id, payload } = job
    const params = payload?.parameters || payload || {}

    console.log(`[Worker] Generating plans for user ${user_id}`)

    // Get fitness profile
    const { data: profile, error: profileError } = await supabase
        .from("user_fitness_profile")
        .select("*")
        .eq("user_id", user_id)
        .maybeSingle()

    if (profileError || !profile) {
        throw new Error("Fitness profile not found. Complete your profile first.")
    }

    // Get user info
    const { data: userInfo, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user_id)
        .maybeSingle()

    if (userError || !userInfo) {
        throw new Error("User info not found.")
    }

    // Get goals
    const { data: goals } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user_id)
        .maybeSingle()

    // Build schedule from profile or params
    const today = dayjs().format("YYYY-MM-DD")
    const startDate = params.startDate || today
    const workoutDays = profile.workout_days || ["Monday", "Wednesday", "Friday"]
    const weekNumber = getWeekNumber(new Date(startDate))

    // Get previous workouts for progressive overload
    const { data: previousWorkouts } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(10)

    // Generate a full week plan using AI
    console.log(`[Worker] Generating week ${weekNumber} plan with AI...`)

    const weekPlan = await generateWeekPlan(
        profile,
        userInfo,
        goals,
        startDate,
        workoutDays,
        previousWorkouts || []
    )

    if (!weekPlan?.workouts || weekPlan.workouts.length === 0) {
        throw new Error("Failed to generate workout plan")
    }

    // Delete existing plan for this week first
    await supabase
        .from("personalized_plans")
        .delete()
        .eq("user_id", user_id)
        .eq("plan_type", "workout")
        .eq("week_number", weekNumber)

    // Save as a single plan row with all workouts
    const { error: saveError } = await supabase
        .from("personalized_plans")
        .insert({
            user_id,
            profile_id: profile.id,
            plan_type: "workout",
            week_number: weekNumber,
            content: weekPlan, // Store as object (Supabase handles JSONB)
            is_active: true,
            is_completed: false,
        })

    if (saveError) {
        console.error(`[Worker] Failed to save plan:`, saveError.message)
        throw new Error(`Failed to save plan: ${saveError.message}`)
    }

    console.log(`[Worker] Saved week ${weekNumber} plan with ${weekPlan.workouts.length} workout days`)

    return {
        success: true,
        message: `Generated your week ${weekNumber} workout plan with ${weekPlan.workouts.filter((w: any) => w.exercises?.length > 0).length} training days! 💪`,
        weekNumber,
        workoutDays: weekPlan.workouts.length,
    }
}

/**
 * Generate a full week's workout plan using AI
 */
async function generateWeekPlan(
    profile: any,
    userInfo: any,
    goals: any,
    startDate: string,
    workoutDays: string[],
    previousWorkouts: any[]
): Promise<{ workouts: any[] }> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
        throw new Error("Missing OPENROUTER_API_KEY")
    }

    // Build the 7-day schedule
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const schedule: { day: string; date: string; isWorkout: boolean }[] = []

    for (let i = 0; i < 7; i++) {
        const date = dayjs(startDate).add(i, "day")
        const dayName = dayNames[date.day()]
        schedule.push({
            day: dayName,
            date: date.format("YYYY-MM-DD"),
            isWorkout: workoutDays.includes(dayName)
        })
    }

    const systemPrompt = `You are an elite fitness coach. Generate a complete week of workouts as JSON.

Return JSON matching this schema:
{
  "workouts": [
    {
      "day": "Monday",
      "date": "YYYY-MM-DD",
      "dayName": "Monday",
      "focus": "Chest & Triceps",
      "focuses": ["Chest", "Triceps"],
      "duration": 60,
      "warmup": "5-10 min dynamic stretching",
      "cooldown": "5 min static stretching",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "rest": "90s",
          "notes": "Focus on controlled movement",
          "targets": {
            "rir": 2,
            "suggested_weight_kg": 60
          }
        }
      ]
    }
  ]
}

For REST DAYS, include them with focus: "Rest", duration: 0, exercises: []

IMPORTANT:
- Include ALL 7 days (workout and rest days)
- Each workout should have 5-8 exercises
- Include realistic weight suggestions based on user level
- Return ONLY valid JSON, no markdown`

    const userPrompt = `Generate a full week of workouts starting ${startDate}.

USER PROFILE:
- Height: ${userInfo.height || 175} cm
- Weight: ${userInfo.current_weight || 75} kg
- Fitness Level: ${profile.fitness_level || "beginner"}
- Primary Goals: ${Array.isArray(profile.primary_goals) ? profile.primary_goals.join(", ") : profile.primary_goals || "General Fitness"}
- Available Equipment: ${Array.isArray(profile.available_equipment) ? profile.available_equipment.join(", ") : "Full Gym"}
- Workout Duration: ${profile.workout_duration || 60} minutes
- Injuries/Limitations: ${profile.injuries_limitations || "None"}

WEEKLY SCHEDULE:
${schedule.map(s => `- ${s.day} (${s.date}): ${s.isWorkout ? 'WORKOUT DAY' : 'Rest Day'}`).join('\n')}

${previousWorkouts?.length ? `
PREVIOUS WORKOUTS (for Progressive Overload):
${previousWorkouts.slice(0, 3).map(w => `- ${w.workout_type}: ${w.description || 'No details'}`).join('\n')}
` : ''}

Generate the complete week with all 7 days. Return JSON ONLY.`

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-Title": "FitGrit AI",
        },
        body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            temperature: 0.3,
            max_tokens: 4000,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
        }),
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`OpenRouter error: ${response.status} ${text}`)
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content

    if (!content) {
        throw new Error("OpenRouter returned empty content")
    }

    try {
        return JSON.parse(content)
    } catch {
        // Try to extract JSON from response
        const match = content.match(/\{[\s\S]*\}$/m)
        if (match) {
            return JSON.parse(match[0])
        }
        throw new Error("AI did not return valid JSON")
    }
}

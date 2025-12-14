import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import dayjs from "https://esm.sh/dayjs@1.11.18"

// This is the main worker function that listens to the queue
Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const { job_id, user_id } = payload

    console.log(`[Worker] Received job: ${job_id} for user: ${user_id}`)

    // Create a new Supabase client with the SERVICE_ROLE_KEY
    // This is required for background functions
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Run the job logic
    await processPlanGenerationJob(job_id, user_id, supabase)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("[Worker] Error processing job:", error)
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})

/**
 * Background worker function that processes plan generation jobs
 * This runs asynchronously and updates job status in real-time
 */
async function processPlanGenerationJob(
  jobId: string,
  userId: string,
  supabase: any
) {
  console.log("[Worker] Starting plan generation job:", jobId)

  try {
    // Update status: checking_profile
    await supabase
      .from("plan_generation_jobs")
      .update({ status: "checking_profile" })
      .eq("id", jobId)

    // Fetch user profile and context
    const [profileResult, userResult, goalsResult] = await Promise.all([
      supabase
        .from("user_fitness_profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("users").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_goals").select("*").eq("user_id", userId).maybeSingle(),
    ])

    const profile = profileResult.data
    const userInfo = userResult.data
    const goals = goalsResult.data

    if (!profile || !userInfo) {
      throw new Error("User profile or info not found")
    }

    // Get job request payload
    const { data: job } = await supabase
      .from("plan_generation_jobs")
      .select("*")
      .eq("id", jobId)
      .single()
    if (!job) {
      throw new Error("Job not found")
    }

    const { startDate, schedule } = job.request_payload

    // Update status: checking_previous_workouts
    await supabase
      .from("plan_generation_jobs")
      .update({ status: "checking_previous_workouts" })
      .eq("id", jobId)

    // Fetch previous workouts for progressive overload
    const { data: previousWorkouts } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(20)

    // Update status: creating_plan
    await supabase
      .from("plan_generation_jobs")
      .update({
        status: "creating_plan",
        progress_data: {
          currentDay: 0,
          totalDays: schedule.length,
          currentWeek: 0,
          totalWeeks: 1,
        },
      })
      .eq("id", jobId)

    // Generate and save plans one day at a time (day-by-day storage)
    const savedDays: string[] = []

    for (let i = 0; i < schedule.length; i++) {
      const day = schedule[i]
      // Use dayjs for accurate date calculations
      const planDate = dayjs(startDate).add(i, "day").format("YYYY-MM-DD")

      // Update progress
      await supabase
        .from("plan_generation_jobs")
        .update({
          progress_data: {
            currentDay: i + 1,
            totalDays: schedule.length,
            currentWeek: 1,
            totalWeeks: 1,
            currentFocus: day.focus,
          },
        })
        .eq("id", jobId)

      if (day.focus.toLowerCase() === "rest") {
        // Skip rest days - no workout or macros needed
        continue
      }

      // Get previous workout for this focus type
      const previousWorkout = previousWorkouts?.find((w: any) => {
        const workoutContent = w.workout_content || {}
        const workouts = workoutContent.workouts || []
        return workouts.some((wo: any) => wo.focus === day.focus)
      })

      // Generate plan for this day using AI
      const dayPlan = await generateDayPlan(
        profile,
        userInfo,
        goals,
        day,
        startDate,
        i,
        previousWorkout
      )

      // Save each day as its own row (day-by-day storage)
      if (dayPlan.workout) {
        // Extract workout content (without date/dayName/macros)
        const { date: _, dayName: __, macros: ___, ...workoutContent } =
          dayPlan.workout

        // Save individual day plan
        const { error: saveError } = await supabase
          .from("personalized_plans")
          .upsert(
            {
              user_id: userId,
              profile_id: profile.id,
              plan_type: "workout",
              date: planDate, // Use date as the key
              focus: day.focus,
              workout_content: workoutContent,
              nutrition_guidance: dayPlan.macros || null,
              is_active: true,
              is_completed: false,
            },
            { onConflict: "user_id,date,plan_type" } // Unique constraint on user_id + date + plan_type
          )

        if (saveError) {
          console.error(`[Worker] Failed to save plan for ${planDate}:`, saveError)
        } else {
          savedDays.push(planDate)
        }
      }
    }

    const generatedPlans = {
      workout: { savedDays, count: savedDays.length },
    }

    // Update job as complete
    await supabase
      .from("plan_generation_jobs")
      .update({
        status: "complete",
        result_payload: generatedPlans,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId)

    console.log("[Worker] Plan generation completed:", jobId)
  } catch (error: any) {
    console.error("[Worker] Plan generation failed:", error)
    await supabase
      .from("plan_generation_jobs")
      .update({
        status: "failed",
        error_message: error.message || "Unknown error",
      })
      .eq("id", jobId)
    throw error
  }
}

/**
 * Generate a plan for a single day using AI
 */
async function generateDayPlan(
  profile: any,
  userInfo: any,
  goals: any,
  day: { day: string; focus: string },
  startDate: string,
  dayIndex: number,
  previousWorkout: any
): Promise<any> {
  const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
  const apiKey = Deno.env.get("OPENROUTER_API_KEY")
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY")
  }

  // Use dayjs for accurate date calculations
  const planDate = dayjs(startDate).add(dayIndex, "day").format("YYYY-MM-DD")

  // Build micro-prompt for single day
  const systemPrompt = `You are an elite fitness coach. Generate ONLY the JSON for a single day's workout plan with macro suggestions.

Return JSON matching this exact schema:
{
  "workout": {
    "date": "YYYY-MM-DD",
    "dayName": "Monday",
    "focus": "string",
    "style": "Strength|Hypertrophy|Endurance|Circuit|HIIT|Recovery",
    "duration": <minutes>,
    "warmup": "string",
    "cooldown": "string",
    "exercises": [
      {
        "name": "string",
        "sets": <int>,
        "reps": "string (e.g., '8-12')",
        "rest": "string (e.g., '60s')",
        "weight": "string (optional)"
      }
    ],
    "cardio": {
      "mode": "Running|Cycling|Rowing|Stair Climber|Jump Rope",
      "target_time_min": <int>,
      "target_rpe": <1-10>,
      "notes": "string"
    } | null
  },
  "macros": {
    "calories": <int>,
    "protein_g": <int>,
    "carbs_g": <int>,
    "fat_g": <int>,
    "notes": "string (optional guidance on meal timing, pre/post workout nutrition)"
  }
}

IMPORTANT:
- Do NOT generate specific meals or food items
- Only provide macro targets (calories, protein, carbs, fat)
- Include brief notes about meal timing if relevant (e.g., "Prioritize protein post-workout")
- Macros should align with the workout intensity and user's goals

Return ONLY valid JSON, no markdown, no explanations.`

  const userPrompt = `Generate a plan for ${day.day}, ${day.focus}.

USER PROFILE:
- Height: ${userInfo.height} cm
- Weight: ${userInfo.current_weight} kg
- Fitness Level: ${profile.fitness_level || "beginner"}
- Primary Goals: ${
    Array.isArray(profile.primary_goals)
      ? profile.primary_goals.join(", ")
      : profile.primary_goals || "General Fitness"
  }
- Available Equipment: ${
    Array.isArray(profile.available_equipment)
      ? profile.available_equipment.join(", ")
      : "Limited"
  }
- Workout Duration: ${profile.workout_duration || 45} minutes
- Strength Levels: ${JSON.stringify(profile.strength_levels || {})}
- Injuries/Limitations: ${profile.injuries_limitations || "None"}

${
  previousWorkout
    ? `PREVIOUS ${day.focus} WORKOUT (for Progressive Overload):
Date: ${previousWorkout.completed_at || "N/A"}
${JSON.stringify(previousWorkout.workout_content || {})}

Apply progressive overload: increase weight by 2.5-5kg or reps by 1-2.
`
    : ""
}

NUTRITION (MACROS ONLY - NO MEALS):
- Daily Calorie Goal: ${goals?.daily_calorie_goal || 2000} calories
- Adjust macros based on workout intensity (higher carbs/protein on intense days)
- Provide macro targets only, no specific meals or food items
- Include brief notes on meal timing if relevant

REQUIREMENTS:
- Date: ${planDate}
- Focus: ${day.focus}
- Apply progressive overload if previous workout provided
- Return workout plan with macro suggestions (no meals)
- Return JSON ONLY.`

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        Deno.env.get("NEXT_PUBLIC_SITE_URL") ||
        "https://fit-grit-ai.vercel.app",
      "X-Title": Deno.env.get("NEXT_PUBLIC_APP_NAME") || "FitGrit AI",
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENROUTER_MODEL") || "openai/gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`OpenRouter error: ${response.status} ${text}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error("OpenRouter returned empty content")
  }

  // Extract JSON
  let planJson: any
  try {
    planJson = JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}$/m)
    if (match) {
      planJson = JSON.parse(match[0])
    } else {
      throw new Error("AI did not return valid JSON")
    }
  }

  return planJson
}


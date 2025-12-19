import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { date, logs, profile } = body

    // Fetch user goals
    const { data: goals } = await supabase.from("user_goals").select("*").eq("user_id", user.id).single()

    // Provide safe defaults for all data
    const safeProfile = {
      current_weight: profile?.current_weight || "Not set",
      goal_weight: profile?.goal_weight || "Not set",
      height: profile?.height || "Not set",
      starting_weight: profile?.starting_weight || "Not set",
    }

    const safeLogs = {
      weight: logs?.weight || null,
      meals: logs?.meals || [],
      activities: logs?.activities || [],
      moods: logs?.moods || [],
    }

    const safeGoals = {
      weight: goals?.target_weight || "Not set",
      calories: goals?.daily_calorie_goal || 2000,
      protein: goals?.daily_protein_goal || 150,
      carbs: goals?.daily_carbs_target || 200,
      fat: goals?.daily_fat_target || 65,
      bmr: goals?.calculated_bmr || 0,
      tdee: goals?.calculated_tdee || 0,
    }

    // Helper function to parse exercises JSON safely
    const parseExercises = (exercisesString: string | null) => {
      if (!exercisesString) return []
      try {
        // Handle double-encoded JSON
        let parsed = JSON.parse(exercisesString)
        // If it's still a string, parse again
        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed)
        }
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error("Error parsing exercises:", e)
        return []
      }
    }

    // Format activities with detailed exercise information
    const formatActivities = (activities: any[]) => {
      return activities
        .map((activity, index) => {
          const exercises = parseExercises(activity.exercises)
          const lines: string[] = []

          lines.push(`${index + 1}. ${activity.workout_type || "Activity"}`)

          if (activity.workout_time) {
            lines.push(`   Time: ${activity.workout_time}`)
          }

          if (activity.duration) {
            lines.push(`   Duration: ${activity.duration} minutes`)
          }

          if (activity.steps) {
            lines.push(`   Steps: ${activity.steps}`)
          }

          // Add detailed exercise information
          if (exercises.length > 0) {
            lines.push(`   Exercises:`)
            exercises.forEach((exercise: any) => {
              let exerciseLine = `   - ${exercise.name || "Exercise"}`

              // For strength training
              if (exercise.sets && exercise.reps) {
                exerciseLine += ` (${exercise.sets} sets × ${exercise.reps} reps`
                if (exercise.weight) {
                  exerciseLine += `, ${exercise.weight}kg`
                }
                if (exercise.rest) {
                  exerciseLine += `, ${exercise.rest}min rest`
                }
                exerciseLine += `)`
              }

              // For cardio
              if (exercise.duration) {
                exerciseLine += ` (${exercise.duration} min`
                if (exercise.distance) {
                  exerciseLine += `, ${exercise.distance}km`
                }
                if (exercise.intensity) {
                  exerciseLine += `, ${exercise.intensity}`
                }
                exerciseLine += `)`
              }

              lines.push(exerciseLine)
            })
          }

          if (activity.notes) {
            lines.push(`   Notes: ${activity.notes}`)
          }

          return lines.join("\n")
        })
        .join("\n\n")
    }

    // Calculate total workout time across all activities
    const calculateTotalWorkoutTime = (activities: any[]) => {
      let totalMinutes = 0
      activities.forEach((activity) => {
        if (activity.duration) {
          totalMinutes += Number.parseInt(activity.duration, 10) || 0
        }
        // Also count exercises with individual durations
        const exercises = parseExercises(activity.exercises)
        exercises.forEach((exercise: any) => {
          if (exercise.duration && !activity.duration) {
            totalMinutes += Number.parseInt(exercise.duration, 10) || 0
          }
        })
      })
      return totalMinutes
    }

    const totalWorkoutTime = calculateTotalWorkoutTime(safeLogs.activities)

    // Prepare comprehensive analysis prompt
    const analysisPrompt = `
You are FitGrit AI, a tough-love fitness coach. Analyze this user's daily logs and provide direct, actionable feedback.

USER PROFILE:
- Current Weight: ${safeProfile.current_weight}kg
- Goal Weight: ${safeProfile.goal_weight}kg
- Height: ${safeProfile.height}cm
- Starting Weight: ${safeProfile.starting_weight}kg

DAILY TARGETS (Personalized):
- Calories: ${safeGoals.calories} kcal
- Protein: ${safeGoals.protein}g
- Carbs: ${safeGoals.carbs}g
- Fat: ${safeGoals.fat}g
- BMR: ${safeGoals.bmr} kcal
- TDEE: ${safeGoals.tdee} kcal

DAILY LOGS FOR ${date}:

WEIGHT:
${safeLogs.weight ? `- Logged: ${safeLogs.weight.weight}kg` : "- Not logged"}
${safeLogs.weight?.notes ? `- Notes: ${safeLogs.weight.notes}` : ""}

MEALS (${safeLogs.meals.length} logged):
${
  safeLogs.meals.length > 0
    ? safeLogs.meals
        .map((meal: any, i: number) => {
          let mealInfo = `${i + 1}. ${meal.meal_type}: ${meal.description}`
          if (meal.calories) mealInfo += ` (${meal.calories} cal`
          if (meal.protein) mealInfo += `, ${meal.protein}g protein`
          if (meal.carbs) mealInfo += `, ${meal.carbs}g carbs`
          if (meal.fat) mealInfo += `, ${meal.fat}g fat`
          if (meal.calories) mealInfo += `)`
          if (meal.notes) mealInfo += `\n   Notes: ${meal.notes}`
          return mealInfo
        })
        .join("\n")
    : "- No meals logged"
}

ACTIVITIES (${safeLogs.activities.length} workout sessions logged, ${totalWorkoutTime} total minutes):
${safeLogs.activities.length > 0 ? formatActivities(safeLogs.activities) : "- No activities logged"}

MOOD & ENERGY:
${
  safeLogs.moods.length > 0
    ? safeLogs.moods
        .map(
          (mood: any, i: number) =>
            `${i + 1}. Mood: ${mood.mood}/10, Energy: ${mood.energy}/10, Motivation: ${mood.motivation}/10${mood.notes ? ` (${mood.notes})` : ""}`,
        )
        .join("\n")
    : "- Not logged"
}

Provide a direct, honest daily analysis covering:
1. Weight progress vs goal (if logged)
2. Meal quality and quantity assessment - compare to personalized targets
3. Activity level evaluation - BE SPECIFIC about ALL workouts logged, including cardio AND strength training details
4. Mood and energy patterns
5. 2-3 specific actionable improvements for tomorrow
6. What they did well today (if anything)

IMPORTANT: Make sure to acknowledge ALL workout sessions logged by the user, including multiple workout sessions.

Be direct but constructive. No sugarcoating - they want real feedback to get results. Keep it under 300 words.
`

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "FitGrit AI Daily Analysis",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content:
              "You are FitGrit AI, a direct, no-nonsense fitness coach focused on results. Provide tough-love feedback that's honest but constructive. Always acknowledge ALL activities logged by the user, including multiple workout sessions.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error("OpenRouter API error:", await response.text())
      // Fallback to local analysis
      return NextResponse.json({
        analysis: generateLocalAnalysis(date, safeLogs, safeProfile, safeGoals, totalWorkoutTime),
      })
    }

    const data = await response.json()
    const analysis =
      data.choices?.[0]?.message?.content ||
      generateLocalAnalysis(date, safeLogs, safeProfile, safeGoals, totalWorkoutTime)

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Daily analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze daily logs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function generateLocalAnalysis(date: string, logs: any, profile: any, goals: any, totalWorkoutTime: number): string {
  const sections = []

  sections.push(`📊 **Daily Analysis for ${date}**\n`)

  // Weight section
  if (logs.weight) {
    sections.push(`**Weight:** ${logs.weight.weight}kg logged`)
    if (profile.goal_weight !== "Not set") {
      const diff = Number.parseFloat(logs.weight.weight) - Number.parseFloat(profile.goal_weight)
      sections.push(`- ${Math.abs(diff).toFixed(1)}kg ${diff > 0 ? "above" : "to"} goal`)
    }
  } else {
    sections.push("**Weight:** Not logged - consistency is key!")
  }

  // Meals section
  sections.push(`\n**Meals:** ${logs.meals.length} logged`)
  if (logs.meals.length < 3) {
    sections.push("- You're missing meals. Log everything to track patterns.")
  } else {
    sections.push("- Good meal logging consistency!")
  }

  // Activity section with detailed breakdown
  sections.push(
    `\n**Activity:** ${logs.activities.length} workout session(s) logged (${totalWorkoutTime} total minutes)`,
  )
  if (logs.activities.length === 0) {
    sections.push("- No activity logged - movement is essential for weight loss.")
  } else {
    logs.activities.forEach((activity: any, index: number) => {
      sections.push(`\n${index + 1}. ${activity.workout_type || "Workout"}:`)
      if (activity.duration) {
        sections.push(`   - ${activity.duration} minutes`)
      }
      if (activity.description) {
        sections.push(`   - ${activity.description}`)
      }
    })
    sections.push("\n- Good job logging your workouts!")
  }

  // Mood section
  if (logs.moods.length > 0) {
    const mood = logs.moods[0]
    sections.push(`\n**Mood:** ${mood.mood}/5 | Energy: ${mood.energy}/5 | Motivation: ${mood.motivation}/5`)
  } else {
    sections.push("\n**Mood:** Not logged")
  }

  // Action items
  sections.push("\n**Tomorrow's Focus:**")
  if (!logs.weight) sections.push("1. Weigh yourself first thing")
  if (logs.meals.length < 3) sections.push("2. Log all meals - no exceptions")
  if (totalWorkoutTime < 30) sections.push("3. Aim for at least 30 minutes of total workout time")

  sections.push("\n💪 Keep pushing forward!")

  return sections.join("\n")
}

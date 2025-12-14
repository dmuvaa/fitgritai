import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

/**
 * AI Workout Generator Endpoint
 * Generates personalized workouts based on user data and preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      workoutType, // 'strength', 'cardio', 'flexibility', 'mixed'
      duration, // in minutes
      equipment, // array of available equipment
      fitnessLevel, // 'beginner', 'intermediate', 'advanced'
      targetMuscles, // optional array of target muscle groups
    } = body

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user profile
    const { data: profile } = await supabase.from("users").select("*").eq("id", userId).single()

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user goals
    const { data: goals } = await supabase.from("user_goals").select("*").eq("user_id", userId).single()

    // Get recent activity logs to understand patterns
    const { data: recentActivities } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(10)

    // Get exercise database
    const { data: exercises } = await supabase.from("exercises").select("*")

    // Build workout generation prompt
    const workoutPrompt = buildWorkoutPrompt(
      profile,
      goals,
      recentActivities || [],
      exercises || [],
      {
        workoutType: workoutType || "mixed",
        duration: duration || 30,
        equipment: equipment || ["bodyweight"],
        fitnessLevel: fitnessLevel || "intermediate",
        targetMuscles: targetMuscles || [],
      },
    )

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "FitGrit AI Workout Generator",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content: workoutPrompt,
          },
          {
            role: "user",
            content: "Generate a personalized workout plan for me based on my profile and preferences.",
          },
        ],
        max_tokens: 1500,
        temperature: 0.8, // Higher temperature for more creative workouts
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API error:", response.status, errorText)
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    let workoutPlan = aiResponse.choices[0]?.message?.content || "Unable to generate workout at this time."

    // Try to parse as JSON if it's structured
    let structuredWorkout = null
    try {
      // Check if response contains JSON
      if (workoutPlan.includes("{")) {
        const jsonMatch = workoutPlan.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          structuredWorkout = JSON.parse(jsonMatch[0])
        }
      }
    } catch (e) {
      // If parsing fails, keep the text version
      console.log("Workout plan is text-based, not JSON")
    }

    return NextResponse.json({
      workout: structuredWorkout || { description: workoutPlan },
      timestamp: new Date().toISOString(),
      parameters: {
        workoutType,
        duration,
        equipment,
        fitnessLevel,
        targetMuscles,
      },
    })
  } catch (error: any) {
    console.error("AI workout generation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function buildWorkoutPrompt(
  profile: any,
  goals: any,
  recentActivities: any[],
  exercises: any[],
  preferences: any,
) {
  const availableExercises = exercises
    .filter((ex) => {
      // Filter by equipment availability
      if (preferences.equipment.includes("bodyweight") && ex.equipment === "bodyweight") return true
      if (preferences.equipment.includes(ex.equipment)) return true
      return false
    })
    .slice(0, 50) // Limit to avoid token limits

  const recentWorkouts = recentActivities.map((a) => a.exercise_type).join(", ")

  return `You are a professional fitness trainer AI creating personalized workouts.

USER PROFILE:
- Current Weight: ${profile.current_weight || profile.starting_weight}kg
- Goal: ${profile.goal_weight}kg (${profile.starting_weight - profile.current_weight}kg lost so far)
- Activity Level: ${goals?.activity_level || "moderate"}

RECENT WORKOUTS:
${recentActivities.length > 0 ? recentActivities.map((a) => `- ${a.exercise_type}: ${a.duration} min, ${a.calories_burned} cal`).join("\n") : "- No recent workouts logged"}

WORKOUT PREFERENCES:
- Type: ${preferences.workoutType}
- Duration: ${preferences.duration} minutes
- Fitness Level: ${preferences.fitnessLevel}
- Equipment: ${preferences.equipment.join(", ")}
${preferences.targetMuscles.length > 0 ? `- Target Muscles: ${preferences.targetMuscles.join(", ")}` : ""}

AVAILABLE EXERCISES IN DATABASE:
${availableExercises.slice(0, 20).map((ex) => `- ${ex.name} (${ex.category}, ${ex.equipment})`).join("\n")}

YOUR TASK:
Create a complete workout plan that:
1. Matches the user's fitness level and goals
2. Uses only available equipment
3. Fits within the time duration
4. Provides variety from recent workouts
5. Includes warm-up and cool-down
6. Specifies sets, reps, rest periods

Format your response as a detailed workout plan with:
- Warm-up (5 min)
- Main workout (exercises with sets/reps/duration)
- Cool-down (5 min)
- Estimated calories burned
- Key tips for proper form

Be specific, practical, and motivating. Use exercises from the database when possible, or suggest bodyweight alternatives.`
}


import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"
import { isSupabaseConfigured } from "@/lib/supabase-utils"

export const dynamic = "force-dynamic"

type RawExerciseBenchmark = {
  exercise?: string
  current_weight?: number | string
  current_reps?: number | string
  target_weight?: number | string | null
  target_date?: string | null
}

type SanitizedExerciseBenchmark = {
  exercise: string
  current_weight: number
  current_reps: number
  target_weight?: number
  target_date?: string
}

type RawBodyMetrics = {
  waist_size_cm?: number | string
  current_weight_kg?: number | string
  body_fat_percentage?: number | string
}

function sanitizeExerciseBenchmarks(value: unknown): SanitizedExerciseBenchmark[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item: RawExerciseBenchmark) => {
      const exercise = typeof item?.exercise === "string" ? item.exercise.trim() : ""
      const currentWeight = Number(item?.current_weight)
      const currentReps = Number(item?.current_reps)
      const targetWeight =
        item?.target_weight !== undefined && item?.target_weight !== null
          ? Number(item.target_weight)
          : undefined
      const targetDate =
        typeof item?.target_date === "string" && item.target_date.trim().length > 0
          ? item.target_date
          : undefined

      if (!exercise || Number.isNaN(currentWeight) || Number.isNaN(currentReps)) {
        return null
      }

      return {
        exercise,
        current_weight: currentWeight,
        current_reps: currentReps,
        ...(Number.isFinite(targetWeight) ? { target_weight: targetWeight } : {}),
        ...(targetDate ? { target_date: targetDate } : {}),
      }
    })
    .filter(Boolean) as SanitizedExerciseBenchmark[]
}

function sanitizeBodyMetrics(value: unknown): RawBodyMetrics {
  if (!value || typeof value !== "object") return {}

  const metrics = value as RawBodyMetrics
  const waist = Number(metrics.waist_size_cm)
  const weight = Number(metrics.current_weight_kg)
  const bodyFat = Number(metrics.body_fat_percentage)

  return {
    ...(Number.isFinite(waist) ? { waist_size_cm: waist } : {}),
    ...(Number.isFinite(weight) ? { current_weight_kg: weight } : {}),
    ...(Number.isFinite(bodyFat) ? { body_fat_percentage: bodyFat } : {}),
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const supabase = await getSupabaseForRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[SERVER] GET /api/personalized-plans/questionnaire - Starting")
    console.log("[SERVER] Fetching fitness profile for user:", user.id)

    const { data: profile, error: profileError } = await supabase
      .from("user_fitness_profile")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("[SERVER] Profile fetch error:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    console.log("[SERVER] Profile found:", !!profile)
    return NextResponse.json(profile || null)
  } catch (error: any) {
    console.error("[SERVER] Profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const supabase = await getSupabaseForRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[SERVER] Received questionnaire data")

    const exerciseBenchmarks = sanitizeExerciseBenchmarks(
      body.exercise_benchmarks || body.exerciseBenchmarks,
    )
    const bodyMetrics = sanitizeBodyMetrics(body.body_metrics || body.bodyMetrics)

    // Map the data to match the actual database schema
    // Note: We do NOT include workout_frequency - it's derived from workout_days.length
    const profileData = {
      user_id: user.id,

      // Primary Goals & Fitness Level
      primary_goals: body.primary_goals || body.primaryGoals || [],
      fitness_level: body.fitness_level || body.fitnessLevel || "beginner",

      // Workout Schedule
      // workout_days is text[] - array of day names like ["Monday", "Wednesday", "Friday"]
      workout_days: body.workout_days || body.workoutDays || [],
      rest_days: body.rest_days || body.restDays || [],
      workout_duration: body.workout_duration || body.workoutDuration || 30,
      preferred_workout_time: body.preferred_workout_time || body.preferredWorkoutTime || "morning",

      // Equipment & Location
      available_equipment: body.available_equipment || body.availableEquipment || [],
      workout_location: body.workout_location || body.workoutLocation || "home",

      // Strength & Limitations
      strength_levels: {},
      exercise_benchmarks: exerciseBenchmarks,
      body_metrics: bodyMetrics,
      injuries_limitations: body.injuries_limitations || body.injuriesLimitations || [],
      disliked_exercises: body.disliked_exercises || body.dislikedExercises || [],
      preferred_activities: body.preferred_activities || body.preferredActivities || [],

      // Nutrition
      dietary_restrictions: body.dietary_restrictions || body.dietaryRestrictions || [],
      food_allergies: body.food_allergies || body.foodAllergies || [],
      disliked_foods: body.disliked_foods || body.dislikedFoods || [],
      accessible_foods: body.accessible_foods || body.accessibleFoods || [],
      preferred_foods: body.preferred_foods || body.preferredFoods || [],
      meals_per_day: body.meals_per_day || body.mealsPerDay || 3,
      cooking_time: body.cooking_time || body.cookingTime || "30-60",

      // Additional Info
      additional_notes: body.additional_notes || body.additionalNotes || null,

      updated_at: new Date().toISOString(),
    }

    console.log("[SERVER] Mapped profile data (workout_frequency NOT included - using workout_days array)")

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("user_fitness_profile")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()

    let result

    if (existingProfile) {
      console.log("[SERVER] Updating existing profile")
      const { data, error } = await supabase
        .from("user_fitness_profile")
        .update(profileData)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("[SERVER] Error updating profile:", error)
        throw error
      }
      result = data
    } else {
      console.log("[SERVER] Creating new profile")
      const insertData = {
        ...profileData,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("user_fitness_profile").insert(insertData).select().single()

      if (error) {
        console.error("[SERVER] Error creating profile:", error)
        throw error
      }
      result = data
    }

    console.log("[SERVER] Profile saved successfully")
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[SERVER] Error saving questionnaire:", error.message || error)
    return NextResponse.json({ error: error.message || "Failed to save questionnaire" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const supabase = await getSupabaseForRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("user_fitness_profile").delete().eq("user_id", user.id)

    if (error) {
      console.error("[SERVER] Error deleting profile:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[SERVER] Error in DELETE:", error)
    return NextResponse.json({ error: error.message || "Failed to delete profile" }, { status: 500 })
  }
}

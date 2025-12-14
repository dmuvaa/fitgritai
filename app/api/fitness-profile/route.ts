// app/api/fitness-profile/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"
import { isSupabaseConfigured } from "@/lib/supabase-utils"

export const dynamic = "force-dynamic"

type ExerciseBenchmark = {
  exercise: string
  current_weight: number
  current_reps: number
  target_weight?: number
  target_date?: string
}

type BodyMetrics = {
  waist_size_cm?: number
  current_weight_kg?: number
  body_fat_percentage?: number
}

function toArray(value: any): any[] {
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function toNumber(value: any): number | undefined {
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

function sanitizeExerciseBenchmarks(value: any): ExerciseBenchmark[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => ({
      exercise: typeof item?.exercise === "string" ? item.exercise : "",
      current_weight: toNumber(item?.current_weight),
      current_reps: toNumber(item?.current_reps),
      target_weight: toNumber(item?.target_weight),
      target_date: typeof item?.target_date === "string" ? item.target_date : undefined,
    }))
    .filter((item) => item.exercise && item.current_weight !== undefined && item.current_reps !== undefined)
    .map((item) => ({
      exercise: item.exercise,
      current_weight: item.current_weight as number,
      current_reps: item.current_reps as number,
      ...(item.target_weight !== undefined ? { target_weight: item.target_weight } : {}),
      ...(item.target_date ? { target_date: item.target_date } : {}),
    }))
}

function sanitizeBodyMetrics(value: any): BodyMetrics {
  if (!value || typeof value !== "object") return {}
  const waist = toNumber(value.waist_size_cm)
  const weight = toNumber(value.current_weight_kg)
  const bodyFat = toNumber(value.body_fat_percentage)
  return {
    ...(waist !== undefined ? { waist_size_cm: waist } : {}),
    ...(weight !== undefined ? { current_weight_kg: weight } : {}),
    ...(bodyFat !== undefined ? { body_fat_percentage: bodyFat } : {}),
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

    console.log("[SERVER] GET /api/fitness-profile - Starting")
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
    if (profile) {
      console.log("[SERVER] Profile data:", {
        id: profile.id,
        primary_goals: profile.primary_goals,
        fitness_level: profile.fitness_level,
        workout_days: profile.workout_days,
        available_equipment: profile.available_equipment?.length || 0,
        strength_levels: profile.strength_levels,
      })
    }

    // Ensure arrays are properly formatted (in case they're stored as JSON strings)
    if (profile) {
      const processedProfile = {
        ...profile,
        primary_goals: toArray(profile.primary_goals),
        workout_days: toArray(profile.workout_days),
        rest_days: toArray(profile.rest_days),
        available_equipment: toArray(profile.available_equipment),
        disliked_exercises: toArray(profile.disliked_exercises),
        preferred_activities: toArray(profile.preferred_activities),
        dietary_restrictions: toArray(profile.dietary_restrictions),
        food_allergies: toArray(profile.food_allergies),
        disliked_foods: toArray(profile.disliked_foods),
        accessible_foods: toArray(profile.accessible_foods),
        preferred_foods: toArray(profile.preferred_foods),
        strength_levels: profile.strength_levels || {},
        exercise_benchmarks: sanitizeExerciseBenchmarks(profile.exercise_benchmarks),
        body_metrics: sanitizeBodyMetrics(profile.body_metrics),
      };
      
      console.log("[SERVER] Processed profile:", {
        primary_goals: processedProfile.primary_goals,
        workout_days: processedProfile.workout_days,
        available_equipment: processedProfile.available_equipment,
      });
      
      return NextResponse.json(processedProfile);
    }

    return NextResponse.json(null)
  } catch (error: any) {
    console.error("[SERVER] Fitness profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const payload = await request.json()

    const exerciseBenchmarks = sanitizeExerciseBenchmarks(payload.exercise_benchmarks)
    const bodyMetrics = sanitizeBodyMetrics(payload.body_metrics)

    const updates = {
      ...payload,
      exercise_benchmarks: exerciseBenchmarks,
      body_metrics: bodyMetrics,
      updated_at: new Date().toISOString(),
    }

    delete (updates as any).user_id
    delete (updates as any).id

    const { data: existing } = await supabase
      .from("user_fitness_profile")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    let result

    if (existing?.id) {
      const { data, error } = await supabase
        .from("user_fitness_profile")
        .update(updates)
        .eq("user_id", user.id)
        .select("*")
        .single()

      if (error) {
        console.error("[SERVER] Fitness profile update error:", error)
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
      }
      result = data
    } else {
      const { data, error } = await supabase
        .from("user_fitness_profile")
        .insert([{ ...updates, user_id: user.id }])
        .select("*")
        .single()

      if (error) {
        console.error("[SERVER] Fitness profile insert error:", error)
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
      }
      result = data
    }

    const processedProfile = {
      ...result,
      primary_goals: toArray(result.primary_goals),
      workout_days: toArray(result.workout_days),
      rest_days: toArray(result.rest_days),
      available_equipment: toArray(result.available_equipment),
      disliked_exercises: toArray(result.disliked_exercises),
      preferred_activities: toArray(result.preferred_activities),
      dietary_restrictions: toArray(result.dietary_restrictions),
      food_allergies: toArray(result.food_allergies),
      disliked_foods: toArray(result.disliked_foods),
      accessible_foods: toArray(result.accessible_foods),
      preferred_foods: toArray(result.preferred_foods),
      strength_levels: result.strength_levels || {},
      exercise_benchmarks: sanitizeExerciseBenchmarks(result.exercise_benchmarks),
      body_metrics: sanitizeBodyMetrics(result.body_metrics),
    }

    return NextResponse.json(processedProfile)
  } catch (error) {
    console.error("[SERVER] Fitness profile PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

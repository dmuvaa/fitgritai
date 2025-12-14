/**
 * User Goals API
 * Calculates and stores personalized nutrition goals
 */

import { NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
}

// Calculate BMR using Mifflin-St Jeor equation
function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

// Calculate TDEE
function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS] || 1.2
  return Math.round(bmr * multiplier)
}

// Calculate daily calorie goal based on fitness goal
function calculateCalorieGoal(tdee: number, fitnessGoal: string, currentWeight: number, goalWeight: number): number {
  const weightDifference = currentWeight - goalWeight
  
  switch (fitnessGoal) {
    case 'lose_weight':
      // 500 calorie deficit per day for 1 lb/week loss
      return Math.round(tdee - 500)
    case 'maintain_weight':
      return Math.round(tdee)
    case 'build_muscle':
      // 300 calorie surplus for muscle gain
      return Math.round(tdee + 300)
    case 'body_recomposition':
      // Small deficit for recomposition
      return Math.round(tdee - 200)
    default:
      return Math.round(tdee)
  }
}

// Calculate macronutrient targets
function calculateMacros(calorieGoal: number, weight: number, fitnessGoal: string) {
  let proteinPerKg = 1.6 // Default protein per kg
  
  // Adjust protein based on fitness goal
  if (fitnessGoal === 'build_muscle' || fitnessGoal === 'body_recomposition') {
    proteinPerKg = 2.0
  } else if (fitnessGoal === 'lose_weight') {
    proteinPerKg = 2.2 // Higher protein for weight loss
  }
  
  const proteinGrams = Math.round(weight * proteinPerKg)
  const proteinCalories = proteinGrams * 4
  
  // Fat: 25% of calories
  const fatCalories = Math.round(calorieGoal * 0.25)
  const fatGrams = Math.round(fatCalories / 9)
  
  // Carbs: remaining calories
  const carbCalories = calorieGoal - proteinCalories - fatCalories
  const carbGrams = Math.round(carbCalories / 4)
  
  return {
    protein: proteinGrams,
    fat: fatGrams,
    carbs: carbGrams,
    proteinCalories,
    fatCalories,
    carbCalories,
  }
}

export async function POST(request: Request) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    // Verify current user (works in both paths)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { profile } = body

    if (!profile) {
      return NextResponse.json(
        { error: "Profile data is required" },
        { status: 400 }
      )
    }

    // Calculate age from date of birth
    const birthDate = new Date(profile.date_of_birth)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()

    // Calculate BMR and TDEE
    const bmr = calculateBMR(profile.current_weight, profile.height, age, profile.gender)
    const tdee = calculateTDEE(bmr, profile.activity_level)
    
    // Calculate calorie goal
    const calorieGoal = calculateCalorieGoal(
      tdee,
      profile.fitness_goal,
      profile.current_weight,
      profile.goal_weight
    )
    
    // Calculate macronutrients
    const macros = calculateMacros(calorieGoal, profile.current_weight, profile.fitness_goal)

    // Store goals in database (matching web version schema)
    const { data: goals, error: goalsError } = await supabase
      .from("user_goals")
      .upsert({
        user_id: user.id,
        target_weight: profile.goal_weight,
        daily_calorie_goal: calorieGoal,
        daily_protein_goal: macros.protein,
        daily_carbs_target: macros.carbs,
        daily_fat_target: macros.fat,
        calculated_bmr: bmr,
        calculated_tdee: tdee,
        goal_intensity: "moderate", // Default intensity
        last_recalculated_at: new Date().toISOString(),
        auto_recalculate: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (goalsError) {
      console.error("Goals creation error:", goalsError)
      return NextResponse.json(
        { error: "Failed to create goals" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      goals: {
        ...goals,
        calculated_values: {
          bmr,
          tdee,
          calorie_goal: calorieGoal,
          macros,
        },
      },
      message: "Goals calculated and stored successfully",
    })
  } catch (error) {
    console.error("Error in POST /api/users/goals:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    // Verify current user (works in both paths)
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = authData.user.id

    const { data: goals, error: goalsError } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (goalsError) {
      if (goalsError.code === "PGRST116") {
        return NextResponse.json({ goals: null })
      }
      console.error("Goals fetch error:", goalsError)
      return NextResponse.json(
        { error: "Failed to fetch goals" },
        { status: 500 }
      )
    }

    return NextResponse.json({ goals })
  } catch (error) {
    console.error("Error in GET /api/users/goals:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

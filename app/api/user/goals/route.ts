import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"
import { calculateAllGoals, type UserProfile } from "@/lib/nutrition-calculator"

export const dynamic = "force-dynamic"

/**
 * GET /api/user/goals
 * Fetch user's nutrition goals
 * Supports both mobile Bearer token and web cookies
 */
export async function GET(request: NextRequest) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = authData.user

    // Fetch goals from database
    const { data: goals, error: goalsError } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (goalsError) {
      if (goalsError.code === "PGRST116") {
        // No goals found - need to calculate
        return NextResponse.json({ error: "Goals not set", code: "NO_GOALS" }, { status: 404 })
      }
      console.error("Goals fetch error:", goalsError)
      return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
    }

    return NextResponse.json(goals)
  } catch (error) {
    console.error("Goals API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/user/goals/calculate
 * Calculate and save nutrition goals based on user profile
 */
export async function POST(request: NextRequest) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = authData.user

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Validate required fields
    if (!profile.date_of_birth || !profile.gender || !profile.activity_level || !profile.fitness_goal) {
      return NextResponse.json(
        {
          error: "Incomplete profile",
          code: "INCOMPLETE_PROFILE",
          missing: {
            date_of_birth: !profile.date_of_birth,
            gender: !profile.gender,
            activity_level: !profile.activity_level,
            fitness_goal: !profile.fitness_goal,
          },
        },
        { status: 422 },
      )
    }

    // Calculate goals
    const userProfile: UserProfile = {
      current_weight: profile.current_weight || profile.starting_weight,
      height: profile.height,
      date_of_birth: profile.date_of_birth,
      gender: profile.gender,
      activity_level: profile.activity_level,
      fitness_goal: profile.fitness_goal,
      goal_weight: profile.goal_weight,
    }

    const calculatedGoals = calculateAllGoals(userProfile)

    // Upsert goals
    const { data: savedGoals, error: saveError } = await supabase
      .from("user_goals")
      .upsert(
        {
          user_id: user.id,
          target_weight: profile.goal_weight,
          daily_calorie_goal: calculatedGoals.daily_calories,
          daily_protein_goal: calculatedGoals.daily_protein,
          daily_carbs_target: calculatedGoals.daily_carbs,
          daily_fat_target: calculatedGoals.daily_fat,
          calculated_bmr: calculatedGoals.bmr,
          calculated_tdee: calculatedGoals.tdee,
          goal_intensity: calculatedGoals.goal_intensity,
          last_recalculated_at: new Date().toISOString(),
          auto_recalculate: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (saveError) {
      console.error("Goals save error:", saveError)
      return NextResponse.json({ error: "Failed to save goals" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      goals: savedGoals,
      calculated: calculatedGoals,
    })
  } catch (error) {
    console.error("Calculate goals API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

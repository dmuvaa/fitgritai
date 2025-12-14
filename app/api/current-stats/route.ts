import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export async function GET(request: NextRequest) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = authData.user

    // Get user goals - use maybeSingle() to handle missing data
    const { data: goals } = await supabase.from("user_goals").select("*").eq("user_id", user.id).maybeSingle()

    // Get latest weight
    const { data: latestWeight } = await supabase
      .from("weight_logs")
      .select("weight, logged_at")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    // Get today's logs
    const today = new Date().toISOString().split("T")[0]

    const { data: todayMeals } = await supabase
      .from("meal_logs")
      .select("calories, protein")
      .eq("user_id", user.id)
      .gte("logged_at", today)
      .lt("logged_at", new Date(new Date(today).getTime() + 86400000).toISOString())

    const { data: todayActivity } = await supabase
      .from("activity_logs")
      .select("steps")
      .eq("user_id", user.id)
      .gte("logged_at", today)
      .lt("logged_at", new Date(new Date(today).getTime() + 86400000).toISOString())
      .maybeSingle()

    // Calculate totals
    const caloriesConsumed = todayMeals?.reduce((sum, meal) => sum + (meal.calories || 0), 0) || 0
    const proteinConsumed = todayMeals?.reduce((sum, meal) => sum + (meal.protein || 0), 0) || 0
    const stepsToday = todayActivity?.steps || 0

    return NextResponse.json({
      currentWeight: latestWeight?.weight || null,
      targetWeight: goals?.target_weight || null,
      caloriesConsumed,
      caloriesTarget: goals?.daily_calorie_goal || null,
      proteinConsumed,
      proteinTarget: goals?.daily_protein_goal || null,
      stepsToday,
      stepsTarget: goals?.daily_steps_goal || null,
    })
  } catch (error: any) {
    console.error("Current stats API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

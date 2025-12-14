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

    // Get user profile
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    // Get last 7 days of data
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: weeklyWeights } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true })

    const { data: weeklyMeals } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])

    const { data: weeklyActivity } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])

    const { data: weeklyMoods } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])

    // Calculate stats
    const weightChange =
      weeklyWeights && weeklyWeights.length > 1
        ? weeklyWeights[weeklyWeights.length - 1].weight - weeklyWeights[0].weight
        : 0

    const avgMood =
      weeklyMoods && weeklyMoods.length > 0
        ? weeklyMoods.reduce((sum, log) => sum + log.mood, 0) / weeklyMoods.length
        : 0

    const totalMeals = weeklyMeals?.length || 0
    const totalWorkouts = weeklyActivity?.filter((a) => a.workout_type).length || 0

    // Generate a simple summary based on the data
    let summary = "Keep up the great work! "

    if (weightChange < 0) {
      summary += `You're down ${Math.abs(weightChange).toFixed(1)}kg this week - excellent progress! `
    } else if (weightChange > 0) {
      summary += `Your weight increased by ${weightChange.toFixed(1)}kg this week. Let's focus on consistency. `
    } else {
      summary += "Your weight has been stable this week. "
    }

    if (totalMeals > 14) {
      summary += "Your meal logging is excellent. "
    } else if (totalMeals > 7) {
      summary += "Good meal tracking, but try to log every meal. "
    } else {
      summary += "Focus on logging all your meals for better insights. "
    }

    summary += "Remember, consistency beats perfection!"

    return NextResponse.json({
      summary,
      stats: {
        weightChange,
        avgMood,
        totalMeals,
        totalWorkouts,
        daysLogged: {
          weight: weeklyWeights?.length || 0,
          meals: new Set(weeklyMeals?.map((m) => m.date)).size || 0,
          activity: new Set(weeklyActivity?.map((a) => a.date)).size || 0,
          mood: weeklyMoods?.length || 0,
        },
      },
    })
  } catch (error) {
    console.error("Weekly summary API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

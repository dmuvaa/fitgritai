import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7" // days

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - Number.parseInt(period))
    const dateFilter = daysAgo.toISOString().split("T")[0]

    // Fetch all data in parallel
    const [weightLogs, mealLogs, activityLogs, moodLogs, profile] = await Promise.all([
      supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", dateFilter)
        .order("date", { ascending: true }),

      supabase.from("meal_logs").select("*").eq("user_id", user.id).gte("date", dateFilter),

      supabase.from("activity_logs").select("*").eq("user_id", user.id).gte("date", dateFilter),

      supabase.from("mood_logs").select("*").eq("user_id", user.id).gte("date", dateFilter),

      supabase.from("users").select("*").eq("id", user.id).single(),
    ])

    // Calculate analytics
    const currentWeight = weightLogs.data?.[weightLogs.data.length - 1]?.weight || profile.data?.current_weight
    const weightLoss = profile.data ? profile.data.starting_weight - currentWeight : 0
    const goalProgress = profile.data
      ? ((profile.data.starting_weight - currentWeight) / (profile.data.starting_weight - profile.data.goal_weight)) *
        100
      : 0

    const avgMood = moodLogs.data?.length
      ? moodLogs.data.reduce((sum, log) => sum + log.mood, 0) / moodLogs.data.length
      : 0

    const totalSteps = activityLogs.data?.reduce((sum, log) => sum + (log.steps || 0), 0) || 0
    const totalCalories = mealLogs.data?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0

    // Calculate streaks
    const uniqueLogDates = new Set([
      ...(weightLogs.data?.map((log) => log.date) || []),
      ...(mealLogs.data?.map((log) => log.date) || []),
    ])

    return NextResponse.json({
      period: Number.parseInt(period),
      weight: {
        current: currentWeight,
        loss: weightLoss,
        goalProgress: Math.max(0, goalProgress),
        logs: weightLogs.data,
      },
      activity: {
        totalSteps,
        avgStepsPerDay: Math.round(totalSteps / Number.parseInt(period)),
        logs: activityLogs.data,
      },
      nutrition: {
        totalCalories,
        avgCaloriesPerDay: Math.round(totalCalories / Number.parseInt(period)),
        logs: mealLogs.data,
      },
      mood: {
        average: avgMood,
        logs: moodLogs.data,
      },
      consistency: {
        daysLogged: uniqueLogDates.size,
        totalDays: Number.parseInt(period),
        percentage: Math.round((uniqueLogDates.size / Number.parseInt(period)) * 100),
      },
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

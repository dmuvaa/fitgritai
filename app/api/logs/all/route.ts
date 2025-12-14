import { NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

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

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateString = startDate.toISOString().split("T")[0]

    // Fetch all log types in parallel
    const [weightResponse, mealResponse, activityResponse, moodResponse, workoutResponse] = await Promise.all([
      supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDateString)
        .order("date", { ascending: false }),
      supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDateString)
        .order("date", { ascending: false }),
      supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDateString)
        .order("date", { ascending: false }),
      supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDateString)
        .order("date", { ascending: false }),
      supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "completed")
        .gte("completed_at", startDateString)
        .order("completed_at", { ascending: false }),
    ])

    // Handle errors but don't fail the whole request
    if (weightResponse.error) console.error("Weight logs error:", weightResponse.error)
    if (mealResponse.error) console.error("Meal logs error:", mealResponse.error)
    if (activityResponse.error) console.error("Activity logs error:", activityResponse.error)
    if (moodResponse.error) console.error("Mood logs error:", moodResponse.error)
    if (workoutResponse.error) console.error("Workout logs error:", workoutResponse.error)

    return NextResponse.json({
      weight: weightResponse.data || [],
      meals: mealResponse.data || [],
      activities: activityResponse.data || [],
      moods: moodResponse.data || [],
      workouts: workoutResponse.data || [],
    })
  } catch (error) {
    console.error("Error in GET /api/logs/all:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

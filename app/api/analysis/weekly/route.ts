import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const period = searchParams.get("period") || "week"

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Calculate date range
    const now = new Date()
    const daysToFetch = period === "week" ? 7 : 30
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToFetch)

    // Fetch all data in parallel
    const [weightLogs, mealLogs, activityLogs, moodLogs, profile] = await Promise.all([
      supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true }),
      supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true }),
      supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true }),
      supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true }),
      supabase.from("users").select("*").eq("id", userId).single(),
    ])

    // Process weight data for chart
    const weightData = (weightLogs.data || []).map((log) => ({
      date: new Date(log.date).toLocaleDateString("en-US", { weekday: "short" }),
      weight: log.weight,
      target: profile.data?.goal_weight || 75,
    }))

    // Process meal data for chart
    const mealsByDay = (mealLogs.data || []).reduce((acc: any, log) => {
      const day = new Date(log.date).toLocaleDateString("en-US", { weekday: "short" })
      if (!acc[day]) {
        acc[day] = { day, calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
      }
      acc[day].calories += log.calories || 0
      acc[day].protein += log.protein || 0
      acc[day].carbs += log.carbs || 0
      acc[day].fat += log.fat || 0
      acc[day].count += 1
      return acc
    }, {})

    const mealData = Object.values(mealsByDay)

    // Process workout data
    const workoutsByType = (activityLogs.data || []).reduce((acc: any, log) => {
      let type = log.workout_type || "Exercise"

      // Parse exercises if they exist
      let exercises = []
      try {
        if (log.exercises) {
          if (typeof log.exercises === "string") {
            exercises = JSON.parse(log.exercises)
          } else {
            exercises = log.exercises
          }
          if (exercises.length > 0) {
            type = exercises[0].category || type
          }
        }
      } catch (e) {
        // Use default type if parsing fails
      }

      if (!acc[type]) {
        acc[type] = { type, value: 0 }
      }
      acc[type].value += 1
      return acc
    }, {})

    const workoutData = Object.values(workoutsByType)

    // Process mood data
    const moodData = (moodLogs.data || []).map((log) => ({
      day: new Date(log.date).toLocaleDateString("en-US", { weekday: "short" }),
      mood: log.mood || "neutral",
      energy: log.energy_level || "medium",
      motivation: log.motivation_level || "medium",
    }))

    // Calculate insights
    const weightTrend =
      weightData.length >= 2
        ? weightData[weightData.length - 1].weight < weightData[0].weight
          ? "decreasing"
          : "increasing"
        : "stable"

    const nutritionScore = Math.min(100, Math.round(((mealLogs.data?.length || 0) / daysToFetch) * 100 * 1.2))
    const workoutConsistency = Math.min(100, Math.round(((activityLogs.data?.length || 0) / daysToFetch) * 100 * 1.5))
    const moodStability = Math.min(100, Math.round(((moodLogs.data?.length || 0) / daysToFetch) * 100 * 1.2))
    const overallProgress = Math.round((nutritionScore + workoutConsistency + moodStability) / 3)

    // Generate recommendations
    const recommendations = []

    if (weightTrend === "decreasing" && weightData.length >= 2) {
      const weightLoss = weightData[0].weight - weightData[weightData.length - 1].weight
      recommendations.push(
        `Great progress! You've lost ${weightLoss.toFixed(1)}kg this ${period}. Keep up the excellent work!`,
      )
    } else if (weightTrend === "increasing" && weightData.length >= 2) {
      const weightGain = weightData[weightData.length - 1].weight - weightData[0].weight
      recommendations.push(
        `Your weight increased by ${weightGain.toFixed(1)}kg this ${period}. Let's review your nutrition and exercise patterns.`,
      )
    }

    if (workoutConsistency < 50) {
      recommendations.push(
        "Your workout consistency could improve. Try scheduling workouts at the same time each day to build a habit.",
      )
    } else if (workoutConsistency >= 80) {
      recommendations.push(
        `Excellent workout consistency at ${workoutConsistency}%! You're crushing your fitness goals.`,
      )
    }

    if (nutritionScore < 60) {
      recommendations.push("Consider logging more meals to get better insights into your nutrition patterns.")
    } else if (nutritionScore >= 80) {
      recommendations.push("Outstanding meal logging! Your nutrition tracking is on point.")
    }

    if (moodData.length > 0) {
      const lowEnergyDays = moodData.filter((d) => d.energy === "low").length
      if (lowEnergyDays > daysToFetch / 3) {
        recommendations.push(
          "You had several low-energy days. Consider earlier bedtimes, more hydration, and lighter workouts on these days.",
        )
      }
    }

    if (recommendations.length === 0) {
      recommendations.push("Keep logging your data consistently to get personalized recommendations!")
    }

    // Generate achievements
    const achievements = []

    if ((mealLogs.data?.length || 0) >= daysToFetch - 1) {
      achievements.push("🔥 Consistent meal logging throughout the period")
    }

    if ((activityLogs.data?.length || 0) >= Math.floor(daysToFetch / 2)) {
      achievements.push(`💪 Completed ${activityLogs.data?.length || 0} workouts`)
    }

    if (weightTrend === "decreasing" && weightData.length >= 2) {
      achievements.push("📉 Weight loss progress toward your goal")
    }

    if ((moodLogs.data?.length || 0) >= daysToFetch - 1) {
      achievements.push("😊 Tracked your mood consistently")
    }

    if (achievements.length === 0) {
      achievements.push("Start logging consistently to unlock achievements!")
    }

    // Generate concerns
    const concerns = []

    if (nutritionScore < 40) {
      concerns.push("⚠️ Low meal logging frequency may impact progress tracking")
    }

    if (workoutConsistency < 30) {
      concerns.push("⚠️ Workout frequency below recommended levels")
    }

    if (
      weightTrend === "increasing" &&
      profile.data?.goal_weight &&
      profile.data.goal_weight < (weightData[0]?.weight || 0)
    ) {
      concerns.push("⚠️ Weight trending away from goal - review nutrition plan")
    }

    const analysisData = {
      weightData,
      mealData,
      workoutData,
      moodData,
      insights: {
        weightTrend,
        nutritionScore,
        workoutConsistency,
        moodStability,
        overallProgress,
      },
      recommendations,
      achievements,
      concerns,
    }

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error("Weekly analysis error:", error)
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}

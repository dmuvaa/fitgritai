import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export const dynamic = "force-dynamic"

/**
 * AI Proactive Insights Endpoint
 * Generates daily insights based on user data without requiring user prompts
 * Now supports both mobile Bearer token and web cookies
 * Uses same auth pattern as coach/chat route
 */
export async function POST(request: NextRequest) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    // Parse request body
    const body = await request.json()
    let userId = body.userId
    const weeksAgo = Math.min(Math.max(body.weeksAgo || 0, 0), 4) // Clamp to 0-4 weeks

    // Verify authentication first (same pattern as coach/chat)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      console.error("[Insights] Authentication failed:", authError?.message)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authenticatedUserId = authData.user.id

    // If userId provided in body, verify it matches authenticated user
    if (userId && userId !== authenticatedUserId) {
      console.error("[Insights] User ID mismatch:", { provided: userId, authenticated: authenticatedUserId })
      return NextResponse.json({ error: "Forbidden - cannot access other user's insights" }, { status: 403 })
    }

    // Use authenticated user's ID
    userId = authenticatedUserId

    console.log("[Insights] Loading data for user:", userId, "weeksAgo:", weeksAgo)

    // Load user profile (may not exist if user hasn't completed onboarding)
    // Using maybeSingle() to avoid throwing error if profile doesn't exist
    const { data: profile } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

    // Create a basic profile object from auth user if profile doesn't exist (same as coach/chat)
    const userProfile = profile || {
      id: authenticatedUserId,
      email: authData.user.email,
      name: authData.user.user_metadata?.name || authData.user.email?.split("@")[0] || "User",
      height: 0,
      starting_weight: 0,
      current_weight: 0,
      goal_weight: 0,
    }

    // Get user goals (may not exist)
    const { data: goals } = await supabase.from("user_goals").select("*").eq("user_id", userId).maybeSingle()

    // Calculate date range based on weeksAgo
    // weeksAgo=0 means current week (last 7 days)
    // weeksAgo=1 means 7-14 days ago, etc.
    const now = Date.now()
    const endDate = new Date(now - weeksAgo * 7 * 24 * 60 * 60 * 1000)
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)

    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    const weekLabel = weeksAgo === 0 ? "this week" : `${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ago`
    console.log(`[Insights] Fetching data for ${weekLabel}: ${startDateStr} to ${endDateStr}`)

    const [weightLogsRes, mealLogsRes, activityLogsRes, moodLogsRes] = await Promise.all([
      supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDateStr)
        .lte("date", endDateStr)
        .order("date", { ascending: false }),
      supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDateStr)
        .lte("date", endDateStr)
        .order("date", { ascending: false }),
      supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDateStr)
        .lte("date", endDateStr)
        .order("date", { ascending: false }),
      supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDateStr)
        .lte("date", endDateStr)
        .order("date", { ascending: false }),
    ])

    const logs = {
      weightLogs: weightLogsRes.data || [],
      mealLogs: mealLogsRes.data || [],
      activityLogs: activityLogsRes.data || [],
      moodLogs: moodLogsRes.data || [],
    }

    // Build comprehensive analysis prompt with week context
    const analysisPrompt = buildInsightsPrompt(userProfile, goals, logs, weekLabel)

    // Call OpenRouter API - same format as coach/chat route
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "FitGrit AI Insights",
      },
      body: JSON.stringify({
        model: "openai/gpt-4.1",
        messages: [
          {
            role: "system",
            content: analysisPrompt,
          },
          {
            role: "user",
            content:
              "Analyze my recent data and provide proactive insights. Include: 1) Key patterns you've noticed, 2) What I'm doing well, 3) Areas for improvement, 4) Specific actionable recommendations.",
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Insights] OpenRouter API error:", response.status, errorText)
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const aiResponse = await response.json()

    // Handle potential error in response (same as coach/chat)
    if (aiResponse.error) {
      console.error("[Insights] OpenRouter error in response:", aiResponse.error)
      throw new Error(`OpenRouter returned error: ${aiResponse.error.message || JSON.stringify(aiResponse.error)}`)
    }

    const insights = aiResponse.choices?.[0]?.message?.content || "Unable to generate insights at this time."

    // Store insights in database for future reference (optional - don't fail if this fails)
    try {
      await supabase.from("ai_insights").insert({
        user_id: userId,
        insights,
        insight_type: "daily_proactive",
      })
    } catch (insertError) {
      console.error("[Insights] Failed to store insights:", insertError)
      // Continue anyway - storing is not critical
    }

    return NextResponse.json({
      insights,
      weeksAgo,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("AI insights error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

function buildInsightsPrompt(profile: any, goals: any, logs: any, weekLabel: string = 'this week') {
  const currentWeight = profile.current_weight || profile.starting_weight || 0
  const startingWeight = profile.starting_weight || 0
  const goalWeight = profile.goal_weight || 0
  const weightLost = startingWeight - currentWeight
  const progressPercentage = startingWeight && goalWeight && startingWeight !== goalWeight
    ? Math.round(((startingWeight - currentWeight) / (startingWeight - goalWeight)) * 100)
    : 0

  // Analyze trends
  const recentWeights = logs.weightLogs.slice(0, 7)
  const weeklyTrend =
    recentWeights.length >= 2
      ? recentWeights[0].weight - recentWeights[recentWeights.length - 1].weight
      : 0

  // Calculate logging consistency
  const loggedDays = new Set(logs.weightLogs.map((log: any) => log.date))
  const consistency = loggedDays.size

  // Analyze meal patterns
  const avgDailyCalories =
    logs.mealLogs.length > 0
      ? Math.round(
        logs.mealLogs.reduce((sum: number, meal: any) => sum + (meal.calories || 0), 0) / Math.max(loggedDays.size, 1),
      )
      : 0

  // Count workouts
  const weeklyWorkouts = logs.activityLogs.length

  // Analyze mood patterns
  const avgMood =
    logs.moodLogs.length > 0
      ? logs.moodLogs.reduce((sum: number, mood: any) => {
        const moodValue = { great: 5, good: 4, okay: 3, poor: 2, terrible: 1 }[mood.mood] || 3
        return sum + moodValue
      }, 0) / logs.moodLogs.length
      : 3

  return `You are FitGrit AI, a proactive fitness coach. Analyze this user's data for ${weekLabel} and provide insights.

TIME PERIOD: ${weekLabel.toUpperCase()}

USER PROFILE:
- Name: ${profile.name || "User"}
- Starting Weight: ${startingWeight}kg
- Current Weight: ${currentWeight}kg
- Goal Weight: ${goalWeight}kg
- Weight Lost: ${weightLost.toFixed(1)}kg (${progressPercentage}% to goal)

GOALS:
- Daily Calorie Target: ${goals?.daily_calorie_goal || "Not set"}
- Daily Protein Target: ${goals?.daily_protein_goal || "Not set"}g
- BMR: ${goals?.calculated_bmr || "Unknown"} cal/day
- TDEE: ${goals?.calculated_tdee || "Unknown"} cal/day

RECENT TRENDS (Last 7 Days):
- Weekly Weight Trend: ${weeklyTrend > 0 ? "+" : ""}${weeklyTrend.toFixed(2)}kg
- Logging Consistency: ${consistency}/7 days
- Average Daily Calories: ${avgDailyCalories}
- Workouts Completed: ${weeklyWorkouts}
- Average Mood: ${avgMood.toFixed(1)}/5

DETAILED DATA:
- Weight Logs: ${logs.weightLogs.length} entries (${logs.weightLogs.slice(0, 5).map((w: any) => `${w.weight}kg on ${w.date}`).join(", ") || "None"})
- Meal Logs: ${logs.mealLogs.length} entries
- Activity Logs: ${logs.activityLogs.length} entries
- Mood Logs: ${logs.moodLogs.length} entries

YOUR TASK:
Analyze patterns and provide:
1. Pattern Recognition: What trends do you see? (e.g., weekend vs weekday behavior)
2. Wins: What's the user doing well?
3. Concerns: Any red flags or areas of concern?
4. Recommendations: 2-3 specific, actionable recommendations

Be direct, honest, and supportive. Use their actual data points. Keep it concise but insightful.`
}

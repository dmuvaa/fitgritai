import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

/**
 * Legacy Chat API
 * 
 * This endpoint is maintained for backward compatibility.
 * For agentic capabilities (actions, plan updates, logging), use /api/coach/chat instead.
 * Now supports both mobile Bearer token and web cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()

    if (!message || !userId) {
      return NextResponse.json({ error: "Message and userId are required" }, { status: 400 })
    }

    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    // Verify authentication
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure userId matches authenticated user
    if (authData.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized - user ID mismatch" }, { status: 401 })
    }

    // Get user data for context
    const { data: profile } = await supabase.from("users").select("*").eq("id", userId).single()

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user goals
    const { data: goals } = await supabase.from("user_goals").select("*").eq("user_id", userId).single()

    // Get recent weight logs
    const { data: weightLogs } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(30)

    // Get recent meal logs
    const { data: mealLogs } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(20)

    // Get recent activity logs
    const { data: activityLogs } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(20)

    // Get recent mood logs
    const { data: moodLogs } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(20)

    // Get chat history for context
    const { data: chatHistory } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    // Calculate user metrics
    const currentWeight = profile.current_weight || profile.starting_weight
    const weightLost = profile.starting_weight - currentWeight
    const progressPercentage = Math.round(
      ((profile.starting_weight - currentWeight) / (profile.starting_weight - profile.goal_weight)) * 100,
    )

    // Calculate BMI
    const heightInMeters = profile.height / 100
    const bmi = currentWeight / (heightInMeters * heightInMeters)

    // Use calculated BMR and TDEE from goals if available
    const bmr = goals?.calculated_bmr || 0
    const tdee = goals?.calculated_tdee || 0

    // Analyze recent trends
    const recentWeights = weightLogs?.slice(0, 7) || []
    const weightTrend =
      recentWeights.length > 1 ? recentWeights[0].weight - recentWeights[recentWeights.length - 1].weight : 0

    // Calculate average daily calories
    const recentMeals =
      mealLogs?.filter((meal) => new Date(meal.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) || []

    const totalCalories = recentMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
    const avgDailyCalories = recentMeals.length > 0 ? Math.round(totalCalories / 7) : 0

    // Create comprehensive system prompt
    const systemPrompt = `You are FitGrit AI, a direct, no-nonsense weight loss coach. You have access to the user's complete fitness data and should reference specific metrics in your responses. Be tough but supportive, call out excuses, and provide actionable advice.

USER PROFILE:
- Name: ${profile.name}
- Height: ${profile.height}cm
- Starting Weight: ${profile.starting_weight}kg
- Current Weight: ${currentWeight}kg
- Goal Weight: ${profile.goal_weight}kg
- Weight Lost: ${weightLost.toFixed(1)}kg
- Progress: ${progressPercentage}%

CALCULATED METRICS:
- BMI: ${Math.round(bmi * 10) / 10}
- BMR: ${bmr} calories/day
- TDEE: ${tdee} calories/day
- Daily Calorie Target: ${goals?.daily_calorie_goal || "Not set"}
- Daily Protein Target: ${goals?.daily_protein_goal || "Not set"}g
- Daily Carbs Target: ${goals?.daily_carbs_target || "Not set"}g
- Daily Fat Target: ${goals?.daily_fat_target || "Not set"}g
- 7-day weight trend: ${weightTrend > 0 ? "+" : ""}${Math.round(weightTrend * 10) / 10}kg
- Average daily calories (last 7 days): ${avgDailyCalories}

RECENT DATA SUMMARY:
- Recent weights: ${recentWeights.map((w) => `${w.weight}kg (${new Date(w.date).toLocaleDateString()})`).join(", ")}
- Recent meals: ${recentMeals.length} logged in past 7 days
- Recent activities: ${activityLogs?.length || 0} logged recently
- Recent mood: ${moodLogs?.length || 0} entries logged recently

COACHING STYLE:
- Be direct and honest, but not mean
- Reference specific data points from their logs
- Identify patterns and trends
- Give actionable, specific advice
- Call out inconsistencies or missed logging
- Celebrate real progress with numbers
- Keep responses concise but helpful (2-3 sentences max)
- Use a tough love approach - no coddling`

    // Prepare messages for OpenRouter
    const messages = [
      { role: "system", content: systemPrompt },
      ...(chatHistory
        ?.slice()
        .reverse()
        .slice(-8) // Keep last 8 messages for context
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        })) || []),
      { role: "user", content: message },
    ]

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "FitGrit AI Coach",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenRouter API error:", response.status, errorText)
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const aiMessage =
      aiResponse.choices[0]?.message?.content || "I'm having trouble processing that right now. Please try again."

    // Save both messages to chat history
    try {
      await supabase.from("chat_messages").insert([
        {
          user_id: userId,
          role: "user",
          content: message,
        },
        {
          user_id: userId,
          role: "assistant",
          content: aiMessage,
        },
      ])
    } catch (error) {
      console.log("Chat history not saved:", error)
    }

    return NextResponse.json({
      message: aiMessage,
      quickReplies: generateQuickReplies(message, profile, weightTrend, avgDailyCalories),
    })
  } catch (error) {
    console.error("Chat API error:", error)

    // Provide intelligent fallback based on user data
    const fallbackMessage = generateIntelligentFallback("")

    return NextResponse.json({
      message: fallbackMessage,
      quickReplies: ["Tell me about my progress", "Meal suggestions", "Workout tips", "Motivation boost"],
    })
  }
}

function generateQuickReplies(message: string, profile: any, weightTrend: number, avgCalories: number): string[] {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("progress") || lowerMessage.includes("analyze")) {
    return ["What should I focus on?", "Weekly summary", "Set new goals", "Compare to last month"]
  }

  if (lowerMessage.includes("meal") || lowerMessage.includes("food") || lowerMessage.includes("calorie")) {
    return ["Meal prep ideas", "Healthy snacks", "Restaurant choices", "Portion control tips"]
  }

  if (lowerMessage.includes("workout") || lowerMessage.includes("exercise") || lowerMessage.includes("activity")) {
    return ["Quick workouts", "Strength training", "Cardio options", "Rest day activities"]
  }

  if (lowerMessage.includes("plateau") || lowerMessage.includes("stuck") || lowerMessage.includes("not losing")) {
    return ["Break my plateau", "Change my routine", "Check my calories", "Increase activity"]
  }

  // Default quick replies
  return ["Analyze my progress", "Meal suggestions", "Workout tips", "Motivation boost"]
}

function generateIntelligentFallback(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("progress") || lowerMessage.includes("analyze")) {
    return "I'm having trouble accessing my full analysis right now, but here's what I know: consistency is everything. Are you logging every single day? Even the days you don't want to admit what you ate? That's where real progress starts."
  }

  if (lowerMessage.includes("plateau") || lowerMessage.includes("stuck")) {
    return "Plateaus happen when your body adapts. Time to shake things up - increase your activity, tighten your food logging, or try intermittent fasting. Your body is comfortable, and comfortable doesn't lose weight."
  }

  if (lowerMessage.includes("motivation") || lowerMessage.includes("give up")) {
    return "Motivation is bullshit. Discipline is what gets results. You didn't gain the weight overnight, you won't lose it overnight. But every day you stick to the plan is a day closer to your goal. What's your next move?"
  }

  return "I'm having some technical difficulties, but let me be clear: your success depends on consistency, not perfection. Are you tracking everything? Are you moving your body? Are you making excuses or making progress?"
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, profile, mealLogs, weeklyAverages, goals, mealsByDate, totalDays, totalMeals } = body

    // Prepare analysis prompt
    const analysisPrompt = `
You are FitGrit AI, a tough-love nutrition coach. Analyze this user's meal data and provide direct, actionable feedback.

USER PROFILE:
- Current Weight: ${profile?.current_weight || "Not set"}
- Goal Weight: ${profile?.goal_weight || "Not set"}
- Height: ${profile?.height || "Not set"}
- Activity Level: ${profile?.activity_level || "Not set"}

MEAL DATA (Past 7 Days):
- Total Days with Meals: ${totalDays}/7
- Total Meals Logged: ${totalMeals}
- Weekly Averages: ${weeklyAverages.calories} cal, ${weeklyAverages.protein}g protein, ${weeklyAverages.carbs}g carbs, ${weeklyAverages.fat}g fat
- Daily Goals: ${goals.calories} cal, ${goals.protein}g protein, ${goals.carbs}g carbs, ${goals.fat}g fat

RECENT MEALS:
${Object.entries(mealsByDate)
  .map(
    ([date, meals]) =>
      `${date}: ${meals.map((m) => `${m.meal_type} - ${m.description} (${m.calories || 0} cal)`).join(", ")}`,
  )
  .join("\n")}

Provide a direct, honest analysis covering:
1. Calorie intake vs goals
2. Protein adequacy 
3. Meal consistency and patterns
4. Specific areas for improvement
5. 2-3 actionable next steps

Be direct but constructive. No sugarcoating - this user wants real feedback to get results.
`

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "FitGrit AI Nutrition Analysis",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          {
            role: "system",
            content:
              "You are FitGrit AI, a direct, no-nonsense nutrition coach focused on results. Provide tough-love feedback that's honest but constructive.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error("OpenRouter API error:", await response.text())
      return NextResponse.json({
        analysis:
          "I'm having trouble analyzing your meals right now. Here's what I can see: You've logged meals on " +
          totalDays +
          " out of 7 days. Your average daily intake is " +
          weeklyAverages.calories +
          " calories with " +
          weeklyAverages.protein +
          "g protein. Focus on consistency - log meals every day and hit your protein target of " +
          goals.protein +
          "g daily.",
      })
    }

    const data = await response.json()
    const analysis = data.choices?.[0]?.message?.content || "Unable to generate analysis at this time."

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Nutrition analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze nutrition data" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile for email
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (!profile || !user.email) {
      return NextResponse.json({ error: "User profile or email not found" }, { status: 404 })
    }

    // Calculate date range (last 7 days)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    // Fetch all logs from the last 7 days
    const [weightLogs, mealLogs, activityLogs, moodLogs] = await Promise.all([
      supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDateStr)
        .lte("date", endDateStr)
        .order("date", { ascending: true }),
      supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDateStr)
        .lte("date", endDateStr)
        .order("date", { ascending: true }),
      supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDateStr)
        .lte("date", endDateStr)
        .order("date", { ascending: true }),
      supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDateStr)
        .lte("date", endDateStr)
        .order("date", { ascending: true }),
    ])

    // Calculate weekly stats
    const weights = weightLogs.data || []
    const meals = mealLogs.data || []
    const activities = activityLogs.data || []
    const moods = moodLogs.data || []

    const weightChange =
      weights.length >= 2 ? (weights[weights.length - 1].weight - weights[0].weight).toFixed(1) : "N/A"

    const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
    const avgCalories = meals.length > 0 ? Math.round(totalCalories / meals.length) : 0

    const totalProtein = meals.reduce((sum, meal) => sum + (Number.parseFloat(meal.protein) || 0), 0)
    const avgProtein = meals.length > 0 ? Math.round(totalProtein / meals.length) : 0

    const workoutCount = activities.filter((a) => a.workout_type).length
    const totalSteps = activities.reduce((sum, a) => sum + (a.steps || 0), 0)

    const avgMood =
      moods.length > 0 ? (moods.reduce((sum, m) => sum + (m.mood_rating || 0), 0) / moods.length).toFixed(1) : "N/A"

    // Generate AI analysis
    const analysisPrompt = `As a fitness coach, analyze this user's weekly data and provide personalized insights:

User Profile:
- Starting Weight: ${profile.starting_weight || "Not set"}kg
- Current Weight: ${profile.current_weight || "Not set"}kg
- Goal Weight: ${profile.goal_weight || "Not set"}kg
- Height: ${profile.height || "Not set"}cm

Weekly Data (Last 7 Days):
- Weight Change: ${weightChange}kg
- Average Calories: ${avgCalories} cal/day
- Average Protein: ${avgProtein}g/day
- Workouts Completed: ${workoutCount}
- Total Steps: ${totalSteps}
- Average Mood: ${avgMood}/5
- Total Meals Logged: ${meals.length}

Please provide:
1. Overall Assessment (2-3 sentences)
2. Key Achievements (2-3 bullet points)
3. Areas of Concern (1-2 bullet points, if any)
4. Actionable Recommendations for next week (3-4 specific steps)

Be direct, honest, and motivating. Focus on data-driven insights.`

    let aiAnalysis = ""

    try {
      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "X-Title": "FitGrit AI Weekly Analysis",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [{ role: "user", content: analysisPrompt }],
          max_tokens: 800,
          temperature: 0.7,
        }),
      })

      if (aiResponse.ok) {
        const aiData = await aiResponse.json()
        aiAnalysis = aiData.choices[0]?.message?.content || "Analysis unavailable"
      } else {
        aiAnalysis = "AI analysis temporarily unavailable. Here are your stats for the week."
      }
    } catch (error) {
      console.error("AI analysis error:", error)
      aiAnalysis = "AI analysis temporarily unavailable. Here are your stats for the week."
    }

    // Parse AI analysis into sections
    const parseAnalysis = (text: string) => {
      const sections = {
        assessment: "",
        achievements: [] as string[],
        concerns: [] as string[],
        recommendations: [] as string[],
      }

      const lines = text.split("\n").filter((line) => line.trim())
      let currentSection = ""

      for (const line of lines) {
        const lower = line.toLowerCase()
        if (lower.includes("overall assessment") || lower.includes("assessment:")) {
          currentSection = "assessment"
        } else if (lower.includes("achievement") || lower.includes("wins") || lower.includes("successes")) {
          currentSection = "achievements"
        } else if (lower.includes("concern") || lower.includes("challenge") || lower.includes("area")) {
          currentSection = "concerns"
        } else if (lower.includes("recommendation") || lower.includes("next week") || lower.includes("action")) {
          currentSection = "recommendations"
        } else if (line.trim().startsWith("-") || line.trim().startsWith("•") || line.trim().startsWith("*")) {
          const cleanLine = line.replace(/^[-•*]\s*/, "").trim()
          if (currentSection === "achievements") sections.achievements.push(cleanLine)
          else if (currentSection === "concerns") sections.concerns.push(cleanLine)
          else if (currentSection === "recommendations") sections.recommendations.push(cleanLine)
        } else if (line.trim() && currentSection === "assessment" && !line.includes(":")) {
          sections.assessment += line.trim() + " "
        }
      }

      return sections
    }

    const analysis = parseAnalysis(aiAnalysis)

    // Create beautiful HTML email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px 20px; background: #f9fafb; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-value { font-size: 32px; font-weight: bold; color: #667eea; margin: 5px 0; }
            .stat-label { font-size: 14px; color: #666; }
            .section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .section h2 { color: #667eea; margin-top: 0; font-size: 20px; }
            .section ul { margin: 10px 0; padding-left: 20px; }
            .section li { margin: 8px 0; }
            .achievement { color: #10b981; }
            .concern { color: #f59e0b; }
            .recommendation { color: #3b82f6; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Weekly Analysis</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Week of ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
            </div>
            
            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Hi ${profile.full_name || "there"}! 👋</h2>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-label">Weight Change</div>
                  <div class="stat-value">${weightChange !== "N/A" ? (Number.parseFloat(weightChange) > 0 ? "+" : "") + weightChange : "N/A"}kg</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Workouts</div>
                  <div class="stat-value">${workoutCount}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Avg Calories</div>
                  <div class="stat-value">${avgCalories}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Avg Protein</div>
                  <div class="stat-value">${avgProtein}g</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Total Steps</div>
                  <div class="stat-value">${totalSteps.toLocaleString()}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Avg Mood</div>
                  <div class="stat-value">${avgMood !== "N/A" ? avgMood + "/5" : "N/A"}</div>
                </div>
              </div>

              ${
                analysis.assessment
                  ? `
                <div class="section">
                  <h2>🎯 Overall Assessment</h2>
                  <p>${analysis.assessment}</p>
                </div>
              `
                  : ""
              }

              ${
                analysis.achievements.length > 0
                  ? `
                <div class="section">
                  <h2>🏆 Key Achievements</h2>
                  <ul>
                    ${analysis.achievements.map((item) => `<li class="achievement">${item}</li>`).join("")}
                  </ul>
                </div>
              `
                  : ""
              }

              ${
                analysis.concerns.length > 0
                  ? `
                <div class="section">
                  <h2>⚠️ Areas to Watch</h2>
                  <ul>
                    ${analysis.concerns.map((item) => `<li class="concern">${item}</li>`).join("")}
                  </ul>
                </div>
              `
                  : ""
              }

              ${
                analysis.recommendations.length > 0
                  ? `
                <div class="section">
                  <h2>💡 Action Steps for Next Week</h2>
                  <ul>
                    ${analysis.recommendations.map((item) => `<li class="recommendation">${item}</li>`).join("")}
                  </ul>
                </div>
              `
                  : ""
              }

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">View Full Dashboard</a>
              </div>
            </div>

            <div class="footer">
              <p>Keep up the great work! 💪</p>
              <p>© 2025 FitGrit AI. All rights reserved.</p>
              <p>Questions? Reply to this email: dennis@fitgritai.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send the email
    const result = await sendEmail({
      to: user.email,
      subject: `📊 Your Weekly Analysis - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      html: emailHtml,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Weekly analysis sent to your email!",
        stats: {
          weightChange,
          avgCalories,
          avgProtein,
          workoutCount,
          totalSteps,
          avgMood,
        },
      })
    } else {
      throw new Error("Failed to send email")
    }
  } catch (error) {
    console.error("Request weekly analysis error:", error)
    return NextResponse.json({ error: "Failed to generate and send weekly analysis" }, { status: 500 })
  }
}

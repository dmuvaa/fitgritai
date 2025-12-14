import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"
import { isSupabaseConfigured } from "@/lib/supabase-utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    // Verify current user (works in both paths)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = authData.user.id

    // Get user profile (use same pattern as /api/users/profile)
    console.log('🔍 [Stats API] Fetching profile for userId:', userId)
    const { data: profiles, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)

    console.log('🔍 [Stats API] Profile result:', { 
      profilesCount: profiles?.length || 0,
      hasProfile: profiles && profiles.length > 0, 
      error: profileError?.message 
    })

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    const profile = profiles && profiles.length > 0 ? profiles[0] : null

    if (!profile) {
      console.log('❌ [Stats API] Profile not found for userId:', userId)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    console.log('✅ [Stats API] Profile found:', profile.email)

    // Get user goals (includes BMR/TDEE)
    const { data: goals } = await supabase.from("user_goals").select("*").eq("user_id", userId).single()

    // Get recent weight logs (last 14 for weekly comparison)
    const { data: weightLogs } = await supabase
      .from("weight_logs")
      .select("weight, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(14)

    // Get all logs count
    const { count: totalLogs } = await supabase
      .from("weight_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    // Get this week's logs
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { count: weeklyLogs } = await supabase
      .from("weight_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("date", weekAgo.toISOString().split("T")[0])

    // Calculate stats
    const currentWeight = weightLogs?.[0]?.weight || profile.current_weight || 0
    const startingWeight = profile.starting_weight || currentWeight
    const goalWeight = profile.goal_weight || currentWeight

    const weightLost = startingWeight - currentWeight
    const totalWeightToLose = startingWeight - goalWeight
    const progressPercentage = totalWeightToLose > 0 ? Math.round((weightLost / totalWeightToLose) * 100) : 0

    // BMI calculation
    let bmi = 0
    if (profile.height && currentWeight > 0) {
      const heightInM = profile.height / 100
      bmi = Math.round((currentWeight / (heightInM * heightInM)) * 10) / 10
    }

    // Get BMR and TDEE from goals (calculated values)
    const bmr = goals?.calculated_bmr || 0
    const tdee = goals?.calculated_tdee || 0

    // Weekly weight change
    let weeklyWeightChange = 0
    if (weightLogs && weightLogs.length >= 7) {
      weeklyWeightChange = Math.round((weightLogs[0].weight - weightLogs[6].weight) * 10) / 10
    }

    // Calculate streak
    let currentStreak = 0
    if (weightLogs && weightLogs.length > 0) {
      const sortedLogs = [...weightLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      let checkDate = new Date()
      for (const log of sortedLogs) {
        const logDate = new Date(log.date)
        const daysDiff = Math.floor((checkDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff <= 1) {
          currentStreak++
          checkDate = logDate
        } else {
          break
        }
      }
    }

    return NextResponse.json({
      currentWeight: Math.round(currentWeight * 10) / 10,
      goalWeight: Math.round(goalWeight * 10) / 10,
      weightLost: Math.round(weightLost * 10) / 10,
      progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
      bmi,
      bmr,
      tdee,
      weeklyWeightChange,
      currentStreak,
      totalLogs: totalLogs || 0,
      weeklyLogs: weeklyLogs || 0,
    })
  } catch (error) {
    console.error("Stats overview error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, emailTemplates } from "@/lib/email"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("users").select("name, email").eq("id", user.id).single()

    if (!profile?.email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 })
    }

    // Calculate weight change this week
    const today = new Date()
    const oneWeekAgo = new Date(today)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { data: currentWeight } = await supabase
      .from("weight_logs")
      .select("weight")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .single()

    const { data: weekAgoWeight } = await supabase
      .from("weight_logs")
      .select("weight")
      .eq("user_id", user.id)
      .lte("date", oneWeekAgo.toISOString().split("T")[0])
      .order("date", { ascending: false })
      .limit(1)
      .single()

    const weightChange = weekAgoWeight && currentWeight ? weekAgoWeight.weight - currentWeight.weight : 0

    // Calculate streak
    const { data: allLogs } = await supabase
      .from("weight_logs")
      .select("date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    let streak = 0
    if (allLogs && allLogs.length > 0) {
      const sortedDates = allLogs.map((log) => new Date(log.date)).sort((a, b) => b.getTime() - a.getTime())
      let currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0)

      for (const logDate of sortedDates) {
        logDate.setHours(0, 0, 0, 0)
        const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
          streak++
          currentDate = new Date(logDate)
        } else {
          break
        }
      }
    }

    const template = emailTemplates.weeklyProgress(profile.name || "there", weightChange, streak)
    const result = await sendEmail({
      to: profile.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error("Send weekly progress error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

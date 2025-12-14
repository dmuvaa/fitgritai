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

    // Calculate missed days
    const { data: recentLogs } = await supabase
      .from("weight_logs")
      .select("date")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(1)
      .single()

    let missedDays = 0
    if (recentLogs?.date) {
      const lastLog = new Date(recentLogs.date)
      const today = new Date()
      missedDays = Math.floor((today.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24))
    }

    const template = emailTemplates.dailyReminder(profile.name || "there", missedDays)
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
    console.error("Send daily reminder error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

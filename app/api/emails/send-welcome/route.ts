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

    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const template = emailTemplates.welcome(name || "there")
    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error("Send welcome email error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

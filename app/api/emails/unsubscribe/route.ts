import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { randomBytes } from "crypto"

/**
 * GET /api/emails/unsubscribe?token=xxx
 * Unsubscribe user from emails using a secure token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")
    const email = searchParams.get("email")
    const type = searchParams.get("type") // Optional: specific email type

    if (!token && !email) {
      return NextResponse.json({ error: "Token or email required" }, { status: 400 })
    }

    const supabase = await createClient()

    let userId: string | null = null

    // If token provided, validate it
    if (token) {
      const { data: tokenData, error: tokenError } = await supabase
        .from("unsubscribe_tokens")
        .select("user_id, email_type, used, expires_at")
        .eq("token", token)
        .single()

      if (tokenError || !tokenData) {
        return NextResponse.json({ error: "Invalid unsubscribe token" }, { status: 400 })
      }

      if (tokenData.used) {
        return NextResponse.json({ error: "Token already used" }, { status: 400 })
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return NextResponse.json({ error: "Token expired" }, { status: 400 })
      }

      userId = tokenData.user_id

      // Mark token as used
      await supabase.from("unsubscribe_tokens").update({ used: true }).eq("token", token)
    }

    // If email provided (fallback), find user by email
    if (email && !userId) {
      const { data: userData } = await supabase.from("users").select("id").eq("email", email).single()

      if (userData) {
        userId = userData.id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update email preferences
    const updates: any = {}

    if (type === "daily_reminder") {
      updates.daily_reminders = false
    } else if (type === "weekly_progress") {
      updates.weekly_reports = false
    } else if (type === "achievement") {
      updates.achievement_emails = false
    } else {
      // Unsubscribe from all
      updates.daily_reminders = false
      updates.weekly_reports = false
      updates.achievement_emails = false
      updates.marketing_emails = false
    }

    const { error: updateError } = await supabase
      .from("email_preferences")
      .upsert({ user_id: userId, ...updates }, { onConflict: "user_id" })

    if (updateError) {
      console.error("Error updating preferences:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Redirect to unsubscribe confirmation page
    return NextResponse.redirect(
      new URL(`/emails/unsubscribed${type ? `?type=${type}` : ""}`, request.url),
      { status: 302 },
    )
  } catch (error: any) {
    console.error("Unsubscribe error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/emails/unsubscribe
 * Generate unsubscribe token for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email_type } = await request.json()

    // Generate secure token
    const token = randomBytes(32).toString("hex")

    const { data: tokenData, error } = await supabase
      .from("unsubscribe_tokens")
      .insert({
        user_id: user.id,
        token,
        email_type: email_type || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating unsubscribe token:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/emails/unsubscribe?token=${token}`

    return NextResponse.json({
      token,
      unsubscribeUrl,
      message: "Unsubscribe token generated",
    })
  } catch (error: any) {
    console.error("Generate unsubscribe token error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


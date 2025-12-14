import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export const dynamic = "force-dynamic"

// Default preferences for new users
const DEFAULT_PREFERENCES = {
  daily_reminders: true,
  weekly_reports: true,
  achievement_emails: true,
  marketing_emails: false,
  in_app_notifications: true,
  logging_reminder_intervals: ['24_hours'],
  insights_delivery_intervals: ['1_week'],
  quiet_hours_start: null,
  quiet_hours_end: null,
}

export async function GET(request: NextRequest) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = authData.user

    // Get user's email preferences
    let { data: preferences, error } = await supabase
      .from("email_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("Error fetching preferences:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no preferences found, create default ones
    if (!preferences) {
      const { data: newPreferences, error: insertError } = await supabase
        .from("email_preferences")
        .insert({
          user_id: user.id,
          ...DEFAULT_PREFERENCES,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error creating preferences:", insertError)
        // Return defaults if insert fails (table might not have new columns yet)
        return NextResponse.json({
          preferences: { user_id: user.id, ...DEFAULT_PREFERENCES }
        })
      }

      preferences = newPreferences
    }

    return NextResponse.json({ preferences })
  } catch (error: any) {
    console.error("Email preferences GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = authData.user
    const body = await request.json()

    const {
      daily_reminders,
      weekly_reports,
      achievement_emails,
      marketing_emails,
      reminder_time,
      timezone,
      // New fields
      logging_reminder_intervals,
      insights_delivery_intervals,
      in_app_notifications,
      quiet_hours_start,
      quiet_hours_end,
    } = body

    // Validate logging_reminder_intervals (1-3 selections)
    if (logging_reminder_intervals) {
      if (!Array.isArray(logging_reminder_intervals)) {
        return NextResponse.json({ error: "logging_reminder_intervals must be an array" }, { status: 400 })
      }
      if (logging_reminder_intervals.length < 1 || logging_reminder_intervals.length > 3) {
        return NextResponse.json({ error: "Must select 1-3 reminder intervals" }, { status: 400 })
      }
      const validIntervals = ['24_hours', '48_hours', '3_days', '1_week', '1_month']
      const allValid = logging_reminder_intervals.every(i => validIntervals.includes(i))
      if (!allValid) {
        return NextResponse.json({ error: "Invalid reminder interval" }, { status: 400 })
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (daily_reminders !== undefined) updateData.daily_reminders = daily_reminders
    if (weekly_reports !== undefined) updateData.weekly_reports = weekly_reports
    if (achievement_emails !== undefined) updateData.achievement_emails = achievement_emails
    if (marketing_emails !== undefined) updateData.marketing_emails = marketing_emails
    if (reminder_time !== undefined) updateData.reminder_time = reminder_time
    if (timezone !== undefined) updateData.timezone = timezone
    if (logging_reminder_intervals !== undefined) updateData.logging_reminder_intervals = logging_reminder_intervals
    if (insights_delivery_intervals !== undefined) updateData.insights_delivery_intervals = insights_delivery_intervals
    if (in_app_notifications !== undefined) updateData.in_app_notifications = in_app_notifications
    if (quiet_hours_start !== undefined) updateData.quiet_hours_start = quiet_hours_start
    if (quiet_hours_end !== undefined) updateData.quiet_hours_end = quiet_hours_end

    // Upsert preferences
    const { data: preferences, error } = await supabase
      .from("email_preferences")
      .upsert(
        {
          user_id: user.id,
          ...updateData,
        },
        { onConflict: "user_id" },
      )
      .select()
      .single()

    if (error) {
      console.error("Error updating preferences:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ preferences, message: "Preferences updated successfully" })
  } catch (error: any) {
    console.error("Email preferences POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

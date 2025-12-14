import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { sendEmail, emailTemplates } from "@/lib/email"

/**
 * Vercel Cron Job: Daily Email Reminders
 * Triggered by Vercel Cron: Every day at 9 AM UTC
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Starting daily email cron job...')
    
    const supabase = await createClient()
    
    // Get all users who:
    // 1. Have email preferences enabled for daily reminders (or no preferences set - default ON)
    // 2. Haven't logged weight today
    // 3. Are active (logged in last 30 days)

    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Get all users with their preferences
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        last_sign_in_at,
        email_preferences (
          daily_reminders
        )
      `)
      .gte('last_sign_in_at', thirtyDaysAgo)
      .not('email', 'is', null)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      throw usersError
    }

    console.log(`📊 Found ${users.length} active users`)

    let emailsSent = 0
    let emailsSkipped = 0
    let emailsFailed = 0

    for (const user of users) {
      // Check email preferences (default to true if not set)
      const dailyRemindersEnabled = user.email_preferences?.[0]?.daily_reminders ?? true
      
      if (!dailyRemindersEnabled) {
        emailsSkipped++
        continue
      }

      // Check if user has already logged today
      const { data: todayLogs } = await supabase
        .from('weight_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1)

      if (todayLogs && todayLogs.length > 0) {
        // User already logged today, skip
        emailsSkipped++
        continue
      }

      // Calculate streak
      const { data: allLogs } = await supabase
        .from('weight_logs')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30)

      let streak = 0
      if (allLogs && allLogs.length > 0) {
        const sortedDates = allLogs.map(log => new Date(log.date)).sort((a, b) => b.getTime() - a.getTime())
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

      // Send email
      try {
        const template = emailTemplates.dailyReminder(user.name || 'there', streak)
        
        const result = await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        })

        if (result.success) {
          emailsSent++
          console.log(`✅ Sent email to ${user.email} (streak: ${streak})`)
        } else {
          emailsFailed++
          console.error(`❌ Failed to send email to ${user.email}:`, result.error)
        }
      } catch (error) {
        console.error(`❌ Failed to send email to ${user.email}:`, error)
        emailsFailed++
      }

      // Rate limiting: wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const summary = {
      emailsSent,
      emailsSkipped,
      emailsFailed,
      totalUsers: users.length,
    }

    console.log(`\n📊 Daily Email Summary:`, summary)

    // Log to database for tracking
    await supabase.from('email_logs').insert({
      job_type: 'daily_reminder',
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      emails_skipped: emailsSkipped,
      total_users: users.length,
    })

    return NextResponse.json({
      success: true,
      message: 'Daily emails sent successfully',
      ...summary,
    })

  } catch (error: any) {
    console.error('❌ Fatal error in daily email cron:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

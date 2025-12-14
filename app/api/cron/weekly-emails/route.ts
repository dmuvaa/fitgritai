import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { sendEmail, emailTemplates } from "@/lib/email"

/**
 * Vercel Cron Job: Weekly Progress Emails
 * Triggered by Vercel Cron: Every Sunday at 7 PM UTC
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Starting weekly email cron job...')
    
    const supabase = await createClient()
    
    const today = new Date()
    const oneWeekAgo = new Date(today)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const todayStr = today.toISOString().split('T')[0]
    const weekAgoStr = oneWeekAgo.toISOString().split('T')[0]

    // Get all users who have logged at least once this week
    const { data: activeUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        email_preferences (
          weekly_reports
        )
      `)
      .not('email', 'is', null)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      throw usersError
    }

    console.log(`📊 Found ${activeUsers.length} users`)

    let emailsSent = 0
    let emailsSkipped = 0
    let emailsFailed = 0

    for (const user of activeUsers) {
      // Check email preferences
      const weeklyReportsEnabled = user.email_preferences?.[0]?.weekly_reports ?? true
      
      if (!weeklyReportsEnabled) {
        emailsSkipped++
        continue
      }

      // Get user's weekly data
      const { data: weightLogs } = await supabase
        .from('weight_logs')
        .select('weight, date')
        .eq('user_id', user.id)
        .gte('date', weekAgoStr)
        .lte('date', todayStr)
        .order('date', { ascending: false })

      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekAgoStr)
        .lte('date', todayStr)

      const { data: mealLogs } = await supabase
        .from('meal_logs')
        .select('calories')
        .eq('user_id', user.id)
        .gte('date', weekAgoStr)
        .lte('date', todayStr)

      // Skip if no activity this week
      if (!weightLogs?.length && !activityLogs?.length && !mealLogs?.length) {
        emailsSkipped++
        continue
      }

      // Calculate stats
      const weightChange = weightLogs?.length >= 2 
        ? weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight 
        : 0

      const workouts = activityLogs?.length || 0

      const avgCalories = mealLogs?.length > 0
        ? Math.round(mealLogs.reduce((sum, m) => sum + (m.calories || 0), 0) / 7)
        : 0

      // Calculate log streak
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

      const stats = {
        weightChange: weightChange.toFixed(1),
        workouts,
        avgCalories,
        logStreak: streak,
        message: generateWeeklyMessage(weightChange, workouts, avgCalories),
      }

      // Send email
      try {
        const template = emailTemplates.weeklyProgress(user.name || 'there', stats)
        
        const result = await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        })

        if (result.success) {
          emailsSent++
          console.log(`✅ Sent email to ${user.email}`)
        } else {
          emailsFailed++
          console.error(`❌ Failed to send email to ${user.email}:`, result.error)
        }
      } catch (error) {
        console.error(`❌ Failed to send email to ${user.email}:`, error)
        emailsFailed++
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const summary = {
      emailsSent,
      emailsSkipped,
      emailsFailed,
      totalUsers: activeUsers.length,
    }

    console.log(`\n📊 Weekly Email Summary:`, summary)

    // Log to database
    await supabase.from('email_logs').insert({
      job_type: 'weekly_progress',
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      emails_skipped: emailsSkipped,
      total_users: activeUsers.length,
    })

    return NextResponse.json({
      success: true,
      message: 'Weekly emails sent successfully',
      ...summary,
    })

  } catch (error: any) {
    console.error('❌ Fatal error in weekly email cron:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

function generateWeeklyMessage(weightChange: number, workouts: number, avgCalories: number): string {
  if (weightChange < -0.5) {
    return `Excellent progress this week! You're ${Math.abs(weightChange)}kg lighter. Keep it up! 💪`
  } else if (weightChange > 0.5) {
    return `Weight's up ${weightChange}kg this week. Don't worry - focus on consistency and the trend will follow. 💪`
  } else if (workouts >= 4) {
    return `Crushing it with ${workouts} workouts this week! Your dedication is inspiring! 🔥`
  } else {
    return `You're making progress! Stay consistent and you'll see results. 🌟`
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { sendEmail, emailTemplates } from "@/lib/email"

/**
 * Vercel Cron Job: Re-engagement Emails
 * Triggered by Vercel Cron: Every Monday at 10 AM UTC
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Starting re-engagement email cron job...')
    
    const supabase = await createClient()
    
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const fourteenDaysAgo = new Date(today)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]
    const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split('T')[0]

    // Get users who haven't logged in the last 7 days but logged within 14 days
    const { data: inactiveUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        starting_weight,
        goal_weight,
        email_preferences (
          daily_reminders
        )
      `)
      .not('email', 'is', null)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      throw usersError
    }

    console.log(`📊 Checking ${inactiveUsers.length} users for inactivity`)

    let emailsSent = 0
    let emailsSkipped = 0
    let emailsFailed = 0

    for (const user of inactiveUsers) {
      // Check if user has logged in the last 7 days
      const { data: recentLogs } = await supabase
        .from('weight_logs')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgoStr)
        .limit(1)

      if (recentLogs && recentLogs.length > 0) {
        // User is active, skip
        emailsSkipped++
        continue
      }

      // Check if user logged within 14 days (so they're not completely inactive)
      const { data: recentActivity } = await supabase
        .from('weight_logs')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', fourteenDaysAgoStr)
        .limit(1)

      if (!recentActivity || recentActivity.length === 0) {
        // User hasn't logged in 14+ days, skip (they need a different email)
        emailsSkipped++
        continue
      }

      // Get user's total progress
      const { data: latestWeight } = await supabase
        .from('weight_logs')
        .select('weight')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      const weightLost = latestWeight 
        ? user.starting_weight - latestWeight.weight 
        : 0

      const stats = {
        weightLost: weightLost.toFixed(1),
        goalWeight: user.goal_weight,
        daysInactive: 7,
      }

      // Send email
      try {
        const template = generateReengagementEmail(user.name || 'there', stats)
        
        const result = await sendEmail({
          to: user.email,
          subject: `We miss you! Your goals are waiting 💪`,
          html: template.html,
          text: template.text,
        })

        if (result.success) {
          emailsSent++
          console.log(`✅ Sent re-engagement email to ${user.email}`)
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
      totalUsers: inactiveUsers.length,
    }

    console.log(`\n📊 Re-engagement Email Summary:`, summary)

    // Log to database
    await supabase.from('email_logs').insert({
      job_type: 'reengagement',
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      emails_skipped: emailsSkipped,
      total_users: inactiveUsers.length,
    })

    return NextResponse.json({
      success: true,
      message: 'Re-engagement emails sent successfully',
      ...summary,
    })

  } catch (error: any) {
    console.error('❌ Fatal error in re-engagement email cron:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

function generateReengagementEmail(userName: string, stats: any) {
  return {
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 16px; font-weight: 600; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>We Miss You! 💜</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We noticed you haven't logged your progress in a while. Your journey matters, and consistency is the key to reaching your goals!</p>
              
              ${stats.weightLost > 0 ? `
                <div class="highlight">You've already lost ${stats.weightLost}kg!</div>
                <p style="text-align: center;">Don't let that progress slip away. 🎯</p>
              ` : `
                <p style="text-align: center;"><strong>Every journey starts with a single step.</strong></p>
              `}

              <p><strong>Here's the truth:</strong></p>
              <ul>
                <li>⏰ It takes just 2 minutes to log your progress</li>
                <li>📊 Tracking is the #1 predictor of success</li>
                <li>💪 The best time to get back on track is RIGHT NOW</li>
              </ul>

              <p>Your goals aren't going to achieve themselves. What are you waiting for?</p>

              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">Get Back On Track</a>
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #666; font-style: italic;">
                "The only workout you regret is the one you didn't do. The only log you regret is the one you skipped."
              </p>
            </div>
            <div class="footer">
              <p>© 2025 FitGrit AI. All rights reserved.</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/emails/preferences" style="color: #666;">Manage email preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${userName}, we noticed you haven't logged your progress in a while. Your journey matters! Get back on track at ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  }
}

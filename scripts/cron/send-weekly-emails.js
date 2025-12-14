/**
 * Weekly Email Cron Job
 * Sends weekly progress reports to all active users
 * Run by Render Cron: Every Sunday at 7 PM UTC
 */

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!supabaseUrl || !supabaseKey || !resendKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendKey);

const FROM_EMAIL = 'dennis@fitgritai.com';
const APP_NAME = 'FitGrit AI';

async function sendWeeklyEmails() {
  console.log('🚀 Starting weekly email job...');
  
  try {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const todayStr = today.toISOString().split('T')[0];
    const weekAgoStr = oneWeekAgo.toISOString().split('T')[0];

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
      .not('email', 'is', null);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`📊 Found ${activeUsers.length} users`);

    let emailsSent = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;

    for (const user of activeUsers) {
      // Check email preferences
      const weeklyReportsEnabled = user.email_preferences?.[0]?.weekly_reports ?? true;
      
      if (!weeklyReportsEnabled) {
        emailsSkipped++;
        continue;
      }

      // Get user's weekly data
      const { data: weightLogs } = await supabase
        .from('weight_logs')
        .select('weight, date')
        .eq('user_id', user.id)
        .gte('date', weekAgoStr)
        .lte('date', todayStr)
        .order('date', { ascending: false });

      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekAgoStr)
        .lte('date', todayStr);

      const { data: mealLogs } = await supabase
        .from('meal_logs')
        .select('calories')
        .eq('user_id', user.id)
        .gte('date', weekAgoStr)
        .lte('date', todayStr);

      // Skip if no activity this week
      if (!weightLogs?.length && !activityLogs?.length && !mealLogs?.length) {
        emailsSkipped++;
        continue;
      }

      // Calculate stats
      const weightChange = weightLogs?.length >= 2 
        ? weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight 
        : 0;

      const workouts = activityLogs?.length || 0;

      const avgCalories = mealLogs?.length > 0
        ? Math.round(mealLogs.reduce((sum, m) => sum + (m.calories || 0), 0) / 7)
        : 0;

      // Calculate log streak
      const { data: allLogs } = await supabase
        .from('weight_logs')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      let streak = 0;
      if (allLogs && allLogs.length > 0) {
        const sortedDates = allLogs.map(log => new Date(log.date)).sort((a, b) => b - a);
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const logDate of sortedDates) {
          logDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((currentDate - logDate) / (1000 * 60 * 60 * 24));

          if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
            streak++;
            currentDate = new Date(logDate);
          } else {
            break;
          }
        }
      }

      const stats = {
        weightChange: weightChange.toFixed(1),
        workouts,
        avgCalories,
        logStreak: streak,
        message: generateWeeklyMessage(weightChange, workouts, avgCalories),
      };

      // Send email
      try {
        const emailHtml = generateWeeklyProgressEmail(user.name || 'there', stats);
        
        await resend.emails.send({
          from: `${APP_NAME} <${FROM_EMAIL}>`,
          to: user.email,
          subject: `Your Weekly Progress Report 📊`,
          html: emailHtml,
        });

        emailsSent++;
        console.log(`✅ Sent email to ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to send email to ${user.email}:`, error);
        emailsFailed++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Weekly Email Summary:`);
    console.log(`   ✅ Sent: ${emailsSent}`);
    console.log(`   ⏭️  Skipped: ${emailsSkipped}`);
    console.log(`   ❌ Failed: ${emailsFailed}`);
    console.log(`   📧 Total processed: ${activeUsers.length}\n`);

    // Log to database
    await supabase.from('email_logs').insert({
      job_type: 'weekly_progress',
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      emails_skipped: emailsSkipped,
      total_users: activeUsers.length,
    });

  } catch (error) {
    console.error('❌ Fatal error in weekly email job:', error);
    process.exit(1);
  }
}

function generateWeeklyMessage(weightChange, workouts, avgCalories) {
  if (weightChange < -0.5) {
    return `Excellent progress this week! You're ${Math.abs(weightChange)}kg lighter. Keep it up! 💪`;
  } else if (weightChange > 0.5) {
    return `Weight's up ${weightChange}kg this week. Don't worry - focus on consistency and the trend will follow. 💪`;
  } else if (workouts >= 4) {
    return `Crushing it with ${workouts} workouts this week! Your dedication is inspiring! 🔥`;
  } else {
    return `You're making progress! Stay consistent and you'll see results. 🌟`;
  }
}

function generateWeeklyProgressEmail(userName, stats) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Weekly Progress Report 📊</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Here's your weekly summary:</p>
            
            <div class="stat-grid">
              <div class="stat-card">
                <div class="stat-value">${stats.weightChange > 0 ? '+' : ''}${stats.weightChange}kg</div>
                <div class="stat-label">Weight Change</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.workouts}</div>
                <div class="stat-label">Workouts</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.avgCalories}</div>
                <div class="stat-label">Avg Calories</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.logStreak}</div>
                <div class="stat-label">Log Streak</div>
              </div>
            </div>

            <p><strong>Keep up the great work!</strong> ${stats.message}</p>
            
            <div style="text-align: center;">
              <a href="${siteUrl}/dashboard" class="button">View Full Report</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 ${APP_NAME}. All rights reserved.</p>
            <p><a href="${siteUrl}/api/emails/preferences" style="color: #666;">Manage email preferences</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Run the job
sendWeeklyEmails()
  .then(() => {
    console.log('✅ Weekly email job completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Weekly email job failed:', error);
    process.exit(1);
  });


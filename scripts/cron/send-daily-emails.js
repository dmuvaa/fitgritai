/**
 * Daily Email Cron Job
 * Sends daily reminder emails to active users who haven't logged today
 * Run by Render Cron: Every day at 9 AM UTC
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

async function sendDailyEmails() {
  console.log('🚀 Starting daily email job...');
  
  try {
    // Get all users who:
    // 1. Have email preferences enabled for daily reminders (or no preferences set - default ON)
    // 2. Haven't logged weight today
    // 3. Are active (logged in last 30 days)

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

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
      .not('email', 'is', null);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`📊 Found ${users.length} active users`);

    let emailsSent = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;

    for (const user of users) {
      // Check email preferences (default to true if not set)
      const dailyRemindersEnabled = user.email_preferences?.[0]?.daily_reminders ?? true;
      
      if (!dailyRemindersEnabled) {
        emailsSkipped++;
        continue;
      }

      // Check if user has already logged today
      const { data: todayLogs } = await supabase
        .from('weight_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1);

      if (todayLogs && todayLogs.length > 0) {
        // User already logged today, skip
        emailsSkipped++;
        continue;
      }

      // Calculate streak
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

      // Send email
      try {
        const emailHtml = generateDailyReminderEmail(user.name || 'there', streak);
        
        await resend.emails.send({
          from: `${APP_NAME} <${FROM_EMAIL}>`,
          to: user.email,
          subject: streak > 0 ? `Don't break your ${streak}-day streak! 🔥` : `Time to log your progress! 💪`,
          html: emailHtml,
        });

        emailsSent++;
        console.log(`✅ Sent email to ${user.email} (streak: ${streak})`);
      } catch (error) {
        console.error(`❌ Failed to send email to ${user.email}:`, error);
        emailsFailed++;
      }

      // Rate limiting: wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Daily Email Summary:`);
    console.log(`   ✅ Sent: ${emailsSent}`);
    console.log(`   ⏭️  Skipped: ${emailsSkipped}`);
    console.log(`   ❌ Failed: ${emailsFailed}`);
    console.log(`   📧 Total processed: ${users.length}\n`);

    // Log to database for tracking
    await supabase.from('email_logs').insert({
      job_type: 'daily_reminder',
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
      emails_skipped: emailsSkipped,
      total_users: users.length,
    });

  } catch (error) {
    console.error('❌ Fatal error in daily email job:', error);
    process.exit(1);
  }
}

function generateDailyReminderEmail(userName, streak) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .streak { font-size: 48px; font-weight: bold; color: #f5576c; text-align: center; margin: 20px 0; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Time to Log! 🔥</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            ${streak > 0 ? `
              <p>You're on a roll!</p>
              <div class="streak">${streak} Day${streak !== 1 ? 's' : ''}</div>
              <p style="text-align: center; font-size: 18px;">Don't break your streak! 🔥</p>
            ` : `
              <p>Ready to crush your goals today? 💪</p>
            `}
            <p>Quick check-in time:</p>
            <ul>
              <li>✅ Log your weight</li>
              <li>🍽️ Record your meals</li>
              <li>💪 Track your activity</li>
              <li>😊 Check in with your mood</li>
            </ul>
            <div style="text-align: center;">
              <a href="${siteUrl}/dashboard" class="button">Log Now</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 ${APP_NAME}. All rights reserved.</p>
            <p><a href="${siteUrl}/api/emails/unsubscribe?email=${encodeURIComponent(userName)}" style="color: #666;">Unsubscribe from daily reminders</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Run the job
sendDailyEmails()
  .then(() => {
    console.log('✅ Daily email job completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Daily email job failed:', error);
    process.exit(1);
  });


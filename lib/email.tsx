import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = "dennis@fitgritai.com"
const APP_NAME = "FitGrit AI"

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: text || stripHtml(html),
    })

    return { success: true, data }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// Email Templates
export const emailTemplates = {
  welcome: (userName: string) => ({
    subject: `Welcome to ${APP_NAME}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${APP_NAME}!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We're thrilled to have you on board! 🎉</p>
              <p>${APP_NAME} is your AI-powered fitness companion that provides honest, actionable guidance to help you achieve your weight loss goals.</p>
              <p><strong>Here's what you can do:</strong></p>
              <ul>
                <li>📊 Track your weight, meals, activities, and mood</li>
                <li>🧠 Get AI-powered nutrition analysis</li>
                <li>💪 Receive personalized coaching and insights</li>
                <li>📈 Monitor your progress with detailed analytics</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">Go to Dashboard</a>
              <p>Ready to start your transformation? Let's do this! 💪</p>
            </div>
            <div class="footer">
              <p>© 2025 ${APP_NAME}. All rights reserved.</p>
              <p>Questions? Reply to this email: ${FROM_EMAIL}</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome to ${APP_NAME}! We're thrilled to have you on board. Start tracking your progress at ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  }),

  dailyReminder: (userName: string, streak: number) => ({
    subject: `Don't break your ${streak}-day streak! 🔥`,
    html: `
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
              <p>You're on a roll!</p>
              <div class="streak">${streak} Day${streak !== 1 ? "s" : ""}</div>
              <p style="text-align: center; font-size: 18px;">Don't break your streak! 🔥</p>
              <p>Quick check-in time:</p>
              <ul>
                <li>✅ Log your weight</li>
                <li>🍽️ Record your meals</li>
                <li>💪 Track your activity</li>
                <li>😊 Check in with your mood</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">Log Now</a>
            </div>
            <div class="footer">
              <p>© 2025 ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Hi ${userName}, you're on a ${streak}-day streak! Don't break it - log your progress now at ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  }),

  weeklyProgress: (userName: string, stats: any) => ({
    subject: `Your Weekly Progress Report 📊`,
    html: `
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
                  <div class="stat-value">${stats.weightChange > 0 ? "+" : ""}${stats.weightChange}kg</div>
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
              
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">View Full Report</a>
            </div>
            <div class="footer">
              <p>© 2025 ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Your weekly progress: ${stats.weightChange}kg weight change, ${stats.workouts} workouts, ${stats.avgCalories} avg calories. View more at ${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
  }),

  goalAchieved: (userName: string, goalName: string) => ({
    subject: `🎉 Congratulations! You achieved your goal!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 50px; text-align: center; border-radius: 10px 10px 0 0; }
            .trophy { font-size: 80px; margin-bottom: 20px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="trophy">🏆</div>
              <h1>Goal Achieved!</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <h2 style="color: #f5576c; text-align: center;">Congratulations! 🎉</h2>
              <p style="font-size: 18px; text-align: center;">You've achieved your goal: <strong>${goalName}</strong></p>
              <p>This is a huge milestone! Your dedication and hard work have paid off. Take a moment to celebrate this achievement! 🎊</p>
              <p><strong>What's next?</strong></p>
              <ul>
                <li>Set a new goal to keep the momentum going</li>
                <li>Share your success with the community</li>
                <li>Reflect on what worked for you</li>
              </ul>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" class="button">View Dashboard</a>
            </div>
            <div class="footer">
              <p>© 2025 ${APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Congratulations ${userName}! You've achieved your goal: ${goalName}. Keep up the great work!`,
  }),
}

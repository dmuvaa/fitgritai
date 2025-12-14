"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import { Brain, TrendingUp, Award, Lightbulb } from "lucide-react"

interface ProgressInsightsProps {
  userId: string
  profile: any
}

interface InsightData {
  patterns: Array<{
    title: string
    description: string
    confidence: number
    type: "positive" | "neutral" | "negative"
    impact: "high" | "medium" | "low"
  }>
  achievements: Array<{
    title: string
    description: string
    date: string
    category: string
    impact: "high" | "medium" | "low"
  }>
  predictions: Array<{
    title: string
    description: string
    timeframe: string
    confidence: number
  }>
  recommendations: Array<{
    title: string
    description: string
    priority: "high" | "medium" | "low"
    category: string
  }>
}

export function ProgressInsights({ userId, profile }: ProgressInsightsProps) {
  const [insightData, setInsightData] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      if (!isSupabaseConfigured()) {
        // Demo data with AI-like insights
        setInsightData({
          patterns: [
            {
              title: "Consistent Morning Weigh-ins",
              description:
                "You've been weighing yourself consistently in the mornings, which provides more accurate tracking data.",
              confidence: 92,
              type: "positive",
              impact: "high",
            },
            {
              title: "Weekend Calorie Increase",
              description:
                "Your calorie intake tends to increase by 15-20% on weekends. This is normal but worth monitoring.",
              confidence: 78,
              type: "neutral",
              impact: "medium",
            },
            {
              title: "Exercise-Mood Correlation",
              description: "Your mood scores are 40% higher on days when you exercise. Keep up the great work!",
              confidence: 85,
              type: "positive",
              impact: "high",
            },
            {
              title: "Sleep Impact on Energy",
              description:
                "When you sleep less than 7 hours, your energy levels drop by an average of 2 points the next day.",
              confidence: 88,
              type: "negative",
              impact: "medium",
            },
          ],
          achievements: [
            {
              title: "7-Day Logging Streak",
              description: "You've logged your weight for 7 consecutive days!",
              date: "2024-03-10",
              category: "consistency",
              impact: "medium",
            },
            {
              title: "5kg Weight Loss Milestone",
              description: "Congratulations on losing 5kg! You're 43% of the way to your goal.",
              date: "2024-03-08",
              category: "weight_loss",
              impact: "high",
            },
            {
              title: "Workout Frequency Goal",
              description: "You've worked out 4 times this week, meeting your weekly goal!",
              date: "2024-03-07",
              category: "fitness",
              impact: "medium",
            },
            {
              title: "Nutrition Consistency",
              description: "You've logged meals for 10 consecutive days. Great habit building!",
              date: "2024-03-05",
              category: "nutrition",
              impact: "medium",
            },
          ],
          predictions: [
            {
              title: "Goal Achievement Timeline",
              description: "Based on your current progress, you're likely to reach your goal weight in 12-16 weeks.",
              timeframe: "3-4 months",
              confidence: 76,
            },
            {
              title: "Plateau Risk Assessment",
              description:
                "Your weight loss rate may slow down in the next 2-3 weeks. Consider adjusting your approach.",
              timeframe: "2-3 weeks",
              confidence: 68,
            },
            {
              title: "Habit Sustainability",
              description: "Your current logging habits have a 85% chance of being maintained long-term.",
              timeframe: "6+ months",
              confidence: 85,
            },
          ],
          recommendations: [
            {
              title: "Increase Protein Intake",
              description:
                "Your protein intake is below optimal levels. Aim for 1.6g per kg of body weight to preserve muscle mass.",
              priority: "high",
              category: "nutrition",
            },
            {
              title: "Add Strength Training",
              description: "Include 2-3 strength training sessions per week to boost metabolism and preserve muscle.",
              priority: "high",
              category: "fitness",
            },
            {
              title: "Improve Sleep Consistency",
              description:
                "Try to maintain a consistent sleep schedule. Aim for 7-9 hours nightly for optimal recovery.",
              priority: "medium",
              category: "wellness",
            },
            {
              title: "Weekend Meal Planning",
              description: "Plan your weekend meals in advance to maintain better calorie control during leisure time.",
              priority: "medium",
              category: "nutrition",
            },
            {
              title: "Stress Management",
              description:
                "Consider adding meditation or yoga to your routine to manage stress levels more effectively.",
              priority: "low",
              category: "wellness",
            },
          ],
        })
        setLoading(false)
        return
      }

      // In a real app, this would analyze user data to generate insights
      const supabase = createClient()

      try {
        // This would involve complex analysis of user data
        // For now, we'll use the demo data structure
        setInsightData({
          patterns: [],
          achievements: [],
          predictions: [],
          recommendations: [],
        })
      } catch (error) {
        console.error("Error fetching insights:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!insightData) return null

  const getPatternColor = (type: string) => {
    switch (type) {
      case "positive":
        return "border-green-200 bg-green-50"
      case "negative":
        return "border-red-200 bg-red-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Patterns */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Pattern Analysis
          </CardTitle>
          <CardDescription>Insights discovered from your health data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insightData.patterns.map((pattern, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getPatternColor(pattern.type)}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{pattern.title}</h4>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(pattern.impact)}>{pattern.impact} impact</Badge>
                    <Badge variant="outline">{pattern.confidence}% confidence</Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{pattern.description}</p>
                <Progress value={pattern.confidence} className="mt-2 h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Recent Achievements
          </CardTitle>
          <CardDescription>Milestones you've reached on your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insightData.achievements.map((achievement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              >
                <div>
                  <h4 className="font-semibold text-yellow-800">{achievement.title}</h4>
                  <p className="text-sm text-yellow-600">{achievement.description}</p>
                  <p className="text-xs text-yellow-500 mt-1">{new Date(achievement.date).toLocaleDateString()}</p>
                </div>
                <Badge className={getImpactColor(achievement.impact)}>{achievement.impact}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Future Predictions
          </CardTitle>
          <CardDescription>AI-powered forecasts based on your current trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insightData.predictions.map((prediction, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-blue-800">{prediction.title}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-blue-600">
                      {prediction.timeframe}
                    </Badge>
                    <Badge variant="outline">{prediction.confidence}% likely</Badge>
                  </div>
                </div>
                <p className="text-sm text-blue-600">{prediction.description}</p>
                <Progress value={prediction.confidence} className="mt-2 h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-500" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>Action items to optimize your progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insightData.recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-orange-800">{rec.title}</h4>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(rec.priority)}>{rec.priority} priority</Badge>
                    <Badge variant="outline" className="text-orange-600">
                      {rec.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-orange-600">{rec.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

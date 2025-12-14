"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle, Target } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase-utils"

interface WeeklySummaryProps {
  userId: string
  profile?: any
}

export function WeeklySummary({ userId, profile }: WeeklySummaryProps) {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSummary = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!isSupabaseConfigured()) {
        // Mock summary for demo mode
        const mockSummary = {
          overall_grade: 7,
          weight_trend: "down",
          weight_feedback: "Good progress! You're down 0.7kg this week. Keep up the consistent effort.",
          consistency_score: 8,
          consistency_feedback: "Excellent logging consistency. You're building strong habits.",
          coach_message:
            "You're showing real commitment this week. The weight loss is steady and sustainable - exactly what we want to see. Don't get comfortable though, this is just the beginning.",
          next_week_goals: [
            "Log weight every morning before breakfast",
            "Increase daily steps to 10,000",
            "Track all meals, including snacks",
          ],
        }
        setSummary(mockSummary)
        setLoading(false)
        return
      }

      const response = await fetch("/api/weekly-summary", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      // Transform the API response to match our expected format
      const transformedSummary = {
        overall_grade: 7,
        weight_trend: data.stats?.weightChange < 0 ? "down" : data.stats?.weightChange > 0 ? "up" : "stable",
        weight_feedback: `Weight change: ${data.stats?.weightChange?.toFixed(1) || 0}kg this week`,
        consistency_score: Math.min(
          10,
          Math.max(1, (data.stats?.daysLogged?.weight || 0) + (data.stats?.daysLogged?.meals || 0)),
        ),
        consistency_feedback: `You logged data ${data.stats?.daysLogged?.weight || 0} days this week`,
        coach_message: data.summary || "Keep up the great work! Consistency is key to your success.",
        next_week_goals: [
          "Continue daily weight logging",
          "Track all meals consistently",
          "Stay motivated and focused",
        ],
      }

      setSummary(transformedSummary)
    } catch (error) {
      console.error("Error generating summary:", error)
      setError("Failed to generate weekly summary. Please try again.")

      // Fallback to a basic summary
      const fallbackSummary = {
        overall_grade: 6,
        weight_trend: "stable",
        weight_feedback: "Keep tracking your progress to see trends over time.",
        consistency_score: 5,
        consistency_feedback: "Focus on logging your data daily for better insights.",
        coach_message: "Every day is a new opportunity to make progress. Stay consistent and trust the process.",
        next_week_goals: ["Log your weight daily", "Track your meals", "Stay committed to your goals"],
      }
      setSummary(fallbackSummary)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      generateSummary()
    }
  }, [userId])

  if (!summary) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription>Analyzing your progress...</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateSummary} disabled={loading}>
            {loading ? "Generating..." : "Generate Weekly Summary"}
          </Button>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Weekly Summary
          <Badge variant={summary.overall_grade >= 7 ? "default" : "secondary"}>{summary.overall_grade}/10</Badge>
        </CardTitle>
        <CardDescription>Your coach's honest assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weight Progress */}
        <div className="flex items-start gap-3">
          {summary.weight_trend === "down" ? (
            <TrendingDown className="h-5 w-5 text-green-500 mt-0.5" />
          ) : summary.weight_trend === "up" ? (
            <TrendingUp className="h-5 w-5 text-red-500 mt-0.5" />
          ) : (
            <Target className="h-5 w-5 text-yellow-500 mt-0.5" />
          )}
          <div>
            <h4 className="font-medium">Weight Progress</h4>
            <p className="text-sm text-muted-foreground">{summary.weight_feedback}</p>
          </div>
        </div>

        {/* Consistency */}
        <div className="flex items-start gap-3">
          {summary.consistency_score >= 7 ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          )}
          <div>
            <h4 className="font-medium">Consistency</h4>
            <p className="text-sm text-muted-foreground">{summary.consistency_feedback}</p>
          </div>
        </div>

        {/* Coach's Message */}
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
          <h4 className="font-medium text-orange-900 mb-2">Coach's Tough Love</h4>
          <p className="text-sm text-orange-800">{summary.coach_message}</p>
        </div>

        {/* Next Week Goals */}
        <div>
          <h4 className="font-medium mb-2">This Week's Focus</h4>
          <ul className="space-y-1">
            {summary.next_week_goals?.map((goal: string, index: number) => (
              <li key={index} className="text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                {goal}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={generateSummary}
              className="mt-2 bg-transparent"
              disabled={loading}
            >
              {loading ? "Retrying..." : "Try Again"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

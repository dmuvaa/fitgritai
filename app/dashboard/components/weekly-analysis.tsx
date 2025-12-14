"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Apple,
  Heart,
  Target,
  Award,
  AlertCircle,
  Calendar,
  Mail,
  Loader2,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

interface WeeklyAnalysisProps {
  userId?: string
}

export function WeeklyAnalysis({ userId }: WeeklyAnalysisProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week")
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    fetchAnalysisData()
  }, [selectedPeriod, userId])

  const fetchAnalysisData = async () => {
    try {
      setLoading(true)
      setError(null)

      let currentUserId = userId

      if (!currentUserId) {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        currentUserId = user?.id
      }

      if (!currentUserId) {
        setError("User not authenticated")
        setLoading(false)
        return
      }

      const response = await fetch(`/api/analysis/weekly?userId=${currentUserId}&period=${selectedPeriod}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch analysis: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setAnalysisData(data)
    } catch (err) {
      console.error("Analysis fetch error:", err)
      setError(err instanceof Error ? err.message : "Failed to load analysis")

      // Use demo data as fallback
      setAnalysisData({
        weightData: [
          { date: "Mon", weight: 85, target: 75 },
          { date: "Wed", weight: 84.5, target: 75 },
          { date: "Fri", weight: 84, target: 75 },
        ],
        mealData: [
          { day: "Mon", calories: 2200, protein: 120, carbs: 250, fat: 70 },
          { day: "Wed", calories: 2100, protein: 115, carbs: 240, fat: 65 },
          { day: "Fri", calories: 2000, protein: 110, carbs: 230, fat: 60 },
        ],
        workoutData: [
          { type: "Cardio", value: 3 },
          { type: "Strength", value: 2 },
          { type: "Flexibility", value: 1 },
        ],
        moodData: [
          { day: "Mon", mood: "good", energy: "high", motivation: "high" },
          { day: "Wed", mood: "great", energy: "medium", motivation: "high" },
          { day: "Fri", mood: "good", energy: "high", motivation: "medium" },
        ],
        insights: {
          weightTrend: "decreasing",
          nutritionScore: 85,
          workoutConsistency: 75,
          moodStability: 90,
          overallProgress: 83,
        },
        recommendations: [
          "Great progress! You're on track to reach your goals.",
          "Consider adding more protein to support muscle recovery.",
          "Your workout consistency is excellent - keep it up!",
        ],
        achievements: ["🔥 7-day workout streak", "📉 Lost 1kg this week", "💪 Completed all planned workouts"],
        concerns: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestWeeklyAnalysis = async () => {
    try {
      setSendingEmail(true)
      toast.info("Generating your analysis...")

      const response = await fetch("/api/emails/request-weekly-analysis", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to send analysis")
      }

      const data = await response.json()

      if (data.success) {
        toast.success("✅ Weekly analysis sent to your email!")
      } else {
        throw new Error(data.error || "Failed to send email")
      }
    } catch (error: any) {
      console.error("Send analysis error:", error)
      toast.error(error.message || "Failed to send analysis")
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Analysis</CardTitle>
          <CardDescription>Loading your progress data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Analysis</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAnalysisData}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  if (!analysisData) {
    return null
  }

  const { weightData, mealData, workoutData, moodData, insights, recommendations, achievements, concerns } =
    analysisData

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Progress Analysis</h2>
          <p className="text-muted-foreground">Your journey at a glance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === "week" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("week")}
            size="sm"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Week
          </Button>
          <Button
            variant={selectedPeriod === "month" ? "default" : "outline"}
            onClick={() => setSelectedPeriod("month")}
            size="sm"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Month
          </Button>
          <Button onClick={handleRequestWeeklyAnalysis} disabled={sendingEmail} variant="outline" size="sm">
            {sendingEmail ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Email Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Score</span>
              <Badge variant="default" className="text-lg px-4 py-1">
                {insights.overallProgress}%
              </Badge>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Nutrition</span>
                  <span className="text-sm font-medium">{insights.nutritionScore}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${insights.nutritionScore}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Workouts</span>
                  <span className="text-sm font-medium">{insights.workoutConsistency}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${insights.workoutConsistency}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Mood</span>
                  <span className="text-sm font-medium">{insights.moodStability}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${insights.moodStability}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements and Concerns */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {achievements.map((achievement: string, index: number) => (
                <li key={`achievement-${index}`} className="flex items-start gap-2">
                  <span className="text-sm">{achievement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {concerns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {concerns.map((concern: string, index: number) => (
                  <li key={`concern-${index}`} className="flex items-start gap-2">
                    <span className="text-sm">{concern}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Charts */}
      <Tabs defaultValue="weight" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {insights.weightTrend === "decreasing" ? (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                )}
                Weight Progress
              </CardTitle>
              <CardDescription>Your weight trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Nutrition Breakdown
              </CardTitle>
              <CardDescription>Daily calorie and macro intake</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mealData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calories" fill="#8884d8" />
                  <Bar dataKey="protein" fill="#82ca9d" />
                  <Bar dataKey="carbs" fill="#ffc658" />
                  <Bar dataKey="fat" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Workout Distribution
              </CardTitle>
              <CardDescription>Types of workouts completed</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={workoutData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {workoutData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Mood Patterns
              </CardTitle>
              <CardDescription>Your emotional well-being</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moodData.map((day: any, index: number) => (
                  <div
                    key={`mood-${day.day}-${index}`}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <span className="font-medium">{day.day}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">Mood: {day.mood}</Badge>
                      <Badge variant="outline">Energy: {day.energy}</Badge>
                      <Badge variant="outline">Motivation: {day.motivation}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>Based on your recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recommendations.map((rec: string, index: number) => (
              <li key={`recommendation-${index}`} className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">{index + 1}</span>
                </div>
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

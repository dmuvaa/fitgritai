"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Activity, Target, Zap, Clock } from "lucide-react"

interface FitnessDashboardProps {
  userId: string
  profile: any
}

interface FitnessData {
  todaySteps: number
  stepGoal: number
  caloriesBurned: number
  activeMinutes: number
  workoutsThisWeek: number
  recentActivities: Array<{
    workout_type: string
    duration: number
    date: string
    notes?: string
  }>
  weeklyTrends: Array<{
    day: string
    steps: number
    calories: number
    workouts: number
  }>
}

export function FitnessDashboard({ userId, profile }: FitnessDashboardProps) {
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFitnessData() {
      if (!isSupabaseConfigured()) {
        // Demo data
        setFitnessData({
          todaySteps: 8500,
          stepGoal: 10000,
          caloriesBurned: 420,
          activeMinutes: 45,
          workoutsThisWeek: 4,
          recentActivities: [
            { workout_type: "running", duration: 30, date: "2024-03-10", notes: "Morning jog" },
            { workout_type: "strength_training", duration: 45, date: "2024-03-09", notes: "Upper body" },
            { workout_type: "yoga", duration: 60, date: "2024-03-08", notes: "Relaxing session" },
            { workout_type: "cycling", duration: 40, date: "2024-03-07", notes: "Outdoor ride" },
          ],
          weeklyTrends: [
            { day: "Mon", steps: 9200, calories: 380, workouts: 1 },
            { day: "Tue", steps: 10500, calories: 450, workouts: 1 },
            { day: "Wed", steps: 7800, calories: 320, workouts: 0 },
            { day: "Thu", steps: 11200, calories: 480, workouts: 1 },
            { day: "Fri", steps: 9800, calories: 410, workouts: 1 },
            { day: "Sat", steps: 12000, calories: 520, workouts: 1 },
            { day: "Sun", steps: 8500, calories: 420, workouts: 0 },
          ],
        })
        setLoading(false)
        return
      }

      const supabase = createClient()

      try {
        const today = new Date().toISOString().split("T")[0]
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        // Get today's activities
        const { data: todayActivities } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", userId)
          .eq("date", today)

        // Get recent activities
        const { data: recentActivities } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(10)

        // Get this week's workouts
        const { count: workoutsThisWeek } = await supabase
          .from("activity_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("date", weekAgo.toISOString().split("T")[0])

        // Calculate fitness data
        const todaySteps = todayActivities?.reduce((sum, activity) => sum + (activity.steps || 0), 0) || 0
        const activeMinutes = todayActivities?.reduce((sum, activity) => sum + (activity.duration || 0), 0) || 0
        const caloriesBurned = Math.round(activeMinutes * 8) // Rough estimate

        setFitnessData({
          todaySteps,
          stepGoal: 10000,
          caloriesBurned,
          activeMinutes,
          workoutsThisWeek: workoutsThisWeek || 0,
          recentActivities: recentActivities || [],
          weeklyTrends: [
            { day: "Mon", steps: 9200, calories: 380, workouts: 1 },
            { day: "Tue", steps: 10500, calories: 450, workouts: 1 },
            { day: "Wed", steps: 7800, calories: 320, workouts: 0 },
            { day: "Thu", steps: 11200, calories: 480, workouts: 1 },
            { day: "Fri", steps: 9800, calories: 410, workouts: 1 },
            { day: "Sat", steps: 12000, calories: 520, workouts: 1 },
            { day: "Sun", steps: todaySteps, calories: caloriesBurned, workouts: todayActivities?.length || 0 },
          ],
        })
      } catch (error) {
        console.error("Error fetching fitness data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFitnessData()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!fitnessData) return null

  const stepProgress = (fitnessData.todaySteps / fitnessData.stepGoal) * 100

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-xl p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Fitness Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Activity className="h-5 w-5" />
                  Steps Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 mb-2">{fitnessData.todaySteps.toLocaleString()}</div>
                <Progress value={stepProgress} className="mb-2" />
                <p className="text-sm text-blue-600">
                  {fitnessData.stepGoal - fitnessData.todaySteps > 0
                    ? `${(fitnessData.stepGoal - fitnessData.todaySteps).toLocaleString()} steps to goal`
                    : "Goal achieved! 🎉"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Zap className="h-5 w-5" />
                  Calories Burned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900 mb-2">{fitnessData.caloriesBurned}</div>
                <p className="text-sm text-orange-600">calories burned today</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Clock className="h-5 w-5" />
                  Active Minutes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 mb-2">{fitnessData.activeMinutes}</div>
                <p className="text-sm text-green-600">minutes of activity</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Target className="h-5 w-5" />
                  Weekly Workouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 mb-2">{fitnessData.workoutsThisWeek}</div>
                <p className="text-sm text-purple-600">workouts this week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your latest workouts and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fitnessData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{activity.workout_type?.replace("_", " ")}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(activity.date).toLocaleDateString()}
                        {activity.notes && ` • ${activity.notes}`}
                      </div>
                    </div>
                    <Badge variant="secondary">{activity.duration} min</Badge>
                  </div>
                ))}
                {fitnessData.recentActivities.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No activities logged yet. Start tracking your workouts!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
              <CardHeader>
                <CardTitle>Weekly Steps</CardTitle>
                <CardDescription>Your daily step count this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fitnessData.weeklyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="steps" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
              <CardHeader>
                <CardTitle>Calories Burned</CardTitle>
                <CardDescription>Daily calorie burn trend</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fitnessData.weeklyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="calories"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

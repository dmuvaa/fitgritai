"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase-client-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, Target, Calendar, Activity, Heart } from "lucide-react"

interface StatsDashboardProps {
  userId: string
  profile: any
}

export function StatsDashboard({ userId, profile }: StatsDashboardProps) {
  const [stats, setStats] = useState({
    weightLogs: [],
    mealLogs: [],
    activityLogs: [],
    moodLogs: [],
    weeklyStats: {
      logsThisWeek: 0,
      avgMood: 0,
      avgEnergy: 0,
      totalSteps: 0,
    },
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSupabaseConfigured()) {
        // Mock data for demo mode
        const mockStats = {
          weightLogs: [
            { id: "1", weight: 85.0, date: "2024-01-22" },
            { id: "2", weight: 84.2, date: "2024-01-23" },
            { id: "3", weight: 83.8, date: "2024-01-24" },
          ],
          mealLogs: [
            { id: "1", meal_type: "breakfast", description: "Oatmeal with berries", date: "2024-01-24" },
            { id: "2", meal_type: "lunch", description: "Grilled chicken salad", date: "2024-01-24" },
            { id: "3", meal_type: "dinner", description: "Salmon with vegetables", date: "2024-01-24" },
          ],
          activityLogs: [
            { id: "1", steps: 8500, duration: 30, date: "2024-01-24" },
            { id: "2", steps: 7200, duration: 45, date: "2024-01-23" },
          ],
          moodLogs: [
            { id: "1", mood: 4, energy: 4, motivation: 5, date: "2024-01-24" },
            { id: "2", mood: 3, energy: 3, motivation: 4, date: "2024-01-23" },
          ],
          weeklyStats: {
            logsThisWeek: 8,
            avgMood: 3.5,
            avgEnergy: 3.5,
            totalSteps: 15700,
          },
        }
        setStats(mockStats)
        return
      }

      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const weekAgoStr = weekAgo.toISOString().split("T")[0]

      // Fetch recent data
      const [weightLogs, mealLogs, activityLogs, moodLogs] = await Promise.all([
        createClient()
          .from("weight_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", weekAgoStr)
          .order("date", { ascending: false }),
        createClient()
          .from("meal_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", weekAgoStr)
          .order("date", { ascending: false }),
        createClient()
          .from("activity_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", weekAgoStr)
          .order("date", { ascending: false }),
        createClient()
          .from("mood_logs")
          .select("*")
          .eq("user_id", userId)
          .gte("date", weekAgoStr)
          .order("date", { ascending: false }),
      ])

      // Calculate weekly stats
      const logsThisWeek = (weightLogs.data?.length || 0) + (mealLogs.data?.length || 0)
      const avgMood = moodLogs.data?.length
        ? moodLogs.data.reduce((sum, log) => sum + log.mood, 0) / moodLogs.data.length
        : 0
      const avgEnergy = moodLogs.data?.length
        ? moodLogs.data.reduce((sum, log) => sum + log.energy, 0) / moodLogs.data.length
        : 0
      const totalSteps = activityLogs.data?.reduce((sum, log) => sum + (log.steps || 0), 0) || 0

      setStats({
        weightLogs: weightLogs.data || [],
        mealLogs: mealLogs.data || [],
        activityLogs: activityLogs.data || [],
        moodLogs: moodLogs.data || [],
        weeklyStats: {
          logsThisWeek,
          avgMood,
          avgEnergy,
          totalSteps,
        },
      })
    }

    fetchStats()
  }, [userId])

  const currentWeight = stats.weightLogs[0]?.weight || profile.current_weight
  const weightLoss = profile.starting_weight - currentWeight
  const goalProgress =
    ((profile.starting_weight - currentWeight) / (profile.starting_weight - profile.goal_weight)) * 100
  const remainingWeight = currentWeight - profile.goal_weight

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Weight Progress */}
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Weight Progress</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight">{currentWeight.toFixed(1)} kg</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {weightLoss > 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-green-500" />
                <span className="text-green-500">-{weightLoss.toFixed(1)} kg lost</span>
              </>
            ) : (
              <span>No change yet</span>
            )}
          </div>
          <Progress value={Math.max(0, Math.min(100, goalProgress))} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">{remainingWeight.toFixed(1)} kg to goal</p>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight">{stats.weeklyStats.logsThisWeek}</div>
          <p className="text-sm text-gray-600 font-medium">Total logs</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span>Weight logs: {stats.weightLogs.length}</span>
              <span>Meal logs: {stats.mealLogs.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Steps This Week</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight">{stats.weeklyStats.totalSteps.toLocaleString()}</div>
          <p className="text-sm text-gray-600 font-medium">
            Avg: {Math.round(stats.weeklyStats.totalSteps / 7).toLocaleString()}/day
          </p>
        </CardContent>
      </Card>

      {/* Mood & Energy */}
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Mood & Energy</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Mood</span>
              <Badge variant={stats.weeklyStats.avgMood >= 4 ? "default" : "secondary"}>
                {stats.weeklyStats.avgMood.toFixed(1)}/5
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Energy</span>
              <Badge variant={stats.weeklyStats.avgEnergy >= 4 ? "default" : "secondary"}>
                {stats.weeklyStats.avgEnergy.toFixed(1)}/5
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Counter */}
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Target className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight">3</div>
          <p className="text-sm text-gray-600 font-medium">Days logging consistently</p>
          <div className="mt-2">
            <Badge variant="outline">Keep it up! 🔥</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs">
            {stats.weightLogs.slice(0, 3).map((log, index) => (
              <div key={log.id} className="flex justify-between">
                <span>Weight: {log.weight}kg</span>
                <span className="text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
              </div>
            ))}
            {stats.mealLogs.slice(0, 2).map((log, index) => (
              <div key={log.id} className="flex justify-between">
                <span>
                  {log.meal_type}: {log.description.slice(0, 20)}...
                </span>
                <span className="text-muted-foreground">{new Date(log.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

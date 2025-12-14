"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { Heart, Brain, Moon, Thermometer } from "lucide-react"

interface HealthDashboardProps {
  userId: string
  profile: any
}

interface HealthData {
  todayMood: number
  todayEnergy: number
  todayMotivation: number
  sleepHours: number
  stressLevel: number
  healthScore: number
  wellnessRadar: Array<{
    metric: string
    value: number
    fullMark: 5
  }>
  weeklyWellness: Array<{
    day: string
    mood: number
    energy: number
    stress: number
  }>
  recentMoods: Array<{
    mood: number
    energy: number
    motivation: number
    date: string
    notes?: string
  }>
}

export function HealthDashboard({ userId, profile }: HealthDashboardProps) {
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHealthData() {
      if (!isSupabaseConfigured()) {
        // Demo data
        setHealthData({
          todayMood: 4,
          todayEnergy: 3,
          todayMotivation: 4,
          sleepHours: 7.5,
          stressLevel: 2,
          healthScore: 78,
          wellnessRadar: [
            { metric: "Mood", value: 4, fullMark: 5 },
            { metric: "Energy", value: 3, fullMark: 5 },
            { metric: "Sleep", value: 4, fullMark: 5 },
            { metric: "Stress", value: 2, fullMark: 5 },
            { metric: "Motivation", value: 4, fullMark: 5 },
            { metric: "Hydration", value: 3, fullMark: 5 },
          ],
          weeklyWellness: [
            { day: "Mon", mood: 3, energy: 4, stress: 3 },
            { day: "Tue", mood: 4, energy: 3, stress: 2 },
            { day: "Wed", mood: 3, energy: 2, stress: 4 },
            { day: "Thu", mood: 4, energy: 4, stress: 2 },
            { day: "Fri", mood: 5, energy: 4, stress: 1 },
            { day: "Sat", mood: 4, energy: 3, stress: 2 },
            { day: "Sun", mood: 4, energy: 3, stress: 2 },
          ],
          recentMoods: [
            { mood: 4, energy: 3, motivation: 4, date: "2024-03-10", notes: "Feeling good today" },
            { mood: 3, energy: 2, motivation: 3, date: "2024-03-09", notes: "Tired from work" },
            { mood: 4, energy: 4, motivation: 5, date: "2024-03-08", notes: "Great workout!" },
            { mood: 3, energy: 3, motivation: 3, date: "2024-03-07", notes: "Average day" },
          ],
        })
        setLoading(false)
        return
      }

      const supabase = createClient()

      try {
        const today = new Date().toISOString().split("T")[0]

        // Get today's mood log
        const { data: todayMood } = await supabase
          .from("mood_logs")
          .select("*")
          .eq("user_id", userId)
          .eq("date", today)
          .single()

        // Get recent mood logs
        const { data: recentMoods } = await supabase
          .from("mood_logs")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(10)

        const mood = todayMood?.mood || 3
        const energy = todayMood?.energy || 3
        const motivation = todayMood?.motivation || 3

        // Calculate health score (simplified)
        const healthScore = Math.round(((mood + energy + motivation) / 15) * 100)

        setHealthData({
          todayMood: mood,
          todayEnergy: energy,
          todayMotivation: motivation,
          sleepHours: 7.5,
          stressLevel: 5 - mood, // Inverse relationship
          healthScore,
          wellnessRadar: [
            { metric: "Mood", value: mood, fullMark: 5 },
            { metric: "Energy", value: energy, fullMark: 5 },
            { metric: "Sleep", value: 4, fullMark: 5 },
            { metric: "Stress", value: 5 - mood, fullMark: 5 },
            { metric: "Motivation", value: motivation, fullMark: 5 },
            { metric: "Hydration", value: 3, fullMark: 5 },
          ],
          weeklyWellness: [
            { day: "Mon", mood: 3, energy: 4, stress: 3 },
            { day: "Tue", mood: 4, energy: 3, stress: 2 },
            { day: "Wed", mood: 3, energy: 2, stress: 4 },
            { day: "Thu", mood: 4, energy: 4, stress: 2 },
            { day: "Fri", mood: 5, energy: 4, stress: 1 },
            { day: "Sat", mood: 4, energy: 3, stress: 2 },
            { day: "Sun", mood: mood, energy: energy, stress: 5 - mood },
          ],
          recentMoods: recentMoods || [],
        })
      } catch (error) {
        console.error("Error fetching health data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHealthData()
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

  if (!healthData) return null

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return "text-green-600"
    if (mood >= 3) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Heart className="h-5 w-5" />
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${getHealthScoreColor(healthData.healthScore)}`}>
              {healthData.healthScore}
            </div>
            <Progress value={healthData.healthScore} className="mb-2" />
            <p className="text-sm text-pink-600">Overall wellness rating</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Brain className="h-5 w-5" />
              Mood Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${getMoodColor(healthData.todayMood)}`}>
              {healthData.todayMood}/5
            </div>
            <p className="text-sm text-blue-600">
              {healthData.todayMood >= 4
                ? "Feeling great!"
                : healthData.todayMood >= 3
                  ? "Doing okay"
                  : "Needs attention"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Moon className="h-5 w-5" />
              Sleep
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900 mb-2">{healthData.sleepHours}h</div>
            <p className="text-sm text-yellow-600">{healthData.sleepHours >= 7 ? "Good sleep!" : "Need more rest"}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Thermometer className="h-5 w-5" />
              Stress Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900 mb-2">{healthData.stressLevel}/5</div>
            <p className="text-sm text-red-600">
              {healthData.stressLevel <= 2 ? "Low stress" : healthData.stressLevel <= 3 ? "Moderate" : "High stress"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wellness Radar & Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle>Wellness Overview</CardTitle>
            <CardDescription>Your overall health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={healthData.wellnessRadar}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} />
                  <Radar
                    name="Wellness"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle>Weekly Wellness Trends</CardTitle>
            <CardDescription>Your mood and energy patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthData.weeklyWellness}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[1, 5]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} name="Mood" />
                  <Line type="monotone" dataKey="energy" stroke="#3b82f6" strokeWidth={2} name="Energy" />
                  <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} name="Stress" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Mood Logs */}
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
        <CardHeader>
          <CardTitle>Recent Mood Logs</CardTitle>
          <CardDescription>Your latest wellness check-ins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthData.recentMoods.map((entry, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex gap-4 mb-1">
                    <Badge variant="outline">Mood: {entry.mood}/5</Badge>
                    <Badge variant="outline">Energy: {entry.energy}/5</Badge>
                    <Badge variant="outline">Motivation: {entry.motivation}/5</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(entry.date).toLocaleDateString()}
                    {entry.notes && ` • ${entry.notes}`}
                  </div>
                </div>
              </div>
            ))}
            {healthData.recentMoods.length === 0 && (
              <div className="text-center text-gray-500 py-8">No mood logs yet. Start tracking your wellness!</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

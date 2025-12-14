"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { TrendingDown, TrendingUp, Target, Calendar } from "lucide-react"

interface WeightProgressProps {
  userId: string
  profile: any
}

interface WeightEntry {
  date: string
  weight: number
  notes?: string
}

export function WeightProgress({ userId, profile }: WeightProgressProps) {
  const [weightData, setWeightData] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeightData() {
      if (!isSupabaseConfigured()) {
        // Demo data
        const demoData = [
          { date: "2024-01-01", weight: 85.0 },
          { date: "2024-01-08", weight: 84.2 },
          { date: "2024-01-15", weight: 83.5 },
          { date: "2024-01-22", weight: 82.8 },
          { date: "2024-01-29", weight: 82.1 },
          { date: "2024-02-05", weight: 81.4 },
          { date: "2024-02-12", weight: 80.7 },
          { date: "2024-02-19", weight: 80.0 },
          { date: "2024-02-26", weight: 79.3 },
          { date: "2024-03-05", weight: 78.5 },
        ]
        setWeightData(demoData)
        setLoading(false)
        return
      }

      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from("weight_logs")
          .select("weight, date, notes")
          .eq("user_id", userId)
          .order("date", { ascending: true })
          .limit(50)

        if (error) throw error

        setWeightData(data || [])
      } catch (error) {
        console.error("Error fetching weight data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeightData()
  }, [userId])

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  const currentWeight = weightData[weightData.length - 1]?.weight || profile.current_weight
  const startWeight = weightData[0]?.weight || profile.starting_weight
  const weightLost = startWeight - currentWeight
  const remainingWeight = currentWeight - profile.goal_weight

  const getTrend = () => {
    if (weightData.length < 2) return "stable"
    const recent = weightData.slice(-5)
    const trend = recent[recent.length - 1].weight - recent[0].weight
    if (trend < -0.5) return "losing"
    if (trend > 0.5) return "gaining"
    return "stable"
  }

  const trend = getTrend()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart */}
      <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Weight Progress
          </CardTitle>
          <CardDescription>Your weight journey over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#666" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} stroke="#666" />
                <Tooltip
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value: number) => [`${value}kg`, "Weight"]}
                />
                <ReferenceLine
                  y={profile.goal_weight}
                  stroke="#10b981"
                  strokeDasharray="5 5"
                  label={{ value: "Goal", position: "right" }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary & Recent Entries */}
      <div className="space-y-6">
        {/* Progress Summary */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/50">
          <CardHeader>
            <CardTitle className="text-lg">Progress Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Weight</span>
              <span className="font-bold text-lg">{currentWeight}kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Weight Lost</span>
              <span className="font-bold text-lg text-green-600">
                {weightLost > 0 ? `-${weightLost.toFixed(1)}kg` : `+${Math.abs(weightLost).toFixed(1)}kg`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Remaining</span>
              <span className="font-bold text-lg text-orange-600">{remainingWeight.toFixed(1)}kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trend</span>
              <Badge
                variant={trend === "losing" ? "default" : trend === "gaining" ? "destructive" : "secondary"}
                className="flex items-center gap-1"
              >
                {trend === "losing" && <TrendingDown className="h-3 w-3" />}
                {trend === "gaining" && <TrendingUp className="h-3 w-3" />}
                {trend === "stable" && <Calendar className="h-3 w-3" />}
                {trend.charAt(0).toUpperCase() + trend.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="text-lg">Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weightData
                .slice(-5)
                .reverse()
                .map((entry, index) => (
                  <div
                    key={entry.date}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <div className="font-medium">{entry.weight}kg</div>
                      <div className="text-xs text-gray-500">{formatDate(entry.date)}</div>
                    </div>
                    {entry.notes && <div className="text-xs text-gray-600 max-w-24 truncate">{entry.notes}</div>}
                  </div>
                ))}
              {weightData.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No weight entries yet. Start logging to see your progress!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

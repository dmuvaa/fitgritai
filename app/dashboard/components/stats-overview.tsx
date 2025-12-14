"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Target, TrendingUp, TrendingDown, Activity, Heart, Calendar, Zap, Award } from "lucide-react"

interface StatsOverviewProps {
  userId?: string
  profile?: any
}

interface Stats {
  currentWeight: number
  goalWeight: number
  weightLost: number
  progressPercentage: number
  bmi: number
  bmr: number
  tdee: number
  weeklyWeightChange: number
  currentStreak: number
  totalLogs: number
  weeklyLogs: number
}

export function StatsOverview({ userId, profile }: StatsOverviewProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        const response = await fetch("/api/stats/overview")

        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchStats()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load stats</p>
      </div>
    )
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi === 0) return { status: "Not calculated", color: "text-gray-600" }
    if (bmi < 18.5) return { status: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { status: "Normal", color: "text-green-600" }
    if (bmi < 30) return { status: "Overweight", color: "text-orange-600" }
    return { status: "Obese", color: "text-red-600" }
  }

  const bmiStatus = getBMIStatus(stats.bmi)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Current Weight */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Current Weight</CardTitle>
          <Scale className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {stats.currentWeight > 0 ? `${stats.currentWeight}kg` : "No data"}
          </div>
          {stats.weightLost !== 0 && (
            <p className="text-xs text-blue-600 mt-1">
              {stats.weightLost > 0 ? `-${stats.weightLost}kg` : `+${Math.abs(stats.weightLost)}kg`} from start
            </p>
          )}
        </CardContent>
      </Card>

      {/* Weight Lost */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Weight Lost</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {stats.weightLost > 0 ? `${stats.weightLost}kg` : "0kg"}
          </div>
        </CardContent>
      </Card>

      {/* Goal Weight */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">Goal Weight</CardTitle>
          <Target className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">
            {stats.goalWeight > 0 ? `${stats.goalWeight}kg` : "Not set"}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Progress</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{stats.progressPercentage}%</div>
        </CardContent>
      </Card>

      {/* Weekly Change */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">Weekly Change</CardTitle>
          {stats.weeklyWeightChange < 0 ? (
            <TrendingDown className="h-4 w-4 text-orange-600" />
          ) : (
            <TrendingUp className="h-4 w-4 text-orange-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">
            {stats.weeklyWeightChange !== 0
              ? `${stats.weeklyWeightChange > 0 ? "+" : ""}${stats.weeklyWeightChange}kg`
              : "N/A"}
          </div>
          {stats.weeklyWeightChange !== 0 && (
            <p className="text-xs text-orange-600 mt-1">
              {stats.weeklyWeightChange < 0 ? "Great progress!" : "Keep pushing!"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Current Streak</CardTitle>
          <Award className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{stats.currentStreak}</div>
          <p className="text-xs text-purple-600 mt-1">days logging</p>
        </CardContent>
      </Card>

      {/* BMI */}
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-indigo-700">BMI</CardTitle>
          <Heart className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-900">{stats.bmi > 0 ? stats.bmi : "N/A"}</div>
          <p className={`text-xs mt-1 ${bmiStatus.color}`}>{bmiStatus.status}</p>
        </CardContent>
      </Card>

      {/* BMR */}
      <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-teal-700">BMR</CardTitle>
          <Zap className="h-4 w-4 text-teal-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-teal-900">{stats.bmr > 0 ? stats.bmr : "N/A"}</div>
          <p className="text-xs text-teal-600 mt-1">{stats.bmr > 0 ? "cal/day at rest" : "Complete profile"}</p>
        </CardContent>
      </Card>

      {/* TDEE */}
      <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-rose-700">TDEE</CardTitle>
          <Activity className="h-4 w-4 text-rose-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-900">{stats.tdee > 0 ? stats.tdee : "N/A"}</div>
          <p className="text-xs text-rose-600 mt-1">{stats.tdee > 0 ? "total daily energy" : "Complete profile"}</p>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-700">Weekly Logs</CardTitle>
          <Calendar className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-900">{stats.weeklyLogs}</div>
          <p className="text-xs text-amber-600 mt-1">{stats.totalLogs} total entries</p>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, Calendar, Activity, Heart, Flame, Scale, Utensils, Award, TrendingUp } from "lucide-react"

interface ComprehensiveStatsProps {
  userId: string
  profile: any
}

export function ComprehensiveStats({ userId, profile }: ComprehensiveStatsProps) {
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
      totalCalories: 0,
      workoutDays: 0,
      avgSleep: 0,
    },
    streaks: {
      currentWeightStreak: 0,
      currentMealStreak: 0,
      longestStreak: 0,
    },
    achievements: [],
  })

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSupabaseConfigured()) {
        // Enhanced mock data for demo mode
        const mockStats = {
          weightLogs: [
            { id: "1", weight: 85.0, date: "2024-01-22", body_fat: 18.5 },
            { id: "2", weight: 84.2, date: "2024-01-23", body_fat: 18.2 },
            { id: "3", weight: 83.8, date: "2024-01-24", body_fat: 18.0 },
          ],
          mealLogs: [
            { id: "1", meal_type: "breakfast", description: "Oatmeal with berries", calories: 350, date: "2024-01-24" },
            { id: "2", meal_type: "lunch", description: "Grilled chicken salad", calories: 450, date: "2024-01-24" },
            { id: "3", meal_type: "dinner", description: "Salmon with vegetables", calories: 520, date: "2024-01-24" },
            { id: "4", meal_type: "snack", description: "Greek yogurt", calories: 120, date: "2024-01-24" },
          ],
          activityLogs: [
            { id: "1", steps: 8500, duration: 30, workout_type: "Running", calories_burned: 300, date: "2024-01-24" },
            {
              id: "2",
              steps: 7200,
              duration: 45,
              workout_type: "Strength Training",
              calories_burned: 250,
              date: "2024-01-23",
            },
          ],
          moodLogs: [
            { id: "1", mood: 4, energy: 4, motivation: 5, sleep_hours: 7.5, date: "2024-01-24" },
            { id: "2", mood: 3, energy: 3, motivation: 4, sleep_hours: 6.8, date: "2024-01-23" },
          ],
          weeklyStats: {
            logsThisWeek: 12,
            avgMood: 3.5,
            avgEnergy: 3.5,
            totalSteps: 15700,
            totalCalories: 1440,
            workoutDays: 4,
            avgSleep: 7.2,
          },
          streaks: {
            currentWeightStreak: 5,
            currentMealStreak: 3,
            longestStreak: 12,
          },
          achievements: [
            { id: 1, name: "First Week", description: "Completed your first week!", earned: true },
            { id: 2, name: "Consistent Logger", description: "Logged for 5 days straight", earned: true },
            { id: 3, name: "Weight Loss Warrior", description: "Lost 2kg", earned: true },
          ],
        }
        setStats(mockStats)
        return
      }

      // Real Supabase implementation would go here
      setStats({
        weightLogs: [],
        mealLogs: [],
        activityLogs: [],
        moodLogs: [],
        weeklyStats: {
          logsThisWeek: 0,
          avgMood: 0,
          avgEnergy: 0,
          totalSteps: 0,
          totalCalories: 0,
          workoutDays: 0,
          avgSleep: 0,
        },
        streaks: {
          currentWeightStreak: 0,
          currentMealStreak: 0,
          longestStreak: 0,
        },
        achievements: [],
      })
    }

    fetchStats()
  }, [userId])

  const currentWeight = stats.weightLogs[0]?.weight || profile.current_weight
  const weightLoss = profile.starting_weight - currentWeight
  const goalProgress =
    ((profile.starting_weight - currentWeight) / (profile.starting_weight - profile.goal_weight)) * 100
  const remainingWeight = currentWeight - profile.goal_weight
  const bmi = currentWeight / (profile.height / 100) ** 2

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Weight Progress - Enhanced */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-orange-900">Weight Progress</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Scale className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight text-orange-900">{currentWeight.toFixed(1)} kg</div>
          <div className="flex items-center space-x-2 text-xs text-orange-700 mt-1">
            {weightLoss > 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">-{weightLoss.toFixed(1)} kg lost</span>
              </>
            ) : (
              <span>No change yet</span>
            )}
          </div>
          <Progress value={Math.max(0, Math.min(100, goalProgress))} className="mt-3 h-2" />
          <div className="flex justify-between text-xs text-orange-700 mt-2">
            <span>{remainingWeight.toFixed(1)} kg to goal</span>
            <span>BMI: {bmi.toFixed(1)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Summary */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-green-900">Today's Nutrition</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <Utensils className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight text-green-900">{stats.weeklyStats.totalCalories}</div>
          <p className="text-sm text-green-700 font-medium">Calories consumed</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs text-green-700">
              <span>Protein: 120g</span>
              <span>Carbs: 180g</span>
            </div>
            <div className="flex justify-between text-xs text-green-700">
              <span>Fat: 65g</span>
              <span>Fiber: 28g</span>
            </div>
          </div>
          <Badge variant="outline" className="mt-2 text-green-700 border-green-300">
            {stats.mealLogs.length} meals logged
          </Badge>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-blue-900">Activity Today</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight text-blue-900">
            {stats.weeklyStats.totalSteps.toLocaleString()}
          </div>
          <p className="text-sm text-blue-700 font-medium">Steps taken</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs text-blue-700">
              <span>Calories burned: 550</span>
              <span>Active time: 45min</span>
            </div>
            <Progress value={75} className="h-2" />
            <span className="text-xs text-blue-700">75% of daily goal</span>
          </div>
        </CardContent>
      </Card>

      {/* Wellness Score */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-purple-900">Wellness Score</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight text-purple-900">8.2/10</div>
          <p className="text-sm text-purple-700 font-medium">Overall wellness</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs text-purple-700">
              <span>Mood: {stats.weeklyStats.avgMood.toFixed(1)}/5</span>
              <span>Energy: {stats.weeklyStats.avgEnergy.toFixed(1)}/5</span>
            </div>
            <div className="flex justify-between text-xs text-purple-700">
              <span>Sleep: {stats.weeklyStats.avgSleep.toFixed(1)}h</span>
              <span>Stress: Low</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streaks & Achievements */}
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-yellow-900">Current Streak</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
            <Flame className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight text-yellow-900">{stats.streaks.currentWeightStreak}</div>
          <p className="text-sm text-yellow-700 font-medium">Days logging consistently</p>
          <div className="mt-3">
            <Badge variant="outline" className="text-yellow-700 border-yellow-300 mr-2">
              🔥 {stats.streaks.longestStreak} day record
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-indigo-900">This Week</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight text-indigo-900">{stats.weeklyStats.logsThisWeek}</div>
          <p className="text-sm text-indigo-700 font-medium">Total logs</p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-indigo-700">
              <span>Workouts: {stats.weeklyStats.workoutDays}</span>
              <span>Avg sleep: {stats.weeklyStats.avgSleep}h</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-pink-900">Achievements</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Award className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight text-pink-900">{stats.achievements.length}</div>
          <p className="text-sm text-pink-700 font-medium">Badges earned</p>
          <div className="mt-3 space-y-1">
            {stats.achievements.slice(0, 2).map((achievement) => (
              <Badge key={achievement.id} variant="outline" className="text-pink-700 border-pink-300 text-xs">
                🏆 {achievement.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metabolic Rate */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-red-900">Metabolic Rate</CardTitle>
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight text-red-900">1,850</div>
          <p className="text-sm text-red-700 font-medium">BMR (calories/day)</p>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-red-700">
              <span>TDEE: 2,420 cal</span>
              <span>Deficit: -570 cal</span>
            </div>
            <Progress value={65} className="h-2 mt-2" />
            <span className="text-xs text-red-700">Optimal deficit range</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

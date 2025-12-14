"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, Calendar, Dumbbell, Apple, Footprints, Edit, Loader2 } from "lucide-react"

interface Goals {
  id?: string
  target_weight?: number
  target_date?: string
  weekly_workout_goal?: number
  daily_calorie_goal?: number
  daily_protein_goal?: number
  daily_steps_goal?: number
  notes?: string
}

interface CurrentStats {
  current_weight: number
  weekly_workouts: number
  avg_daily_calories: number
  avg_daily_protein: number
  avg_daily_steps: number
}

interface GoalsViewProps {
  goals?: Goals[]
  profile: any
  onEdit?: () => void
}

export function GoalsView({ goals: _unused, profile, onEdit }: GoalsViewProps) {
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<Goals | null>(null)
  const [currentStats, setCurrentStats] = useState<CurrentStats | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [goalsResponse, statsResponse] = await Promise.all([fetch("/api/goals"), fetch("/api/current-stats")])

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json()
        setGoals(goalsData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setCurrentStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (!goals) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Set Yet</h3>
          <p className="text-gray-600 mb-4">Set your fitness goals to track your progress</p>
          {onEdit && (
            <Button onClick={onEdit}>
              <Target className="h-4 w-4 mr-2" />
              Set Your Goals
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500"
    if (percentage >= 75) return "bg-blue-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 100) return { label: "Goal Achieved!", color: "bg-green-100 text-green-800" }
    if (percentage >= 75) return { label: "Almost There!", color: "bg-blue-100 text-blue-800" }
    if (percentage >= 50) return { label: "On Track", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Needs Focus", color: "bg-red-100 text-red-800" }
  }

  const calculateWeightProgress = () => {
    if (!goals.target_weight || !currentStats?.current_weight || !profile?.starting_weight) return 0
    const totalToLose = profile.starting_weight - goals.target_weight
    const currentLoss = profile.starting_weight - currentStats.current_weight
    return Math.min(Math.max((currentLoss / totalToLose) * 100, 0), 100)
  }

  const weightProgress = calculateWeightProgress()
  const workoutProgress = goals.weekly_workout_goal
    ? Math.min(((currentStats?.weekly_workouts || 0) / goals.weekly_workout_goal) * 100, 100)
    : 0
  const calorieProgress = goals.daily_calorie_goal
    ? Math.min(((currentStats?.avg_daily_calories || 0) / goals.daily_calorie_goal) * 100, 100)
    : 0
  const proteinProgress = goals.daily_protein_goal
    ? Math.min(((currentStats?.avg_daily_protein || 0) / goals.daily_protein_goal) * 100, 100)
    : 0
  const stepsProgress = goals.daily_steps_goal
    ? Math.min(((currentStats?.avg_daily_steps || 0) / goals.daily_steps_goal) * 100, 100)
    : 0

  const daysUntilTarget = goals.target_date
    ? Math.ceil((new Date(goals.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const weightRemaining =
    currentStats && goals.target_weight ? Math.max(currentStats.current_weight - goals.target_weight, 0) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Your Goals Progress</h2>
          <p className="text-gray-600">Track how close you are to achieving your targets</p>
        </div>
        {onEdit && (
          <Button onClick={onEdit} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Goals
          </Button>
        )}
      </div>

      {/* Target Date Card */}
      {goals.target_date && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Target Date</p>
                <p className="text-2xl font-bold text-gray-900">{new Date(goals.target_date).toLocaleDateString()}</p>
              </div>
            </div>
            {daysUntilTarget !== null && (
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600">{Math.abs(daysUntilTarget)}</p>
                <p className="text-sm text-gray-600">{daysUntilTarget >= 0 ? "days remaining" : "days overdue"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weight Goal */}
      {goals.target_weight && currentStats && profile?.starting_weight && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Weight Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-sm text-gray-600">Starting</p>
                <p className="text-2xl font-bold">{profile.starting_weight} kg</p>
              </div>
              <TrendingUp className="h-6 w-6 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-600">Current</p>
                <p className="text-2xl font-bold text-blue-600">{currentStats.current_weight} kg</p>
              </div>
              <TrendingUp className="h-6 w-6 text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-gray-600">Target</p>
                <p className="text-2xl font-bold text-green-600">{goals.target_weight} kg</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <Badge className={getProgressStatus(weightProgress).color}>
                  {getProgressStatus(weightProgress).label}
                </Badge>
              </div>
              <Progress value={weightProgress} className="h-3" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-600">
                  {(profile.starting_weight - currentStats.current_weight).toFixed(1)} kg lost
                </span>
                <span className="text-xs font-semibold text-blue-600">{weightProgress.toFixed(1)}%</span>
                <span className="text-xs text-gray-600">{weightRemaining.toFixed(1)} kg to go</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity and Nutrition Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Workouts */}
        {goals.weekly_workout_goal && currentStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-purple-500" />
                Weekly Workouts
              </CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-purple-600">{currentStats.weekly_workouts}</p>
                  <p className="text-sm text-gray-600">Current</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">{goals.weekly_workout_goal}</p>
                  <p className="text-sm text-gray-600">Target</p>
                </div>
              </div>
              <div>
                <Progress value={workoutProgress} className="h-2" />
                <div className="flex justify-between items-center mt-2">
                  <Badge className={getProgressStatus(workoutProgress).color}>
                    {getProgressStatus(workoutProgress).label}
                  </Badge>
                  <p className="text-xs font-semibold">{workoutProgress.toFixed(0)}%</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {currentStats.weekly_workouts >= goals.weekly_workout_goal
                  ? "🎉 Goal achieved this week!"
                  : `${goals.weekly_workout_goal - currentStats.weekly_workouts} more workouts needed`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Daily Steps */}
        {goals.daily_steps_goal && currentStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Footprints className="h-5 w-5 text-green-500" />
                Daily Steps
              </CardTitle>
              <CardDescription>7-day average</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-green-600">{currentStats.avg_daily_steps.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Current Avg</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">{goals.daily_steps_goal.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Target</p>
                </div>
              </div>
              <div>
                <Progress value={stepsProgress} className="h-2" />
                <div className="flex justify-between items-center mt-2">
                  <Badge className={getProgressStatus(stepsProgress).color}>
                    {getProgressStatus(stepsProgress).label}
                  </Badge>
                  <p className="text-xs font-semibold">{stepsProgress.toFixed(0)}%</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {currentStats.avg_daily_steps >= goals.daily_steps_goal
                  ? "🚶 Crushing your step goal!"
                  : `${(goals.daily_steps_goal - currentStats.avg_daily_steps).toLocaleString()} more steps needed on average`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Daily Calories */}
        {goals.daily_calorie_goal && currentStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-orange-500" />
                Daily Calories
              </CardTitle>
              <CardDescription>7-day average</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-orange-600">{currentStats.avg_daily_calories}</p>
                  <p className="text-sm text-gray-600">Current Avg</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">{goals.daily_calorie_goal}</p>
                  <p className="text-sm text-gray-600">Target</p>
                </div>
              </div>
              <div>
                <Progress value={calorieProgress} className="h-2" />
                <div className="flex justify-between items-center mt-2">
                  <Badge className={getProgressStatus(calorieProgress).color}>
                    {getProgressStatus(calorieProgress).label}
                  </Badge>
                  <p className="text-xs font-semibold">{calorieProgress.toFixed(0)}%</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {Math.abs(currentStats.avg_daily_calories - goals.daily_calorie_goal)} cal{" "}
                {currentStats.avg_daily_calories > goals.daily_calorie_goal ? "over" : "under"} target
              </p>
            </CardContent>
          </Card>
        )}

        {/* Daily Protein */}
        {goals.daily_protein_goal && currentStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-red-500" />
                Daily Protein
              </CardTitle>
              <CardDescription>7-day average</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-red-600">{currentStats.avg_daily_protein}g</p>
                  <p className="text-sm text-gray-600">Current Avg</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">{goals.daily_protein_goal}g</p>
                  <p className="text-sm text-gray-600">Target</p>
                </div>
              </div>
              <div>
                <Progress value={proteinProgress} className="h-2" />
                <div className="flex justify-between items-center mt-2">
                  <Badge className={getProgressStatus(proteinProgress).color}>
                    {getProgressStatus(proteinProgress).label}
                  </Badge>
                  <p className="text-xs font-semibold">{proteinProgress.toFixed(0)}%</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {currentStats.avg_daily_protein >= goals.daily_protein_goal
                  ? "💪 Hitting your protein target!"
                  : `${goals.daily_protein_goal - currentStats.avg_daily_protein}g more protein needed on average`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Personal Notes */}
      {goals.notes && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg">Your Motivation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 italic">&ldquo;{goals.notes}&rdquo;</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

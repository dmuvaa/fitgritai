"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Flame, Beef, Wheat, Droplet, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface TodaysNutritionProps {
  userId: string
  profile?: any
}

export function TodaysNutrition({ userId, profile }: TodaysNutritionProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    caloriesGoal: 0,
    proteinGoal: 0,
    carbsGoal: 0,
    fatGoal: 0,
  })
  const [loading, setLoading] = useState(true)
  const [goalsLoading, setGoalsLoading] = useState(true)

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const formatDisplayDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (formatDate(date) === formatDate(today)) {
      return "Today"
    } else if (formatDate(date) === formatDate(yesterday)) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }
  }

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    const today = new Date()
    if (formatDate(newDate) <= formatDate(today)) {
      setSelectedDate(newDate)
    }
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const isToday = formatDate(selectedDate) === formatDate(new Date())

  // Fetch user goals
  useEffect(() => {
    const fetchGoals = async () => {
      setGoalsLoading(true)
      try {
        const response = await fetch("/api/user/goals")
        if (response.ok) {
          const data = await response.json()
          setNutrition((prev) => ({
            ...prev,
            caloriesGoal: data.daily_calorie_goal || 2000,
            proteinGoal: data.daily_protein_goal || 150,
            carbsGoal: data.daily_carbs_target || 200,
            fatGoal: data.daily_fat_target || 65,
          }))
        }
      } catch (error) {
        console.error("Error fetching goals:", error)
      } finally {
        setGoalsLoading(false)
      }
    }

    if (userId) {
      fetchGoals()
    }
  }, [userId])

  // Fetch daily nutrition
  useEffect(() => {
    const fetchNutrition = async () => {
      setLoading(true)
      try {
        const dateStr = formatDate(selectedDate)
        const response = await fetch(`/api/nutrition/daily?date=${dateStr}`)

        if (response.ok) {
          const data = await response.json()
          setNutrition((prev) => ({
            ...prev,
            calories: data.calories || 0,
            protein: data.protein || 0,
            carbs: data.carbs || 0,
            fat: data.fat || 0,
          }))
        }
      } catch (error) {
        console.error("Error fetching nutrition:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchNutrition()
    }
  }, [userId, selectedDate])

  const nutrients = [
    {
      name: "Calories",
      value: nutrition.calories,
      goal: nutrition.caloriesGoal,
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500",
      unit: "kcal",
    },
    {
      name: "Protein",
      value: nutrition.protein,
      goal: nutrition.proteinGoal,
      icon: Beef,
      color: "text-red-500",
      bgColor: "bg-red-500",
      unit: "g",
    },
    {
      name: "Carbs",
      value: nutrition.carbs,
      goal: nutrition.carbsGoal,
      icon: Wheat,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
      unit: "g",
    },
    {
      name: "Fat",
      value: nutrition.fat,
      goal: nutrition.fatGoal,
      icon: Droplet,
      color: "text-blue-500",
      bgColor: "bg-blue-500",
      unit: "g",
    },
  ]

  // Prepare chart data
  const chartData = nutrients.map((nutrient) => ({
    name: nutrient.name,
    Intake: nutrient.value,
    Goal: nutrient.goal,
  }))

  if (goalsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading nutrition targets...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Nutrition Overview</CardTitle>
            <CardDescription>Track your daily macros</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant={isToday ? "default" : "outline"} size="sm" onClick={goToToday} className="min-w-[120px]">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDisplayDate(selectedDate)}
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextDay} disabled={isToday}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Side - Macros Progress */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">Daily Progress</h3>
            {nutrients.map((nutrient) => {
              const Icon = nutrient.icon
              const percentage = nutrient.goal > 0 ? Math.min(100, (nutrient.value / nutrient.goal) * 100) : 0

              return (
                <div key={nutrient.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${nutrient.color}`} />
                      <span className="text-sm font-medium">{nutrient.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {nutrient.value} / {nutrient.goal} {nutrient.unit}
                    </span>
                  </div>
                  <Progress value={percentage} className={`h-2`} />
                  <div className="text-xs text-muted-foreground text-right">{Math.round(percentage)}%</div>
                </div>
              )
            })}
          </div>

          {/* Right Side - Chart */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">Intake vs Goal</h3>
            <ChartContainer
              config={{
                Intake: {
                  label: "Intake",
                  color: "hsl(var(--chart-1))",
                },
                Goal: {
                  label: "Goal",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[280px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="Intake" fill="var(--color-Intake)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Goal" fill="var(--color-Goal)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

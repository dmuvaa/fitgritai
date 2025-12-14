"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Zap, Apple, Edit, Brain, Calendar, TrendingUp, Loader2 } from "lucide-react"

interface NutritionAnalysisProps {
  userId: string
  profile: any
}

interface FoodItem {
  id?: string
  name: string
  quantity?: number
  unit?: string
}

interface MealLog {
  id: string
  user_id: string
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  description: string
  meal_time?: string
  foods?: string[] | string | FoodItem[]
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  date: string
  created_at: string
}

interface EditMealData {
  id: string
  meal_type: string
  description: string
  meal_time: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export function NutritionAnalysis({ userId, profile }: NutritionAnalysisProps) {
  const [mealLogs, setMealLogs] = useState<MealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string>("")
  const [editingMeal, setEditingMeal] = useState<EditMealData | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Fetch meal logs for the past 7 days
  useEffect(() => {
    fetchMealLogs()
  }, [userId])

  const fetchMealLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/logs/meals")
      if (response.ok) {
        const logs = await response.json()
        // Filter for past 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const recentLogs = logs
          .filter((log: MealLog) => new Date(log.date) >= sevenDaysAgo)
          .sort((a: MealLog, b: MealLog) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setMealLogs(recentLogs)
      }
    } catch (error) {
      console.error("Failed to fetch meal logs:", error)
    } finally {
      setLoading(false)
    }
  }

  // Group meals by date
  const mealsByDate = mealLogs.reduce(
    (acc, meal) => {
      const date = meal.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(meal)
      return acc
    },
    {} as Record<string, MealLog[]>,
  )

  // Calculate daily totals
  const calculateDailyTotals = (meals: MealLog[]) => {
    return meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.calories || 0),
        protein: totals.protein + (meal.protein || 0),
        carbs: totals.carbs + (meal.carbs || 0),
        fat: totals.fat + (meal.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    )
  }

  // Calculate weekly averages
  const weeklyTotals = Object.values(mealsByDate).map((dayMeals) => calculateDailyTotals(dayMeals))
  const weeklyAverages =
    weeklyTotals.length > 0
      ? {
          calories: Math.round(weeklyTotals.reduce((sum, day) => sum + day.calories, 0) / weeklyTotals.length),
          protein: Math.round(weeklyTotals.reduce((sum, day) => sum + day.protein, 0) / weeklyTotals.length),
          carbs: Math.round(weeklyTotals.reduce((sum, day) => sum + day.carbs, 0) / weeklyTotals.length),
          fat: Math.round(weeklyTotals.reduce((sum, day) => sum + day.fat, 0) / weeklyTotals.length),
        }
      : { calories: 0, protein: 0, carbs: 0, fat: 0 }

  // Goals (these could come from user profile in the future)
  const goals = {
    calories: 2000,
    protein: 140,
    carbs: 200,
    fat: 70,
  }

  // Helper function to safely parse foods and convert to display strings
  const parseFoodsForDisplay = (foods: string[] | string | FoodItem[] | undefined): string[] => {
    if (!foods) return []

    // If it's already an array of strings
    if (Array.isArray(foods)) {
      return foods.map((food) => {
        if (typeof food === "string") {
          return food
        }
        // If it's a food object, format it nicely
        if (typeof food === "object" && food.name) {
          const quantity = food.quantity ? ` (${food.quantity}${food.unit || ""})` : ""
          return `${food.name}${quantity}`
        }
        return String(food)
      })
    }

    // If it's a string, try to parse it
    if (typeof foods === "string") {
      try {
        const parsed = JSON.parse(foods)
        if (Array.isArray(parsed)) {
          return parsed.map((food) => {
            if (typeof food === "string") {
              return food
            }
            if (typeof food === "object" && food.name) {
              const quantity = food.quantity ? ` (${food.quantity}${food.unit || ""})` : ""
              return `${food.name}${quantity}`
            }
            return String(food)
          })
        }
        return [String(parsed)]
      } catch {
        return [foods]
      }
    }

    return []
  }

  const handleAnalyzeMeals = async () => {
    if (mealLogs.length === 0) return

    setAnalyzing(true)
    try {
      // Prepare comprehensive data for AI analysis
      const analysisData = {
        userId,
        profile,
        mealLogs,
        weeklyAverages,
        goals,
        mealsByDate,
        totalDays: Object.keys(mealsByDate).length,
        totalMeals: mealLogs.length,
      }

      const response = await fetch("/api/analyze-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisData),
      })

      if (response.ok) {
        const analysis = await response.json()
        setAiAnalysis(analysis.analysis)
      } else {
        setAiAnalysis("Sorry, I couldn't analyze your meals right now. Please try again later.")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      setAiAnalysis("An error occurred while analyzing your meals. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleEditMeal = (meal: MealLog) => {
    setEditingMeal({
      id: meal.id,
      meal_type: meal.meal_type,
      description: meal.description,
      meal_time: meal.meal_time || "",
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateMeal = async () => {
    if (!editingMeal) return

    try {
      const response = await fetch(`/api/logs/meals/${editingMeal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingMeal),
      })

      if (response.ok) {
        await fetchMealLogs() // Refresh the data
        setEditDialogOpen(false)
        setEditingMeal(null)
      }
    } catch (error) {
      console.error("Failed to update meal:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    }
  }

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "lunch":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "dinner":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "snack":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading nutrition data...</span>
      </div>
    )
  }

  if (mealLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Apple className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Meals Logged Yet</h3>
        <p className="text-gray-600 mb-6">Start logging your meals to see detailed nutrition analysis and insights.</p>
        <Button onClick={() => window.location.reload()}>
          <Zap className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Nutrition Analysis</h2>
        <p className="text-gray-600">Past 7 days meal history and insights</p>
      </div>

      {/* Weekly Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-orange-900">Avg Daily Calories</CardTitle>
            <Zap className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{weeklyAverages.calories}</div>
            <p className="text-sm text-orange-700">of {goals.calories} goal</p>
            <Progress value={(weeklyAverages.calories / goals.calories) * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-red-900">Avg Daily Protein</CardTitle>
            <Target className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{weeklyAverages.protein}g</div>
            <p className="text-sm text-red-700">of {goals.protein}g goal</p>
            <Progress value={(weeklyAverages.protein / goals.protein) * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-blue-900">Total Meals</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{mealLogs.length}</div>
            <p className="text-sm text-blue-700">in {Object.keys(mealsByDate).length} days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-green-900">Consistency</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {Math.round((Object.keys(mealsByDate).length / 7) * 100)}%
            </div>
            <p className="text-sm text-green-700">days with meals logged</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Section */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Nutrition Analysis
          </CardTitle>
          <CardDescription>Get personalized insights based on your meal history, goals, and progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleAnalyzeMeals}
            disabled={analyzing}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Your Meals...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze My Nutrition
              </>
            )}
          </Button>

          {aiAnalysis && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
              <h4 className="font-semibold mb-2 text-purple-900">Your Personalized Analysis:</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{aiAnalysis}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meal History by Date */}
      <Card>
        <CardHeader>
          <CardTitle>Meal History - Past 7 Days</CardTitle>
          <CardDescription>Review and edit your logged meals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(mealsByDate)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, meals]) => {
              const dailyTotals = calculateDailyTotals(meals)
              return (
                <div key={date} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{formatDate(date)}</h3>
                    <div className="text-sm text-gray-600">
                      {dailyTotals.calories} cal • {dailyTotals.protein}g protein
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {meals.map((meal) => {
                      const foodsArray = parseFoodsForDisplay(meal.foods)
                      return (
                        <div key={meal.id} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getMealTypeColor(meal.meal_type)}>
                                  {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                                </Badge>
                                {meal.meal_time && <span className="text-sm text-gray-500">{meal.meal_time}</span>}
                              </div>

                              <p className="text-sm text-gray-900 mb-2">{meal.description}</p>

                              {foodsArray.length > 0 && (
                                <div className="mb-2">
                                  <div className="flex flex-wrap gap-1">
                                    {foodsArray.map((food, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {food}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-4 text-xs text-gray-600">
                                {meal.calories && <span>{meal.calories} cal</span>}
                                {meal.protein && <span>{meal.protein}g protein</span>}
                                {meal.carbs && <span>{meal.carbs}g carbs</span>}
                                {meal.fat && <span>{meal.fat}g fat</span>}
                              </div>
                            </div>

                            <Button variant="ghost" size="sm" onClick={() => handleEditMeal(meal)} className="ml-2">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </CardContent>
      </Card>

      {/* Edit Meal Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Meal</DialogTitle>
            <DialogDescription>Update the details of your logged meal for better accuracy.</DialogDescription>
          </DialogHeader>

          {editingMeal && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meal_type" className="text-right">
                  Type
                </Label>
                <Select
                  value={editingMeal.meal_type}
                  onValueChange={(value) => setEditingMeal({ ...editingMeal, meal_type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meal_time" className="text-right">
                  Time
                </Label>
                <Input
                  id="meal_time"
                  type="time"
                  value={editingMeal.meal_time}
                  onChange={(e) => setEditingMeal({ ...editingMeal, meal_time: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editingMeal.description}
                  onChange={(e) => setEditingMeal({ ...editingMeal, description: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={editingMeal.calories}
                    onChange={(e) => setEditingMeal({ ...editingMeal, calories: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={editingMeal.protein}
                    onChange={(e) => setEditingMeal({ ...editingMeal, protein: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={editingMeal.carbs}
                    onChange={(e) => setEditingMeal({ ...editingMeal, carbs: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={editingMeal.fat}
                    onChange={(e) => setEditingMeal({ ...editingMeal, fat: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateMeal}>Update Meal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

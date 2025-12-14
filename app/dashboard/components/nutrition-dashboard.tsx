"use client"
import { NutritionAnalysis } from "./nutrition-analysis"

interface NutritionDashboardProps {
  userId: string
  profile: any
}

interface NutritionData {
  totalCalories: number
  targetCalories: number
  mealsToday: number
  weeklyAverage: number
  macros: {
    protein: number
    carbs: number
    fats: number
  }
  recentMeals: Array<{
    meal_type: string
    description: string
    calories: number
    date: string
  }>
  weeklyTrends: Array<{
    day: string
    calories: number
    meals: number
  }>
}

export function NutritionDashboard({ userId, profile }: NutritionDashboardProps) {
  return <NutritionAnalysis userId={userId} profile={profile} />
}

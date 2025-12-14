import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase-utils"

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    // Fetch all meals for the specified date
    const { data: meals, error: mealsError } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)

    if (mealsError) {
      console.error("Meals fetch error:", mealsError)
      return NextResponse.json({ error: "Failed to fetch meals" }, { status: 500 })
    }

    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      meals_logged: meals?.length || 0,
    }

    if (meals && meals.length > 0) {
      meals.forEach((meal) => {
        totals.calories += Number(meal.calories) || 0
        totals.protein += Number(meal.protein) || 0
        totals.carbs += Number(meal.carbs) || 0
        totals.fat += Number(meal.fat) || 0
        totals.fiber += Number(meal.fiber) || 0
        totals.sugar += Number(meal.sugar) || 0
        totals.sodium += Number(meal.sodium) || 0
      })
    }

    // Round all values to 1 decimal place
    const result = {
      date,
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      sugar: Math.round(totals.sugar * 10) / 10,
      sodium: Math.round(totals.sodium),
      meals_logged: totals.meals_logged,
      meals_breakdown: meals?.map((meal) => ({
        id: meal.id,
        meal_type: meal.meal_type,
        description: meal.description,
        meal_time: meal.meal_time,
        calories: Number(meal.calories) || 0,
        protein: Number(meal.protein) || 0,
        carbs: Number(meal.carbs) || 0,
        fat: Number(meal.fat) || 0,
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Daily nutrition API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase-utils"

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const workoutType = searchParams.get("workout_type")

    if (!workoutType) {
      return NextResponse.json({ error: "workout_type parameter is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: categories, error } = await supabase
      .from("exercise_categories")
      .select("*")
      .eq("workout_type", workoutType)
      .order("name")

    if (error) {
      console.error("Exercise categories fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch exercise categories" }, { status: 500 })
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Exercise categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Simple query to test database connection - use user_fitness_profile instead of user_profiles
    const { data, error } = await supabase.from("user_fitness_profile").select("count").limit(1)

    if (error) {
      console.error("Database health check failed:", error)
      return NextResponse.json(
        { status: "error", message: "Database connection failed", error: error.message },
        { status: 503 },
      )
    }

    return NextResponse.json({
      status: "healthy",
      message: "Database connection successful",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json({ status: "error", message: "Service unavailable" }, { status: 503 })
  }
}

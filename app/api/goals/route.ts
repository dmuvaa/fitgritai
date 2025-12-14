import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export const dynamic = "force-dynamic"

/**
 * GET /api/goals
 * Fetch user's goals (without throwing error if not found)
 */
export async function GET(request: NextRequest) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    // Verify current user (works in both paths)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = authData.user.id

    // Use maybeSingle() instead of single() to handle missing goals gracefully
    const { data: goals, error: goalsError } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

    if (goalsError) {
      console.error("Error fetching goals:", goalsError)
      return NextResponse.json({ error: goalsError.message }, { status: 500 })
    }

    // Return null if no goals exist instead of throwing error
    return NextResponse.json({ goals: goals ?? null }, { status: 200 })
  } catch (e: any) {
    console.error("GET /api/goals failed:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/goals
 * Create or update user goals
 */
export async function POST(request: Request) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    // Verify current user (works in both paths)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = authData.user.id
    const body = await request.json()

    // Check if goals already exist
    const { data: existing } = await supabase
      .from("user_goals")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (existing) {
      // Update existing goals
      const { data: updated, error: updateError } = await supabase
        .from("user_goals")
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating goals:", updateError)
        return NextResponse.json({ error: "Failed to update goals" }, { status: 500 })
      }

      return NextResponse.json({ goals: updated })
    } else {
      // Insert new goals
      const { data: inserted, error: insertError } = await supabase
        .from("user_goals")
        .insert({
          user_id: userId,
          ...body,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error creating goals:", insertError)
        return NextResponse.json({ error: "Failed to create goals" }, { status: 500 })
      }

      return NextResponse.json({ goals: inserted })
    }
  } catch (e: any) {
    console.error("POST /api/goals failed:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

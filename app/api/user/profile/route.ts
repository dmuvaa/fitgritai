import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"
import { isSupabaseConfigured } from "@/lib/supabase-utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = authData.user

    // Try to get the profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    // If no profile exists, create a basic one
    if (!profile) {
      console.log("Creating new profile for user:", user.id)

      const { data: newProfile, error: createError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          created_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle()

      if (createError) {
        console.error("Profile creation error:", createError)
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
      }

      return NextResponse.json(newProfile)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = authData.user
    const body = await request.json()
    const { name, height, goal_weight, activity_level, dietary_preferences, date_of_birth, gender, fitness_goal } = body

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Only include fields that are provided
    if (name !== undefined) updateData.name = name
    if (height !== undefined) updateData.height = Number.parseFloat(height)
    if (goal_weight !== undefined) updateData.goal_weight = Number.parseFloat(goal_weight)
    if (activity_level !== undefined) updateData.activity_level = activity_level
    if (dietary_preferences !== undefined) updateData.dietary_preferences = dietary_preferences
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth
    if (gender !== undefined) updateData.gender = gender
    if (fitness_goal !== undefined) updateData.fitness_goal = fitness_goal

    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .maybeSingle()

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Profile update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

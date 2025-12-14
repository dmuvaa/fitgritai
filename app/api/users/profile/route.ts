/**
 * User Profile API
 * Creates and updates user profile information
 */

import { NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export async function POST(request: Request) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    // Verify current user (works in both paths)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData.user) {
      console.log('❌ Authentication failed:', authError?.message || 'No user')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = authData.user

    const body = await request.json()
    const {
      name,
      height,
      starting_weight,
      current_weight,
      goal_weight,
      date_of_birth,
      gender,
      activity_level,
      fitness_goal,
    } = body

    // Validate required fields
    if (!name || !height || !current_weight || !goal_weight || !date_of_birth || !gender || !activity_level || !fitness_goal) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create user profile (matching web version schema)
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email,
        name,
        height,
        starting_weight,
        current_weight,
        goal_weight,
        date_of_birth,
        gender,
        activity_level,
        fitness_goal,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return NextResponse.json(
        { error: "Failed to create profile" },
        { status: 500 }
      )
    }

    // Create initial weight log
    const { error: weightLogError } = await supabase
      .from("weight_logs")
      .insert({
        user_id: user.id,
        weight: current_weight,
        date: new Date().toISOString().split("T")[0],
        notes: "Starting weight",
      })

    if (weightLogError) {
      console.error("Weight log creation error:", weightLogError)
      // Don't fail the request for this
    }

    return NextResponse.json({
      success: true,
      profile,
      message: "Profile created successfully",
    })
  } catch (error) {
    console.error("Error in POST /api/users/profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    // Verify current user (works in both paths)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authData.user) {
      console.log('❌ Authentication failed:', authError?.message || 'No user')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = authData.user
    console.log('🔍 Fetching profile for user:', user.id, user.email)
    
    const { data: profiles, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)

    console.log('🔍 Profile query result:', {
      profilesCount: profiles?.length || 0,
      hasError: !!profileError,
      error: profileError?.message,
      firstProfile: profiles?.[0] || null,
    })

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      )
    }

    // Return the first profile if exists, null if none
    const profile = profiles && profiles.length > 0 ? profiles[0] : null

    console.log('📤 Returning profile:', { hasProfile: !!profile, profileEmail: profile?.email })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error in GET /api/users/profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

import { NextResponse, type NextRequest } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseForRequest(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const days = Number.parseInt(searchParams.get("days") || "30")

    if (id) {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (error) {
        console.error("Error fetching single activity log:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json(data)
    }

    // Calculate date range
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateString = startDate.toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDateString)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching activity logs:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET /api/logs/activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseForRequest(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Match the actual schema from your export
    const { workout_type, description, duration, workout_time, exercises, steps, notes, date } = body

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }

    // Prepare data matching the actual database schema
    const insertData = {
      user_id: user.id,
      workout_type: workout_type || null,
      description: description || null,
      duration: duration || null,
      workout_time: workout_time || null,
      exercises: exercises || null, // This should be a JSON string
      steps: steps || null,
      notes: notes || null,
      date,
    }

    console.log("Inserting activity log:", insertData)

    const { data, error } = await supabase.from("activity_logs").insert(insertData).select().single()

    if (error) {
      console.error("Error inserting activity log:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/logs/activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseForRequest(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const body = await request.json()

    // Match the actual schema
    const { workout_type, description, duration, workout_time, exercises, steps, notes, date } = body

    const updateData: any = {}
    if (workout_type !== undefined) updateData.workout_type = workout_type
    if (description !== undefined) updateData.description = description
    if (duration !== undefined) updateData.duration = duration
    if (workout_time !== undefined) updateData.workout_time = workout_time
    if (exercises !== undefined) updateData.exercises = exercises
    if (steps !== undefined) updateData.steps = steps
    if (notes !== undefined) updateData.notes = notes
    if (date !== undefined) updateData.date = date

    console.log("Updating activity log:", id, updateData)

    const { data, error } = await supabase
      .from("activity_logs")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating activity log:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/logs/activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseForRequest(request)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    console.log("Deleting activity log:", id)

    const { error } = await supabase.from("activity_logs").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting activity log:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/logs/activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

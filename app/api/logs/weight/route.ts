import { NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export async function GET(request: Request) {
  try {
    // Get Supabase client (handles both mobile Bearer token and web cookies)
    const supabase = await getSupabaseForRequest(request)

    // Verify current user (works in both paths)
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = authData.user.id

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      // Get single weight log
      const { data: weightLog, error: fetchError } = await supabase
        .from("weight_logs")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single()

      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 400 })
      }

      return NextResponse.json(weightLog)
    } else {
      // Get all weight logs for user
      const { data: weights, error: weightsError } = await supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })

      if (weightsError) {
        return NextResponse.json({ error: weightsError.message }, { status: 400 })
      }

      return NextResponse.json(weights ?? [])
    }
  } catch (e: any) {
    console.error("GET /api/logs/weight failed:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const { weight, date, notes } = body

    if (!weight || !date) {
      return NextResponse.json({ error: "Weight and date are required" }, { status: 400 })
    }

    const { data: inserted, error: insertError } = await supabase
      .from("weight_logs")
      .insert({
        user_id: userId,
        weight,
        date: date ?? new Date().toISOString().slice(0, 10),
        notes: notes ?? null,
      })
      .select()

    if (insertError) {
      console.error("Insert weight log error:", insertError)
      return NextResponse.json({ error: "Failed to create weight log" }, { status: 500 })
    }

    return NextResponse.json(inserted?.[0] ?? null, { status: 201 })
  } catch (e: any) {
    console.error("POST /api/logs/weight failed:", e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
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
    const { weight, date, notes } = body

    const updateData: any = {}
    if (weight !== undefined) updateData.weight = weight
    if (date !== undefined) updateData.date = date
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from("weight_logs")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/logs/weight:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
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

    const { error } = await supabase.from("weight_logs").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/logs/weight:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

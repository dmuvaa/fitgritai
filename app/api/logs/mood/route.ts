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

    if (id) {
      const { data, error } = await supabase.from("mood_logs").select("*").eq("id", id).eq("user_id", user.id).single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json(data)
    } else {
      const { data, error } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Error in GET /api/logs/mood:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function normalizeScore(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined
  const num = Number(value)
  if (!Number.isFinite(num)) return undefined
  if (num < 1) return 1
  if (num > 10) return 10
  return num
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

    const mood = normalizeScore(body.mood)
    const energy = normalizeScore(body.energy_level ?? body.energy)
    const motivation = normalizeScore(body.motivation_level ?? body.motivation)
    const date = body.date
    const notes = body.notes ?? null

    if (mood === undefined || date === undefined) {
      return NextResponse.json({ error: "Mood and date are required" }, { status: 400 })
    }

    if (energy === undefined || motivation === undefined) {
      return NextResponse.json({ error: "Energy and motivation are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("mood_logs")
      .insert({
        user_id: user.id,
        mood,
        energy_level: energy,
        motivation_level: motivation,
        date,
        notes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/logs/mood:", error)
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
    const mood = normalizeScore(body.mood)
    const date = body.date
    const energy = normalizeScore(body.energy_level ?? body.energy)
    const motivation = normalizeScore(body.motivation_level ?? body.motivation)
    const notes = body.notes ?? null

    const updateData: any = {}
    if (mood !== undefined) updateData.mood = mood
    if (energy !== undefined) updateData.energy_level = energy
    if (motivation !== undefined) updateData.motivation_level = motivation
    if (date !== undefined) updateData.date = date
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from("mood_logs")
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
    console.error("Error in PUT /api/logs/mood:", error)
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

    const { error } = await supabase.from("mood_logs").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/logs/mood:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

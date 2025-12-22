// app/api/logs/all/meals/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"
// (Optional) simple CORS helper – inline to avoid extra files
const withCORS = (res: NextResponse) => {
  res.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*")
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  res.headers.set("Access-Control-Max-Age", "86400")
  return res
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

// Helpers
function toNumberOrNull(v: unknown) {
  if (v === null || v === undefined || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
function toIntOrNull(v: unknown) {
  if (v === null || v === undefined || v === "") return null
  const n = parseInt(String(v), 10)
  return Number.isFinite(n) ? n : null
}
function toArrayOfStrings(v: unknown): string[] | null {
  if (v === null || v === undefined) return null
  if (Array.isArray(v)) return v.map(String)
  if (typeof v === "string") return [v]
  return null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseForRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return withCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") // exact date (YYYY-MM-DD)
    const from = searchParams.get("from") // inclusive YYYY-MM-DD
    const to = searchParams.get("to")     // inclusive YYYY-MM-DD

    let query = supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })

    if (date) {
      query = query.eq("date", date)
    } else {
      if (from) query = query.gte("date", from)
      if (to) query = query.lte("date", to)
    }

    const { data, error } = await query
    if (error) {
      console.error("Fetch meal logs error:", error)
      return withCORS(NextResponse.json({ error: error.message }, { status: 500 }))
    }

    return withCORS(NextResponse.json(data || []))
  } catch (error: any) {
    console.error("Meal logs GET error:", error)
    return withCORS(NextResponse.json({ error: error.message || "Server error" }, { status: 500 }))
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
      return withCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
    }

    const body = await request.json()

    // --- Required fields ---
    const meal_type = String(body.meal_type || "").trim().toLowerCase()
    const description = String(body.description || "").trim()

    if (!meal_type || !description) {
      return withCORS(
        NextResponse.json({ error: "meal_type and description are required" }, { status: 400 })
      )
    }

    // --- Optional / normalized fields ---
    // Dates: prefer client-provided date (YYYY-MM-DD), else today (UTC)
    const date =
      (typeof body.date === "string" && body.date.match(/^\d{4}-\d{2}-\d{2}$/))
        ? body.date
        : new Date().toISOString().split("T")[0]

    // Time as HH:MM (optional)
    let meal_time: string | null = null
    if (typeof body.meal_time === "string" && body.meal_time.trim()) {
      // very light normalization (accept "9:5" -> "09:05")
      const parts = body.meal_time.trim().split(":")
      if (parts.length >= 2) {
        const hh = parts[0].padStart(2, "0").slice(0, 2)
        const mm = parts[1].padStart(2, "0").slice(0, 2)
        meal_time = `${hh}:${mm}`
      }
    }

    // foods: store as text/JSON depending on your column type. If your column
    // is TEXT, stringify when it's an array/object. If it's JSONB, pass the object.
    // From your sample row, it looks TEXT-ish, so we mirror that safely:
    let foods: string | null = null
    if (body.foods !== undefined && body.foods !== null) {
      try {
        if (typeof body.foods === "string") {
          // accept already-stringified payload
          foods = body.foods
        } else {
          foods = JSON.stringify(body.foods)
        }
      } catch {
        // ignore bad foods shape
      }
    }

    const calories = toNumberOrNull(body.calories)
    const protein = toNumberOrNull(body.protein)
    const carbs = toNumberOrNull(body.carbs)
    const fat = toNumberOrNull(body.fat)
    const fiber = toNumberOrNull(body.fiber)
    const sugar = toNumberOrNull(body.sugar)
    const sodium = toNumberOrNull(body.sodium)
    const confidence = toIntOrNull(body.confidence)

    const ai_suggestions = toArrayOfStrings(body.ai_suggestions)
    const ai_reasoning = typeof body.ai_reasoning === "string" ? body.ai_reasoning : null

    // Build insert payload (only columns that exist)
    const mealData: any = {
      user_id: user.id,         // server-controlled for RLS safety
      meal_type,
      description,
      date,
    }
    if (meal_time) mealData.meal_time = meal_time
    if (foods !== null) mealData.foods = foods

    if (calories !== null) mealData.calories = calories
    if (protein !== null) mealData.protein = protein
    if (carbs !== null) mealData.carbs = carbs
    if (fat !== null) mealData.fat = fat
    if (fiber !== null) mealData.fiber = fiber
    if (sugar !== null) mealData.sugar = sugar
    if (sodium !== null) mealData.sodium = sodium
    if (confidence !== null) mealData.confidence = confidence

    if (ai_suggestions) mealData.ai_suggestions = ai_suggestions
    if (ai_reasoning) mealData.ai_reasoning = ai_reasoning

    const { data, error } = await supabase.from("meal_logs").insert([mealData]).select().single()
    if (error) {
      console.error("Insert meal log error:", error)
      // RLS failures often come back as 42501 insufficient_privilege
      return withCORS(NextResponse.json({ error: error.message, details: error }, { status: 500 }))
    }

    return withCORS(NextResponse.json(data))
  } catch (error: any) {
    console.error("Meal logs POST error:", error)
    return withCORS(NextResponse.json({ error: error.message || "Server error" }, { status: 500 }))
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
      return withCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return withCORS(NextResponse.json({ error: "ID is required" }, { status: 400 }))
    }

    const body = await request.json()

    // Build update payload with only provided fields
    const updateData: any = {}

    if (body.meal_type !== undefined) updateData.meal_type = String(body.meal_type).trim().toLowerCase()
    if (body.description !== undefined) updateData.description = String(body.description).trim()
    if (body.date !== undefined) updateData.date = body.date
    if (body.meal_time !== undefined) {
      // Normalize time format
      const parts = String(body.meal_time).trim().split(":")
      if (parts.length >= 2) {
        const hh = parts[0].padStart(2, "0").slice(0, 2)
        const mm = parts[1].padStart(2, "0").slice(0, 2)
        updateData.meal_time = `${hh}:${mm}`
      }
    }
    if (body.foods !== undefined) {
      updateData.foods = typeof body.foods === "string" ? body.foods : JSON.stringify(body.foods)
    }
    if (body.calories !== undefined) updateData.calories = toNumberOrNull(body.calories)
    if (body.protein !== undefined) updateData.protein = toNumberOrNull(body.protein)
    if (body.carbs !== undefined) updateData.carbs = toNumberOrNull(body.carbs)
    if (body.fat !== undefined) updateData.fat = toNumberOrNull(body.fat)
    if (body.fiber !== undefined) updateData.fiber = toNumberOrNull(body.fiber)
    if (body.sugar !== undefined) updateData.sugar = toNumberOrNull(body.sugar)
    if (body.sodium !== undefined) updateData.sodium = toNumberOrNull(body.sodium)

    const { data, error } = await supabase
      .from("meal_logs")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Update meal log error:", error)
      return withCORS(NextResponse.json({ error: error.message }, { status: 400 }))
    }

    return withCORS(NextResponse.json(data))
  } catch (error: any) {
    console.error("Meal logs PUT error:", error)
    return withCORS(NextResponse.json({ error: error.message || "Server error" }, { status: 500 }))
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
      return withCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return withCORS(NextResponse.json({ error: "ID is required" }, { status: 400 }))
    }

    const { error } = await supabase
      .from("meal_logs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Delete meal log error:", error)
      return withCORS(NextResponse.json({ error: error.message }, { status: 400 }))
    }

    return withCORS(NextResponse.json({ success: true }))
  } catch (error: any) {
    console.error("Meal logs DELETE error:", error)
    return withCORS(NextResponse.json({ error: error.message || "Server error" }, { status: 500 }))
  }
}

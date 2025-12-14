import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { meal_type, description, meal_time, calories, protein, carbs, fat, fiber, sugar, sodium } = body

    // Update the meal log (only if it belongs to the current user)
    const { data, error } = await supabase
      .from("meal_logs")
      .update({
        meal_type,
        description,
        meal_time,
        calories: calories ? Number.parseInt(calories) : null,
        protein: protein ? Number.parseFloat(protein) : null,
        carbs: carbs ? Number.parseFloat(carbs) : null,
        fat: fat ? Number.parseFloat(fat) : null,
        fiber: fiber ? Number.parseFloat(fiber) : null,
        sugar: sugar ? Number.parseFloat(sugar) : null,
        sodium: sodium ? Number.parseFloat(sodium) : null,
      })
      .eq("id", params.id)
      .eq("user_id", user.id) // Ensure user can only edit their own meals
      .select()
      .single()

    if (error) {
      console.error("Error updating meal:", error)
      return NextResponse.json({ error: "Failed to update meal" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Meal not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Update meal error:", error)
    return NextResponse.json({ error: "Failed to update meal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Deleting meal log:", params.id, "for user:", user.id)

    // Delete the meal log (only if it belongs to the current user)
    const { data, error } = await supabase
      .from("meal_logs")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id) // Ensure user can only delete their own meals
      .select()

    if (error) {
      console.error("Error deleting meal:", error)
      return NextResponse.json({ error: error.message || "Failed to delete meal" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.error("Meal not found or user unauthorized")
      return NextResponse.json({ error: "Meal not found or unauthorized" }, { status: 404 })
    }

    console.log("Successfully deleted meal:", data)
    return NextResponse.json({ success: true, deleted: data[0] })
  } catch (error) {
    console.error("Delete meal error:", error)
    return NextResponse.json({ error: "Failed to delete meal" }, { status: 500 })
  }
}

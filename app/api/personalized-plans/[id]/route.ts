import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseForRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    console.log("[SERVER] Deleting plan:", id)

    // Delete the plan
    const { error: deleteError } = await supabase
      .from("personalized_plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("[SERVER] Delete plan error:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    console.log("[SERVER] Plan deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[SERVER] Delete plan API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseForRequest(request)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    console.log("[SERVER] Updating plan:", id, body)

    // Verify the plan belongs to the user before updating
    const { data: existingPlan, error: fetchError } = await supabase
      .from("personalized_plans")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !existingPlan) {
      return NextResponse.json({ error: "Plan not found or unauthorized" }, { status: 404 })
    }

    // Update the plan
    const { data, error } = await supabase
      .from("personalized_plans")
      .update({
        content: body.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[SERVER] Update plan error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[SERVER] Plan updated successfully")
    return NextResponse.json({ success: true, plan: data })
  } catch (error: any) {
    console.error("[SERVER] Update plan API error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export const dynamic = "force-dynamic"

/**
 * Get the status of a coach action
 * Used by mobile app to poll for completion of queued actions
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const actionId = searchParams.get("actionId")

        if (!actionId) {
            return NextResponse.json({ error: "actionId is required" }, { status: 400 })
        }

        const supabase = await getSupabaseForRequest(request)

        // Verify authentication
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = authData.user.id

        // Get the action (RLS ensures user can only see their own)
        const { data: action, error } = await supabase
            .from("coach_actions")
            .select("id, status, action_type, error_message, payload, completed_at")
            .eq("id", actionId)
            .eq("user_id", userId)
            .maybeSingle()

        if (error) {
            console.error("[ActionStatus] Error fetching action:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!action) {
            return NextResponse.json({ error: "Action not found" }, { status: 404 })
        }

        return NextResponse.json(action)

    } catch (error) {
        console.error("[ActionStatus] Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"
import { isSupabaseConfigured } from "@/lib/supabase-utils"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest) {
    try {
        if (!isSupabaseConfigured()) {
            return NextResponse.json({ error: "Database not configured" }, { status: 503 })
        }

        const supabase = await getSupabaseForRequest(request)
        const { data: authData, error: authError } = await supabase.auth.getUser()

        if (authError || !authData.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = authData.user.id

        // Delete all user data
        // We attempt to delete from child tables first to avoid FK constraints if cascades aren't set
        // Note: If cascading deletes are enabled in DB, deleting from 'users' might suffice, 
        // but explicit deletion is safer for "Delete All Data" feature to ensure cleanup.

        const tablesToDelete = [
            "weight_logs",
            "meal_logs",
            "activity_logs",
            "mood_logs",
            "goals",
            "daily_stats",
            "weekly_summaries",
            "chat_messages",
            "user_plans", // personalized plans
            "fitness_profiles"
        ]

        const errors = []

        // Delete related data
        for (const table of tablesToDelete) {
            const { error } = await supabase.from(table).delete().eq("user_id", userId)
            if (error) {
                // We log but continue, as some tables might not exist or might depend on others differently
                console.warn(`Failed to delete from ${table}:`, error)
                // We don't error out hard here, we try to clear as much as possible
            }
        }

        // Finally delete from public.users
        const { error: userError } = await supabase.from("users").delete().eq("id", userId)

        if (userError) {
            console.error("Error deleting user profile:", userError)
            return NextResponse.json({ error: "Failed to delete user profile" }, { status: 500 })
        }

        // Note: We do NOT delete from auth.users here as that requires Service Role key 
        // and might be out of scope for this "Delete Data" button vs "Delete Account".
        // But usually "Delete All Data" implies app data.

        return NextResponse.json({ success: true, message: "All user data deleted" })
    } catch (error) {
        console.error("Delete API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

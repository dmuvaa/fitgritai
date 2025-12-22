import { SupabaseClient } from "@supabase/supabase-js"

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
}

/**
 * Log weight directly to weight_logs table
 */
export async function handleLogWeight(
    job: CoachAction,
    supabase: SupabaseClient,
    appOrigin: string
): Promise<any> {
    const { user_id, payload } = job
    const params = payload?.parameters || payload || {}
    const today = new Date().toISOString().split("T")[0]

    if (!params.weight && !params.value) {
        throw new Error("Weight value is required")
    }

    const { data, error } = await supabase
        .from("weight_logs")
        .insert({
            user_id,
            weight: params.weight || params.value,
            date: params.date || today,
            notes: params.notes || null,
        })
        .select("id")
        .single()

    if (error) {
        throw new Error(`LOG_WEIGHT failed: ${error.message}`)
    }

    return {
        success: true,
        message: `Weight logged: ${params.weight || params.value} kg ⚖️`,
        logId: data.id,
    }
}

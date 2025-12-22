import { SupabaseClient } from "@supabase/supabase-js"

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
}

/**
 * Log a workout directly to activity_logs table
 */
export async function handleLogWorkout(
    job: CoachAction,
    supabase: SupabaseClient,
    appOrigin: string
): Promise<any> {
    const { user_id, payload } = job
    const params = payload?.parameters || payload || {}
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
        .from("activity_logs")
        .insert({
            user_id,
            workout_type: params.workout_type || params.type || "Other",
            description: params.description || params.original_message || "",
            duration: params.duration || null,
            workout_time: params.workout_time || new Date().toISOString(),
            exercises: params.exercises || null,
            notes: params.notes || null,
            date: params.date || today,
        })
        .select("id")
        .single()

    if (error) {
        throw new Error(`LOG_WORKOUT failed: ${error.message}`)
    }

    return {
        success: true,
        message: "Workout logged successfully! 💪",
        logId: data.id,
    }
}

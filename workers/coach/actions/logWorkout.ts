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

    // Extract just the time portion (HH:MM:SS) - database expects TIME not TIMESTAMP
    let workoutTime = params.workout_time
    if (workoutTime && workoutTime.includes("T")) {
        workoutTime = workoutTime.split("T")[1]?.split(".")[0] || null
    }

    const { data, error } = await supabase
        .from("activity_logs")
        .insert({
            user_id,
            workout_type: params.workout_type || params.type || "Other",
            description: params.description || params.original_message || "",
            duration: params.duration || null,
            workout_time: workoutTime || null,
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

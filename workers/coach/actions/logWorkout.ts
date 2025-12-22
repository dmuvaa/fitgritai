import { SupabaseClient } from "@supabase/supabase-js"

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
}

/**
 * Log a workout via the existing activity API
 */
export async function handleLogWorkout(
    job: CoachAction,
    supabase: SupabaseClient,
    appOrigin: string
): Promise<any> {
    const { user_id, payload } = job
    const params = payload?.parameters || payload || {}
    const today = new Date().toISOString().split("T")[0]

    const response = await fetch(
        `${appOrigin}/api/logs/activity`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Service-Role": "true",
                "X-User-Id": user_id,
            },
            body: JSON.stringify({
                workout_type: params.workout_type || params.type || "Other",
                description: params.description || params.original_message || "",
                duration: params.duration,
                workout_time: params.workout_time || new Date().toISOString(),
                exercises: params.exercises,
                notes: params.notes,
                date: params.date || today,
            }),
        }
    )

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`LOG_WORKOUT failed: ${response.status} - ${text}`)
    }

    const data = await response.json()

    return {
        success: true,
        message: "Workout logged successfully",
        logId: data.id,
    }
}

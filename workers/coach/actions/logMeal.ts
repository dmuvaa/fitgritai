import { SupabaseClient } from "@supabase/supabase-js"

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
}

/**
 * Log a meal directly to meal_logs table
 */
export async function handleLogMeal(
    job: CoachAction,
    supabase: SupabaseClient,
    appOrigin: string
): Promise<any> {
    const { user_id, payload } = job
    const params = payload?.parameters || payload || {}
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
        .from("meal_logs")
        .insert({
            user_id,
            meal_type: params.meal_type || "Other",
            description: params.description || params.original_message || "",
            date: params.date || today,
            meal_time: params.meal_time || new Date().toISOString(),
            calories: params.calories || null,
            protein: params.protein || null,
            carbs: params.carbs || null,
            fat: params.fat || null,
            foods: params.foods || null,
        })
        .select("id")
        .single()

    if (error) {
        throw new Error(`LOG_MEAL failed: ${error.message}`)
    }

    return {
        success: true,
        message: "Meal logged successfully! 🍽️",
        logId: data.id,
    }
}

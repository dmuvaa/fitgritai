import { SupabaseClient } from "@supabase/supabase-js"

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
}

/**
 * Log a meal via the existing meals API
 */
export async function handleLogMeal(
    job: CoachAction,
    supabase: SupabaseClient,
    appOrigin: string
): Promise<any> {
    const { user_id, payload } = job
    const params = payload?.parameters || payload || {}
    const today = new Date().toISOString().split("T")[0]

    const response = await fetch(
        `${appOrigin}/api/logs/meals`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Service-Role": "true",
                "X-User-Id": user_id,
            },
            body: JSON.stringify({
                meal_type: params.meal_type || "Other",
                description: params.description || params.original_message || "",
                date: params.date || today,
                meal_time: params.meal_time,
                calories: params.calories,
                protein: params.protein,
                carbs: params.carbs,
                fat: params.fat,
                foods: params.foods,
            }),
        }
    )

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`LOG_MEAL failed: ${response.status} - ${text}`)
    }

    const data = await response.json()

    return {
        success: true,
        message: "Meal logged successfully",
        logId: data.id,
    }
}

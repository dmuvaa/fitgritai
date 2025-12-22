import { SupabaseClient } from "@supabase/supabase-js"

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
}

/**
 * Log weight via the existing weight API
 */
export async function handleLogWeight(
    job: CoachAction,
    supabase: SupabaseClient,
    appOrigin: string
): Promise<any> {
    const { user_id, payload } = job
    const params = payload?.parameters || payload || {}
    const today = new Date().toISOString().split("T")[0]

    const response = await fetch(
        `${appOrigin}/api/logs/weight`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Service-Role": "true",
                "X-User-Id": user_id,
            },
            body: JSON.stringify({
                weight: params.weight,
                date: params.date || today,
                notes: params.notes,
            }),
        }
    )

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`LOG_WEIGHT failed: ${response.status} - ${text}`)
    }

    const data = await response.json()

    return {
        success: true,
        message: "Weight logged successfully",
        logId: data.id,
    }
}

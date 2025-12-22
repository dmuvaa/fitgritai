import { SupabaseClient } from "@supabase/supabase-js"

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
}

/**
 * Generate personalized workout/meal plans via the existing API
 */
export async function handleGeneratePlans(
    job: CoachAction,
    supabase: SupabaseClient,
    appOrigin: string
): Promise<any> {
    const { user_id, payload } = job

    // Get a service token for internal API calls
    // The API will use this to authenticate as the user
    const response = await fetch(
        `${appOrigin}/api/personalized-plans/generate-from-data`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Service-Role": "true",
                "X-User-Id": user_id,
            },
            body: JSON.stringify({
                userId: user_id,
                ...(payload?.parameters || {}),
            }),
        }
    )

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`GENERATE_PLANS failed: ${response.status} - ${text}`)
    }

    const data = await response.json()

    return {
        success: true,
        plansGenerated: data.plans?.length || 0,
        message: `Generated ${data.plans?.length || 0} new plans`,
    }
}

import { SupabaseClient } from "@supabase/supabase-js"

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
}

/**
 * Generate personalized workout/meal plans
 * Uses Supabase directly with service role (bypasses RLS)
 */
export async function handleGeneratePlans(
    job: CoachAction,
    supabase: SupabaseClient,
    appOrigin: string
): Promise<any> {
    const { user_id, payload } = job
    const params = payload?.parameters || payload || {}

    // Check if user has a fitness profile
    const { data: profile, error: profileError } = await supabase
        .from("user_fitness_profile")
        .select("id, workout_days, primary_goals, fitness_level")
        .eq("user_id", user_id)
        .maybeSingle()

    if (profileError || !profile) {
        throw new Error("Fitness profile not found. Complete your profile first.")
    }

    // Create a plan generation job
    const today = new Date().toISOString().split("T")[0]
    const schedule = (profile.workout_days || ["Monday", "Wednesday", "Friday"]).map((day: string) => ({
        day,
        focus: params.focus || profile.primary_goals?.[0] || "General Fitness",
    }))

    const { data: jobData, error: jobError } = await supabase
        .from("plan_generation_jobs")
        .insert({
            user_id,
            status: "pending",
            request_payload: {
                startDate: today,
                schedule,
                ...params,
            },
        })
        .select("id")
        .single()

    if (jobError) {
        throw new Error(`Failed to create plan job: ${jobError.message}`)
    }

    // Trigger the edge function to process the job
    const edgeFunctionUrl = process.env.SUPABASE_EDGE_FUNCTION_URL ||
        "https://hipdgmzzdvipcsqxqnhn.supabase.co/functions/v1/dynamic-endpoint"
    const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    try {
        const response = await fetch(edgeFunctionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${svcKey}`,
                "apikey": svcKey,
            },
            body: JSON.stringify({ job_id: jobData.id, user_id }),
        })

        if (!response.ok) {
            const text = await response.text()
            console.log(`[Worker] Plan generation triggered but got ${response.status}: ${text}`)
        }
    } catch (err: any) {
        console.error("[Worker] Failed to trigger edge function:", err.message)
    }

    return {
        success: true,
        message: `Plan generation job created (ID: ${jobData.id}). Processing in background.`,
        jobId: jobData.id,
    }
}

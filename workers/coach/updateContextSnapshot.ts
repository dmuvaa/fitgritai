import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Update the coach context snapshot after any mutation
 * This is called by the worker after successful action execution
 * 
 * The snapshot provides a cached summary for fast chat responses
 */
export async function updateContextSnapshot(
    userId: string,
    supabase: SupabaseClient
): Promise<void> {
    console.log(`[Worker] Updating context snapshot for user ${userId}`)

    // Fetch all relevant user data in parallel
    const [profileResult, goalsResult, plansResult, logsResult] = await Promise.all([
        supabase
            .from("user_fitness_profile")
            .select("fitness_level, primary_goals, exercise_benchmarks, workout_days")
            .eq("user_id", userId)
            .maybeSingle(),

        supabase
            .from("user_goals")
            .select("daily_calorie_goal, weekly_weight_goal, calculated_tdee")
            .eq("user_id", userId)
            .maybeSingle(),

        supabase
            .from("personalized_plans")
            .select("plan_type, week_number")
            .eq("user_id", userId)
            .eq("is_active", true),

        // Get recent log counts
        supabase
            .from("activity_logs")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]),
    ])

    const profile = profileResult.data
    const goals = goalsResult.data
    const plans = plansResult.data || []
    const recentWorkouts = logsResult.count || 0

    // Build compact summary
    const summary = buildSummary(profile, goals, plans, recentWorkouts)

    // Upsert the snapshot
    const { error } = await supabase
        .from("coach_context_snapshot")
        .upsert({
            user_id: userId,
            summary,
            data: {
                profile,
                goals,
                activePlans: plans.length,
                recentWorkouts,
            },
            updated_at: new Date().toISOString(),
        })

    if (error) {
        console.error(`[Worker] Failed to update snapshot: ${error.message}`)
    } else {
        console.log(`[Worker] Snapshot updated for user ${userId}`)
    }
}

function buildSummary(
    profile: any,
    goals: any,
    plans: any[],
    recentWorkouts: number
): string {
    const lines: string[] = []

    // Fitness profile
    if (profile) {
        if (profile.fitness_level) {
            lines.push(`Fitness level: ${profile.fitness_level}`)
        }
        if (profile.primary_goals?.length) {
            lines.push(`Goals: ${profile.primary_goals.join(", ")}`)
        }
        if (profile.workout_days?.length) {
            lines.push(`Workout days: ${profile.workout_days.join(", ")}`)
        }
        if (profile.exercise_benchmarks?.length) {
            const top3 = profile.exercise_benchmarks.slice(0, 3)
            const benchmarks = top3
                .map((b: any) => `${b.exercise}: ${b.current_weight}kg`)
                .join(", ")
            lines.push(`Top lifts: ${benchmarks}`)
        }
    }

    // Goals
    if (goals) {
        if (goals.daily_calorie_goal) {
            lines.push(`Daily calories: ${goals.daily_calorie_goal} kcal`)
        }
        if (goals.weekly_weight_goal) {
            lines.push(`Weekly weight goal: ${goals.weekly_weight_goal} kg`)
        }
    }

    // Plans
    if (plans.length > 0) {
        const workoutPlans = plans.filter(p => p.plan_type === "workout").length
        const mealPlans = plans.filter(p => p.plan_type === "meal").length
        lines.push(`Active plans: ${workoutPlans} workout, ${mealPlans} meal`)
    } else {
        lines.push("No active plans")
    }

    // Recent activity
    lines.push(`Workouts this week: ${recentWorkouts}`)

    return lines.join("\n")
}

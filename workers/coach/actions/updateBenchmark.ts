import { SupabaseClient } from "@supabase/supabase-js"

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
}

/**
 * Update exercise benchmarks directly in the database
 * (No API endpoint needed - direct Supabase access)
 */
export async function handleUpdateBenchmark(
    job: CoachAction,
    supabase: SupabaseClient
): Promise<any> {
    const { user_id, payload } = job
    const params = payload?.parameters || payload || {}

    // Get current fitness profile
    const { data: currentProfile, error: profileError } = await supabase
        .from("user_fitness_profile")
        .select("exercise_benchmarks")
        .eq("user_id", user_id)
        .maybeSingle()

    if (profileError) {
        throw new Error(`Failed to fetch profile: ${profileError.message}`)
    }

    // Parse existing benchmarks
    const existingBenchmarks = currentProfile?.exercise_benchmarks || []
    const exerciseName = params.exercise || params.exercise_name

    if (!exerciseName) {
        throw new Error("Exercise name is required for UPDATE_BENCHMARK")
    }

    // Update or add the new benchmark
    const updatedBenchmarks = [...existingBenchmarks]
    const existingIndex = updatedBenchmarks.findIndex(
        (b: any) => b.exercise?.toLowerCase() === exerciseName.toLowerCase()
    )

    const newBenchmark = {
        exercise: exerciseName,
        current_weight: params.weight || params.current_weight,
        current_reps: params.reps || params.current_reps,
        target_weight: params.target_weight,
        target_date: params.target_date,
        updated_at: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
        updatedBenchmarks[existingIndex] = {
            ...updatedBenchmarks[existingIndex],
            ...newBenchmark
        }
    } else {
        updatedBenchmarks.push(newBenchmark)
    }

    // Save updated benchmarks
    const { error: updateError } = await supabase
        .from("user_fitness_profile")
        .update({
            exercise_benchmarks: updatedBenchmarks,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)

    if (updateError) {
        throw new Error(`Failed to update benchmark: ${updateError.message}`)
    }

    return {
        success: true,
        message: `Updated ${exerciseName} benchmark: ${newBenchmark.current_weight}kg x ${newBenchmark.current_reps} reps`,
        benchmark: newBenchmark,
    }
}

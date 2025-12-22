import "dotenv/config"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { handleGeneratePlans } from "./actions/generatePlans"
import { handleLogWorkout } from "./actions/logWorkout"
import { handleLogMeal } from "./actions/logMeal"
import { handleLogWeight } from "./actions/logWeight"
import { handleUpdateBenchmark } from "./actions/updateBenchmark"
import { handleUpdatePlan } from "./actions/updatePlan"
import { updateContextSnapshot } from "./updateContextSnapshot"

// ============================================================================
// COACH WORKER
// ============================================================================
// Polls coach_actions for queued jobs and executes them
// Runs as a long-lived Node.js process (not serverless)
//
// Run: npx tsx workers/coach/index.ts
// Scale: pm2 start workers/coach/index.ts -i 4
// ============================================================================

// Support both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const APP_ORIGIN = process.env.APP_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment variables:")
    console.error("  - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL")
    console.error("  - SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const WORKER_ID = `coach-worker-${process.pid}`
const POLL_INTERVAL_MS = 1500
const MAX_ATTEMPTS = 3

console.log(`[Worker] Starting ${WORKER_ID}...`)
console.log(`[Worker] App origin: ${APP_ORIGIN}`)

// ============================================================================
// JOB MANAGEMENT
// ============================================================================

interface CoachAction {
    id: string
    user_id: string
    action_type: string
    payload: any
    attempts: number
    created_at: string
}

async function fetchNextJob(): Promise<CoachAction | null> {
    const { data, error } = await supabase
        .from("coach_actions")
        .select("*")
        .eq("status", "queued")
        .lt("attempts", MAX_ATTEMPTS)
        .is("locked_at", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error("[Worker] Error fetching job:", error.message)
        return null
    }

    return data
}

async function lockJob(jobId: string, currentAttempts: number): Promise<boolean> {
    const { error } = await supabase
        .from("coach_actions")
        .update({
            status: "processing",
            locked_at: new Date().toISOString(),
            locked_by: WORKER_ID,
            attempts: currentAttempts + 1,
        })
        .eq("id", jobId)
        .eq("status", "queued") // Optimistic lock - only update if still queued
        .is("locked_at", null)

    if (error) {
        console.error("[Worker] Error locking job:", error.message)
        return false
    }

    return true
}

async function completeJob(jobId: string, result?: any) {
    await supabase
        .from("coach_actions")
        .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            locked_at: null,
            locked_by: null,
            payload: result ? { ...result } : undefined,
        })
        .eq("id", jobId)
}

async function failJob(jobId: string, error: string, attempts: number) {
    const status = attempts >= MAX_ATTEMPTS ? "failed" : "queued" // Retry or final fail

    await supabase
        .from("coach_actions")
        .update({
            status,
            error_message: error,
            locked_at: null,
            locked_by: null,
        })
        .eq("id", jobId)
}

// ============================================================================
// ACTION EXECUTION
// ============================================================================

async function executeAction(job: CoachAction): Promise<any> {
    console.log(`[Worker] Executing ${job.action_type} for user ${job.user_id}`)

    switch (job.action_type) {
        case "GENERATE_PLANS":
            return await handleGeneratePlans(job, supabase, APP_ORIGIN)
        case "UPDATE_PLAN":
            return await handleUpdatePlan(job, supabase, APP_ORIGIN)
        case "LOG_WORKOUT":
            return await handleLogWorkout(job, supabase, APP_ORIGIN)
        case "LOG_MEAL":
            return await handleLogMeal(job, supabase, APP_ORIGIN)
        case "LOG_WEIGHT":
            return await handleLogWeight(job, supabase, APP_ORIGIN)
        case "UPDATE_BENCHMARK":
            return await handleUpdateBenchmark(job, supabase)
        default:
            throw new Error(`Unsupported action type: ${job.action_type}`)
    }
}

// ============================================================================
// MAIN LOOP
// ============================================================================

async function run() {
    console.log(`[Worker] Polling every ${POLL_INTERVAL_MS}ms...`)

    while (true) {
        try {
            const job = await fetchNextJob()

            if (!job) {
                await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
                continue
            }

            console.log(`[Worker] Found job ${job.id} (${job.action_type})`)

            const locked = await lockJob(job.id, job.attempts)
            if (!locked) {
                console.log(`[Worker] Job ${job.id} already locked, skipping`)
                continue
            }

            try {
                const result = await executeAction(job)

                // Update context snapshot after successful mutation
                await updateContextSnapshot(job.user_id, supabase)

                await completeJob(job.id, result)
                console.log(`[Worker] Completed job ${job.id}`)

            } catch (err: any) {
                console.error(`[Worker] Job ${job.id} failed:`, err.message)
                await failJob(job.id, err.message, job.attempts + 1)
            }

        } catch (err: any) {
            console.error("[Worker] Loop error:", err.message)
            await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))
        }
    }
}

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("[Worker] Received SIGTERM, shutting down...")
    process.exit(0)
})

process.on("SIGINT", () => {
    console.log("[Worker] Received SIGINT, shutting down...")
    process.exit(0)
})

run()

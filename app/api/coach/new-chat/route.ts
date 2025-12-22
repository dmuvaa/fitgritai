import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseForRequest } from "@/utils/supabase/api-request"

export const dynamic = "force-dynamic"

/**
 * Optimized AI Coach Chat Endpoint (new-chat)
 * 
 * Key differences from /api/coach/chat:
 * 1. Uses cached context snapshot instead of rebuilding every request
 * 2. Direct Supabase queries instead of internal HTTP fetches
 * 3. Queues actions for async execution instead of executing synchronously
 * 4. Smaller prompt and context for faster LLM responses
 * 5. Returns in <2s instead of 6-12s
 */

type ActionType =
    | 'GENERATE_PLANS'
    | 'UPDATE_PLAN'
    | 'LOG_WORKOUT'
    | 'LOG_MEAL'
    | 'LOG_WEIGHT'
    | 'LOG_MOOD'
    | 'ADJUST_GOALS'
    | 'UPDATE_BENCHMARK'
    | 'NONE'

interface ParsedAction {
    intent: ActionType
    requires_confirmation: boolean
    parameters: Record<string, any>
    message: string
}

export async function POST(request: NextRequest) {
    const startTime = Date.now()

    try {
        const { message, conversationId } = await request.json()

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        const supabase = await getSupabaseForRequest(request)

        // ============================================================================
        // STEP 1: AUTHENTICATION (reuse existing pattern)
        // ============================================================================
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData.user) {
            console.error("[NewChat] Authentication failed:", authError?.message)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = authData.user.id
        console.log("[NewChat] User authenticated:", userId)

        // ============================================================================
        // STEP 2: GET OR CREATE CONVERSATION
        // ============================================================================
        let convId = conversationId
        if (!convId) {
            const { data: newConv } = await supabase
                .from("coach_conversations")
                .insert({ user_id: userId })
                .select()
                .single()
            convId = newConv?.id
        }

        // ============================================================================
        // STEP 3: LOAD MINIMAL CONTEXT (3-5 DB calls vs 12-18 in old endpoint)
        // ============================================================================

        // Parallel fetch: snapshot, recent messages, and pending action
        const [snapshotResult, messagesResult, pendingActionResult] = await Promise.all([
            // Try to load cached context snapshot
            supabase
                .from("coach_context_snapshot")
                .select("summary, data, updated_at")
                .eq("user_id", userId)
                .maybeSingle(),

            // Load last 5-8 messages only
            supabase
                .from("coach_messages")
                .select("role, content")
                .eq("conversation_id", convId)
                .order("created_at", { ascending: false })
                .limit(8),

            // Check for pending action (confirmation flow)
            supabase
                .from("coach_actions")
                .select("*")
                .eq("user_id", userId)
                .eq("status", "pending")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle()
        ])

        const snapshot = snapshotResult.data
        const recentMessages = messagesResult.data || []
        const pendingAction = pendingActionResult.data

        // Build context from snapshot or minimal fallback
        let contextSummary: string
        if (snapshot?.summary) {
            contextSummary = snapshot.summary
        } else {
            // Minimal fallback - load just essential data
            const { data: profile } = await supabase
                .from("users")
                .select("name, current_weight, goal_weight")
                .eq("id", userId)
                .maybeSingle()

            contextSummary = profile
                ? `User: ${profile.name || 'User'}, Current: ${profile.current_weight || '?'}kg, Goal: ${profile.goal_weight || '?'}kg`
                : "No profile data available yet."
        }

        // ============================================================================
        // STEP 4: CHECK FOR CONFIRMATION RESPONSE
        // ============================================================================
        const isConfirmation = /^(yes|confirm|ok|do it|go ahead|proceed)$/i.test(message.trim())

        if (isConfirmation && pendingAction) {
            // Queue the pending action for execution
            await supabase
                .from("coach_actions")
                .update({
                    status: "queued",
                    completed_at: null
                })
                .eq("id", pendingAction.id)

            // Save messages
            await supabase.from("coach_messages").insert([
                {
                    conversation_id: convId,
                    user_id: userId,
                    role: "user",
                    content: message,
                },
                {
                    conversation_id: convId,
                    user_id: userId,
                    role: "assistant",
                    content: `✅ Got it! I've queued ${pendingAction.action_type.replace(/_/g, ' ').toLowerCase()} for execution. This will be processed shortly.`,
                    metadata: { actionId: pendingAction.id, status: "queued" },
                },
            ])

            const elapsed = Date.now() - startTime
            console.log(`[NewChat] Confirmation processed in ${elapsed}ms`)

            return NextResponse.json({
                message: `✅ Got it! I've queued ${pendingAction.action_type.replace(/_/g, ' ').toLowerCase()} for execution. This will be processed shortly.`,
                intent: pendingAction.action_type,
                requiresConfirmation: false,
                conversationId: convId,
                pendingActionId: pendingAction.id,
                actionStatus: "queued",
            })
        }

        // ============================================================================
        // STEP 5: COACH-LIKE SYSTEM PROMPT
        // ============================================================================
        const systemPrompt = `You are FitGrit AI, an expert personal fitness coach. You are NOT a generic chatbot — you are a hands-on, personalized coach who asks smart questions, gives specific actionable guidance, and offers to take action on behalf of the user.

USER CONTEXT:
${contextSummary}

YOUR COACHING STYLE:
1. **Ask follow-up questions** when you need more info (pain, fatigue, goals, preferences)
2. **Give specific actionable cues** — not generic advice. Tell them exactly what to do on their next rep, set, or meal
3. **Offer to take action** — you can log workouts, update plans, swap exercises, adjust loads. Always offer these when relevant
4. **Be confident and authoritative** — you're a coach, not a search engine

MICRO-ASSESSMENT MODE (trigger on pain/injury/fatigue/discomfort):
When user mentions pain, injury, or discomfort:
1. Ask 2-4 smart diagnostic questions (which knee? sharp or dull? during which phase?)
2. Give immediate form cues or modifications they can try NOW
3. Offer specific actions: "I can swap squats for leg press today" or "Log this as a knee note for future reference"

ACTIONS YOU CAN TAKE (be proactive about offering these):
- GENERATE_PLANS: Create new workout/meal plans
- UPDATE_PLAN: Modify/swap exercises, adjust volume, change today's workout
- LOG_WORKOUT: Log their workout from description
- LOG_MEAL: Log their meal
- LOG_WEIGHT: Log weight
- LOG_MOOD: Log mood/energy (good for tracking recovery)
- UPDATE_BENCHMARK: Update their PR/max
- NONE: Just conversation (only if no action makes sense)

OUTPUT FORMAT (strict JSON):
{
  "intent": "ACTION_TYPE",
  "requires_confirmation": true/false,
  "parameters": { /* exercise names, weights, notes, etc */ },
  "message": "Your coach response here"
}

EXAMPLES OF GOOD COACHING:

User: "My knees hurt on squats"
Bad: "Consider modifying your form. Consult a professional."
Good: "Knee pain during squats usually comes from form, load, or mobility. Quick check:
1️⃣ Is it one knee or both?
2️⃣ Sharp pain or dull ache?
3️⃣ During the descent or coming up?

For right now: reduce depth to where pain starts, push knees slightly out, keep weight mid-foot.

Want me to swap squats for leg press today, or log this as a knee issue for future workouts?"

User: "I did bench press today"
Bad: "Great job working out!"
Good: "Nice! What weight did you hit? I'll log it and update your bench benchmark if it's a PR."

RULES:
- GENERATE_PLANS, UPDATE_PLAN always require confirmation (requires_confirmation: true)
- LOG_* actions typically don't need confirmation unless it's a guess
- When offering actions, list them clearly so user knows their options
- Use emojis sparingly for warmth (1-2 max)
- Keep responses conversational but efficient`

        // ============================================================================
        // STEP 6: CALL OPENROUTER (smaller context = faster)
        // ============================================================================
        const messages = [
            { role: "system", content: systemPrompt },
            // Reverse to get chronological order, take last 5
            ...recentMessages.slice().reverse().slice(-5).map((msg: any) => ({
                role: msg.role,
                content: msg.content,
            })),
            { role: "user", content: message },
        ]

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "X-Title": "FitGrit AI Coach",
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: messages,
                max_tokens: 1200, // Increased for detailed coach responses
                temperature: 0.7, // Slightly higher for more natural coaching
                response_format: { type: "json_object" },
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("[NewChat] OpenRouter API error:", response.status, errorText)
            throw new Error(`OpenRouter API error: ${response.status}`)
        }

        const aiResponse = await response.json()
        const aiMessageContent = aiResponse.choices?.[0]?.message?.content || "{}"

        // ============================================================================
        // STEP 7: PARSE RESPONSE (strict JSON)
        // ============================================================================
        let parsed: ParsedAction
        try {
            parsed = JSON.parse(aiMessageContent)
        } catch (e) {
            console.error("[NewChat] Failed to parse JSON response:", e)
            parsed = {
                intent: "NONE",
                requires_confirmation: false,
                parameters: {},
                message: "I'm having trouble processing that. Could you rephrase?"
            }
        }

        // ============================================================================
        // STEP 8: QUEUE ACTION (if needed)
        // ============================================================================
        let pendingActionId: string | undefined
        let actionStatus: string = "none"

        if (parsed.intent && parsed.intent !== "NONE") {
            // Generate idempotency key to prevent duplicate actions
            const today = new Date().toISOString().split("T")[0]
            const idempotencyKey = `${userId}:${parsed.intent}:${today}:${message.slice(0, 50)}`

            // Check for existing action with same idempotency key (prevent duplicates)
            const { data: existing } = await supabase
                .from("coach_actions")
                .select("id, status")
                .eq("idempotency_key", idempotencyKey)
                .maybeSingle()

            if (existing) {
                // Action already exists, reuse it
                pendingActionId = existing.id
                actionStatus = existing.status
                console.log(`[NewChat] Reusing existing action ${existing.id}`)
            } else {
                // Insert new action
                const actionData = {
                    user_id: userId,
                    conversation_id: convId,
                    action_type: parsed.intent,
                    idempotency_key: idempotencyKey,
                    payload: {
                        parameters: parsed.parameters,
                        original_message: message,
                    },
                    status: parsed.requires_confirmation ? "pending" : "queued",
                }

                const { data: insertedAction, error: actionError } = await supabase
                    .from("coach_actions")
                    .insert(actionData)
                    .select("id")
                    .single()

                if (actionError) {
                    console.error("[NewChat] Failed to insert action:", actionError)
                } else {
                    pendingActionId = insertedAction?.id
                    actionStatus = parsed.requires_confirmation ? "pending" : "queued"
                }
            }
        }

        // ============================================================================
        // STEP 9: SAVE MESSAGES
        // ============================================================================
        const assistantMessage = parsed.requires_confirmation
            ? `${parsed.message}\n\n❓ Should I proceed with this? Reply "yes" to confirm.`
            : parsed.message

        await supabase.from("coach_messages").insert([
            {
                conversation_id: convId,
                user_id: userId,
                role: "user",
                content: message,
            },
            {
                conversation_id: convId,
                user_id: userId,
                role: "assistant",
                content: assistantMessage,
                metadata: {
                    intent: parsed.intent,
                    actionId: pendingActionId,
                    status: actionStatus,
                },
            },
        ])

        // ============================================================================
        // STEP 10: RETURN FAST RESPONSE
        // ============================================================================
        const elapsed = Date.now() - startTime
        console.log(`[NewChat] Response in ${elapsed}ms (intent: ${parsed.intent})`)

        return NextResponse.json({
            message: assistantMessage,
            intent: parsed.intent,
            requiresConfirmation: parsed.requires_confirmation,
            conversationId: convId,
            pendingActionId,
            actionStatus,
            _timing: `${elapsed}ms`,
        })

    } catch (error) {
        console.error("[NewChat] Error:", error)
        return NextResponse.json(
            {
                message: "I'm having some technical difficulties. Please try again in a moment.",
                error: "Internal server error",
            },
            { status: 500 }
        )
    }
}

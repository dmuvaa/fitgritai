import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    console.log('➕ [ADD-EXERCISE] Adding exercise to workout...');
    
    // --- Auth: mobile-only (require Bearer token) ---
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) {
      console.log('❌ [ADD-EXERCISE] No mobile token provided');
      return NextResponse.json({ error: 'Mobile token required' }, { status: 401 })
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 503 })
    }

    // Build a token-bound Supabase client so all DB calls carry the JWT (RLS works)
    const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Validate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    // Parse body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { session_id, exercise_id, sets, reps, weight, rest_time, duration } = body
    console.log('📋 [ADD-EXERCISE] Request body:', { session_id, exercise_id, sets, reps, weight, rest_time, duration });

    if (!session_id || !exercise_id) {
      console.log('❌ [ADD-EXERCISE] Missing required fields');
      return NextResponse.json({ error: 'session_id and exercise_id are required' }, { status: 400 })
    }

    // Verify the session exists and belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('id, user_id, status')
      .eq('id', session_id)
      .eq('user_id', userId)
      .maybeSingle()

    if (sessionError) {
      console.error('Session verification error:', sessionError)
      return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 })
    }

    if (session.status !== 'active') {
      return NextResponse.json({ error: 'Cannot add exercises to completed session' }, { status: 400 })
    }

    // Get the next order index for this session
    const { data: existingExercises, error: orderError } = await supabase
      .from('workout_exercises')
      .select('order_index')
      .eq('session_id', session_id)
      .order('order_index', { ascending: false })
      .limit(1)

    if (orderError) {
      console.error('Order index error:', orderError)
      return NextResponse.json({ error: 'Failed to get order index' }, { status: 500 })
    }

    const nextOrderIndex = existingExercises && existingExercises.length > 0 
      ? (existingExercises[0].order_index || 0) + 1 
      : 1

    // Add the exercise to the workout
    const { data: workoutExercise, error: addError } = await supabase
      .from('workout_exercises')
      .insert({
        session_id,
        exercise_id,
        order_index: nextOrderIndex,
        target_sets: sets ?? null,
        target_reps: reps ?? null,
        target_weight: weight ?? null,
        target_duration: duration ?? null,
        rest_time: rest_time ?? 60,
      })
      .select(`
        id,
        exercise_id,
        order_index,
        target_sets,
        target_reps,
        target_weight,
        target_duration,
        rest_time,
        exercises!inner(
          name,
          description,
          muscle_groups
        )
      `)
      .single()

    if (addError) {
      console.error('Add exercise error:', addError)
      return NextResponse.json({ error: 'Failed to add exercise to workout' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      workout_exercise: {
        id: workoutExercise.id,
        exercise_id: workoutExercise.exercise_id,
        name: workoutExercise.exercises.name,
        sets: workoutExercise.target_sets,
        reps: workoutExercise.target_reps,
        weight: workoutExercise.target_weight,
        duration: workoutExercise.target_duration,
        rest_time: workoutExercise.rest_time,
        order: workoutExercise.order_index
      }
    })
  } catch (err) {
    console.error('Add exercise error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

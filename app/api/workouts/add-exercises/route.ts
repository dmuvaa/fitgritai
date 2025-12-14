import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    console.log('➕ [ADD-EXERCISES] Bulk adding exercises to workout...');

    // --- Auth: mobile-only (require Bearer token) ---
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) {
      console.log('❌ [ADD-EXERCISES] No mobile token provided');
      return NextResponse.json({ error: 'Mobile token required' }, { status: 401 })
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 503 })
    }

    // Build a token-bound Supabase client so all DB calls carry the JWT (RLS works)
    const supabase = await createClient()

    // Validate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('❌ [ADD-EXERCISES] Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id
    console.log('✅ [ADD-EXERCISES] User authenticated:', userId);

    // Parse body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { session_id, exercises } = body ?? {}
    console.log('📋 [ADD-EXERCISES] Request body:', {
      session_id,
      exercisesCount: exercises?.length || 0
    });

    if (!session_id || !Array.isArray(exercises) || exercises.length === 0) {
      console.log('❌ [ADD-EXERCISES] Missing required fields');
      return NextResponse.json({ error: 'session_id and exercises array are required' }, { status: 400 })
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

    // Prepare bulk insert data
    const inserts = exercises.map((exercise: any, index: number) => ({
      session_id,
      exercise_id: exercise.exercise_id,
      order_index: nextOrderIndex + index,
      target_sets: exercise.sets || null,
      target_reps: exercise.reps || null,
      target_weight: exercise.weight || null,
      target_duration: exercise.duration || null,
      rest_time: exercise.rest_time || 60,
    }))

    // Bulk add exercises to the workout
    const { data: workoutExercises, error: addError } = await supabase
      .from('workout_exercises')
      .insert(inserts)
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
          muscle_groups,
          equipment_needed
        )
      `)

    if (addError) {
      console.error('Bulk add exercises error:', addError)
      return NextResponse.json({ error: 'Failed to add exercises to workout' }, { status: 500 })
    }

    console.log('✅ [ADD-EXERCISES] Added exercises:', workoutExercises?.length || 0, 'exercises');

    return NextResponse.json({
      success: true,
      exercises: workoutExercises,
      count: workoutExercises?.length || 0
    })

  } catch (error) {
    console.error('Add exercises error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


























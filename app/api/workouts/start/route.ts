// app/api/workouts/start/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type NewExercise = {
  exercise_id: string
  sets?: number | null
  reps?: number | null
  weight?: number | null
  duration?: number | null // seconds or minutes—your schema decides
  rest_time?: number | null // seconds
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏋️ [START] Starting workout session...');
    
    // --- Auth: mobile-only (require Bearer token) ---
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) {
      console.log('❌ [START] No mobile token provided');
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
      console.log('❌ [START] Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id
    console.log('✅ [START] User authenticated:', userId);

    // Parse body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { name, type, exercises } = body ?? {}
    console.log('📋 [START] Request body:', { name, type, exercisesCount: exercises?.length || 0 });
    
    if (!name || !type) {
      console.log('❌ [START] Missing required fields');
      return NextResponse.json({ error: 'name and type are required' }, { status: 400 })
    }
    const exerciseList: NewExercise[] = Array.isArray(exercises) ? exercises : []

    // --- Create workout session ---
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: userId,
        name,
        type, // e.g., 'strength' | 'cardio'
        status: 'active',
        ai_generated: exerciseList.length > 0,
      })
      .select()
      .single()

    if (sessionError || !session) {
      // Common cause: RLS policy mismatch. Ensure WITH CHECK user_id = (SELECT auth.uid()) exists.
      console.error('Session creation error:', sessionError)
      return NextResponse.json({ error: 'Failed to create workout session' }, { status: 500 })
    }

    // --- Optionally attach exercises to this session ---
    let workoutExercises = []
    if (exerciseList.length > 0) {
      const inserts = exerciseList.map((ex: NewExercise, idx) => ({
        session_id: session.id,
        exercise_id: ex.exercise_id,
        order_index: idx + 1,
        target_sets: ex.sets ?? null,
        target_reps: ex.reps ?? null,
        target_weight: ex.weight ?? null,
        target_duration: ex.duration ?? null,
        rest_time: ex.rest_time ?? 60,
      }))

      const { data: insertedExercises, error: exError } = await supabase
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
      
      if (exError) {
        console.error('Exercises creation error:', exError)
        return NextResponse.json({ error: 'Failed to add exercises to session' }, { status: 500 })
      }
      
      workoutExercises = insertedExercises || []
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        name: session.name,
        type: session.type,
        status: session.status,
        started_at: session.started_at,
        exercises: workoutExercises.map(we => ({
          id: we.id, // This is the workout_exercises.id
          exercise_id: we.exercise_id, // This is the catalog exercise.id
          name: we.exercises.name,
          sets: we.target_sets || 3,
          reps: we.target_reps || 10,
          weight: we.target_weight,
          duration: we.target_duration,
          rest_time: we.rest_time || 60,
          completed_sets: 0,
          order: we.order_index
        }))
      },
    })
  } catch (err) {
    console.error('Start workout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    // --- Auth: mobile-only (require Bearer token) ---
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) {
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

    const body = await request.json()
    const { 
      exercise_id, 
      set_number, 
      reps, 
      weight, 
      duration, 
      distance, 
      rpe, 
      notes 
    } = body

    if (!exercise_id || !set_number) {
      return NextResponse.json({ error: 'exercise_id and set_number are required' }, { status: 400 })
    }

    console.log('[log-set] Received:', { exercise_id, set_number, userId })

    // Verify the exercise_id exists in workout_exercises and belongs to user's session
    const { data: workoutExercise, error: exerciseError } = await supabase
      .from('workout_exercises')
      .select(`
        id,
        workout_sessions!inner(
          id,
          user_id,
          status
        )
      `)
      .eq('id', exercise_id)
      .maybeSingle()

    console.log('[log-set] Workout exercise check:', { 
      exercise_id, 
      found: !!workoutExercise, 
      error: exerciseError,
      sessionUserId: workoutExercise?.workout_sessions?.user_id,
      currentUserId: userId
    })

    if (exerciseError) {
      console.error('Workout exercise lookup error:', exerciseError)
      return NextResponse.json({ error: 'Failed to verify exercise' }, { status: 500 })
    }

    if (!workoutExercise) {
      return NextResponse.json({ error: 'Exercise not found in current workout' }, { status: 404 })
    }

    if (workoutExercise.workout_sessions.user_id !== userId) {
      return NextResponse.json({ error: 'Exercise does not belong to current user' }, { status: 403 })
    }

    // Log the set
    const { data: set, error: setError } = await supabase
      .from('workout_sets')
      .insert({
        exercise_id,
        set_number,
        reps,
        weight,
        duration,
        distance,
        rpe,
        notes
      })
      .select()
      .single()

    if (setError) {
      console.error('Set logging error:', setError)
      return NextResponse.json({ error: 'Failed to log set' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      set: {
        id: set.id,
        set_number: set.set_number,
        reps: set.reps,
        weight: set.weight,
        duration: set.duration,
        distance: set.distance,
        rpe: set.rpe,
        completed_at: set.completed_at
      }
    })

  } catch (error) {
    console.error('Log set error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

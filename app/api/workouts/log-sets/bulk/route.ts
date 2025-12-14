import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [LOG-SETS-BULK] Bulk logging sets...');

    // --- Auth: mobile-only (require Bearer token) ---
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) {
      console.log('❌ [LOG-SETS-BULK] No mobile token provided');
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
      console.log('❌ [LOG-SETS-BULK] Auth failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id
    console.log('✅ [LOG-SETS-BULK] User authenticated:', userId);

    // Parse body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { sets } = body ?? {}
    console.log('📋 [LOG-SETS-BULK] Request body:', {
      setsCount: sets?.length || 0
    });

    if (!Array.isArray(sets) || sets.length === 0) {
      console.log('❌ [LOG-SETS-BULK] Missing required fields');
      return NextResponse.json({ error: 'sets array is required' }, { status: 400 })
    }

    // Validate all sets have required fields
    for (const set of sets) {
      if (!set.exercise_id || !set.set_number) {
        return NextResponse.json({
          error: 'Each set must have exercise_id and set_number'
        }, { status: 400 })
      }
    }

    // Verify all exercises exist and belong to user's sessions
    const exerciseIds = [...new Set(sets.map((s: any) => s.exercise_id))]
    const { data: workoutExercises, error: exerciseError } = await supabase
      .from('workout_exercises')
      .select(`
        id,
        workout_sessions!inner(
          id,
          user_id,
          status
        )
      `)
      .in('id', exerciseIds)

    if (exerciseError) {
      console.error('Workout exercises lookup error:', exerciseError)
      return NextResponse.json({ error: 'Failed to verify exercises' }, { status: 500 })
    }

    if (!workoutExercises || workoutExercises.length !== exerciseIds.length) {
      return NextResponse.json({
        error: 'Some exercises not found in current workout'
      }, { status: 404 })
    }

    // Check all exercises belong to user's sessions
    const invalidExercises = workoutExercises.filter(we =>
      we.workout_sessions.user_id !== userId
    )
    if (invalidExercises.length > 0) {
      return NextResponse.json({
        error: 'Some exercises do not belong to current user'
      }, { status: 403 })
    }

    // Prepare bulk insert data
    const inserts = sets.map((set: any) => ({
      exercise_id: set.exercise_id,
      set_number: set.set_number,
      reps: set.reps || null,
      weight: set.weight || null,
      duration: set.duration || null,
      distance: set.distance || null,
      rpe: set.rpe || null,
      notes: set.notes || null
    }))

    // Bulk insert sets
    const { data: loggedSets, error: setError } = await supabase
      .from('workout_sets')
      .insert(inserts)
      .select(`
        id,
        exercise_id,
        set_number,
        reps,
        weight,
        duration,
        distance,
        rpe,
        completed_at
      `)

    if (setError) {
      console.error('Bulk set logging error:', setError)
      return NextResponse.json({ error: 'Failed to log sets' }, { status: 500 })
    }

    console.log('✅ [LOG-SETS-BULK] Logged sets:', loggedSets?.length || 0, 'sets');

    return NextResponse.json({
      success: true,
      sets: loggedSets,
      count: loggedSets?.length || 0
    })

  } catch (error) {
    console.error('Bulk log sets error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


























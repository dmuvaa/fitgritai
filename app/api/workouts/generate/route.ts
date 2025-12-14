import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    // Require mobile Bearer token (consistent with your /start)
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) {
      return NextResponse.json({ error: 'Mobile token required' }, { status: 401 })
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 503 })
    }

    // Create a token-bound client so RLS sees the JWT on every DB call
    const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Validate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = user.id

    // Parse body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const {
      type,                       // 'strength' | 'hypertrophy' | 'cardio' | ...
      duration_minutes = 45,
      difficulty_level = 3,       // 1-5
      target_muscle_groups = [],  // string[]
      equipment_available = [],   // string[]
    } = body ?? {}

    if (!type) {
      return NextResponse.json({ error: 'type is required' }, { status: 400 })
    }

    // Pull anthropometrics from users
    const { data: userProfile, error: userErr } = await supabase
      .from('users')
      .select('id, current_weight, height, gender, activity_level, fitness_goal')
      .eq('id', userId)
      .maybeSingle()
    if (userErr) {
      console.error('users fetch error:', userErr)
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
    }

    // Optional: goals can inform macros/intensity, etc.
    const { data: goals, error: goalsErr } = await supabase
      .from('user_goals')
      .select('daily_protein_goal, daily_calorie_goal, calculated_bmr, calculated_tdee, goal_intensity')
      .eq('user_id', userId)
      .maybeSingle()
    if (goalsErr) {
      console.warn('user_goals fetch warning (continuing):', goalsErr)
    }

    // Build exercise query - fetch all and filter client-side due to difficulty_level being text
    const { data: allExercises, error: exErr } = await supabase
      .from('exercises')
      .select('*')
      .limit(50)

    if (exErr) {
      console.error('exercises fetch error:', exErr)
      return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
    }

    // Filter exercises client-side due to difficulty_level being text
    let filteredExercises = allExercises || []
    
    if (target_muscle_groups?.length > 0) {
      filteredExercises = filteredExercises.filter(ex => 
        ex.muscle_groups && ex.muscle_groups.some((group: string) => 
          target_muscle_groups.includes(group)
        )
      )
    }
    
    if (equipment_available?.length > 0) {
      filteredExercises = filteredExercises.filter(ex => 
        ex.equipment_needed && ex.equipment_needed.some((equipment: string) => 
          equipment_available.includes(equipment)
        )
      )
    }
    
    if (difficulty_level) {
      filteredExercises = filteredExercises.filter(ex => 
        Number(ex.difficulty_level) <= difficulty_level
      )
    }

    // Generate a workout plan using simple heuristics + your profile/goals
    const plan = generateWorkout({
      type,
      duration_minutes,
      difficulty_level,
      exercises: filteredExercises,
      userProfile, // from users
      goals,       // from user_goals (optional)
    })

    return NextResponse.json({ success: true, workout: plan })
  } catch (err) {
    console.error('Generate workout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ---- Simple "AI" helper functions (same idea as yours, tuned to available data) ----
function generateWorkout({ type, duration_minutes, difficulty_level, exercises, userProfile, goals }: any) {
  const list = (exercises || [])
    .filter((ex: any) => (Number(ex.difficulty_level) ?? 3) <= difficulty_level)
    .sort(() => Math.random() - 0.5)

  const exercisesPerWorkout = Math.min(6, Math.max(3, Math.floor(duration_minutes / 8)))
  const selected = list.slice(0, exercisesPerWorkout)

  const out = selected.map((exercise: any, index: number) => {
    const sets = getSetsForDifficulty(difficulty_level, Number(exercise.difficulty_level))
    const reps = getRepsForType(type, Number(exercise.difficulty_level))
    const weight = estimateWeightFromUser(userProfile, Number(exercise.difficulty_level))

    return {
      exercise_id: exercise.id,   // catalog id — you will convert to workout_exercises on /start
      name: exercise.name,
      sets,
      reps,
      weight,
      rest_time: getRestTime(type, difficulty_level),
      order: index + 1,
    }
  })

  return {
    name: `${capitalize(type)} Workout`,
    type,
    duration_minutes,
    difficulty_level,
    exercises: out,
    estimated_duration: duration_minutes,
    meta: {
      tdee: goals?.calculated_tdee ?? null,
      bmr: goals?.calculated_bmr ?? null,
    }
  }
}

function getSetsForDifficulty(workoutDiff = 3, exerciseDiff = 3) {
  const base = 3
  const mult = workoutDiff / 5
  return Math.max(2, Math.round(base * mult))
}
function getRepsForType(type: string, diff = 3) {
  const ranges: Record<string, [number, number]> = {
    strength: [4, 8],
    hypertrophy: [8, 12],
    endurance: [12, 20],
    cardio: [30, 60],
  }
  const [min, max] = ranges[type] ?? ranges.hypertrophy
  return Math.round(min + (max - min) * (diff / 5))
}
function estimateWeightFromUser(profile: any, diff = 3) {
  const bw = profile?.current_weight ?? 0
  if (!bw) return 0
  const base = bw * 0.1
  return Math.round(base * (diff / 5))
}
function getRestTime(type: string, diff = 3) {
  const ranges: Record<string, [number, number]> = {
    strength: [120, 180],
    hypertrophy: [60, 90],
    endurance: [30, 60],
    cardio: [15, 30],
  }
  const [min, max] = ranges[type] ?? ranges.hypertrophy
  return Math.round(min + (max - min) * (diff / 5))
}
function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

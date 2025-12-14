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
    const { session_id, notes } = body

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    // Defensive probe: check if session exists and is accessible
    const probe = await supabase
      .from('workout_sessions')
      .select('id,user_id,status,started_at')
      .eq('id', session_id)
      .maybeSingle()

    console.log('[complete] probe', { session_id, userId, row: probe.data, err: probe.error })

    if (!probe.data) {
      return NextResponse.json({ error: 'Session not found or access denied' }, { status: 404 })
    }

    if (probe.data.user_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Complete the workout session
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        notes: notes || null
      })
      .eq('id', session_id)
      .eq('user_id', userId)
      .select()
      .maybeSingle()

    if (sessionError) {
      console.error('Session completion error:', sessionError)
      return NextResponse.json({ error: 'Failed to complete workout' }, { status: 500 })
    }

    if (!session) {
      console.error('Session update returned no data despite probe success')
      return NextResponse.json({ error: 'Session update failed' }, { status: 500 })
    }

    // Calculate total duration
    const startTime = new Date(session.started_at)
    const endTime = new Date(session.completed_at)
    const totalDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)

    // Update with calculated duration
    const { error: durationError } = await supabase
      .from('workout_sessions')
      .update({ total_duration: totalDuration })
      .eq('id', session_id)

    if (durationError) {
      console.error('Duration update error:', durationError)
    }

    return NextResponse.json({ 
      success: true, 
      session: {
        id: session.id,
        name: session.name,
        type: session.type,
        total_duration: totalDuration,
        completed_at: session.completed_at
      }
    })

  } catch (error) {
    console.error('Complete workout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

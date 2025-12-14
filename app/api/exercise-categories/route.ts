import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    console.log('🏋️ [CATEGORIES] Fetching exercise categories...');
    
    // For now, return hardcoded categories since RLS is blocking access
    // TODO: Fix RLS policies to allow public read access to exercise_categories
    const categories = [
      {
        id: '0c8ad4d0-7940-4ab0-8df9-573a2d31f99b',
        name: 'Strength',
        description: 'Heavy weight, low rep exercises',
        icon: '💪'
      },
      {
        id: 'e871cd7d-d4e0-42a4-bfe6-060a244a4ca1',
        name: 'Cardio',
        description: 'Cardiovascular and endurance exercises',
        icon: '🏃'
      },
      {
        id: '3f8554c6-a085-4c20-9c77-d81517489a79',
        name: 'HIIT',
        description: 'High intensity interval training',
        icon: '⚡'
      },
      {
        id: '5ec9bbe8-19f4-48bb-b495-f1da89c79613',
        name: 'Bodyweight',
        description: 'Exercises using only body weight',
        icon: '🤸'
      },
      {
        id: '518d0fe5-46a6-4a96-b5ff-2623a9e40aef',
        name: 'Flexibility',
        description: 'Stretching and mobility exercises',
        icon: '🧘'
      }
    ];
    
    console.log('✅ [CATEGORIES] Returning hardcoded categories:', categories.length, 'categories');
    return NextResponse.json(categories)
  } catch (e) {
    console.error('❌ [CATEGORIES] GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase-utils"

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("category_id")
    const categoryName = searchParams.get("category")
    const subcategory = searchParams.get("subcategory")
    const order = searchParams.get("order") || "name.asc"
    const limit = searchParams.get("limit")

    console.log('🏋️ [EXERCISES] Fetching exercises:', { 
      categoryId, 
      categoryName, 
      subcategory, 
      order, 
      limit 
    });

    const supabase = await createClient()

    let query = supabase
      .from("exercises")
      .select("id,name,description,category_id,subcategory,muscle_groups,equipment_needed,difficulty_level")
      .order("name", { ascending: true })

    // Apply filters
    if (categoryId) {
      query = query.eq("category_id", categoryId)
    } else if (categoryName) {
      // resolve name -> id (optional convenience)
      const { data: cats } = await supabase
        .from("exercise_categories")
        .select("id,name")
        .ilike("name", categoryName)
        .limit(1)
      const resolved = cats?.[0]?.id
      if (resolved) query = query.eq("category_id", resolved)
    }

    if (subcategory) {
      query = query.eq("subcategory", subcategory)
    }

    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum)
      }
    }

    // Parse order parameter (e.g., "name.asc", "difficulty_level.desc")
    if (order && order.includes('.')) {
      const [column, direction] = order.split('.')
      const validColumns = ['name', 'difficulty_level', 'created_at']
      const validDirections = ['asc', 'desc']
      
      if (validColumns.includes(column) && validDirections.includes(direction)) {
        query = query.order(column, { ascending: direction === 'asc' })
      }
    }

    const { data: exercises, error } = await query

    if (error) {
      console.error("Exercises fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 })
    }

    console.log('✅ [EXERCISES] Loaded exercises:', exercises?.length || 0, 'exercises');
    
    // Add caching headers for better performance
    const response = NextResponse.json(exercises)
    response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600')
    response.headers.set('ETag', `"exercises-${Date.now()}"`)
    
    return response
  } catch (error) {
    console.error("Exercises API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

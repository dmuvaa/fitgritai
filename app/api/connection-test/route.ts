import { NextResponse } from "next/server"
import { testSupabaseConnection } from "@/lib/supabase-utils.server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const result = await testSupabaseConnection()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Connection test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test connection",
        type: "connection",
      },
      { status: 500 },
    )
  }
}

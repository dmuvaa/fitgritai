/**
 * Creates a Supabase client appropriate for an incoming API request:
 * - Mobile: Authorization: Bearer <JWT>  (RLS enforced as the user)
 * - Web:    Cookie-based session via @supabase/ssr (RLS enforced)
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "./server"

export async function getSupabaseForRequest(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

  const authHeader = request.headers.get("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined

  if (token) {
    // Mobile path — bind the user's JWT to global headers so queries run as the user
    return createSupabaseClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }

  // Web path — use cookie-aware server client
  return await createServerClient()
}

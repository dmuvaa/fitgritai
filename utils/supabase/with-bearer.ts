/**
 * Explicit "Bearer-mode" client factory for API routes that ONLY accept Authorization header.
 * Not required if you use getSupabaseForRequest, but handy for workers/edge utils.
 */
import { createClient } from "@supabase/supabase-js"

export function createBearerClient(authorizationHeader?: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

  return createClient(url, key, {
    global: {
      headers: authorizationHeader ? { Authorization: authorizationHeader } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

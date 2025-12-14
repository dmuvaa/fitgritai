/**
 * Browser client for client-side components (uses ANON key)
 * Respects RLS via the user's session cookie in the browser.
 */
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase envs. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}

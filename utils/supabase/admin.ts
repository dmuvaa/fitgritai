/**
 * Admin Supabase client that bypasses RLS
 * ONLY use this for:
 * - Cron jobs
 * - Backfills
 * - Webhooks
 * - Explicit admin operations
 * 
 * NEVER use in user-facing request paths
 */

import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin client')
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}























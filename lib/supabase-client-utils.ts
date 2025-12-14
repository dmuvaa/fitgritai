// Client-safe Supabase utilities
// This file can be safely imported in client components

// Check if we have valid Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const hasValidCredentials = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("https://") &&
  !supabaseUrl.includes("placeholder") &&
  !supabaseAnonKey.includes("placeholder")
)

// Mock user for demo mode
export const mockUser = {
  id: "demo-user-123",
  email: "demo@fitgrit.ai",
  user_metadata: {
    name: "Demo User",
  },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
}

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const configured = hasValidCredentials
  if (!configured) {
    console.log("🔧 Running in demo mode - Supabase not configured")
  }
  return configured
}

// Check Supabase connection (simplified version for client-side)
export async function checkSupabaseConnection() {
  console.warn("checkSupabaseConnection() is deprecated on client. Use API route instead.")
  return false
}

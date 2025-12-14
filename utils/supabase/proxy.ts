/**
 * Session keep-alive middleware helper.
 * Use in middleware.ts: `export async function middleware(req) { return updateSession(req) }`
 * Redirects to /auth if unauthenticated (adjust to your app).
 */
import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // Write cookies to the outgoing response so the browser stays in sync
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  // IMPORTANT: Don't put logic between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Example gate: redirect to /auth if not logged in and not already on /auth
  if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// import { type NextRequest, NextResponse } from "next/server"
// import { updateSession } from "./utils/supabase/middleware"

// export async function middleware(request: NextRequest) {
//   // Check if Supabase is configured
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
//   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

//   // If Supabase is not configured (demo mode), allow all requests
//   if (!supabaseUrl || !supabaseKey) {
//     return NextResponse.next()
//   }

//   // Skip middleware for API routes
//   if (request.nextUrl.pathname.startsWith("/api/")) {
//     return NextResponse.next()
//   }

//   // Public routes that don't require authentication
//   const publicRoutes = ["/", "/auth", "/auth/callback", "/about", "/faq", "/privacy", "/terms"]

//   if (publicRoutes.includes(request.nextUrl.pathname)) {
//     return NextResponse.next()
//   }

//   // For all other routes, check authentication
//   return await updateSession(request)
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * Feel free to modify this pattern to include more paths.
//      */
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// }

import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "./utils/supabase/proxy"

export async function proxy(request: NextRequest) {
  try {
    // 1. Config Check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.next()
    }

    // 2. Skip API & Public Routes
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next()
    }

    const publicRoutes = ["/", "/auth", "/auth/callback", "/about", "/faq", "/privacy", "/terms"]
    if (publicRoutes.includes(request.nextUrl.pathname)) {
      return NextResponse.next()
    }

    // 3. Run Auth Logic
    return await updateSession(request)

  } catch (error) {
    // 4. Catch Crashes
    console.error("Middleware Error:", error)
    // Return a default response so the user doesn't see a 500 page
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
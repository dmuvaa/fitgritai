"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured, mockUser } from "@/lib/supabase-utils"
import { StatsOverview } from "./components/stats-overview"
import { QuickLogging } from "./components/quick-logging"
import { TodaysNutrition } from "./components/todays-nutrition"
import { ViewMyLogs } from "./components/view-my-logs"
import { PersonalizedPlansSection } from "./components/personalized-plans-section"
import { Navigation } from "@/components/navigation"
import { WeeklySummary } from "@/components/weekly-summary"
import { FloatingAIChat } from "./components/floating-ai-chat"

interface UserProfile {
  id: string
  name: string
  email: string
  height: number
  starting_weight: number
  current_weight: number
  goal_weight: number
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      try {
        if (!isSupabaseConfigured()) {
          // Demo mode
          setUser(mockUser)
          setProfile({
            id: mockUser.id,
            name: "Demo User",
            email: mockUser.email,
            height: 175,
            starting_weight: 85.0,
            current_weight: 78.5,
            goal_weight: 70.0,
            created_at: new Date().toISOString(),
          })
          setLoading(false)
          return
        }

        const supabase = createClient()

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          console.error("Auth error:", authError)
          router.push("/auth")
          return
        }

        setUser(user)

        // Try to fetch the profile
        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Profile fetch error:", profileError)
          setError("Failed to load profile")
          setLoading(false)
          return
        }

        // If no profile exists, redirect to onboarding
        if (!profileData) {
          console.log("No profile found, redirecting to onboarding")
          router.push("/onboarding")
          return
        }

        setProfile(profileData)
        setLoading(false)
      } catch (err) {
        console.error("Dashboard error:", err)
        setError("An unexpected error occurred")
        setLoading(false)
      }
    }

    getUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{profile?.name ? `, ${profile.name}` : ""}! 💪
          </h1>
          <p className="text-gray-600 mt-2">Let's crush your goals today</p>
        </div>

        <div className="space-y-6">
          <StatsOverview userId={user.id} profile={profile} />
          <QuickLogging userId={user.id} profile={profile} />
          <WeeklySummary userId={user.id} />
          <TodaysNutrition userId={user.id} profile={profile} />
          <ViewMyLogs />
          <PersonalizedPlansSection />
        </div>
      </main>

      <FloatingAIChat userId={user.id} profile={profile} />
    </div>
  )
}

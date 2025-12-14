"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Eye, Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PersonalizedPlansJourney } from "./personalized-plans-journey"
import { ViewFitnessProfile } from "./view-fitness-profile"
import { PlanCreationWizard } from "./plan-creation-wizard"
import { ViewGeneratedPlans } from "./view-generated-plans"

export function PersonalizedPlansSection() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [fitnessProfile, setFitnessProfile] = useState<any>(null)
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([])
  const [mealPlans, setMealPlans] = useState<any[]>([])
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCreateWizard, setShowCreateWizard] = useState(false)
  const [showViewPlans, setShowViewPlans] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    console.log("📥 Fetching personalized plans data...")
    setLoading(true)
    try {
      const [profileRes, workoutRes, mealRes] = await Promise.all([
        fetch("/api/personalized-plans/questionnaire"),
        fetch("/api/personalized-plans?type=workout"),
        fetch("/api/personalized-plans?type=meal"),
      ])

      const profileData = await profileRes.json()
      const workoutData = await workoutRes.json()
      const mealData = await mealRes.json()

      console.log("📊 Profile data:", profileData)
      console.log("📊 Workout plans:", workoutData.plans?.length || 0)
      console.log("📊 Meal plans:", mealData.plans?.length || 0)

      setFitnessProfile(profileData)
      setWorkoutPlans(workoutData.plans || [])
      setMealPlans(mealData.plans || [])
    } catch (error) {
      console.error("❌ Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllPlans = async () => {
    console.log("🗑️ Delete All button clicked")

    if (!confirm("This will delete all your plans. This action cannot be undone. Continue?")) {
      console.log("❌ User cancelled deletion")
      return
    }

    console.log("✅ User confirmed deletion")
    setDeleting(true)

    try {
      console.log("📡 Calling DELETE API endpoint...")

      const response = await fetch("/api/personalized-plans/delete-all", {
        method: "POST",
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response OK:", response.ok)

      const data = await response.json()
      console.log("📡 Response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error("❌ API returned error:", data)
        throw new Error(data.error || "Failed to delete plans")
      }

      console.log("✅ Plans deleted successfully!")
      console.log("📊 Summary:", data.summary)

      toast({
        title: "Plans Deleted ✅",
        description: `Successfully deleted ${data.summary?.plansDeleted || 0} plans`,
      })

      console.log("🔄 Refreshing data...")
      await fetchData()
    } catch (error: any) {
      console.error("💥 Error deleting plans:", error)
      toast({
        title: "Error ❌",
        description: error.message || "Failed to delete plans. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      console.log("✅ Delete operation completed")
    }
  }

  const handleProfileComplete = async () => {
    console.log("✅ Profile completed, refreshing...")
    setShowEditDialog(false)
    await fetchData()
  }

  const handlePlansCreated = async () => {
    console.log("✅ Plans created, refreshing...")
    setShowCreateWizard(false)
    await fetchData()
    setShowViewPlans(true)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </CardContent>
      </Card>
    )
  }

  const hasProfile = fitnessProfile !== null
  const hasPlans = workoutPlans.length > 0 || mealPlans.length > 0

  console.log("🔍 Current state:", {
    hasProfile,
    hasPlans,
    workoutPlans: workoutPlans.length,
    mealPlans: mealPlans.length,
  })

  // No profile yet - show create profile CTA
  if (!hasProfile) {
    return (
      <>
        <Card className="border-2 border-dashed">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-orange-500" />
            </div>
            <CardTitle className="text-2xl">Create Your Fitness Profile</CardTitle>
            <CardDescription className="text-base">
              Let's start by understanding your fitness goals, available equipment, and dietary preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <Button
              size="lg"
              onClick={() => setShowEditDialog(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </CardContent>
        </Card>

        {showEditDialog && (
          <PersonalizedPlansJourney
            userId=""
            profile={null}
            isEditing={false}
            onClose={() => setShowEditDialog(false)}
            onComplete={handleProfileComplete}
          />
        )}
      </>
    )
  }

  // Has profile but no plans - show create plans CTA
  if (!hasPlans) {
    return (
      <>
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-orange-500" />
            </div>
            <CardTitle className="text-2xl">Create Your Custom Plan</CardTitle>
            <CardDescription className="text-base">
              Your fitness profile is ready. Now let's build a personalized workout and meal plan tailored to your
              schedule and goals.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3 pb-8">
            <Button
              size="lg"
              onClick={() => setShowCreateWizard(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 w-full max-w-xs"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Custom Plan
            </Button>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => setShowProfileDialog(true)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {showProfileDialog && (
          <ViewFitnessProfile
            profile={fitnessProfile}
            onClose={() => setShowProfileDialog(false)}
            onEdit={() => {
              setShowProfileDialog(false)
              setShowEditDialog(true)
            }}
          />
        )}

        {showEditDialog && (
          <PersonalizedPlansJourney
            userId=""
            profile={fitnessProfile}
            isEditing={true}
            onClose={() => setShowEditDialog(false)}
            onComplete={handleProfileComplete}
          />
        )}

        {showCreateWizard && (
          <PlanCreationWizard
            profile={fitnessProfile}
            onClose={() => setShowCreateWizard(false)}
            onComplete={handlePlansCreated}
          />
        )}
      </>
    )
  }

  // Has both profile and plans - show summary and actions
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-orange-500" />
                Your Custom Plans
              </CardTitle>
              <CardDescription>
                {workoutPlans.length} workout weeks • {mealPlans.length} meal weeks
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowProfileDialog(true)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowViewPlans(true)}>
                <Eye className="mr-2 h-4 w-4" />
                View Plans
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteAllPlans} disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Workout Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workoutPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between text-sm">
                      <span>Week {plan.week_number}</span>
                      <Badge variant={plan.completed ? "default" : "secondary"}>
                        {plan.completed ? "Completed" : "Active"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Meal Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mealPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between text-sm">
                      <span>Week {plan.week_number}</span>
                      <Badge variant={plan.completed ? "default" : "secondary"}>
                        {plan.completed ? "Completed" : "Active"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 text-center">
            <Button onClick={() => setShowCreateWizard(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create More Plans
            </Button>
          </div>
        </CardContent>
      </Card>

      {showProfileDialog && (
        <ViewFitnessProfile
          profile={fitnessProfile}
          onClose={() => setShowProfileDialog(false)}
          onEdit={() => {
            setShowProfileDialog(false)
            setShowEditDialog(true)
          }}
        />
      )}

      {showEditDialog && (
        <PersonalizedPlansJourney
          userId=""
          profile={fitnessProfile}
          isEditing={true}
          onClose={() => setShowEditDialog(false)}
          onComplete={handleProfileComplete}
        />
      )}

      {showCreateWizard && (
        <PlanCreationWizard
          profile={fitnessProfile}
          onClose={() => setShowCreateWizard(false)}
          onComplete={handlePlansCreated}
        />
      )}

      {showViewPlans && (
        <ViewGeneratedPlans
          workoutPlans={workoutPlans}
          mealPlans={mealPlans}
          profile={fitnessProfile}
          onClose={() => setShowViewPlans(false)}
          onRefresh={fetchData}
        />
      )}
    </>
  )
}

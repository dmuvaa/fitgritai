"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dumbbell,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Trash2,
  Edit,
  RefreshCw,
  Settings,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { PersonalizedPlansJourney } from "./personalized-plans-journey"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface ViewPersonalizedPlansProps {
  userId?: string
}

export function ViewPersonalizedPlans({ userId }: ViewPersonalizedPlansProps) {
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([])
  const [mealPlans, setMealPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewProfileDialog, setShowViewProfileDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const [workoutRes, mealRes] = await Promise.all([
        fetch("/api/personalized-plans?type=workout"),
        fetch("/api/personalized-plans?type=meal"),
      ])

      const workoutData = await workoutRes.json()
      const mealData = await mealRes.json()

      setWorkoutPlans(workoutData.plans || [])
      setMealPlans(mealData.plans || [])
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAllPlans = async () => {
    setDeleting(true)
    try {
      // Delete all workout plans
      for (const plan of workoutPlans) {
        await fetch(`/api/personalized-plans/${plan.id}`, {
          method: "DELETE",
        })
      }

      // Delete all meal plans
      for (const plan of mealPlans) {
        await fetch(`/api/personalized-plans/${plan.id}`, {
          method: "DELETE",
        })
      }

      // Delete fitness profile
      await fetch("/api/personalized-plans/questionnaire", {
        method: "DELETE",
      })

      toast({
        title: "Success",
        description: "All plans have been deleted successfully.",
      })

      // Refresh the page to show empty state
      window.location.reload()
    } catch (error) {
      console.error("Error deleting plans:", error)
      toast({
        title: "Error",
        description: "Failed to delete plans. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleRegeneratePlans = async () => {
    setLoading(true)
    try {
      // Delete existing plans but keep the profile
      for (const plan of [...workoutPlans, ...mealPlans]) {
        await fetch(`/api/personalized-plans/${plan.id}`, {
          method: "DELETE",
        })
      }

      // Regenerate plans
      const response = await fetch("/api/personalized-plans/generate", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate plans")
      }

      toast({
        title: "Success! 🎉",
        description: "Your plans have been regenerated successfully!",
      })

      // Refresh plans
      await fetchPlans()
    } catch (error) {
      console.error("Error regenerating plans:", error)
      toast({
        title: "Error",
        description: "Failed to regenerate plans. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading your personalized plans...</div>
        </CardContent>
      </Card>
    )
  }

  if (workoutPlans.length === 0 && mealPlans.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-600">
            <p>No personalized plans yet.</p>
            <p className="text-sm mt-2">Click "Create Personalized Plan" to get started!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentWorkoutPlan = workoutPlans.find((p) => p.week_number === selectedWeek)
  const currentMealPlan = mealPlans.find((p) => p.week_number === selectedWeek)

  return (
    <div className="space-y-6">
      {/* Week Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your 4-Week Personalized Plan</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowViewProfileDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                View Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Plan
              </Button>
              <Button variant="outline" size="sm" onClick={handleRegeneratePlans} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
              disabled={selectedWeek === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="default" className="px-4">
              Week {selectedWeek}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedWeek(Math.min(4, selectedWeek + 1))}
              disabled={selectedWeek === 4}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="workout" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workout">
            <Dumbbell className="h-4 w-4 mr-2" />
            Workout Plan
          </TabsTrigger>
          <TabsTrigger value="meal">
            <Utensils className="h-4 w-4 mr-2" />
            Meal Plan
          </TabsTrigger>
        </TabsList>

        {/* Workout Plan */}
        <TabsContent value="workout">
          {currentWorkoutPlan ? (
            <div className="space-y-4">
              {currentWorkoutPlan.content.workouts.map((workout: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{workout.day}</CardTitle>
                        <CardDescription>{workout.focus}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {workout.duration} min
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm">
                      <p className="font-medium">Warm-up:</p>
                      <p className="text-gray-600">{workout.warmup}</p>
                    </div>

                    <div className="space-y-3">
                      {workout.exercises.map((exercise: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{exercise.name}</p>
                            <p className="text-sm text-gray-600">{exercise.notes}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">
                              {exercise.sets} x {exercise.reps}
                            </p>
                            <p className="text-gray-600">Rest: {exercise.rest}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-sm">
                      <p className="font-medium">Cool-down:</p>
                      <p className="text-gray-600">{workout.cooldown}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-600">No workout plan for this week</CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Meal Plan */}
        <TabsContent value="meal">
          {currentMealPlan ? (
            <div className="space-y-6">
              {currentMealPlan.content.dailyPlan.map((day: any, dayIndex: number) => (
                <Card key={dayIndex}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{day.day}</CardTitle>
                      <Badge variant="outline">
                        <Flame className="h-3 w-3 mr-1" />
                        {day.totalCalories} cal
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {day.meals.map((meal: any, mealIndex: number) => (
                      <div key={mealIndex} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{meal.name}</p>
                            <p className="text-sm text-gray-600">{meal.time}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">{meal.calories} cal</p>
                            <p className="text-xs text-gray-600">
                              P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                            </p>
                          </div>
                        </div>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {meal.items.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {/* Grocery List */}
              {currentMealPlan.content.groceryList && (
                <Card>
                  <CardHeader>
                    <CardTitle>Grocery List for Week {selectedWeek}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-2 gap-2">
                      {currentMealPlan.content.groceryList.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-600">No meal plan for this week</CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your personalized plans and fitness profile. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAllPlans} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {showEditDialog && (
        <PersonalizedPlansJourney
          userId={userId || ""}
          profile={null}
          isEditing={true}
          onClose={() => setShowEditDialog(false)}
          onComplete={() => {
            setShowEditDialog(false)
            handleRegeneratePlans()
          }}
        />
      )}

      {/* View Profile Dialog */}
      {showViewProfileDialog && (
        <ViewFitnessProfile
          userId={userId || ""}
          onClose={() => setShowViewProfileDialog(false)}
          onEdit={() => {
            setShowViewProfileDialog(false)
            setShowEditDialog(true)
          }}
        />
      )}
    </div>
  )
}

function ViewFitnessProfile({
  userId,
  onClose,
  onEdit,
}: {
  userId: string
  onClose: () => void
  onEdit: () => void
}) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      console.log("[CLIENT] Fetching profile from /api/personalized-plans/questionnaire")
      const response = await fetch("/api/personalized-plans/questionnaire", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      })

      console.log("[CLIENT] Response status:", response.status)
      console.log("[CLIENT] Response URL:", response.url)

      const contentType = response.headers.get("content-type")
      console.log("[CLIENT] Content-Type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[CLIENT] Expected JSON but got HTML. First 500 chars:", text.substring(0, 500))
        throw new Error("Server returned HTML instead of JSON. The API route may not be working correctly.")
      }

      const data = await response.json()
      console.log("[CLIENT] Profile response:", data)

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch profile: ${response.status}`)
      }

      if (data.profile) {
        setProfile(data.profile)
      } else {
        setError("No profile found. Please create a plan first.")
      }
    } catch (error: any) {
      console.error("[CLIENT] Error fetching profile:", error)
      setError(error.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Your Fitness Profile</span>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogTitle>
          <DialogDescription>
            Your personalized fitness and nutrition preferences used to generate workout and meal plans.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-3 text-gray-600">Loading your profile...</span>
          </div>
        ) : error || !profile ? (
          <div className="py-8 text-center">
            <p className="text-red-600 mb-4">{error || "No fitness profile found."}</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Goals */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-2">Primary Goals</h3>
              <div className="flex flex-wrap gap-2">
                {profile.primary_goals && profile.primary_goals.length > 0 ? (
                  profile.primary_goals.map((goal: string) => (
                    <Badge key={goal} variant="secondary">
                      {goal}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No goals set</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Fitness Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-1">Fitness Level</h3>
                <p className="capitalize">{profile.fitness_level || "Not set"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-1">Workout Location</h3>
                <p className="capitalize">{profile.workout_location || "Not set"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-1">Workout Duration</h3>
                <p>{profile.workout_duration ? `${profile.workout_duration} minutes` : "Not set"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-1">Preferred Time</h3>
                <p>{profile.preferred_workout_time || "Not set"}</p>
              </div>
            </div>

            <Separator />

            {/* Workout Days */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-2">Workout Days</h3>
              <div className="flex flex-wrap gap-2">
                {profile.workout_days && profile.workout_days.length > 0 ? (
                  profile.workout_days.map((day: string) => (
                    <Badge key={day} variant="default">
                      {day}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No workout days set</p>
                )}
              </div>
            </div>

            {/* Rest Days */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-2">Rest Days</h3>
              <div className="flex flex-wrap gap-2">
                {profile.rest_days && profile.rest_days.length > 0 ? (
                  profile.rest_days.map((day: string) => (
                    <Badge key={day} variant="outline">
                      {day}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No rest days set</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Strength Levels */}
            {profile.strength_levels &&
              Object.keys(profile.strength_levels).some((key) => profile.strength_levels[key]) && (
                <>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500 mb-2">Current Strength Levels</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(profile.strength_levels)
                        .filter(([_, value]: [string, any]) => value)
                        .map(([key, value]: [string, any]) => {
                          const label = key
                            .replace(/([A-Z])/g, " $1")
                            .trim()
                            .split(" ")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")
                          return (
                            <div key={key}>
                              <span className="text-gray-600">{label}:</span>{" "}
                              <span className="font-medium">{value} kg</span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

            {/* Equipment */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-2">Available Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {profile.available_equipment && profile.available_equipment.length > 0 ? (
                  <>
                    {profile.available_equipment.slice(0, 10).map((item: string) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                    {profile.available_equipment.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.available_equipment.length - 10} more
                      </Badge>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No equipment listed</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Dietary Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-1">Meals Per Day</h3>
                <p>{profile.meals_per_day || "Not set"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-500 mb-1">Cooking Time</h3>
                <p>{profile.cooking_time ? `${profile.cooking_time} minutes` : "Not set"}</p>
              </div>
            </div>

            {/* Accessible Foods */}
            {profile.accessible_foods && profile.accessible_foods.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">Accessible Foods</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.accessible_foods.map((food: string) => (
                      <Badge key={food} variant="secondary" className="text-xs">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Dietary Restrictions */}
            {profile.disliked_foods && profile.disliked_foods.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">Disliked Foods</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.disliked_foods.map((food: string) => (
                      <Badge key={food} variant="destructive" className="text-xs">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Preferred Activities */}
            {profile.preferred_activities && profile.preferred_activities.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">Preferred Activities</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_activities.map((activity: string) => (
                      <Badge key={activity} variant="outline" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Injuries/Limitations */}
            {profile.injuries_limitations && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-1">Injuries & Limitations</h3>
                  <p className="text-sm text-gray-600">{profile.injuries_limitations}</p>
                </div>
              </>
            )}

            {/* Additional Notes */}
            {profile.additional_notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-1">Additional Notes</h3>
                  <p className="text-sm text-gray-600">{profile.additional_notes}</p>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

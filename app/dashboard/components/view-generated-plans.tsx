"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Dumbbell, Utensils, Flame, TrendingUp, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ViewGeneratedPlansProps {
  onClose: () => void
  onRefresh: () => void
}

export function ViewGeneratedPlans({ onClose, onRefresh }: ViewGeneratedPlansProps) {
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([])
  const [mealPlans, setMealPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
      toast({
        title: "Error",
        description: "Failed to load plans",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWeek = async (planType: "workout" | "meal") => {
    if (!confirm(`Delete ${planType} plan for Week ${selectedWeek}?`)) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/personalized-plans?type=${planType}&week=${selectedWeek}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete plan")

      toast({
        title: "Plan Deleted",
        description: `Week ${selectedWeek} ${planType} plan has been deleted.`,
      })

      // Refresh plans
      await fetchPlans()

      // Switch to another week if current one is deleted
      const remainingPlans = planType === "workout" ? workoutPlans : mealPlans
      const otherWeeks = remainingPlans.filter((p) => p.week_number !== selectedWeek)
      if (otherWeeks.length > 0) {
        setSelectedWeek(otherWeeks[0].week_number)
      } else {
        onRefresh()
        onClose()
      }
    } catch (error) {
      console.error("Error deleting plan:", error)
      toast({
        title: "Error",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const currentWorkoutPlan = workoutPlans.find((p) => p.week_number === selectedWeek)
  const currentMealPlan = mealPlans.find((p) => p.week_number === selectedWeek)

  const availableWeeks = Array.from(
    new Set([...workoutPlans.map((p) => p.week_number), ...mealPlans.map((p) => p.week_number)]),
  ).sort((a, b) => a - b)

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Loading Plans...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Your Personalized Plans</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Week Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                  disabled={selectedWeek === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-lg font-semibold">Week {selectedWeek}</div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedWeek(Math.min(availableWeeks.length, selectedWeek + 1))}
                  disabled={selectedWeek === availableWeeks.length}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {availableWeeks.map((week) => (
                  <Button
                    key={week}
                    variant={selectedWeek === week ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedWeek(week)}
                  >
                    Week {week}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tabs for Workout and Meal Plans */}
            <Tabs defaultValue="workout" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="workout">
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Workout Plan
                </TabsTrigger>
                <TabsTrigger value="meal">
                  <Utensils className="mr-2 h-4 w-4" />
                  Meal Plan
                </TabsTrigger>
              </TabsList>

              {/* Workout Plan Tab */}
              <TabsContent value="workout" className="space-y-4">
                {currentWorkoutPlan ? (
                  <>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteWeek("workout")}
                        disabled={deleting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete This Week
                      </Button>
                    </div>
                    {currentWorkoutPlan.content.workouts.map((workout: any, idx: number) => (
                      <Card key={idx}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{workout.day}</CardTitle>
                              <p className="text-sm text-muted-foreground">{workout.focus}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                <Clock className="mr-1 h-3 w-3" />
                                {workout.duration} min
                              </Badge>
                              <Badge variant={workout.intensity === "intense" ? "destructive" : "default"}>
                                {workout.intensity}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Warm-up */}
                          <div>
                            <h4 className="font-semibold mb-2">Warm-up:</h4>
                            <p className="text-sm text-muted-foreground">{workout.warmup}</p>
                          </div>

                          {/* Exercises */}
                          <div className="space-y-3">
                            {workout.exercises.map((exercise: any, exerciseIdx: number) => (
                              <div key={exerciseIdx} className="border rounded-lg p-3">
                                <div className="font-semibold mb-1">{exercise.name}</div>
                                <div className="text-sm text-muted-foreground">{exercise.notes}</div>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                  <span>
                                    <strong>{exercise.sets}</strong> × <strong>{exercise.reps}</strong>
                                  </span>
                                  {exercise.weight && exercise.weight !== "N/A" && (
                                    <span>
                                      <TrendingUp className="inline h-3 w-3 mr-1" />
                                      {exercise.weight}
                                    </span>
                                  )}
                                  <span>Rest: {exercise.rest}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Cool-down */}
                          <div>
                            <h4 className="font-semibold mb-2">Cool-down:</h4>
                            <p className="text-sm text-muted-foreground">{workout.cooldown}</p>
                          </div>

                          {workout.notes && (
                            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                              <p className="text-sm">
                                <strong>Notes:</strong> {workout.notes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No workout plan for Week {selectedWeek}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Meal Plan Tab */}
              <TabsContent value="meal" className="space-y-4">
                {currentMealPlan ? (
                  <>
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteWeek("meal")}
                        disabled={deleting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete This Week
                      </Button>
                    </div>
                    {currentMealPlan.content.dailyPlan.map((day: any, idx: number) => (
                      <Card key={idx}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{day.day}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {day.isWorkoutDay ? "Training Day 💪" : "Rest Day 😌"}
                              </p>
                            </div>
                            <Badge variant="outline">
                              <Flame className="mr-1 h-3 w-3" />
                              {day.totalCalories} kcal
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {day.meals.map((meal: any, mealIdx: number) => (
                            <div key={mealIdx} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <div className="font-semibold">{meal.name}</div>
                                  <div className="text-xs text-muted-foreground">{meal.time}</div>
                                </div>
                                <Badge variant="secondary">{meal.calories} kcal</Badge>
                              </div>
                              <ul className="text-sm space-y-1 mb-2">
                                {meal.items.map((item: string, itemIdx: number) => (
                                  <li key={itemIdx} className="text-muted-foreground">
                                    • {item}
                                  </li>
                                ))}
                              </ul>
                              <div className="flex gap-4 text-xs text-muted-foreground">
                                <span>Protein: {meal.protein}g</span>
                                <span>Carbs: {meal.carbs}g</span>
                                <span>Fat: {meal.fat}g</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No meal plan for Week {selectedWeek}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Dumbbell,
  Apple,
  AlertCircle,
  Info,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

interface PlanCreationWizardProps {
  profile: any
  onClose: () => void
  onComplete: () => void
}

interface WorkoutDay {
  date: string
  dayName: string
  enabled: boolean
  muscleGroups: string[]
  activities: string[]
  duration: number
  intensity: "light" | "moderate" | "intense"
  notes: string
}

interface MealDay {
  date: string
  dayName: string
  isWorkoutDay: boolean
  breakfast: boolean
  preWorkout: boolean
  postWorkout: boolean
  lunch: boolean
  dinner: boolean
  snacks: boolean
}

const muscleGroupOptions = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Core",
  "Abs",
]

const activityOptions = [
  "Cardio - Running",
  "Cardio - Cycling",
  "Cardio - Swimming",
  "Cardio - Rowing",
  "HIIT",
  "Yoga",
  "Pilates",
  "Stretching",
  "Sports",
  "Active Recovery",
]

export function PlanCreationWizard({ profile, onClose, onComplete }: PlanCreationWizardProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [numWeeks, setNumWeeks] = useState(4)
  const [currentWeek, setCurrentWeek] = useState(1)
  const [progressiveOverload, setProgressiveOverload] = useState({
    enabled: true,
    weightIncrease: 2.5,
    repIncrease: 1,
    setIncrease: 0,
  })

  const [workoutSchedule, setWorkoutSchedule] = useState<Map<number, WorkoutDay[]>>(new Map())
  const [mealSchedule, setMealSchedule] = useState<Map<number, MealDay[]>>(new Map())

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  useEffect(() => {
    initializeSchedules()
  }, [])

  const initializeSchedules = () => {
    const today = new Date()
    const workoutMap = new Map<number, WorkoutDay[]>()
    const mealMap = new Map<number, MealDay[]>()

    // Calculate the Sunday that ends this week
    const currentDayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek

    for (let week = 1; week <= 4; week++) {
      const weekWorkouts: WorkoutDay[] = []
      const weekMeals: MealDay[] = []

      let weekStartDate: Date
      let weekEndDate: Date

      if (week === 1) {
        // Week 1: Today until this Sunday
        weekStartDate = new Date(today)
        weekEndDate = new Date(today)
        weekEndDate.setDate(today.getDate() + daysUntilSunday)
      } else {
        // Week 2+: Monday to Sunday
        // Previous week ended on a Sunday, so this week starts the next day (Monday)
        const previousWeekEnd = new Date(today)
        previousWeekEnd.setDate(today.getDate() + daysUntilSunday + (week - 2) * 7)

        weekStartDate = new Date(previousWeekEnd)
        weekStartDate.setDate(previousWeekEnd.getDate() + 1) // Monday after previous Sunday

        weekEndDate = new Date(weekStartDate)
        weekEndDate.setDate(weekStartDate.getDate() + 6) // Sunday (6 days later)
      }

      // Generate days for this week
      const currentDate = new Date(weekStartDate)
      while (currentDate <= weekEndDate) {
        const dateStr = currentDate.toISOString().split("T")[0]
        const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
          currentDate.getDay()
        ]

        weekWorkouts.push({
          date: dateStr,
          dayName,
          enabled: false,
          muscleGroups: [],
          activities: [],
          duration: 60,
          intensity: "moderate",
          notes: "",
        })

        weekMeals.push({
          date: dateStr,
          dayName,
          isWorkoutDay: false,
          breakfast: true,
          preWorkout: false,
          postWorkout: false,
          lunch: true,
          dinner: true,
          snacks: false,
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      workoutMap.set(week, weekWorkouts)
      mealMap.set(week, weekMeals)
    }

    setWorkoutSchedule(workoutMap)
    setMealSchedule(mealMap)
  }

  const toggleWorkoutDay = (weekNum: number, dayIndex: number) => {
    setWorkoutSchedule((prev) => {
      const newMap = new Map(prev)
      const weekDays = [...(newMap.get(weekNum) || [])]
      weekDays[dayIndex] = { ...weekDays[dayIndex], enabled: !weekDays[dayIndex].enabled }
      newMap.set(weekNum, weekDays)
      return newMap
    })
  }

  const updateWorkoutDay = (weekNum: number, dayIndex: number, updates: Partial<WorkoutDay>) => {
    setWorkoutSchedule((prev) => {
      const newMap = new Map(prev)
      const weekDays = [...(newMap.get(weekNum) || [])]
      weekDays[dayIndex] = { ...weekDays[dayIndex], ...updates }
      newMap.set(weekNum, weekDays)
      return newMap
    })
  }

  const toggleMuscleGroup = (weekNum: number, dayIndex: number, group: string) => {
    setWorkoutSchedule((prev) => {
      const newMap = new Map(prev)
      const weekDays = [...(newMap.get(weekNum) || [])]
      const day = weekDays[dayIndex]
      const muscleGroups = day.muscleGroups.includes(group)
        ? day.muscleGroups.filter((g) => g !== group)
        : [...day.muscleGroups, group]
      weekDays[dayIndex] = { ...day, muscleGroups }
      newMap.set(weekNum, weekDays)
      return newMap
    })
  }

  const toggleActivity = (weekNum: number, dayIndex: number, activity: string) => {
    setWorkoutSchedule((prev) => {
      const newMap = new Map(prev)
      const weekDays = [...(newMap.get(weekNum) || [])]
      const day = weekDays[dayIndex]
      const activities = day.activities.includes(activity)
        ? day.activities.filter((a) => a !== activity)
        : [...day.activities, activity]
      weekDays[dayIndex] = { ...day, activities }
      newMap.set(weekNum, weekDays)
      return newMap
    })
  }

  const updateMealDay = (weekNum: number, dayIndex: number, mealType: keyof MealDay, value: boolean) => {
    if (mealType === "date" || mealType === "dayName" || mealType === "isWorkoutDay") return

    setMealSchedule((prev) => {
      const newMap = new Map(prev)
      const weekDays = [...(newMap.get(weekNum) || [])]
      weekDays[dayIndex] = { ...weekDays[dayIndex], [mealType]: value }
      newMap.set(weekNum, weekDays)
      return newMap
    })
  }

  useEffect(() => {
    setMealSchedule((prev) => {
      const newMap = new Map(prev)
      workoutSchedule.forEach((workoutDays, weekNum) => {
        const mealDays = [...(newMap.get(weekNum) || [])]
        workoutDays.forEach((workout, idx) => {
          if (mealDays[idx]) {
            mealDays[idx] = { ...mealDays[idx], isWorkoutDay: workout.enabled }
            if (workout.enabled) {
              mealDays[idx].preWorkout = true
              mealDays[idx].postWorkout = true
            } else {
              mealDays[idx].preWorkout = false
              mealDays[idx].postWorkout = false
            }
          }
        })
        newMap.set(weekNum, mealDays)
      })
      return newMap
    })
  }, [workoutSchedule])

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const workoutData: any[] = []
      const mealData: any[] = []

      workoutSchedule.forEach((weekDays, weekNum) => {
        weekDays.forEach((day) => {
          if (day.enabled) {
            workoutData.push({
              week: weekNum,
              date: day.date,
              dayName: day.dayName,
              muscleGroups: day.muscleGroups,
              activities: day.activities,
              duration: day.duration,
              intensity: day.intensity,
              notes: day.notes,
            })
          }
        })
      })

      mealSchedule.forEach((weekDays, weekNum) => {
        weekDays.forEach((day) => {
          mealData.push({
            week: weekNum,
            date: day.date,
            dayName: day.dayName,
            isWorkoutDay: day.isWorkoutDay,
            breakfast: day.breakfast,
            preWorkout: day.preWorkout,
            postWorkout: day.postWorkout,
            lunch: day.lunch,
            dinner: day.dinner,
            snacks: day.snacks,
          })
        })
      })

      const response = await fetch("/api/personalized-plans/generate-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numWeeks,
          workouts: workoutData,
          meals: mealData,
          progressiveOverload,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate plans")
      }

      toast({
        title: "Success! 🎉",
        description: "Your custom plans have been generated!",
      })

      onComplete()
    } catch (error: any) {
      console.error("Error generating plans:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate plans. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return numWeeks > 0
    if (step === 2) {
      let hasWorkout = false
      workoutSchedule.forEach((weekDays) => {
        weekDays.forEach((day) => {
          if (day.enabled && (day.muscleGroups.length > 0 || day.activities.length > 0)) {
            hasWorkout = true
          }
        })
      })
      return hasWorkout
    }
    if (step === 3) return true
    if (step === 4) return true
    return false
  }

  const currentWeekWorkouts = workoutSchedule.get(currentWeek) || []
  const currentWeekMeals = mealSchedule.get(currentWeek) || []

  // Get week date range for display
  const getWeekDateRange = (weekNum: number) => {
    const weekDays = workoutSchedule.get(weekNum)
    if (!weekDays || weekDays.length === 0) return ""

    const firstDay = new Date(weekDays[0].date)
    const lastDay = new Date(weekDays[weekDays.length - 1].date)

    return `${firstDay.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${lastDay.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-orange-500" />
            Create Your Custom Plan
          </DialogTitle>
          <DialogDescription>Design a personalized workout and meal plan that fits your schedule</DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <ScrollArea className="max-h-[calc(90vh-280px)] px-6">
          <div className="space-y-4 pr-4 pb-4">
            {step === 1 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <CardTitle>How Many Weeks?</CardTitle>
                    </div>
                    <CardDescription>Choose how many weeks you want to plan ahead (up to 4 weeks)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((weeks) => (
                        <Card
                          key={weeks}
                          className={`cursor-pointer transition-all ${
                            numWeeks === weeks ? "border-orange-500 border-2 bg-orange-50" : "hover:border-orange-200"
                          }`}
                          onClick={() => setNumWeeks(weeks)}
                        >
                          <CardHeader>
                            <CardTitle className="text-lg text-center">
                              {weeks} Week{weeks > 1 ? "s" : ""}
                            </CardTitle>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>

                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Week 1 runs from today until this Sunday. All subsequent weeks run Monday-Sunday.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Progressive Overload Settings</CardTitle>
                    <CardDescription>Configure how your workouts will progress week over week</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="progressive-overload"
                        checked={progressiveOverload.enabled}
                        onCheckedChange={(checked) =>
                          setProgressiveOverload((prev) => ({ ...prev, enabled: checked as boolean }))
                        }
                      />
                      <Label htmlFor="progressive-overload">Enable Progressive Overload</Label>
                    </div>

                    {progressiveOverload.enabled && (
                      <div className="grid grid-cols-3 gap-4 pl-6">
                        <div className="space-y-2">
                          <Label>Weight Increase per Week (kg)</Label>
                          <Input
                            type="number"
                            step="0.5"
                            value={progressiveOverload.weightIncrease}
                            onChange={(e) =>
                              setProgressiveOverload((prev) => ({
                                ...prev,
                                weightIncrease: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Rep Increase per Week</Label>
                          <Input
                            type="number"
                            value={progressiveOverload.repIncrease}
                            onChange={(e) =>
                              setProgressiveOverload((prev) => ({
                                ...prev,
                                repIncrease: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Set Increase per 2 Weeks</Label>
                          <Input
                            type="number"
                            value={progressiveOverload.setIncrease}
                            onChange={(e) =>
                              setProgressiveOverload((prev) => ({
                                ...prev,
                                setIncrease: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-orange-500" />
                      <CardTitle>Design Your Workouts</CardTitle>
                    </div>
                    <CardDescription>
                      Choose which days to train and what muscle groups or activities for each day
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      {Array.from({ length: numWeeks }, (_, i) => i + 1).map((week) => (
                        <div key={week} className="flex flex-col">
                          <Button
                            variant={currentWeek === week ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentWeek(week)}
                          >
                            Week {week}
                          </Button>
                          <span className="text-xs text-gray-500 mt-1 text-center">{getWeekDateRange(week)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {currentWeekWorkouts.map((workout, idx) => (
                        <Card key={workout.date} className={workout.enabled ? "border-orange-300" : ""}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={workout.enabled}
                                  onCheckedChange={() => toggleWorkoutDay(currentWeek, idx)}
                                />
                                <div>
                                  <p className="font-semibold">{workout.dayName}</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(workout.date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                              {workout.enabled && (
                                <Badge variant="secondary">
                                  {workout.muscleGroups.length + workout.activities.length} selected
                                </Badge>
                              )}
                            </div>
                          </CardHeader>

                          {workout.enabled && (
                            <CardContent className="space-y-4 pt-0">
                              <Tabs defaultValue="muscle">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="muscle">Muscle Groups</TabsTrigger>
                                  <TabsTrigger value="activities">Activities</TabsTrigger>
                                </TabsList>

                                <TabsContent value="muscle" className="mt-4">
                                  <div className="grid grid-cols-3 gap-2">
                                    {muscleGroupOptions.map((group) => (
                                      <div key={group} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${workout.date}-${group}`}
                                          checked={workout.muscleGroups.includes(group)}
                                          onCheckedChange={() => toggleMuscleGroup(currentWeek, idx, group)}
                                        />
                                        <Label htmlFor={`${workout.date}-${group}`} className="text-sm">
                                          {group}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </TabsContent>

                                <TabsContent value="activities" className="mt-4">
                                  <div className="grid grid-cols-2 gap-2">
                                    {activityOptions.map((activity) => (
                                      <div key={activity} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${workout.date}-${activity}`}
                                          checked={workout.activities.includes(activity)}
                                          onCheckedChange={() => toggleActivity(currentWeek, idx, activity)}
                                        />
                                        <Label htmlFor={`${workout.date}-${activity}`} className="text-sm">
                                          {activity}
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </TabsContent>
                              </Tabs>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm">Duration (minutes)</Label>
                                  <Input
                                    type="number"
                                    value={workout.duration}
                                    onChange={(e) =>
                                      updateWorkoutDay(currentWeek, idx, {
                                        duration: Number.parseInt(e.target.value) || 45,
                                      })
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm">Intensity</Label>
                                  <Select
                                    value={workout.intensity}
                                    onValueChange={(val: any) => updateWorkoutDay(currentWeek, idx, { intensity: val })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="light">Light</SelectItem>
                                      <SelectItem value="moderate">Moderate</SelectItem>
                                      <SelectItem value="intense">Intense</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm">Notes (optional)</Label>
                                <Textarea
                                  placeholder="Any specific requirements or preferences for this day..."
                                  value={workout.notes}
                                  onChange={(e) => updateWorkoutDay(currentWeek, idx, { notes: e.target.value })}
                                  rows={2}
                                />
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Apple className="h-5 w-5 text-orange-500" />
                      <CardTitle>Design Your Meal Plan</CardTitle>
                    </div>
                    <CardDescription>
                      Select which meals you want planned. Pre/post-workout meals are auto-enabled on workout days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      {Array.from({ length: numWeeks }, (_, i) => i + 1).map((week) => (
                        <div key={week} className="flex flex-col">
                          <Button
                            variant={currentWeek === week ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentWeek(week)}
                          >
                            Week {week}
                          </Button>
                          <span className="text-xs text-gray-500 mt-1 text-center">{getWeekDateRange(week)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {currentWeekMeals.map((meal, idx) => (
                        <Card key={meal.date} className={meal.isWorkoutDay ? "border-orange-200 bg-orange-50" : ""}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold flex items-center gap-2">
                                  {meal.dayName}
                                  {meal.isWorkoutDay && (
                                    <Badge variant="default" className="text-xs">
                                      Workout Day
                                    </Badge>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(meal.date).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              <Badge variant="secondary">
                                {
                                  [
                                    meal.breakfast,
                                    meal.preWorkout,
                                    meal.postWorkout,
                                    meal.lunch,
                                    meal.dinner,
                                    meal.snacks,
                                  ].filter(Boolean).length
                                }{" "}
                                meals
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${meal.date}-breakfast`}
                                  checked={meal.breakfast}
                                  onCheckedChange={(checked) =>
                                    updateMealDay(currentWeek, idx, "breakfast", checked as boolean)
                                  }
                                />
                                <Label htmlFor={`${meal.date}-breakfast`}>Breakfast</Label>
                              </div>

                              {meal.isWorkoutDay && (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${meal.date}-pre`}
                                      checked={meal.preWorkout}
                                      onCheckedChange={(checked) =>
                                        updateMealDay(currentWeek, idx, "preWorkout", checked as boolean)
                                      }
                                    />
                                    <Label htmlFor={`${meal.date}-pre`}>Pre-Workout</Label>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${meal.date}-post`}
                                      checked={meal.postWorkout}
                                      onCheckedChange={(checked) =>
                                        updateMealDay(currentWeek, idx, "postWorkout", checked as boolean)
                                      }
                                    />
                                    <Label htmlFor={`${meal.date}-post`}>Post-Workout</Label>
                                  </div>
                                </>
                              )}

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${meal.date}-lunch`}
                                  checked={meal.lunch}
                                  onCheckedChange={(checked) =>
                                    updateMealDay(currentWeek, idx, "lunch", checked as boolean)
                                  }
                                />
                                <Label htmlFor={`${meal.date}-lunch`}>Lunch</Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${meal.date}-dinner`}
                                  checked={meal.dinner}
                                  onCheckedChange={(checked) =>
                                    updateMealDay(currentWeek, idx, "dinner", checked as boolean)
                                  }
                                />
                                <Label htmlFor={`${meal.date}-dinner`}>Dinner</Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${meal.date}-snacks`}
                                  checked={meal.snacks}
                                  onCheckedChange={(checked) =>
                                    updateMealDay(currentWeek, idx, "snacks", checked as boolean)
                                  }
                                />
                                <Label htmlFor={`${meal.date}-snacks`}>Snacks</Label>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Plan</CardTitle>
                    <CardDescription>Verify your selections before generating your custom plan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Plan Duration</h3>
                      <p className="text-sm text-gray-600">{numWeeks} weeks</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Progressive Overload</h3>
                      {progressiveOverload.enabled ? (
                        <div className="text-sm text-gray-600">
                          <p>• Weight: +{progressiveOverload.weightIncrease}kg per week</p>
                          <p>• Reps: +{progressiveOverload.repIncrease} per week</p>
                          <p>• Sets: +{progressiveOverload.setIncrease} every 2 weeks</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Disabled</p>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Workout Days</h3>
                      {Array.from({ length: numWeeks }, (_, i) => i + 1).map((week) => {
                        const weekWorkouts = workoutSchedule.get(week) || []
                        const enabledWorkouts = weekWorkouts.filter((w) => w.enabled)
                        return (
                          <div key={week} className="text-sm text-gray-600 mb-1">
                            Week {week} ({getWeekDateRange(week)}): {enabledWorkouts.length} workout days
                          </div>
                        )
                      })}
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Once generated, AI will create detailed workout routines with specific exercises, sets, reps,
                        and rest periods based on your fitness profile, available equipment, and current strength
                        levels.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || loading}
            className="min-w-[100px]"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {step < totalSteps ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="min-w-[100px]">
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={loading || !canProceed()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 min-w-[150px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Plans
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

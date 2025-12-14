"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Sparkles, ChevronRight, ChevronLeft, Calendar, Dumbbell, Apple, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getWeekRanges, formatDateRange, getDayOfWeek, getTodayInNairobi } from "@/lib/date-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PlanGenerationJourneyProps {
  open: boolean
  onClose: () => void
  fitnessProfile: any
  onComplete: () => void
}

interface WorkoutDay {
  date: Date
  enabled: boolean
  focuses: string[]
  duration: number
  preferredTime: string
}

interface MealDay {
  date: Date
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  snacks: boolean
}

const muscleGroupOptions = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Legs", "Glutes", "Core", "Conditioning"]
const durationOptions = [30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180]

export function PlanGenerationJourney({ open, onClose, fitnessProfile, onComplete }: PlanGenerationJourneyProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [numWeeks, setNumWeeks] = useState(4)
  const [weekRanges, setWeekRanges] = useState<Array<{ start: Date; end: Date; weekNumber: number }>>([])
  const [selectedWeek, setSelectedWeek] = useState(1)

  // Workout state: Map<weekNumber, Map<dateString, WorkoutDay>>
  const [workoutSchedule, setWorkoutSchedule] = useState<Map<number, Map<string, WorkoutDay>>>(new Map())

  // Meal state: Map<weekNumber, Map<dateString, MealDay>>
  const [mealSchedule, setMealSchedule] = useState<Map<number, Map<string, MealDay>>>(new Map())

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  useEffect(() => {
    if (open) {
      const today = getTodayInNairobi()
      const ranges = getWeekRanges(today, 4)
      setWeekRanges(ranges)
      initializeSchedules(ranges)
    }
  }, [open])

  const initializeSchedules = (ranges: Array<{ start: Date; end: Date; weekNumber: number }>) => {
    const workoutMap = new Map<number, Map<string, WorkoutDay>>()
    const mealMap = new Map<number, Map<string, MealDay>>()

    ranges.forEach((range) => {
      const weekWorkouts = new Map<string, WorkoutDay>()
      const weekMeals = new Map<string, MealDay>()

      const currentDate = new Date(range.start)
      while (currentDate <= range.end) {
        const dateStr = currentDate.toISOString().split("T")[0]

        weekWorkouts.set(dateStr, {
          date: new Date(currentDate),
          enabled: false,
          focuses: [],
          duration: 45,
          preferredTime: "18:00",
        })

        weekMeals.set(dateStr, {
          date: new Date(currentDate),
          breakfast: true,
          lunch: true,
          dinner: true,
          snacks: false,
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      workoutMap.set(range.weekNumber, weekWorkouts)
      mealMap.set(range.weekNumber, weekMeals)
    })

    setWorkoutSchedule(workoutMap)
    setMealSchedule(mealMap)
  }

  const toggleWorkoutDay = (weekNum: number, dateStr: string) => {
    setWorkoutSchedule((prev) => {
      const newMap = new Map(prev)
      const weekMap = new Map(newMap.get(weekNum))
      const day = weekMap.get(dateStr)
      if (day) {
        weekMap.set(dateStr, { ...day, enabled: !day.enabled })
        newMap.set(weekNum, weekMap)
      }
      return newMap
    })
  }

  const updateWorkoutDay = (weekNum: number, dateStr: string, updates: Partial<WorkoutDay>) => {
    setWorkoutSchedule((prev) => {
      const newMap = new Map(prev)
      const weekMap = new Map(newMap.get(weekNum))
      const day = weekMap.get(dateStr)
      if (day) {
        weekMap.set(dateStr, { ...day, ...updates })
        newMap.set(weekNum, weekMap)
      }
      return newMap
    })
  }

  const toggleMuscleGroup = (weekNum: number, dateStr: string, muscleGroup: string) => {
    setWorkoutSchedule((prev) => {
      const newMap = new Map(prev)
      const weekMap = new Map(newMap.get(weekNum))
      const day = weekMap.get(dateStr)
      if (day) {
        const focuses = day.focuses.includes(muscleGroup)
          ? day.focuses.filter((f) => f !== muscleGroup)
          : [...day.focuses, muscleGroup]
        weekMap.set(dateStr, { ...day, focuses })
        newMap.set(weekNum, weekMap)
      }
      return newMap
    })
  }

  const updateMealDay = (weekNum: number, dateStr: string, mealType: keyof MealDay, value: boolean) => {
    if (mealType === "date") return
    setMealSchedule((prev) => {
      const newMap = new Map(prev)
      const weekMap = new Map(newMap.get(weekNum))
      const day = weekMap.get(dateStr)
      if (day) {
        weekMap.set(dateStr, { ...day, [mealType]: value })
        newMap.set(weekNum, weekMap)
      }
      return newMap
    })
  }

  const hasInjuryConflict = (muscleGroup: string): boolean => {
    if (!fitnessProfile?.injuries_limitations) return false
    const injuries = fitnessProfile.injuries_limitations.toLowerCase()

    if (muscleGroup === "Legs" && (injuries.includes("knee") || injuries.includes("leg"))) return true
    if (muscleGroup === "Back" && injuries.includes("back")) return true
    if (muscleGroup === "Shoulders" && injuries.includes("shoulder")) return true

    return false
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      // Convert schedules to serializable format
      const workoutData: any[] = []
      const mealData: any[] = []

      workoutSchedule.forEach((weekMap, weekNum) => {
        weekMap.forEach((day, dateStr) => {
          if (day.enabled) {
            workoutData.push({
              week: weekNum,
              date: dateStr,
              focuses: day.focuses,
              duration: day.duration,
              preferredTime: day.preferredTime,
            })
          }
        })
      })

      mealSchedule.forEach((weekMap, weekNum) => {
        weekMap.forEach((day, dateStr) => {
          mealData.push({
            week: weekNum,
            date: dateStr,
            breakfast: day.breakfast,
            lunch: day.lunch,
            dinner: day.dinner,
            snacks: day.snacks,
          })
        })
      })

      const response = await fetch("/api/personalized-plans/generate-from-selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numWeeks,
          workouts: workoutData,
          meals: mealData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate plans")
      }

      toast({
        title: "Success! 🎉",
        description: "Your personalized plans have been generated!",
      })

      onComplete()
    } catch (error) {
      console.error("Error generating plans:", error)
      toast({
        title: "Error",
        description: "Failed to generate plans. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) return numWeeks > 0
    if (step === 2) {
      // At least one workout day should be enabled
      let hasWorkout = false
      workoutSchedule.forEach((weekMap) => {
        weekMap.forEach((day) => {
          if (day.enabled && day.focuses.length > 0) hasWorkout = true
        })
      })
      return hasWorkout
    }
    if (step === 3) return true
    return false
  }

  const currentWeekRange = weekRanges[selectedWeek - 1]
  const currentWeekWorkouts = workoutSchedule.get(selectedWeek)
  const currentWeekMeals = mealSchedule.get(selectedWeek)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-orange-500" />
            Generate Your Personalized Plan
          </DialogTitle>
          <DialogDescription>Walk through this journey to create your custom workout and meal plan</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col px-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Step {step} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="pb-4">
              {step === 1 && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-orange-500" />
                        <CardTitle>Select Your Planning Period</CardTitle>
                      </div>
                      <CardDescription>Choose how many weeks you want to plan ahead</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((weeks) => (
                          <Card
                            key={weeks}
                            className={`cursor-pointer transition-all ${
                              numWeeks === weeks ? "border-orange-500 border-2 bg-orange-50" : "hover:border-orange-200"
                            }`}
                            onClick={() => setNumWeeks(weeks)}
                          >
                            <CardHeader>
                              <CardTitle className="text-lg">
                                {weeks} Week{weeks > 1 ? "s" : ""}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {weekRanges.slice(0, weeks).map((range) => (
                                <div key={range.weekNumber} className="text-sm text-gray-600 mb-1">
                                  Week {range.weekNumber}: {formatDateRange(range.start, range.end)}
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Week 1 starts today ({getTodayInNairobi().toLocaleDateString()}) and runs until Sunday.
                          Subsequent weeks run Monday-Sunday.
                        </AlertDescription>
                      </Alert>
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
                        <CardTitle>Plan Your Workouts</CardTitle>
                      </div>
                      <CardDescription>Select workout days and customize what you want to train</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {weekRanges.slice(0, numWeeks).map((range) => (
                          <Button
                            key={range.weekNumber}
                            variant={selectedWeek === range.weekNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedWeek(range.weekNumber)}
                          >
                            Week {range.weekNumber}
                          </Button>
                        ))}
                      </div>

                      {currentWeekRange && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium">
                            Week {selectedWeek}: {formatDateRange(currentWeekRange.start, currentWeekRange.end)}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3">
                        {currentWeekWorkouts &&
                          Array.from(currentWeekWorkouts.entries()).map(([dateStr, workout]) => (
                            <Card key={dateStr} className={workout.enabled ? "border-orange-300" : ""}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={workout.enabled}
                                      onCheckedChange={() => toggleWorkoutDay(selectedWeek, dateStr)}
                                    />
                                    <div>
                                      <p className="font-semibold">{getDayOfWeek(workout.date)}</p>
                                      <p className="text-sm text-gray-500">
                                        {workout.date.toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                  {workout.enabled && (
                                    <Badge variant="secondary">{workout.focuses.length} focus areas</Badge>
                                  )}
                                </div>
                              </CardHeader>

                              {workout.enabled && (
                                <CardContent className="space-y-4 pt-0">
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium">Focus Areas</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                      {muscleGroupOptions.map((group) => {
                                        const hasConflict = hasInjuryConflict(group)
                                        return (
                                          <div key={group} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`${dateStr}-${group}`}
                                              checked={workout.focuses.includes(group)}
                                              onCheckedChange={() => toggleMuscleGroup(selectedWeek, dateStr, group)}
                                              disabled={hasConflict}
                                            />
                                            <Label
                                              htmlFor={`${dateStr}-${group}`}
                                              className={`text-sm ${hasConflict ? "text-gray-400 line-through" : ""}`}
                                            >
                                              {group}
                                              {hasConflict && (
                                                <span className="ml-1 text-xs text-red-500">(injury)</span>
                                              )}
                                            </Label>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm">Duration (min)</Label>
                                      <Select
                                        value={workout.duration.toString()}
                                        onValueChange={(val) =>
                                          updateWorkoutDay(selectedWeek, dateStr, {
                                            duration: Number.parseInt(val),
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {durationOptions.map((dur) => (
                                            <SelectItem key={dur} value={dur.toString()}>
                                              {dur} min ({(dur / 60).toFixed(1)}h)
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm">Start Time</Label>
                                      <Input
                                        type="time"
                                        value={workout.preferredTime}
                                        onChange={(e) =>
                                          updateWorkoutDay(selectedWeek, dateStr, {
                                            preferredTime: e.target.value,
                                          })
                                        }
                                        className="w-full"
                                      />
                                    </div>
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
                        <CardTitle>Plan Your Meals</CardTitle>
                      </div>
                      <CardDescription>Select which meals you want for each day</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {weekRanges.slice(0, numWeeks).map((range) => (
                          <Button
                            key={range.weekNumber}
                            variant={selectedWeek === range.weekNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedWeek(range.weekNumber)}
                          >
                            Week {range.weekNumber}
                          </Button>
                        ))}
                      </div>

                      {currentWeekRange && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium">
                            Week {selectedWeek}: {formatDateRange(currentWeekRange.start, currentWeekRange.end)}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-3">
                        {currentWeekMeals &&
                          Array.from(currentWeekMeals.entries()).map(([dateStr, mealDay]) => (
                            <Card key={dateStr}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold">{getDayOfWeek(mealDay.date)}</p>
                                    <p className="text-sm text-gray-500">
                                      {mealDay.date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>
                                  <Badge variant="secondary">
                                    {
                                      [mealDay.breakfast, mealDay.lunch, mealDay.dinner, mealDay.snacks].filter(Boolean)
                                        .length
                                    }{" "}
                                    meals
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${dateStr}-breakfast`}
                                      checked={mealDay.breakfast}
                                      onCheckedChange={(checked) =>
                                        updateMealDay(selectedWeek, dateStr, "breakfast", checked as boolean)
                                      }
                                    />
                                    <Label htmlFor={`${dateStr}-breakfast`}>Breakfast</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${dateStr}-lunch`}
                                      checked={mealDay.lunch}
                                      onCheckedChange={(checked) =>
                                        updateMealDay(selectedWeek, dateStr, "lunch", checked as boolean)
                                      }
                                    />
                                    <Label htmlFor={`${dateStr}-lunch`}>Lunch</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${dateStr}-dinner`}
                                      checked={mealDay.dinner}
                                      onCheckedChange={(checked) =>
                                        updateMealDay(selectedWeek, dateStr, "dinner", checked as boolean)
                                      }
                                    />
                                    <Label htmlFor={`${dateStr}-dinner`}>Dinner</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${dateStr}-snacks`}
                                      checked={mealDay.snacks}
                                      onCheckedChange={(checked) =>
                                        updateMealDay(selectedWeek, dateStr, "snacks", checked as boolean)
                                      }
                                    />
                                    <Label htmlFor={`${dateStr}-snacks`}>Snacks</Label>
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
            </div>
          </ScrollArea>

          <div className="flex justify-between pt-4 pb-6 border-t">
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1 || loading}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={loading || !canProceed()}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

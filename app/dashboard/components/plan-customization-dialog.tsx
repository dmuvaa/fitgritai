"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PlanCustomizationDialogProps {
  open: boolean
  onClose: () => void
  fitnessProfile: any
  onComplete: () => void
}

const muscleGroupOptions = [
  "Full Body",
  "Upper Body",
  "Lower Body",
  "Chest",
  "Back",
  "Shoulders",
  "Arms (Biceps & Triceps)",
  "Legs",
  "Core/Abs",
  "Cardio",
  "HIIT",
  "Rest/Active Recovery",
]

const workoutStyleOptions = [
  "Strength Training",
  "Hypertrophy (Muscle Building)",
  "Endurance",
  "Circuit Training",
  "Functional Fitness",
  "Bodyweight Only",
  "Mixed",
]

export function PlanCustomizationDialog({ open, onClose, fitnessProfile, onComplete }: PlanCustomizationDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [workoutSplit, setWorkoutSplit] = useState<Record<string, { focus: string; style: string }>>({})
  const [mealsPerDay, setMealsPerDay] = useState(fitnessProfile?.meals_per_day || 3)
  const [calorieTarget, setCalorieTarget] = useState<"deficit" | "maintenance" | "surplus">("deficit")
  const [mealPreferences, setMealPreferences] = useState<string[]>([])
  const [customMeal, setCustomMeal] = useState("")

  // Initialize workout split from profile
  useState(() => {
    if (fitnessProfile?.workout_days && fitnessProfile.workout_days.length > 0) {
      const initialSplit: Record<string, { focus: string; style: string }> = {}
      fitnessProfile.workout_days.forEach((day: string) => {
        initialSplit[day] = { focus: "Full Body", style: "Mixed" }
      })
      setWorkoutSplit(initialSplit)
    }
  })

  const handleWorkoutFocusChange = (day: string, focus: string) => {
    setWorkoutSplit((prev) => ({
      ...prev,
      [day]: { ...prev[day], focus },
    }))
  }

  const handleWorkoutStyleChange = (day: string, style: string) => {
    setWorkoutSplit((prev) => ({
      ...prev,
      [day]: { ...prev[day], style },
    }))
  }

  const addMealPreference = () => {
    if (customMeal.trim() && !mealPreferences.includes(customMeal.trim())) {
      setMealPreferences([...mealPreferences, customMeal.trim()])
      setCustomMeal("")
    }
  }

  const removeMealPreference = (meal: string) => {
    setMealPreferences(mealPreferences.filter((m) => m !== meal))
  }

  const handleGeneratePlans = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/personalized-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutSplit,
          mealsPerDay,
          calorieTarget,
          mealPreferences,
          useExistingProfile: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate plans")
      }

      toast({
        title: "Success! 🎉",
        description: "Your personalized plans have been created with your custom preferences!",
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

  const canGenerate = Object.keys(workoutSplit).length > 0 && mealsPerDay > 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-orange-500" />
            Customize Your Plans
          </DialogTitle>
          <DialogDescription>Fine-tune your workout and meal plans based on your preferences</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Workout Customization */}
          <Card>
            <CardHeader>
              <CardTitle>Workout Split</CardTitle>
              <CardDescription>Customize what you want to focus on each workout day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fitnessProfile?.workout_days?.map((day: string) => (
                <div key={day} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{day}</h4>
                    <Badge variant="outline">{workoutSplit[day]?.focus || "Not set"}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`focus-${day}`}>Muscle Group / Focus</Label>
                      <Select
                        value={workoutSplit[day]?.focus || ""}
                        onValueChange={(value) => handleWorkoutFocusChange(day, value)}
                      >
                        <SelectTrigger id={`focus-${day}`}>
                          <SelectValue placeholder="Select focus area" />
                        </SelectTrigger>
                        <SelectContent>
                          {muscleGroupOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`style-${day}`}>Workout Style</Label>
                      <Select
                        value={workoutSplit[day]?.style || ""}
                        onValueChange={(value) => handleWorkoutStyleChange(day, value)}
                      >
                        <SelectTrigger id={`style-${day}`}>
                          <SelectValue placeholder="Select workout style" />
                        </SelectTrigger>
                        <SelectContent>
                          {workoutStyleOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Meal Plan Customization */}
          <Card>
            <CardHeader>
              <CardTitle>Meal Plan Preferences</CardTitle>
              <CardDescription>Customize your daily meal plan and calorie targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mealsPerDay">Meals Per Day</Label>
                  <Input
                    id="mealsPerDay"
                    type="number"
                    min={2}
                    max={6}
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(Number.parseInt(e.target.value) || 3)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calorieTarget">Calorie Target</Label>
                  <Select value={calorieTarget} onValueChange={(value: any) => setCalorieTarget(value)}>
                    <SelectTrigger id="calorieTarget">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deficit">Deficit (Weight Loss)</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="surplus">Surplus (Muscle Gain)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Specific Meal Preferences (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={customMeal}
                    onChange={(e) => setCustomMeal(e.target.value)}
                    placeholder="e.g., Include more fish, Prefer quick breakfast"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addMealPreference()
                      }
                    }}
                  />
                  <Button type="button" onClick={addMealPreference}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {mealPreferences.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mealPreferences.map((pref) => (
                      <Badge key={pref} variant="secondary">
                        {pref}
                        <button onClick={() => removeMealPreference(pref)} className="ml-2 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-lg">Plan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Workout Days:</span>
                <span className="font-medium">{Object.keys(workoutSplit).length} days/week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meals Per Day:</span>
                <span className="font-medium">{mealsPerDay} meals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Calorie Strategy:</span>
                <span className="font-medium capitalize">{calorieTarget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">4 weeks</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleGeneratePlans}
              disabled={loading || !canGenerate}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Plans...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate My Plans
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

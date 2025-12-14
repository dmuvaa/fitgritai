"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Dumbbell, Timer, Target, Zap, Loader2 } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import { toast } from "sonner"

interface Exercise {
  id: string
  name: string
  sets?: string
  reps?: string
  weight?: string
  duration?: string
  distance?: string
  intensity?: string
  rest?: string
}

interface ExerciseCategory {
  id: number
  name: string
  description: string
  icon: string
  workout_type: string
}

interface DatabaseExercise {
  id: number
  name: string
  muscle_groups: string[]
  equipment: string
  difficulty_level: string
  workout_type: string
}

interface RevolutionaryActivityLoggingProps {
  userId: string
  onActivityLogged?: () => void
}

export function RevolutionaryActivityLogging({ userId, onActivityLogged }: RevolutionaryActivityLoggingProps) {
  const [loading, setLoading] = useState(false)
  const [workoutType, setWorkoutType] = useState("")
  const [workoutTime, setWorkoutTime] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([{ id: "1", name: "" }])
  const [notes, setNotes] = useState("")

  // Database state
  const [categories, setCategories] = useState<ExerciseCategory[]>([])
  const [availableExercises, setAvailableExercises] = useState<DatabaseExercise[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingExercises, setLoadingExercises] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")

  const workoutTypes = [
    { value: "strength", label: "💪 Strength Training", icon: Dumbbell },
    { value: "cardio", label: "🏃 Cardio", icon: Zap },
    { value: "bodyweight", label: "🤸 Bodyweight", icon: Target },
    { value: "sports", label: "⚽ Sports", icon: Timer },
    { value: "flexibility", label: "🧘 Flexibility", icon: Target },
  ]

  // Load categories when workout type changes
  useEffect(() => {
    if (workoutType && isSupabaseConfigured()) {
      loadCategories()
    }
  }, [workoutType])

  // Load exercises when category changes
  useEffect(() => {
    if (selectedCategory && isSupabaseConfigured()) {
      loadExercises()
    }
  }, [selectedCategory])

  const loadCategories = async () => {
    if (!isSupabaseConfigured()) {
      toast.error("Database not configured. Please set up Supabase.")
      return
    }

    setLoadingCategories(true)
    try {
      const response = await fetch(`/api/exercises/categories?workout_type=${workoutType}`)

      if (response.ok) {
        const categories = await response.json()
        setCategories(categories || [])
      } else {
        const error = await response.json()
        console.error("Failed to load categories:", error)
        toast.error("Failed to load exercise categories")
      }
    } catch (error) {
      console.error("Error loading categories:", error)
      toast.error("Error loading exercise categories")
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadExercises = async () => {
    if (!isSupabaseConfigured()) {
      toast.error("Database not configured. Please set up Supabase.")
      return
    }

    setLoadingExercises(true)
    try {
      const response = await fetch(`/api/exercises?category_id=${selectedCategory}`)

      if (response.ok) {
        const exercises = await response.json()
        setAvailableExercises(exercises || [])
      } else {
        const error = await response.json()
        console.error("Failed to load exercises:", error)
        toast.error("Failed to load exercises")
      }
    } catch (error) {
      console.error("Error loading exercises:", error)
      toast.error("Error loading exercises")
    } finally {
      setLoadingExercises(false)
    }
  }

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: "",
    }
    setExercises([...exercises, newExercise])
  }

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((exercise) => exercise.id !== id))
    }
  }

  const updateExercise = (id: string, field: keyof Exercise, value: string) => {
    setExercises(exercises.map((exercise) => (exercise.id === id ? { ...exercise, [field]: value } : exercise)))
  }

  const renderExerciseFields = (exercise: Exercise, index: number) => {
    const baseFields = (
      <>
        <div className="md:col-span-2">
          <Label className="text-xs font-medium">Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value)
              // Reset exercise name when category changes
              updateExercise(exercise.id, "name", "")
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {loadingCategories ? (
                <SelectItem value="loading" disabled>
                  Loading categories...
                </SelectItem>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label className="text-xs font-medium">Exercise Name</Label>
          <Select
            value={exercise.name}
            onValueChange={(value) => updateExercise(exercise.id, "name", value)}
            disabled={!selectedCategory}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={selectedCategory ? "Select exercise" : "Select category first"} />
            </SelectTrigger>
            <SelectContent>
              {loadingExercises ? (
                <SelectItem value="loading" disabled>
                  Loading exercises...
                </SelectItem>
              ) : (
                <>
                  {availableExercises.map((dbExercise) => (
                    <SelectItem key={dbExercise.id} value={dbExercise.name}>
                      {dbExercise.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">✏️ Custom Exercise</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {exercise.name === "custom" && (
            <Input
              placeholder="Enter custom exercise name"
              className="mt-2"
              onChange={(e) => updateExercise(exercise.id, "name", e.target.value)}
            />
          )}
        </div>
      </>
    )

    switch (workoutType) {
      case "strength":
        return (
          <>
            {baseFields}
            <div>
              <Label className="text-xs font-medium">Sets</Label>
              <Input
                value={exercise.sets || ""}
                onChange={(e) => updateExercise(exercise.id, "sets", e.target.value)}
                placeholder="3"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Reps</Label>
              <Input
                value={exercise.reps || ""}
                onChange={(e) => updateExercise(exercise.id, "reps", e.target.value)}
                placeholder="10"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Weight (kg)</Label>
              <Input
                value={exercise.weight || ""}
                onChange={(e) => updateExercise(exercise.id, "weight", e.target.value)}
                placeholder="50"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Rest (min)</Label>
              <Input
                value={exercise.rest || ""}
                onChange={(e) => updateExercise(exercise.id, "rest", e.target.value)}
                placeholder="2"
                className="mt-1"
              />
            </div>
          </>
        )

      case "cardio":
        return (
          <>
            {baseFields}
            <div>
              <Label className="text-xs font-medium">Duration (min)</Label>
              <Input
                value={exercise.duration || ""}
                onChange={(e) => updateExercise(exercise.id, "duration", e.target.value)}
                placeholder="30"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Distance (km)</Label>
              <Input
                value={exercise.distance || ""}
                onChange={(e) => updateExercise(exercise.id, "distance", e.target.value)}
                placeholder="5"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Intensity</Label>
              <Select
                value={exercise.intensity || ""}
                onValueChange={(value) => updateExercise(exercise.id, "intensity", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very-high">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      case "bodyweight":
        return (
          <>
            {baseFields}
            <div>
              <Label className="text-xs font-medium">Sets</Label>
              <Input
                value={exercise.sets || ""}
                onChange={(e) => updateExercise(exercise.id, "sets", e.target.value)}
                placeholder="3"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Reps/Duration</Label>
              <Input
                value={exercise.reps || ""}
                onChange={(e) => updateExercise(exercise.id, "reps", e.target.value)}
                placeholder="15 or 60s"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Rest (min)</Label>
              <Input
                value={exercise.rest || ""}
                onChange={(e) => updateExercise(exercise.id, "rest", e.target.value)}
                placeholder="1"
                className="mt-1"
              />
            </div>
          </>
        )

      case "sports":
        return (
          <>
            {baseFields}
            <div>
              <Label className="text-xs font-medium">Duration (min)</Label>
              <Input
                value={exercise.duration || ""}
                onChange={(e) => updateExercise(exercise.id, "duration", e.target.value)}
                placeholder="60"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Intensity/Role</Label>
              <Input
                value={exercise.intensity || ""}
                onChange={(e) => updateExercise(exercise.id, "intensity", e.target.value)}
                placeholder="Competitive, Casual, etc."
                className="mt-1"
              />
            </div>
          </>
        )

      case "flexibility":
        return (
          <>
            {baseFields}
            <div>
              <Label className="text-xs font-medium">Duration (min)</Label>
              <Input
                value={exercise.duration || ""}
                onChange={(e) => updateExercise(exercise.id, "duration", e.target.value)}
                placeholder="15"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Intensity</Label>
              <Select
                value={exercise.intensity || ""}
                onValueChange={(value) => updateExercise(exercise.id, "intensity", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gentle">Gentle</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="deep">Deep</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      default:
        return baseFields
    }
  }

  const generateWorkoutSummary = () => {
    const validExercises = exercises.filter((exercise) => exercise.name.trim())
    if (validExercises.length === 0) return ""

    return validExercises
      .map((exercise) => {
        let summary = exercise.name === "custom" ? "Custom Exercise" : exercise.name

        if (workoutType === "strength") {
          const details = []
          if (exercise.sets) details.push(`${exercise.sets} sets`)
          if (exercise.reps) details.push(`${exercise.reps} reps`)
          if (exercise.weight) details.push(`${exercise.weight}kg`)
          if (details.length > 0) summary += ` (${details.join(", ")})`
        } else if (workoutType === "cardio") {
          const details = []
          if (exercise.duration) details.push(`${exercise.duration}min`)
          if (exercise.distance) details.push(`${exercise.distance}km`)
          if (exercise.intensity) details.push(exercise.intensity)
          if (details.length > 0) summary += ` (${details.join(", ")})`
        } else if (workoutType === "bodyweight") {
          const details = []
          if (exercise.sets) details.push(`${exercise.sets} sets`)
          if (exercise.reps) details.push(`${exercise.reps}`)
          if (details.length > 0) summary += ` (${details.join(", ")})`
        } else if (workoutType === "sports" || workoutType === "flexibility") {
          const details = []
          if (exercise.duration) details.push(`${exercise.duration}min`)
          if (exercise.intensity) details.push(exercise.intensity)
          if (details.length > 0) summary += ` (${details.join(", ")})`
        }

        return summary
      })
      .join(", ")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSupabaseConfigured()) {
      toast.error("Database not configured. Please set up Supabase.")
      return
    }

    if (!workoutType || !workoutTime) {
      toast.error("Please select workout type and time")
      return
    }

    const validExercises = exercises.filter((exercise) => exercise.name.trim())
    if (validExercises.length === 0) {
      toast.error("Please add at least one exercise")
      return
    }

    setLoading(true)

    try {
      const workoutDescription = generateWorkoutSummary()

      // Prepare data for API
      const activityData = {
        user_id: userId,
        workout_type: workoutType,
        description: workoutDescription,
        workout_time: workoutTime,
        exercises: JSON.stringify(validExercises),
        notes: notes || null,
        date: new Date().toISOString().split("T")[0],
      }

      const response = await fetch("/api/logs/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} workout logged successfully!`)
        resetForm()
        onActivityLogged?.()
      } else {
        console.error("API Error:", result)
        throw new Error(result.error || "Failed to log workout")
      }
    } catch (error) {
      console.error("Activity log error:", error)
      toast.error(`Error logging workout: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setWorkoutType("")
    setWorkoutTime("")
    setExercises([{ id: "1", name: "" }])
    setNotes("")
    setSelectedCategory("")
    setCategories([])
    setAvailableExercises([])
  }

  if (!isSupabaseConfigured()) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Revolutionary Activity Logging
          </CardTitle>
          <CardDescription>Database not configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Please configure your Supabase database to use the activity logging feature.
            </p>
            <p className="text-sm text-gray-500">
              Check your environment variables and ensure the database tables are set up correctly.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Revolutionary Activity Logging
        </CardTitle>
        <CardDescription>Track workouts with database-driven exercise selection and adaptive forms</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workout Type and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workout_type" className="text-sm font-medium">
                Workout Type *
              </Label>
              <Select value={workoutType} onValueChange={setWorkoutType} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select workout type" />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workout_time" className="text-sm font-medium flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Workout Time *
              </Label>
              <Input
                id="workout_time"
                type="time"
                value={workoutTime}
                onChange={(e) => setWorkoutTime(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Exercises Section */}
          {workoutType && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium">Exercises</Label>
                <Button
                  type="button"
                  onClick={addExercise}
                  variant="outline"
                  size="sm"
                  className="rounded-xl bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Exercise
                </Button>
              </div>

              <div className="space-y-3">
                {exercises.map((exercise, index) => (
                  <Card key={exercise.id} className="p-4 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                      {renderExerciseFields(exercise, index)}
                      <div>
                        {exercises.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeExercise(exercise.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any observations or achievements?"
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Workout Preview */}
          {generateWorkoutSummary() && (
            <div>
              <Label className="text-sm font-medium">Workout Preview</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-xl text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{workoutTypes.find((t) => t.value === workoutType)?.label}</Badge>
                  {workoutTime && <Badge variant="outline">{workoutTime}</Badge>}
                </div>
                <div className="text-gray-700">{generateWorkoutSummary()}</div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !workoutType || !workoutTime || exercises.every((ex) => !ex.name.trim())}
            className="w-full rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Logging Workout...
              </>
            ) : (
              "Log Revolutionary Workout"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Dumbbell, Timer, Target, Zap, Loader2, Clock3 } from "lucide-react"
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

interface SimpleActivityLoggingProps {
  userId: string
  profile?: any
  selectedDate?: string
  onActivityLogged?: () => void
}

export function SimpleActivityLogging({ userId, profile, selectedDate, onActivityLogged }: SimpleActivityLoggingProps) {
  const [loading, setLoading] = useState(false)
  const [workoutType, setWorkoutType] = useState("")
  const [workoutTime, setWorkoutTime] = useState("")
  const [exercises, setExercises] = useState<Exercise[]>([{ id: "1", name: "" }])
  const [notes, setNotes] = useState("")

  const workoutTypes = [
    { value: "bodyweight", label: "🤸 Bodyweight", icon: Target },
    { value: "cardio", label: "🏃 Cardio", icon: Zap },
    { value: "flexibility", label: "🧘 Flexibility", icon: Target },
    { value: "other", label: "🎯 Other", icon: Target },
    { value: "sports", label: "⚽ Sports", icon: Timer },
    { value: "strength", label: "💪 Strength Training", icon: Dumbbell },
  ]

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
      <div className="md:col-span-2">
        <Label className="text-xs font-medium">Exercise Name</Label>
        <Input
          value={exercise.name || ""}
          onChange={(e) => updateExercise(exercise.id, "name", e.target.value)}
          placeholder="Enter exercise name"
          className="mt-1"
        />
      </div>
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
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
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
                placeholder="30"
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
                  <SelectItem value="intense">Intense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      default:
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
          </>
        )
    }
  }

  const generateWorkoutSummary = () => {
    const validExercises = exercises.filter((exercise) => {
      const name = exercise.name
      return name?.trim()
    })
    if (validExercises.length === 0) return ""

    return validExercises
      .map((exercise) => {
        let summary = exercise.name

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
        } else if (workoutType === "sports") {
          const details = []
          if (exercise.duration) details.push(`${exercise.duration}min`)
          if (exercise.intensity) details.push(exercise.intensity)
          if (details.length > 0) summary += ` (${details.join(", ")})`
        } else if (workoutType === "flexibility") {
          const details = []
          if (exercise.duration) details.push(`${exercise.duration}min`)
          if (exercise.intensity) details.push(exercise.intensity)
          if (details.length > 0) summary += ` (${details.join(", ")})`
        } else {
          if (exercise.duration) summary += ` (${exercise.duration}min)`
        }

        return summary
      })
      .join(", ")
  }

  const calculateTotalDuration = () => {
    let total = 0
    exercises.forEach((exercise) => {
      if (exercise.duration) {
        total += Number.parseInt(exercise.duration) || 0
      }
    })
    return total > 0 ? total : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!workoutType || !workoutTime) {
      toast.error("Please select workout type and time")
      return
    }

    const validExercises = exercises.filter((exercise) => {
      const name = exercise.name
      return name?.trim()
    })
    if (validExercises.length === 0) {
      toast.error("Please add at least one exercise")
      return
    }

    setLoading(true)

    try {
      const workoutDescription = generateWorkoutSummary()
      const totalDuration = calculateTotalDuration()
      const logDate = selectedDate || new Date().toISOString().split("T")[0]

      if (!isSupabaseConfigured()) {
        setTimeout(() => {
          toast.success(
            `${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} workout logged successfully! (Demo mode)`,
          )
          resetForm()
          onActivityLogged?.()
        }, 1000)
        setLoading(false)
        return
      }

      const activityData = {
        user_id: userId,
        workout_type: workoutType,
        description: workoutDescription,
        duration: totalDuration,
        workout_time: workoutTime,
        exercises: JSON.stringify(validExercises),
        notes: notes || null,
        date: logDate,
      }

      const response = await fetch("/api/logs/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} workout logged successfully! 💪`)
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <Clock3 className="h-4 w-4 text-blue-600" />
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

      {workoutType && (
        <div>
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <div key={exercise.id} className="p-4 bg-gray-50 rounded-lg">
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
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button
              type="button"
              onClick={addExercise}
              variant="outline"
              size="sm"
              className="w-full rounded-xl bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Exercise
            </Button>
          </div>
        </div>
      )}

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

      {generateWorkoutSummary() && (
        <div>
          <Label className="text-sm font-medium">Workout Preview</Label>
          <div className="mt-1 p-3 bg-gray-50 rounded-xl text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{workoutTypes.find((t) => t.value === workoutType)?.label}</Badge>
              {workoutTime && <Badge variant="outline">{workoutTime}</Badge>}
              {calculateTotalDuration() && <Badge variant="outline">{calculateTotalDuration()} min total</Badge>}
            </div>
            <div className="text-gray-700">{generateWorkoutSummary()}</div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !workoutType || !workoutTime || exercises.every((ex) => !ex.name?.trim())}
        className="w-full rounded-xl"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Logging Workout...
          </>
        ) : (
          "Log Workout"
        )}
      </Button>
    </form>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale, Utensils, Activity, Heart, Calendar } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import { format, parseISO } from "date-fns"

interface QuickLogProps {
  userId: string
}

export function QuickLog({ userId }: QuickLogProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const formatDateDisplay = (dateString: string) => {
    const date = parseISO(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Today"
    } else if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Yesterday"
    } else {
      return format(date, "EEEE, MMMM d")
    }
  }

  const handleWeightLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const weight = formData.get("weight") as string
    const notes = formData.get("notes") as string

    try {
      if (!isSupabaseConfigured()) {
        // Demo mode
        setTimeout(() => {
          setSuccess(`Weight logged successfully for ${formatDateDisplay(selectedDate)}! (Demo mode)`)
          setLoading(false)
          ;(e.target as HTMLFormElement).reset()
        }, 1000)
        return
      }

      const response = await fetch("/api/logs/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight, notes, date: selectedDate }),
      })

      if (response.ok) {
        setSuccess(`Weight logged successfully for ${formatDateDisplay(selectedDate)}!`)
        ;(e.target as HTMLFormElement).reset()
      } else {
        throw new Error("Failed to log weight")
      }
    } catch (error) {
      console.error("Weight log error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMealLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const meal_type = formData.get("meal_type") as string
    const description = formData.get("description") as string
    const calories = formData.get("calories") as string

    try {
      if (!isSupabaseConfigured()) {
        // Demo mode
        setTimeout(() => {
          setSuccess(`Meal logged successfully for ${formatDateDisplay(selectedDate)}! (Demo mode)`)
          setLoading(false)
          ;(e.target as HTMLFormElement).reset()
        }, 1000)
        return
      }

      const response = await fetch("/api/logs/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal_type, description, calories, date: selectedDate }),
      })

      if (response.ok) {
        setSuccess(`Meal logged successfully for ${formatDateDisplay(selectedDate)}!`)
        ;(e.target as HTMLFormElement).reset()
      } else {
        throw new Error("Failed to log meal")
      }
    } catch (error) {
      console.error("Meal log error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleActivityLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const steps = formData.get("steps") as string
    const workout_type = formData.get("workout_type") as string
    const duration = formData.get("duration") as string
    const notes = formData.get("activity_notes") as string

    try {
      if (!isSupabaseConfigured()) {
        // Demo mode
        setTimeout(() => {
          setSuccess(`Activity logged successfully for ${formatDateDisplay(selectedDate)}! (Demo mode)`)
          setLoading(false)
          ;(e.target as HTMLFormElement).reset()
        }, 1000)
        return
      }

      const response = await fetch("/api/logs/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps, workout_type, duration, notes, date: selectedDate }),
      })

      if (response.ok) {
        setSuccess(`Activity logged successfully for ${formatDateDisplay(selectedDate)}!`)
        ;(e.target as HTMLFormElement).reset()
      } else {
        throw new Error("Failed to log activity")
      }
    } catch (error) {
      console.error("Activity log error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMoodLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const mood = formData.get("mood") as string
    const energy = formData.get("energy") as string
    const motivation = formData.get("motivation") as string
    const notes = formData.get("mood_notes") as string

    try {
      if (!isSupabaseConfigured()) {
        // Demo mode
        setTimeout(() => {
          setSuccess(`Mood logged successfully for ${formatDateDisplay(selectedDate)}! (Demo mode)`)
          setLoading(false)
          ;(e.target as HTMLFormElement).reset()
        }, 1000)
        return
      }

      const response = await fetch("/api/logs/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, energy, motivation, notes, date: selectedDate }),
      })

      if (response.ok) {
        setSuccess(`Mood logged successfully for ${formatDateDisplay(selectedDate)}!`)
        ;(e.target as HTMLFormElement).reset()
      } else {
        throw new Error("Failed to log mood")
      }
    } catch (error) {
      console.error("Mood log error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
      <CardHeader>
        <CardTitle>Quick Log</CardTitle>
        <CardDescription>Track your daily progress in one place</CardDescription>

        {/* Date Picker - Always visible */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Calendar className="h-5 w-5 text-blue-600" />
          <div className="flex items-center gap-2">
            <Label htmlFor="log-date" className="text-sm font-medium text-blue-900">
              Logging for:
            </Label>
            <Input
              id="log-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-auto text-sm border-blue-300 focus:border-blue-500"
            />
            <span className="text-sm font-medium text-blue-700">({formatDateDisplay(selectedDate)})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        <Tabs defaultValue="weight" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weight" className="flex items-center gap-1">
              <Scale className="h-4 w-4" />
              Weight
            </TabsTrigger>
            <TabsTrigger value="meal" className="flex items-center gap-1">
              <Utensils className="h-4 w-4" />
              Meal
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Mood
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weight" className="space-y-4">
            <form onSubmit={handleWeightLog} className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  placeholder="75.5"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" name="notes" placeholder="How are you feeling today?" className="mt-1" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging..." : "Log Weight"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="meal" className="space-y-4">
            <form onSubmit={handleMealLog} className="space-y-4">
              <div>
                <Label htmlFor="meal_type">Meal Type</Label>
                <Select name="meal_type" required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">What did you eat?</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Grilled chicken with vegetables..."
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories (optional)</Label>
                <Input id="calories" name="calories" type="number" placeholder="450" className="mt-1" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging..." : "Log Meal"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <form onSubmit={handleActivityLog} className="space-y-4">
              <div>
                <Label htmlFor="steps">Steps</Label>
                <Input id="steps" name="steps" type="number" placeholder="8500" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="workout_type">Workout Type</Label>
                <Input id="workout_type" name="workout_type" placeholder="Running, Gym, Yoga..." className="mt-1" />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" name="duration" type="number" placeholder="30" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="activity_notes">Notes</Label>
                <Textarea id="activity_notes" name="activity_notes" placeholder="How did it go?" className="mt-1" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging..." : "Log Activity"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="mood" className="space-y-4">
            <form onSubmit={handleMoodLog} className="space-y-4">
              <div>
                <Label htmlFor="mood">Mood (1-5)</Label>
                <Select name="mood" required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Low</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Neutral</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="energy">Energy (1-5)</Label>
                <Select name="energy" required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Energy level?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Exhausted</SelectItem>
                    <SelectItem value="2">2 - Tired</SelectItem>
                    <SelectItem value="3">3 - Okay</SelectItem>
                    <SelectItem value="4">4 - Energetic</SelectItem>
                    <SelectItem value="5">5 - Very Energetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="motivation">Motivation (1-5)</Label>
                <Select name="motivation" required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Motivation level?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - None</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Moderate</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="motivation">Motivation (1-5)</Label>
                <Select name="motivation" required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Motivation level?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - None</SelectItem>
                    <SelectItem value="2">2 - Low</SelectItem>
                    <SelectItem value="3">3 - Moderate</SelectItem>
                    <SelectItem value="4">4 - High</SelectItem>
                    <SelectItem value="5">5 - Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="mood_notes">Notes</Label>
                <Textarea
                  id="mood_notes"
                  name="mood_notes"
                  placeholder="What's affecting your mood today?"
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging..." : "Log Mood"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

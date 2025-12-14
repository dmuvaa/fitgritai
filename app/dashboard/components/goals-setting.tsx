"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Target, Save, Loader2 } from "lucide-react"

interface Goals {
  id?: string
  target_weight?: number
  target_date?: string
  weekly_workout_goal?: number
  daily_calorie_goal?: number
  daily_protein_goal?: number
  daily_steps_goal?: number
  notes?: string
}

interface GoalsSettingProps {
  userId?: string
  profile?: any
  onSaved: () => void
}

export function GoalsSetting({ userId, profile, onSaved }: GoalsSettingProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchingGoals, setFetchingGoals] = useState(true)
  const [existingGoals, setExistingGoals] = useState<Goals | null>(null)
  const [formData, setFormData] = useState<Goals>({})

  useEffect(() => {
    fetchExistingGoals()
  }, [])

  const fetchExistingGoals = async () => {
    try {
      setFetchingGoals(true)
      const response = await fetch("/api/goals")
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setExistingGoals(data)
          setFormData({
            target_weight: data.target_weight,
            target_date: data.target_date,
            weekly_workout_goal: data.weekly_workout_goal,
            daily_calorie_goal: data.daily_calorie_goal,
            daily_protein_goal: data.daily_protein_goal,
            daily_steps_goal: data.daily_steps_goal,
            notes: data.notes,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setFetchingGoals(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to save goals")
      }

      const savedGoals = await response.json()

      toast({
        title: "Goals saved!",
        description: "Your fitness goals have been updated successfully.",
      })

      setExistingGoals(savedGoals)
      onSaved()
    } catch (error) {
      console.error("Error saving goals:", error)
      toast({
        title: "Error",
        description: "Failed to save goals. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchingGoals) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {existingGoals ? "Update Your Goals" : "Set Your Fitness Goals"}
        </CardTitle>
        <CardDescription>
          {existingGoals
            ? "Adjust your targets as you progress on your fitness journey"
            : "Define clear targets to track your progress and stay motivated"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Weight Goal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Weight Target</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target_weight">Target Weight (kg)</Label>
                <Input
                  id="target_weight"
                  type="number"
                  step="0.1"
                  value={formData.target_weight || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_weight: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="75.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date || ""}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Activity Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Activity Goals</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weekly_workout_goal">Weekly Workouts</Label>
                <Input
                  id="weekly_workout_goal"
                  type="number"
                  value={formData.weekly_workout_goal || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weekly_workout_goal: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily_steps_goal">Daily Steps</Label>
                <Input
                  id="daily_steps_goal"
                  type="number"
                  value={formData.daily_steps_goal || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      daily_steps_goal: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="10000"
                />
              </div>
            </div>
          </div>

          {/* Nutrition Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nutrition Goals</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="daily_calorie_goal">Daily Calories</Label>
                <Input
                  id="daily_calorie_goal"
                  type="number"
                  value={formData.daily_calorie_goal || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      daily_calorie_goal: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="2000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily_protein_goal">Daily Protein (g)</Label>
                <Input
                  id="daily_protein_goal"
                  type="number"
                  value={formData.daily_protein_goal || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      daily_protein_goal: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="150"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Personal Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Why are these goals important to you? What motivates you?"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {existingGoals ? "Update Goals" : "Save Goals"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

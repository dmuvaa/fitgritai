"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, X, Dumbbell, Target, Calendar, Clock, Apple, AlertCircle } from "lucide-react"

interface ViewFitnessProfileProps {
  profile: any
  onClose: () => void
  onEdit: () => void
}

// Helper function to ensure value is an array
function ensureArray(value: any): any[] {
  if (Array.isArray(value)) return value
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export function ViewFitnessProfile({ profile, onClose, onEdit }: ViewFitnessProfileProps) {
  if (!profile) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No Profile Found</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600">No fitness profile available.</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const primaryGoals = ensureArray(profile.primary_goals)
  const workoutDays = ensureArray(profile.workout_days)
  const restDays = ensureArray(profile.rest_days)
  const availableEquipment = ensureArray(profile.available_equipment)
  const accessibleFoods = ensureArray(profile.accessible_foods)
  const dislikedFoods = ensureArray(profile.disliked_foods)
  const injuriesLimitations = ensureArray(profile.injuries_limitations)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle className="text-2xl">Your Fitness Profile</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Goals & Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Goals & Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Primary Goals</p>
                  <div className="flex flex-wrap gap-2">
                    {primaryGoals.map((goal: string) => (
                      <Badge key={goal} variant="secondary">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Fitness Level</p>
                    <p className="text-base capitalize">{profile.fitness_level || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Workout Experience</p>
                    <p className="text-base">{profile.workout_experience || "Not specified"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Workout Days</p>
                  <div className="flex flex-wrap gap-2">
                    {workoutDays.map((day: string) => (
                      <Badge key={day} variant="default">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Rest Days</p>
                  <div className="flex flex-wrap gap-2">
                    {restDays.map((day: string) => (
                      <Badge key={day} variant="outline">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Session Duration</p>
                  <p className="text-base">{profile.session_duration || "Not specified"} minutes</p>
                </div>
              </CardContent>
            </Card>

            {/* Equipment & Gym */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-orange-500" />
                  Equipment & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Gym Membership</p>
                  <Badge variant={profile.gym_access ? "default" : "secondary"}>
                    {profile.gym_access ? "Yes" : "No"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Equipment</p>
                  <div className="flex flex-wrap gap-2">
                    {availableEquipment.map((equipment: string) => (
                      <Badge key={equipment} variant="secondary">
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Physical Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Physical Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Current Weight</p>
                  <p className="text-base">{profile.current_weight || "Not specified"} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Target Weight</p>
                  <p className="text-base">{profile.target_weight || "Not specified"} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Height</p>
                  <p className="text-base">{profile.height || "Not specified"} cm</p>
                </div>
              </CardContent>
            </Card>

            {/* Nutrition */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Apple className="h-5 w-5 text-orange-500" />
                  Nutrition Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dietary Preference</p>
                    <p className="text-base capitalize">{profile.dietary_preference || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Daily Calorie Target</p>
                    <p className="text-base">{profile.daily_calorie_target || "Not specified"} cal</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Accessible Foods</p>
                  <div className="flex flex-wrap gap-2">
                    {accessibleFoods.map((food: string) => (
                      <Badge key={food} variant="secondary">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
                {dislikedFoods.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Foods to Avoid</p>
                    <div className="flex flex-wrap gap-2">
                      {dislikedFoods.map((food: string) => (
                        <Badge key={food} variant="outline">
                          {food}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Injuries & Limitations */}
            {injuriesLimitations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Injuries & Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {injuriesLimitations.map((item: string) => (
                      <Badge key={item} variant="destructive">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SimpleMealLogging } from "./simple-meal-logging"
import { SimpleActivityLogging } from "./simple-activity-logging"
import { SimpleWeightLogging } from "./simple-weight-logging"
import { SimpleMoodLogging } from "./simple-mood-logging"
import { Scale, Utensils, Dumbbell, Heart } from "lucide-react"

interface SimpleLoggingProps {
  userId: string
  profile: any
}

export function SimpleLogging({ userId, profile }: SimpleLoggingProps) {
  const [activeTab, setActiveTab] = useState("weight")

  const handleDataLogged = () => {
    // Refresh data or show success message
    console.log("Data logged successfully")
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
            Simple Logging
          </CardTitle>
          <CardDescription>
            Quick and easy logging for all your health metrics. Track weight, meals, workouts, and mood in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100/50 rounded-xl p-1">
              <TabsTrigger value="weight" className="rounded-lg">
                <Scale className="h-4 w-4 mr-2" />
                Weight
              </TabsTrigger>
              <TabsTrigger value="meals" className="rounded-lg">
                <Utensils className="h-4 w-4 mr-2" />
                Meals
              </TabsTrigger>
              <TabsTrigger value="workouts" className="rounded-lg">
                <Dumbbell className="h-4 w-4 mr-2" />
                Workouts
              </TabsTrigger>
              <TabsTrigger value="mood" className="rounded-lg">
                <Heart className="h-4 w-4 mr-2" />
                Mood
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weight">
              <SimpleWeightLogging userId={userId} onWeightLogged={handleDataLogged} />
            </TabsContent>

            <TabsContent value="meals">
              <SimpleMealLogging userId={userId} onMealLogged={handleDataLogged} />
            </TabsContent>

            <TabsContent value="workouts">
              <SimpleActivityLogging userId={userId} onActivityLogged={handleDataLogged} />
            </TabsContent>

            <TabsContent value="mood">
              <SimpleMoodLogging userId={userId} onMoodLogged={handleDataLogged} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

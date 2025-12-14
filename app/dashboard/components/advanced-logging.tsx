"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RevolutionaryMealLogging } from "./revolutionary-meal-logging"
import { RevolutionaryActivityLogging } from "./revolutionary-activity-logging"
import { Utensils, Dumbbell, Heart, Brain } from "lucide-react"

interface AdvancedLoggingProps {
  userId: string
  profile: any
}

export function AdvancedLogging({ userId, profile }: AdvancedLoggingProps) {
  const [activeTab, setActiveTab] = useState("meals")

  const handleMealLogged = () => {
    // Refresh data or show success message
    console.log("Meal logged successfully")
  }

  const handleActivityLogged = () => {
    // Refresh data or show success message
    console.log("Activity logged successfully")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Advanced Revolutionary Logging
          </CardTitle>
          <CardDescription>
            Detailed tracking with AI-powered analysis and adaptive forms that change based on your input
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Logging Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/50">
          <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
            <TabsTrigger value="meals" className="rounded-xl">
              <Utensils className="h-4 w-4 mr-2" />
              Meals
            </TabsTrigger>
            <TabsTrigger value="workouts" className="rounded-xl">
              <Dumbbell className="h-4 w-4 mr-2" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="mood" className="rounded-xl">
              <Heart className="h-4 w-4 mr-2" />
              Mood
            </TabsTrigger>
            <TabsTrigger value="weight" className="rounded-xl">
              <span className="text-lg mr-2">⚖️</span>
              Weight
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="meals">
          <RevolutionaryMealLogging userId={userId} onMealLogged={handleMealLogged} />
        </TabsContent>

        <TabsContent value="workouts">
          <RevolutionaryActivityLogging userId={userId} onActivityLogged={handleActivityLogged} />
        </TabsContent>

        <TabsContent value="mood">
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Advanced Mood Tracking
              </CardTitle>
              <CardDescription>
                Coming soon: Detailed mood analysis with emotional patterns and triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Advanced mood tracking will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weight">
          <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                Advanced Weight Tracking
              </CardTitle>
              <CardDescription>Coming soon: Body composition analysis and weight trend predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">⚖️</div>
                <p>Advanced weight tracking will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

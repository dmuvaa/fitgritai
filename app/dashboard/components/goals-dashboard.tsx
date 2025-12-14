"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GoalsView } from "./goals-view"
import { GoalsSetting } from "./goals-setting"
import { Target, Edit } from "lucide-react"

interface GoalsDashboardProps {
  userId?: string
  profile?: any
  goals?: any[]
}

export function GoalsDashboard({ userId, profile, goals }: GoalsDashboardProps) {
  const [activeTab, setActiveTab] = useState("view")

  const handleGoalsSaved = () => {
    // Switch to view tab after saving
    setActiveTab("view")
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            View Progress
          </TabsTrigger>
          <TabsTrigger value="set" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Set Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6">
          <GoalsView goals={goals} profile={profile} onEdit={() => setActiveTab("set")} />
        </TabsContent>

        <TabsContent value="set" className="mt-6">
          <GoalsSetting userId={userId} profile={profile} onSaved={handleGoalsSaved} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scale, Utensils, Activity, Heart, Zap, Calendar } from "lucide-react"
import { SimpleWeightLogging } from "./simple-weight-logging"
import { SimpleMealLogging } from "./simple-meal-logging"
import { SimpleActivityLogging } from "./simple-activity-logging"
import { SimpleMoodLogging } from "./simple-mood-logging"
import { cn } from "@/lib/utils"

interface QuickLoggingProps {
  userId: string
  profile: any
}

type TabType = "weight" | "meal" | "activity" | "mood"

export function QuickLogging({ userId, profile }: QuickLoggingProps) {
  const [activeTab, setActiveTab] = useState<TabType>("weight")
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0]
  })

  const formatDateDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString + "T00:00:00")
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const todayStr = today.toISOString().split("T")[0]
      const yesterdayStr = yesterday.toISOString().split("T")[0]

      if (dateString === todayStr) {
        return "Today"
      } else if (dateString === yesterdayStr) {
        return "Yesterday"
      } else {
        return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
      }
    } catch {
      return dateString
    }
  }

  const handleTabChange = useCallback((tab: TabType) => {
    console.log("Tab changed to:", tab)
    setActiveTab(tab)
  }, [])

  const tabs = [
    { id: "weight" as TabType, label: "Weight", icon: Scale },
    { id: "meal" as TabType, label: "Meal", icon: Utensils },
    { id: "activity" as TabType, label: "Activity", icon: Activity },
    { id: "mood" as TabType, label: "Mood", icon: Heart },
  ]

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Log
        </CardTitle>
        <CardDescription>Fast tracking for busy days</CardDescription>

        {/* Date Picker */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Calendar className="h-4 w-4 text-blue-600" />
          <div className="flex items-center gap-2">
            <Label htmlFor="quick-log-date" className="text-xs font-medium text-blue-900">
              Logging for:
            </Label>
            <Input
              id="quick-log-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-auto text-xs border-blue-300 focus:border-blue-500"
            />
            <span className="text-xs font-medium text-blue-700">({formatDateDisplay(selectedDate)})</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Custom Tab Buttons */}
        <div className="grid w-full grid-cols-4 bg-gray-100/80 p-1 rounded-2xl gap-1 mb-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant="ghost"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "rounded-xl py-2 flex items-center justify-center gap-2 transition-all",
                activeTab === tab.id
                  ? "bg-white shadow-sm text-foreground"
                  : "hover:bg-white/50 text-muted-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "weight" && (
            <SimpleWeightLogging userId={userId} profile={profile} selectedDate={selectedDate} />
          )}
          {activeTab === "meal" && (
            <SimpleMealLogging userId={userId} profile={profile} selectedDate={selectedDate} />
          )}
          {activeTab === "activity" && (
            <SimpleActivityLogging userId={userId} profile={profile} selectedDate={selectedDate} />
          )}
          {activeTab === "mood" && (
            <SimpleMoodLogging userId={userId} profile={profile} selectedDate={selectedDate} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

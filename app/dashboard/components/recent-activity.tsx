"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Utensils, Activity, Heart, Scale, Clock, Calendar, ArrowRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RecentActivityProps {
  userId: string
  profile: any
}

interface ActivityItem {
  id: string
  type: "weight" | "meal" | "activity" | "mood"
  description: string
  timestamp: string
  value?: string
  icon: any
  color: string
}

export function RecentActivity({ userId, profile }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [userId])

  const fetchRecentActivity = async () => {
    if (!isSupabaseConfigured()) {
      // Demo data
      setActivities([
        {
          id: "1",
          type: "weight",
          description: "Logged weight: 78.5 kg",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          value: "78.5 kg",
          icon: Scale,
          color: "orange",
        },
        {
          id: "2",
          type: "meal",
          description: "Logged lunch: Grilled chicken salad",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          value: "450 cal",
          icon: Utensils,
          color: "green",
        },
        {
          id: "3",
          type: "activity",
          description: "Completed workout: 30 min run",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          value: "8,500 steps",
          icon: Activity,
          color: "blue",
        },
        {
          id: "4",
          type: "mood",
          description: "Mood check-in: Feeling great!",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          value: "4/5",
          icon: Heart,
          color: "purple",
        },
      ])
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const allActivities: ActivityItem[] = []

      // Fetch recent weight logs
      const { data: weightLogs } = await supabase
        .from("weight_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(3)

      weightLogs?.forEach((log) => {
        allActivities.push({
          id: `weight-${log.id}`,
          type: "weight",
          description: `Logged weight: ${log.weight} kg`,
          timestamp: log.date,
          value: `${log.weight} kg`,
          icon: Scale,
          color: "orange",
        })
      })

      // Fetch recent meal logs
      const { data: mealLogs } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(3)

      mealLogs?.forEach((log) => {
        allActivities.push({
          id: `meal-${log.id}`,
          type: "meal",
          description: `Logged ${log.meal_type}: ${log.description?.substring(0, 30) || "Meal"}`,
          timestamp: log.date,
          value: log.calories ? `${log.calories} cal` : undefined,
          icon: Utensils,
          color: "green",
        })
      })

      // Fetch recent activity logs
      const { data: activityLogs } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(3)

      activityLogs?.forEach((log) => {
        const exercises = log.exercises ? JSON.parse(log.exercises) : []
        const workoutType = exercises[0]?.name || "Workout"
        allActivities.push({
          id: `activity-${log.id}`,
          type: "activity",
          description: `Completed workout: ${workoutType}`,
          timestamp: log.date,
          value: log.steps ? `${log.steps.toLocaleString()} steps` : undefined,
          icon: Activity,
          color: "blue",
        })
      })

      // Fetch recent mood logs
      const { data: moodLogs } = await supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(3)

      moodLogs?.forEach((log) => {
        const moodText = ["Terrible", "Bad", "Okay", "Good", "Great"][log.mood - 1] || "Unknown"
        allActivities.push({
          id: `mood-${log.id}`,
          type: "mood",
          description: `Mood check-in: ${moodText}`,
          timestamp: log.date,
          value: `${log.mood}/5`,
          icon: Heart,
          color: "purple",
        })
      })

      // Sort all activities by timestamp
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Take top 8 most recent
      setActivities(allActivities.slice(0, 8))
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-lg border-gray-200/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="rounded-2xl shadow-lg border-gray-200/50">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No recent activity yet</p>
            <p className="text-sm text-gray-400">Start logging to see your activity feed here!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      orange: { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-200" },
      green: { bg: "bg-green-100", text: "text-green-600", border: "border-green-200" },
      blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
      purple: { bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
    }
    return colors[color] || colors.blue
  }

  return (
    <Card className="rounded-2xl shadow-lg border-gray-200/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Recent Activity
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          Last 24 hours
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = activity.icon
            const colors = getColorClasses(activity.color)
            const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })

            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className={`${colors.bg} ${colors.border} border p-2 rounded-xl`}>
                  <Icon className={`h-4 w-4 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{timeAgo}</span>
                    {activity.value && (
                      <>
                        <span className="text-xs text-gray-300">•</span>
                        <Badge variant="secondary" className="text-xs">
                          {activity.value}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    // Navigate to logs view
                    const tabMap = {
                      weight: "logs",
                      meal: "logs",
                      activity: "logs",
                      mood: "logs",
                    }
                    // This would ideally trigger tab change in parent
                  }}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>

        {activities.length >= 8 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full bg-transparent" onClick={() => {}}>
              View All Activity
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

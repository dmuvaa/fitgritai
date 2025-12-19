"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  CalendarIcon,
  RefreshCw,
  Brain,
  ChevronLeft,
  ChevronRight,
  Scale,
  Utensils,
  Dumbbell,
  Heart,
  Pencil,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface LogsData {
  weight: any[]
  meals: any[]
  activities: any[]
  moods: any[]
}

interface DayLog {
  date: string
  weight: any | null
  meals: any[]
  activities: any[]
  moods: any[]
}

function formatDateToLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Inline log view components
function WeightLogView({ log, onEdit, onDelete }: { log: any; onEdit: (log: any) => void; onDelete: (log: any) => void }) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Scale className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">Weight Log</p>
            <p className="text-2xl font-bold text-blue-700">{log.weight} kg</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(log)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(log)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
      {log.notes && <p className="text-sm text-blue-600 mt-2">{log.notes}</p>}
    </div>
  )
}

function MealLogList({ logs, onEdit, onDelete }: { logs: any[]; onEdit: (log: any) => void; onDelete: (log: any) => void }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No meals logged</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        <Utensils className="h-4 w-4 text-green-600" />
        Meals ({logs.length})
      </h4>
      {logs.map((meal) => (
        <div key={meal.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-900">{meal.description || "Meal"}</p>
              <div className="flex gap-4 text-sm text-green-700 mt-1">
                {meal.calories && <span>{meal.calories} cal</span>}
                {meal.protein && <span>{meal.protein}g protein</span>}
                {meal.carbs && <span>{meal.carbs}g carbs</span>}
                {meal.fat && <span>{meal.fat}g fat</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(meal)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(meal)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivityLogList({ logs, onEdit, onDelete }: { logs: any[]; onEdit: (log: any) => void; onDelete: (log: any) => void }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Dumbbell className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No activities logged</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-orange-600" />
        Activities ({logs.length})
      </h4>
      {logs.map((activity) => (
        <div key={activity.id} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-orange-900 capitalize">{activity.activity_type || "Activity"}</p>
              <div className="flex gap-4 text-sm text-orange-700 mt-1">
                {activity.duration && <span>{activity.duration} min</span>}
                {activity.calories_burned && <span>{activity.calories_burned} cal burned</span>}
                {activity.intensity && <span className="capitalize">{activity.intensity} intensity</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(activity)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(activity)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MoodLogList({ logs, onEdit, onDelete }: { logs: any[]; onEdit: (log: any) => void; onDelete: (log: any) => void }) {
  const moodEmojis: Record<string, string> = {
    great: "😄",
    good: "🙂",
    okay: "😐",
    poor: "😔",
    terrible: "😢",
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No moods logged</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      <h4 className="font-semibold flex items-center gap-2">
        <Heart className="h-4 w-4 text-pink-600" />
        Moods ({logs.length})
      </h4>
      {logs.map((mood) => (
        <div key={mood.id} className="bg-pink-50 rounded-lg p-4 border border-pink-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{moodEmojis[mood.mood] || "😐"}</span>
              <div>
                <p className="font-medium text-pink-900 capitalize">{mood.mood || "Unknown"}</p>
                {mood.energy_level && (
                  <p className="text-sm text-pink-700">Energy: {mood.energy_level}/10</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(mood)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(mood)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          {mood.notes && <p className="text-sm text-pink-600 mt-2">{mood.notes}</p>}
        </div>
      ))}
    </div>
  )
}

export function ViewMyLogs() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<LogsData>({
    weight: [],
    meals: [],
    activities: [],
    moods: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(formatDateToLocal(new Date()))
  const [analysisResult, setAnalysisResult] = useState<string>("")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; type: string; log: any }>({
    isOpen: false,
    type: "",
    log: null,
  })
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; type: string; log: any }>({
    isOpen: false,
    type: "",
    log: null,
  })
  const [editForm, setEditForm] = useState<any>({})
  const [deleting, setDeleting] = useState(false)

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/logs/all?days=90")

      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data = await response.json()
      setLogs(data)
    } catch (err) {
      console.error("Error fetching logs:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch logs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleEdit = (log: any, type: string) => {
    setEditForm({ ...log })
    setEditDialog({ isOpen: true, type, log })
  }

  const handleDelete = (log: any, type: string) => {
    setDeleteDialog({ isOpen: true, type, log })
  }

  const handleSaveEdit = async () => {
    try {
      let endpoint = ""
      const data = editForm

      if (editDialog.type === "meals") {
        endpoint = `/api/logs/meals/${data.id}`
      } else if (editDialog.type === "weight") {
        endpoint = `/api/logs/weight/${data.id}`
      } else if (editDialog.type === "activity") {
        endpoint = `/api/logs/activity/${data.id}`
      } else if (editDialog.type === "mood") {
        endpoint = `/api/logs/mood/${data.id}`
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update log")
      }

      toast({
        title: "Success!",
        description: "Log updated successfully",
      })

      await fetchLogs()
      setEditDialog({ isOpen: false, type: "", log: null })
    } catch (err) {
      console.error("Error updating log:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update log",
        variant: "destructive",
      })
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      let endpoint = ""

      if (deleteDialog.type === "meals") {
        endpoint = `/api/logs/meals/${deleteDialog.log.id}`
      } else if (deleteDialog.type === "weight") {
        endpoint = `/api/logs/weight/${deleteDialog.log.id}`
      } else if (deleteDialog.type === "activity") {
        endpoint = `/api/logs/activity/${deleteDialog.log.id}`
      } else if (deleteDialog.type === "mood") {
        endpoint = `/api/logs/mood/${deleteDialog.log.id}`
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete log")
      }

      toast({
        title: "Deleted!",
        description: `${deleteDialog.type} log deleted successfully`,
      })

      await fetchLogs()
      setDeleteDialog({ isOpen: false, type: "", log: null })
    } catch (err) {
      console.error("Error deleting log:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete log",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleAnalyze = async (date: string) => {
    try {
      setAnalyzing(true)
      setSelectedDate(date)
      setAnalysisResult("")
      setError(null)

      const dayLog = groupedLogs().find((log) => log.date === date)
      if (!dayLog) {
        throw new Error("No logs found for this date")
      }

      const profileResponse = await fetch("/api/user/profile")
      let profile = null
      if (profileResponse.ok) {
        profile = await profileResponse.json()
      }

      const analysisData = {
        date,
        profile: profile || {},
        logs: {
          weight: dayLog.weight,
          meals: dayLog.meals,
          activities: dayLog.activities,
          moods: dayLog.moods,
        },
      }

      const response = await fetch("/api/analyze-daily-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze logs")
      }

      const data = await response.json()
      setAnalysisResult(data.analysis)
    } catch (err) {
      console.error("Error analyzing logs:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze logs")
    } finally {
      setAnalyzing(false)
    }
  }

  const groupedLogs = (): DayLog[] => {
    const dateMap = new Map<string, DayLog>()

    const allDates = new Set<string>()
    logs.weight.forEach((log) => allDates.add(log.date))
    logs.meals.forEach((log) => allDates.add(log.date))
    logs.activities.forEach((log) => allDates.add(log.date))
    logs.moods.forEach((log) => allDates.add(log.date))

    allDates.forEach((date) => {
      dateMap.set(date, {
        date,
        weight: null,
        meals: [],
        activities: [],
        moods: [],
      })
    })

    logs.weight.forEach((log) => {
      const dayLog = dateMap.get(log.date)
      if (dayLog) {
        dayLog.weight = log
      }
    })

    logs.meals.forEach((log) => {
      const dayLog = dateMap.get(log.date)
      if (dayLog) {
        dayLog.meals.push(log)
      }
    })

    logs.activities.forEach((log) => {
      const dayLog = dateMap.get(log.date)
      if (dayLog) {
        dayLog.activities.push(log)
      }
    })

    logs.moods.forEach((log) => {
      const dayLog = dateMap.get(log.date)
      if (dayLog) {
        dayLog.moods.push(log)
      }
    })

    return Array.from(dateMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const hasLogsOnDate = (dateString: string): boolean => {
    return groupedLogs().some((log) => log.date === dateString)
  }

  const getDaysInMonth = (date: Date): { date: Date; dateString: string }[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: { date: Date; dateString: string }[] = []

    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const paddingDate = new Date(year, month, -i)
      days.push({
        date: paddingDate,
        dateString: formatDateToLocal(paddingDate),
      })
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day)
      days.push({
        date: currentDate,
        dateString: formatDateToLocal(currentDate),
      })
    }

    return days
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00")
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayString = formatDateToLocal(today)
    const yesterdayString = formatDateToLocal(yesterday)

    if (dateString === todayString) {
      return "Today"
    } else if (dateString === yesterdayString) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading your logs...</span>
      </div>
    )
  }

  if (error && !logs.weight.length && !logs.meals.length) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={fetchLogs} className="mt-2" size="sm">
          Try Again
        </Button>
      </Alert>
    )
  }

  const dailyLogs = groupedLogs()
  const selectedDayLog = dailyLogs.find((log) => log.date === selectedDate)
  const daysInMonth = getDaysInMonth(currentMonth)
  const todayString = formatDateToLocal(new Date())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">My Logs</h2>
        </div>
        <Button onClick={fetchLogs} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Calendar */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm sticky top-24">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button onClick={goToPreviousMonth} variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-lg">
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardTitle>
                <Button onClick={goToNextMonth} variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, index) => {
                  const { date, dateString } = day
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                  const hasLogs = hasLogsOnDate(dateString)
                  const isSelected = dateString === selectedDate
                  const isToday = dateString === todayString

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(dateString)}
                      disabled={!isCurrentMonth}
                      className={cn(
                        "aspect-square p-2 text-sm rounded-lg transition-colors relative",
                        isCurrentMonth ? "hover:bg-gray-100" : "text-gray-300 cursor-not-allowed",
                        isSelected && "bg-blue-600 text-white hover:bg-blue-700",
                        !isSelected && hasLogs && "bg-green-100 text-green-900",
                        !isSelected && !hasLogs && isCurrentMonth && "bg-red-50 text-red-900",
                        isToday && !isSelected && "ring-2 ring-blue-400",
                      )}
                    >
                      <span className="relative z-10">{date.getDate()}</span>
                      {hasLogs && !isSelected && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded" />
                  <span>Has logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-50 rounded" />
                  <span>No logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded" />
                  <span>Selected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Selected day logs */}
        <div className="lg:col-span-2 space-y-4">
          {selectedDayLog ? (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {formatDate(selectedDate)}
                  </CardTitle>
                  <Button
                    onClick={() => handleAnalyze(selectedDate)}
                    disabled={analyzing}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Get Daily Analysis
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {analysisResult && (
                  <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Coach Analysis
                    </h4>
                    <div className="text-sm text-purple-800 whitespace-pre-wrap">{analysisResult}</div>
                  </div>
                )}

                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="weight">Weight</TabsTrigger>
                    <TabsTrigger value="meals">Meals</TabsTrigger>
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                    <TabsTrigger value="moods">Moods</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4 mt-4">
                    {selectedDayLog.weight && (
                      <WeightLogView
                        log={selectedDayLog.weight}
                        onEdit={(log) => handleEdit(log, "weight")}
                        onDelete={(log) => handleDelete(log, "weight")}
                      />
                    )}

                    {selectedDayLog.meals.length > 0 && (
                      <MealLogList
                        logs={selectedDayLog.meals}
                        onEdit={(log) => handleEdit(log, "meals")}
                        onDelete={(log) => handleDelete(log, "meals")}
                      />
                    )}

                    {selectedDayLog.activities.length > 0 && (
                      <ActivityLogList
                        logs={selectedDayLog.activities}
                        onEdit={(log) => handleEdit(log, "activity")}
                        onDelete={(log) => handleDelete(log, "activity")}
                      />
                    )}

                    {selectedDayLog.moods.length > 0 && (
                      <MoodLogList
                        logs={selectedDayLog.moods}
                        onEdit={(log) => handleEdit(log, "mood")}
                        onDelete={(log) => handleDelete(log, "mood")}
                      />
                    )}

                    {!selectedDayLog.weight &&
                      selectedDayLog.meals.length === 0 &&
                      selectedDayLog.activities.length === 0 &&
                      selectedDayLog.moods.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No logs for this date</p>
                        </div>
                      )}
                  </TabsContent>

                  <TabsContent value="weight" className="mt-4">
                    {selectedDayLog.weight ? (
                      <WeightLogView
                        log={selectedDayLog.weight}
                        onEdit={(log) => handleEdit(log, "weight")}
                        onDelete={(log) => handleDelete(log, "weight")}
                      />
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Scale className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No weight logged</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="meals" className="mt-4">
                    <MealLogList
                      logs={selectedDayLog.meals}
                      onEdit={(log) => handleEdit(log, "meals")}
                      onDelete={(log) => handleDelete(log, "meals")}
                    />
                  </TabsContent>

                  <TabsContent value="activities" className="mt-4">
                    <ActivityLogList
                      logs={selectedDayLog.activities}
                      onEdit={(log) => handleEdit(log, "activity")}
                      onDelete={(log) => handleDelete(log, "activity")}
                    />
                  </TabsContent>

                  <TabsContent value="moods" className="mt-4">
                    <MoodLogList
                      logs={selectedDayLog.moods}
                      onEdit={(log) => handleEdit(log, "mood")}
                      onDelete={(log) => handleDelete(log, "mood")}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a date from the calendar</p>
                  <p className="text-sm">Click on any date to view your logs</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => !open && setEditDialog({ isOpen: false, type: "", log: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editDialog.type} Log</DialogTitle>
            <DialogDescription>Make changes to your log entry.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editDialog.type === "weight" && (
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={editForm.weight || ""}
                  onChange={(e) => setEditForm({ ...editForm, weight: parseFloat(e.target.value) })}
                />
              </div>
            )}
            {editDialog.type === "meals" && (
              <>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={editForm.calories || ""}
                      onChange={(e) => setEditForm({ ...editForm, calories: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={editForm.protein || ""}
                      onChange={(e) => setEditForm({ ...editForm, protein: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ isOpen: false, type: "", log: null })}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, type: "", log: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteDialog.type} log? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ isOpen: false, type: "", log: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

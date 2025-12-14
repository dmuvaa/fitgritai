"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Heart, Loader2, Zap, Target } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import { toast } from "sonner"

interface SimpleMoodLoggingProps {
  userId: string
  profile?: any
  selectedDate?: string
  onMoodLogged?: () => void
}

export function SimpleMoodLogging({ userId, profile, selectedDate, onMoodLogged }: SimpleMoodLoggingProps) {
  const [loading, setLoading] = useState(false)
  const [mood, setMood] = useState([5])
  const [energyLevel, setEnergyLevel] = useState([5])
  const [motivationLevel, setMotivationLevel] = useState([5])
  const [notes, setNotes] = useState("")

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return "😢"
    if (value <= 4) return "😐"
    if (value <= 6) return "🙂"
    if (value <= 8) return "😊"
    return "😄"
  }

  const getEnergyEmoji = (value: number) => {
    if (value <= 2) return "😴"
    if (value <= 4) return "😑"
    if (value <= 6) return "😐"
    if (value <= 8) return "😃"
    return "⚡"
  }

  const getMotivationEmoji = (value: number) => {
    if (value <= 2) return "😞"
    if (value <= 4) return "😕"
    if (value <= 6) return "😐"
    if (value <= 8) return "😤"
    return "🔥"
  }

  const getMoodLabel = (value: number) => {
    if (value <= 2) return "Very Low"
    if (value <= 4) return "Low"
    if (value <= 6) return "Neutral"
    if (value <= 8) return "Good"
    return "Excellent"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    try {
      if (!isSupabaseConfigured()) {
        setTimeout(() => {
          toast.success("Mood logged successfully! (Demo mode)")
          resetForm()
          onMoodLogged?.()
        }, 1000)
        setLoading(false)
        return
      }

      const moodData = {
        user_id: userId,
        mood: mood[0],
        energy_level: energyLevel[0],
        motivation_level: motivationLevel[0],
        notes: notes || null,
        date: selectedDate || new Date().toISOString().split("T")[0],
      }

      const response = await fetch("/api/logs/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moodData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Mood logged successfully! 💙")
        resetForm()
        onMoodLogged?.()
      } else {
        console.error("API Error:", result)
        throw new Error(result.error || "Failed to log mood")
      }
    } catch (error) {
      console.error("Mood log error:", error)
      toast.error(`Error logging mood: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setMood([5])
    setEnergyLevel([5])
    setMotivationLevel([5])
    setNotes("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mood Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-600" />
            Overall Mood
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getMoodEmoji(mood[0])}</span>
            <Badge variant="secondary">{getMoodLabel(mood[0])}</Badge>
          </div>
        </div>
        <Slider value={mood} onValueChange={setMood} max={10} min={1} step={1} className="w-full" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Very Low</span>
          <span>Neutral</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Energy Level Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            Energy Level
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getEnergyEmoji(energyLevel[0])}</span>
            <Badge variant="secondary">{getMoodLabel(energyLevel[0])}</Badge>
          </div>
        </div>
        <Slider value={energyLevel} onValueChange={setEnergyLevel} max={10} min={1} step={1} className="w-full" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Exhausted</span>
          <span>Moderate</span>
          <span>Energized</span>
        </div>
      </div>

      {/* Motivation Level Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            Motivation Level
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getMotivationEmoji(motivationLevel[0])}</span>
            <Badge variant="secondary">{getMoodLabel(motivationLevel[0])}</Badge>
          </div>
        </div>
        <Slider
          value={motivationLevel}
          onValueChange={setMotivationLevel}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>No Drive</span>
          <span>Moderate</span>
          <span>Highly Motivated</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="text-sm font-medium">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What's affecting your mood today? Any thoughts or observations..."
          className="mt-1"
          rows={3}
        />
      </div>

      {/* Mood Summary */}
      <div>
        <Label className="text-sm font-medium">Today's Summary</Label>
        <div className="mt-1 p-3 bg-gray-50 rounded-xl text-sm">
          <div className="flex items-center gap-4 text-center">
            <div className="flex-1">
              <div className="text-2xl mb-1">{getMoodEmoji(mood[0])}</div>
              <div className="text-xs text-gray-600">Mood: {mood[0]}/10</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl mb-1">{getEnergyEmoji(energyLevel[0])}</div>
              <div className="text-xs text-gray-600">Energy: {energyLevel[0]}/10</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl mb-1">{getMotivationEmoji(motivationLevel[0])}</div>
              <div className="text-xs text-gray-600">Motivation: {motivationLevel[0]}/10</div>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full rounded-xl">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Logging Mood...
          </>
        ) : (
          "Log Mood"
        )}
      </Button>
    </form>
  )
}

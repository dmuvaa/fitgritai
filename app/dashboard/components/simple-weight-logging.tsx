"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { isSupabaseConfigured } from "@/lib/supabase-utils"

interface SimpleWeightLoggingProps {
  userId: string
  profile?: any
  selectedDate?: string
  onWeightLogged?: () => void
}

export function SimpleWeightLogging({ userId, profile, selectedDate, onWeightLogged }: SimpleWeightLoggingProps) {
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!isSupabaseConfigured()) {
        setTimeout(() => {
          toast.success("Weight logged successfully! (Demo mode)")
          setWeight("")
          setNotes("")
          onWeightLogged?.()
        }, 1000)
        setLoading(false)
        return
      }

      const response = await fetch("/api/logs/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          weight: Number.parseFloat(weight),
          date: selectedDate || new Date().toISOString().split("T")[0],
          notes: notes || null,
        }),
      })

      if (!response.ok) throw new Error("Failed to log weight")

      toast.success("Weight logged successfully! 💪")
      setWeight("")
      setNotes("")
      onWeightLogged?.()
    } catch (error) {
      toast.error("Failed to log weight. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="weight" className="text-sm font-medium">
          Weight (kg) *
        </Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="75.5"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="weight_notes" className="text-sm font-medium">
          Notes (Optional)
        </Label>
        <Textarea
          id="weight_notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling today?"
          className="mt-1"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading || !weight} className="w-full rounded-xl">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Logging Weight...
          </>
        ) : (
          "Log Weight"
        )}
      </Button>
    </form>
  )
}

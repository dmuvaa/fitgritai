"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Loader2, Sparkles, Clock } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import { toast } from "sonner"

interface Food {
  id: string
  name: string
  quantity: string
  unit: string
}

interface NutritionAnalysis {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  confidence: number
  reasoning: string
  suggestions: string
}

interface SimpleMealLoggingProps {
  userId: string
  profile?: any
  selectedDate?: string
  onMealLogged?: () => void
}

export function SimpleMealLogging({ userId, profile, selectedDate, onMealLogged }: SimpleMealLoggingProps) {
  const [loading, setLoading] = useState(false)
  const [mealType, setMealType] = useState("")
  const [mealTime, setMealTime] = useState("")
  const [foods, setFoods] = useState<Food[]>([{ id: "1", name: "", quantity: "", unit: "g" }])
  const [quickDescription, setQuickDescription] = useState("")
  const [useQuickMode, setUseQuickMode] = useState(false)
  const [nutritionAnalysis, setNutritionAnalysis] = useState<NutritionAnalysis | null>(null)

  const mealTypes = [
    { value: "breakfast", label: "🌅 Breakfast" },
    { value: "lunch", label: "🌞 Lunch" },
    { value: "dinner", label: "🌙 Dinner" },
    { value: "snack", label: "🍎 Snack" },
  ]

  const commonUnits = ["g", "kg", "ml", "l", "cup", "tbsp", "tsp", "piece", "slice", "serving"]

  const addFood = () => {
    const newFood: Food = {
      id: Date.now().toString(),
      name: "",
      quantity: "",
      unit: "g",
    }
    setFoods([...foods, newFood])
  }

  const removeFood = (id: string) => {
    if (foods.length > 1) {
      setFoods(foods.filter((food) => food.id !== id))
    }
  }

  const updateFood = (id: string, field: keyof Food, value: string) => {
    setFoods(foods.map((food) => (food.id === id ? { ...food, [field]: value } : food)))
  }

  const generateMealDescription = () => {
    return useQuickMode
      ? quickDescription
      : foods
          .filter((food) => food.name.trim())
          .map((food) => `${food.quantity} ${food.unit} ${food.name}`)
          .join(", ")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mealType) {
      toast.error("Please select a meal type")
      return
    }

    const mealDescription = generateMealDescription()

    if (!mealDescription.trim()) {
      toast.error("Please add some food items or description")
      return
    }

    setLoading(true)

    try {
      if (!isSupabaseConfigured()) {
        setTimeout(() => {
          toast.success(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} logged successfully! (Demo mode)`)
          resetForm()
          onMealLogged?.()
        }, 1000)
        setLoading(false)
        return
      }

      toast.info("🧠 Analyzing meal nutrition...")
      const analysisResponse = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: mealDescription,
          userId: userId,
        }),
      })

      let analysis: NutritionAnalysis | null = null

      if (analysisResponse.ok) {
        analysis = await analysisResponse.json()
        setNutritionAnalysis(analysis)
        toast.success("✨ Nutrition analyzed!")
      } else {
        console.warn("Nutrition analysis failed, logging meal without macros")
        toast.warning("Logging meal without nutrition data")
      }

      const mealData = {
        user_id: userId,
        meal_type: mealType,
        description: mealDescription,
        meal_time: mealTime || null,
        foods: JSON.stringify(useQuickMode ? [] : foods.filter((food) => food.name.trim())),
        calories: analysis?.calories || null,
        protein: analysis?.protein || null,
        carbs: analysis?.carbs || null,
        fat: analysis?.fat || null,
        fiber: analysis?.fiber || null,
        sugar: analysis?.sugar || null,
        sodium: analysis?.sodium || null,
        confidence: analysis?.confidence || null,
        ai_suggestions: analysis?.suggestions || null,
        ai_reasoning: analysis?.reasoning || null,
        date: selectedDate || new Date().toISOString().split("T")[0],
      }

      const response = await fetch("/api/logs/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(
          `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} logged${analysis ? " with nutrition analysis" : ""}! 🍽️${analysis ? "✨" : ""}`,
        )
        resetForm()
        onMealLogged?.()
      } else {
        console.error("API Error:", result)
        throw new Error(result.error || "Failed to log meal")
      }
    } catch (error) {
      console.error("Meal log error:", error)
      toast.error(`Error logging meal: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setMealType("")
    setMealTime("")
    setFoods([{ id: "1", name: "", quantity: "", unit: "g" }])
    setQuickDescription("")
    setUseQuickMode(false)
    setNutritionAnalysis(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="meal_type" className="text-sm font-medium">
            Meal Type *
          </Label>
          <Select value={mealType} onValueChange={setMealType} required>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              {mealTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="meal_time" className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            Meal Time (Optional)
          </Label>
          <Input
            id="meal_time"
            type="time"
            value={mealTime}
            onChange={(e) => setMealTime(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant={!useQuickMode ? "default" : "outline"}
          size="sm"
          onClick={() => setUseQuickMode(false)}
          className="rounded-xl"
        >
          Individual Foods
        </Button>
        <Button
          type="button"
          variant={useQuickMode ? "default" : "outline"}
          size="sm"
          onClick={() => setUseQuickMode(true)}
          className="rounded-xl"
        >
          Quick Description
        </Button>
      </div>

      {!useQuickMode ? (
        <div>
          <div className="space-y-3">
            {foods.map((food) => (
              <div key={food.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end p-3 bg-gray-50 rounded-lg">
                <div className="md:col-span-3">
                  <Label className="text-xs font-medium">Food Name</Label>
                  <Input
                    value={food.name}
                    onChange={(e) => updateFood(food.id, "name", e.target.value)}
                    placeholder="e.g., Chicken breast, Brown rice"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Quantity</Label>
                  <Input
                    value={food.quantity}
                    onChange={(e) => updateFood(food.id, "quantity", e.target.value)}
                    placeholder="100"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Unit</Label>
                  <Select value={food.unit} onValueChange={(value) => updateFood(food.id, "unit", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {commonUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  {foods.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeFood(food.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button
              type="button"
              onClick={addFood}
              variant="outline"
              size="sm"
              className="w-full rounded-xl bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Food
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="quick_description" className="text-sm font-medium">
            Meal Description
          </Label>
          <Textarea
            id="quick_description"
            value={quickDescription}
            onChange={(e) => setQuickDescription(e.target.value)}
            placeholder="Describe your meal... e.g., 'Grilled chicken salad with mixed vegetables and olive oil dressing'"
            className="mt-1"
            rows={4}
          />
        </div>
      )}

      {nutritionAnalysis && (
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Nutrition Analysis
          </Label>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(nutritionAnalysis.calories)}</div>
                <div className="text-xs text-gray-600">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(nutritionAnalysis.protein)}g</div>
                <div className="text-xs text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(nutritionAnalysis.carbs)}g</div>
                <div className="text-xs text-gray-600">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(nutritionAnalysis.fat)}g</div>
                <div className="text-xs text-gray-600">Fat</div>
              </div>
            </div>

            {nutritionAnalysis.suggestions && (
              <>
                <Separator className="my-3" />
                <div className="text-sm text-gray-700 bg-white p-3 rounded-lg">
                  <strong>💡 AI Suggestions:</strong> {nutritionAnalysis.suggestions}
                </div>
              </>
            )}

            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Confidence: {Math.round(nutritionAnalysis.confidence)}%
              </Badge>
            </div>
          </div>
        </div>
      )}

      {((!useQuickMode && foods.some((food) => food.name.trim())) || (useQuickMode && quickDescription.trim())) && (
        <div>
          <Label className="text-sm font-medium">Meal Preview</Label>
          <div className="mt-1 p-3 bg-gray-50 rounded-xl text-sm">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{mealTypes.find((t) => t.value === mealType)?.label}</Badge>
              {mealTime && <Badge variant="outline">{mealTime}</Badge>}
            </div>
            <div className="text-gray-700">{generateMealDescription()}</div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={
          loading ||
          !mealType ||
          (!useQuickMode && !foods.some((food) => food.name.trim())) ||
          (useQuickMode && !quickDescription.trim())
        }
        className="w-full rounded-xl"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {nutritionAnalysis ? "Logging Meal..." : "Analyzing & Logging..."}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Log Meal with AI Analysis
          </>
        )}
      </Button>
    </form>
  )
}

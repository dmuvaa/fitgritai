"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Clock, Utensils, Sparkles, Loader2 } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase-utils"
import { toast } from "sonner"

interface FoodItem {
  id: string
  name: string
  quantity: string
  unit: string
}

interface RevolutionaryMealLoggingProps {
  userId: string
  onMealLogged?: () => void
}

export function RevolutionaryMealLogging({ userId, onMealLogged }: RevolutionaryMealLoggingProps) {
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // Meal data state
  const [mealTime, setMealTime] = useState("")
  const [mealLabel, setMealLabel] = useState("")
  const [foods, setFoods] = useState<FoodItem[]>([{ id: "1", name: "", quantity: "", unit: "g" }])
  const [notes, setNotes] = useState("")
  const [nutritionAnalysis, setNutritionAnalysis] = useState<any>(null)

  // Auto-suggest meal label based on time
  const suggestMealLabel = (time: string) => {
    if (!time) return ""

    const hour = Number.parseInt(time.split(":")[0])

    if (hour >= 5 && hour < 11) return "breakfast"
    if (hour >= 11 && hour < 15) return "lunch"
    if (hour >= 15 && hour < 18) return "snack"
    if (hour >= 18 && hour < 23) return "dinner"
    return "snack"
  }

  const handleTimeChange = (time: string) => {
    setMealTime(time)
    if (!mealLabel) {
      const suggested = suggestMealLabel(time)
      setMealLabel(suggested)
    }
  }

  const addFood = () => {
    const newFood: FoodItem = {
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

  const updateFood = (id: string, field: keyof FoodItem, value: string) => {
    setFoods(foods.map((food) => (food.id === id ? { ...food, [field]: value } : food)))
  }

  const generateMealDescription = () => {
    const validFoods = foods.filter((food) => food.name.trim() && food.quantity.trim())
    return validFoods.map((food) => `${food.name} (${food.quantity}${food.unit})`).join(", ")
  }

  const analyzeNutrition = async () => {
    const mealDescription = generateMealDescription()
    if (!mealDescription) {
      toast.error("Please add at least one food item with quantity")
      return
    }

    setAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: mealDescription,
          userId: userId,
        }),
      })

      if (response.ok) {
        const analysis = await response.json()
        setNutritionAnalysis(analysis)
        toast.success("Nutrition analysis complete!")
      } else {
        throw new Error("Analysis failed")
      }
    } catch (error) {
      console.error("Nutrition analysis error:", error)
      toast.error("Failed to analyze nutrition")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mealTime || !mealLabel) {
      toast.error("Please select meal time and type")
      return
    }

    const validFoods = foods.filter((food) => food.name.trim() && food.quantity.trim())
    if (validFoods.length === 0) {
      toast.error("Please add at least one food item")
      return
    }

    setLoading(true)

    try {
      const mealDescription = generateMealDescription()

      if (!isSupabaseConfigured()) {
        // Demo mode
        setTimeout(() => {
          toast.success(`${mealLabel.charAt(0).toUpperCase() + mealLabel.slice(1)} logged successfully! (Demo mode)`)
          resetForm()
          onMealLogged?.()
        }, 1000)
        setLoading(false)
        return
      }

      // Prepare data for API
      const mealData = {
        user_id: userId,
        meal_type: mealLabel,
        description: mealDescription,
        calories: nutritionAnalysis?.calories || null,
        protein: nutritionAnalysis?.protein || null,
        carbs: nutritionAnalysis?.carbs || null,
        fat: nutritionAnalysis?.fat || null,
        fiber: nutritionAnalysis?.fiber || null,
        sugar: nutritionAnalysis?.sugar || null,
        sodium: nutritionAnalysis?.sodium || null,
        confidence: nutritionAnalysis?.confidence || null,
        ai_suggestions: nutritionAnalysis?.suggestions || null,
        ai_reasoning: nutritionAnalysis?.reasoning || null,
        meal_time: mealTime,
        foods: JSON.stringify(validFoods),
        notes: notes || null,
      }

      console.log("Sending meal data:", mealData)

      const response = await fetch("/api/logs/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`${mealLabel.charAt(0).toUpperCase() + mealLabel.slice(1)} logged successfully!`)
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
    setMealTime("")
    setMealLabel("")
    setFoods([{ id: "1", name: "", quantity: "", unit: "g" }])
    setNotes("")
    setNutritionAnalysis(null)
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          Revolutionary Meal Logging
        </CardTitle>
        <CardDescription>
          Track every food item with precise quantities and get AI-powered nutrition analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Time and Meal Label */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="meal_time" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Meal Time *
              </Label>
              <Input
                id="meal_time"
                type="time"
                value={mealTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="meal_label" className="text-sm font-medium">
                Meal Type *
              </Label>
              <Select value={mealLabel} onValueChange={setMealLabel} required>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                  <SelectItem value="lunch">☀️ Lunch</SelectItem>
                  <SelectItem value="dinner">🌙 Dinner</SelectItem>
                  <SelectItem value="snack">🍎 Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Foods Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">Food Items</Label>
              <Button type="button" onClick={addFood} variant="outline" size="sm" className="rounded-xl bg-transparent">
                <Plus className="h-4 w-4 mr-1" />
                Add Food
              </Button>
            </div>

            <div className="space-y-3">
              {foods.map((food, index) => (
                <Card key={food.id} className="p-4 bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="md:col-span-2">
                      <Label className="text-xs font-medium">Food Name</Label>
                      <Input
                        value={food.name}
                        onChange={(e) => updateFood(food.id, "name", e.target.value)}
                        placeholder="e.g., Grilled chicken breast"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Quantity</Label>
                      <div className="flex mt-1">
                        <Input
                          value={food.quantity}
                          onChange={(e) => updateFood(food.id, "quantity", e.target.value)}
                          placeholder="150"
                          className="rounded-r-none"
                        />
                        <Select value={food.unit} onValueChange={(value) => updateFood(food.id, "unit", value)}>
                          <SelectTrigger className="w-20 rounded-l-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="g">g</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="ml">ml</SelectItem>
                            <SelectItem value="l">l</SelectItem>
                            <SelectItem value="cup">cup</SelectItem>
                            <SelectItem value="tbsp">tbsp</SelectItem>
                            <SelectItem value="tsp">tsp</SelectItem>
                            <SelectItem value="piece">piece</SelectItem>
                            <SelectItem value="slice">slice</SelectItem>
                            <SelectItem value="bowl">bowl</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                </Card>
              ))}
            </div>
          </div>

          {/* AI Nutrition Analysis */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">Nutrition Analysis</Label>
              <Button
                type="button"
                onClick={analyzeNutrition}
                disabled={analyzing || !generateMealDescription()}
                variant="outline"
                size="sm"
                className="rounded-xl bg-transparent"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Analyze Nutrition
                  </>
                )}
              </Button>
            </div>

            {nutritionAnalysis && (
              <Card className="p-4 bg-blue-50/50 border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{nutritionAnalysis.calories || "N/A"}</div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{nutritionAnalysis.protein || "N/A"}g</div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{nutritionAnalysis.carbs || "N/A"}g</div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{nutritionAnalysis.fat || "N/A"}g</div>
                    <div className="text-xs text-gray-600">Fat</div>
                  </div>
                </div>
                {nutritionAnalysis.confidence && (
                  <div className="mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {nutritionAnalysis.confidence}% confidence
                    </Badge>
                  </div>
                )}
                {nutritionAnalysis.suggestions && (
                  <div className="text-sm text-gray-700 bg-white p-3 rounded-lg">
                    <strong>AI Suggestions:</strong> {nutritionAnalysis.suggestions}
                  </div>
                )}
              </Card>
            )}
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
              placeholder="How did this meal make you feel? Any cravings or observations?"
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Meal Preview */}
          {generateMealDescription() && (
            <div>
              <Label className="text-sm font-medium">Meal Preview</Label>
              <div className="mt-1 p-3 bg-gray-50 rounded-xl text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{mealLabel.charAt(0).toUpperCase() + mealLabel.slice(1)}</Badge>
                  {mealTime && <Badge variant="outline">{mealTime}</Badge>}
                </div>
                <div className="text-gray-700">{generateMealDescription()}</div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !mealTime || !mealLabel || foods.every((food) => !food.name.trim())}
            className="w-full rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Logging Meal...
              </>
            ) : (
              "Log Revolutionary Meal"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

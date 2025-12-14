"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Sparkles, CheckCircle, AlertCircle, Brain } from "lucide-react"
import { toast } from "sonner"

interface NutritionData {
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

interface EnhancedMealLoggingProps {
  userId: string
  onMealLogged?: () => void
}

export function EnhancedMealLogging({ userId, onMealLogged }: EnhancedMealLoggingProps) {
  const [mealType, setMealType] = useState("")
  const [description, setDescription] = useState("")
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const [useManualEntry, setUseManualEntry] = useState(false)
  const [manualNutrition, setManualNutrition] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
  })

  const analyzeMeal = async () => {
    if (!description.trim()) {
      toast.error("Please describe your meal first")
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, userId }),
      })

      if (!response.ok) throw new Error("Analysis failed")

      const data = await response.json()
      setNutritionData(data)
      toast.success("Meal analyzed successfully!")
    } catch (error) {
      console.error("Analysis error:", error)
      toast.error("Failed to analyze meal. Try manual entry.")
      setUseManualEntry(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const logMeal = async () => {
    if (!mealType || !description.trim()) {
      toast.error("Please select meal type and add description")
      return
    }

    setIsLogging(true)
    try {
      const mealData = useManualEntry
        ? {
            user_id: userId,
            meal_type: mealType,
            description,
            calories: Number.parseFloat(manualNutrition.calories) || null,
            protein: Number.parseFloat(manualNutrition.protein) || null,
            carbs: Number.parseFloat(manualNutrition.carbs) || null,
            fat: Number.parseFloat(manualNutrition.fat) || null,
          }
        : {
            user_id: userId,
            meal_type: mealType,
            description,
            calories: nutritionData?.calories || null,
            protein: nutritionData?.protein || null,
            carbs: nutritionData?.carbs || null,
            fat: nutritionData?.fat || null,
            fiber: nutritionData?.fiber || null,
            sugar: nutritionData?.sugar || null,
            sodium: nutritionData?.sodium || null,
            confidence: nutritionData?.confidence || null,
            ai_suggestions: nutritionData?.suggestions || null,
            ai_reasoning: nutritionData?.reasoning || null,
          }

      const response = await fetch("/api/logs/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
      })

      if (!response.ok) throw new Error("Failed to log meal")

      toast.success("Meal logged successfully!")

      // Reset form
      setMealType("")
      setDescription("")
      setNutritionData(null)
      setUseManualEntry(false)
      setManualNutrition({ calories: "", protein: "", carbs: "", fat: "" })

      onMealLogged?.()
    } catch (error) {
      console.error("Logging error:", error)
      toast.error("Failed to log meal")
    } finally {
      setIsLogging(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800"
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="h-3 w-3" />
    return <AlertCircle className="h-3 w-3" />
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI-Powered Meal Logging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meal Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="meal-type">Meal Type</Label>
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger>
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Meal Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Meal Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your meal in detail (e.g., 'Grilled chicken breast with quinoa and steamed broccoli')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* AI Analysis Button */}
        {!useManualEntry && !nutritionData && (
          <Button onClick={analyzeMeal} disabled={isAnalyzing || !description.trim()} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing meal...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        )}

        {/* AI Analysis Results */}
        {nutritionData && !useManualEntry && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI Nutrition Analysis
                </CardTitle>
                <Badge className={`${getConfidenceColor(nutritionData.confidence)} flex items-center gap-1`}>
                  {getConfidenceIcon(nutritionData.confidence)}
                  {nutritionData.confidence}% confident
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Macros Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">{nutritionData.calories}</div>
                  <div className="text-sm text-gray-600">Calories</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">{nutritionData.protein}g</div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">{nutritionData.carbs}g</div>
                  <div className="text-sm text-gray-600">Carbs</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">{nutritionData.fat}g</div>
                  <div className="text-sm text-gray-600">Fat</div>
                </div>
              </div>

              {/* Additional Nutrients */}
              {(nutritionData.fiber > 0 || nutritionData.sugar > 0 || nutritionData.sodium > 0) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {nutritionData.fiber > 0 && (
                      <div className="text-center">
                        <div className="font-semibold text-green-700">{nutritionData.fiber}g</div>
                        <div className="text-gray-600">Fiber</div>
                      </div>
                    )}
                    {nutritionData.sugar > 0 && (
                      <div className="text-center">
                        <div className="font-semibold text-red-600">{nutritionData.sugar}g</div>
                        <div className="text-gray-600">Sugar</div>
                      </div>
                    )}
                    {nutritionData.sodium > 0 && (
                      <div className="text-center">
                        <div className="font-semibold text-yellow-600">{nutritionData.sodium}mg</div>
                        <div className="text-gray-600">Sodium</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* AI Reasoning */}
              {nutritionData.reasoning && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Analysis Reasoning</Label>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">{nutritionData.reasoning}</p>
                  </div>
                </>
              )}

              {/* AI Suggestions */}
              {nutritionData.suggestions && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">AI Suggestions</Label>
                  <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    💡 {nutritionData.suggestions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Entry Option */}
        {!nutritionData && (
          <div className="text-center">
            <Button variant="outline" onClick={() => setUseManualEntry(!useManualEntry)} className="text-sm">
              {useManualEntry ? "Use AI Analysis" : "Enter Manually Instead"}
            </Button>
          </div>
        )}

        {/* Manual Entry Form */}
        {useManualEntry && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Manual Nutrition Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-calories">Calories</Label>
                  <Input
                    id="manual-calories"
                    type="number"
                    placeholder="0"
                    value={manualNutrition.calories}
                    onChange={(e) => setManualNutrition((prev) => ({ ...prev, calories: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-protein">Protein (g)</Label>
                  <Input
                    id="manual-protein"
                    type="number"
                    placeholder="0"
                    value={manualNutrition.protein}
                    onChange={(e) => setManualNutrition((prev) => ({ ...prev, protein: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-carbs">Carbs (g)</Label>
                  <Input
                    id="manual-carbs"
                    type="number"
                    placeholder="0"
                    value={manualNutrition.carbs}
                    onChange={(e) => setManualNutrition((prev) => ({ ...prev, carbs: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-fat">Fat (g)</Label>
                  <Input
                    id="manual-fat"
                    type="number"
                    placeholder="0"
                    value={manualNutrition.fat}
                    onChange={(e) => setManualNutrition((prev) => ({ ...prev, fat: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Log Meal Button */}
        <Button onClick={logMeal} disabled={isLogging || !mealType || !description.trim()} className="w-full" size="lg">
          {isLogging ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Logging meal...
            </>
          ) : (
            "Log Meal"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

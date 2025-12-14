"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { isSupabaseConfigured, mockUser } from "@/lib/supabase-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    height: "",
    starting_weight: "",
    goal_weight: "",
    date_of_birth: "",
    gender: "",
    activity_level: "",
    fitness_goal: "",
  })

  useEffect(() => {
    const getUser = async () => {
      if (!isSupabaseConfigured()) {
        setUser(mockUser)
        return
      }

      const {
        data: { user },
      } = await createClient().auth.getUser()
      if (!user) {
        router.push("/auth")
        return
      }
      setUser(user)
    }
    getUser()
  }, [router])

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      if (!isSupabaseConfigured()) {
        // Demo mode - just redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
        return
      }

      const supabase = createClient()

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        name: formData.name,
        height: Number.parseFloat(formData.height),
        starting_weight: Number.parseFloat(formData.starting_weight),
        current_weight: Number.parseFloat(formData.starting_weight),
        goal_weight: Number.parseFloat(formData.goal_weight),
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        activity_level: formData.activity_level,
        fitness_goal: formData.fitness_goal,
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        throw profileError
      }

      // Create initial weight log
      await supabase.from("weight_logs").insert({
        user_id: user.id,
        weight: Number.parseFloat(formData.starting_weight),
        date: new Date().toISOString().split("T")[0],
        notes: "Starting weight",
      })

      // Calculate and save nutrition goals - FIXED ENDPOINT
      try {
        console.log("Calculating nutrition goals...")
        const goalsResponse = await fetch("/api/user/goals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const goalsData = await goalsResponse.json()
        console.log("Goals calculation response:", goalsData)

        if (!goalsResponse.ok) {
          console.error("Failed to calculate goals:", goalsData)
          // Continue anyway - goals can be calculated later from dashboard
        } else {
          console.log("Successfully calculated and saved nutrition goals!")
        }
      } catch (error) {
        console.error("Error calculating goals:", error)
        // Continue anyway - goals can be calculated later
      }

      console.log("Onboarding complete, redirecting to dashboard...")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating profile:", error)
      alert("There was an error setting up your profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!user) return null

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="mb-8">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Let's get to know you"}
              {step === 2 && "Your current stats"}
              {step === 3 && "Your fitness profile"}
              {step === 4 && "Your fitness goals"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "We need some basic info to personalize your experience."}
              {step === 2 && "Time for some honest numbers - this helps us calculate accurate targets."}
              {step === 3 && "Tell us about your activity level and lifestyle."}
              {step === 4 && "What are you working towards?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">What should I call you?</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateFormData("height", e.target.value)}
                    placeholder="170"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => updateFormData("date_of_birth", e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-gray-500">We need this to calculate accurate calorie targets</p>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal cursor-pointer">
                        Male
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal cursor-pointer">
                        Female
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal cursor-pointer">
                        Other
                      </Label>
                    </div>
                  </RadioGroup>
                  <p className="text-xs text-gray-500">Helps calculate your metabolism accurately</p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="starting_weight">Current weight (kg)</Label>
                  <Input
                    id="starting_weight"
                    type="number"
                    step="0.1"
                    value={formData.starting_weight}
                    onChange={(e) => updateFormData("starting_weight", e.target.value)}
                    placeholder="75.0"
                  />
                  <p className="text-sm text-gray-600">Be honest. I can't help you if you lie to me.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal_weight">Goal weight (kg)</Label>
                  <Input
                    id="goal_weight"
                    type="number"
                    step="0.1"
                    value={formData.goal_weight}
                    onChange={(e) => updateFormData("goal_weight", e.target.value)}
                    placeholder="65.0"
                  />
                  <p className="text-sm text-gray-600">Make it realistic. Crash diets don't work.</p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="activity_level">Activity Level</Label>
                  <Select
                    value={formData.activity_level}
                    onValueChange={(value) => updateFormData("activity_level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Sedentary</span>
                          <span className="text-xs text-gray-500">Little or no exercise</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="lightly_active">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Lightly Active</span>
                          <span className="text-xs text-gray-500">Light exercise 1-3 days/week</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="moderately_active">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Moderately Active</span>
                          <span className="text-xs text-gray-500">Moderate exercise 3-5 days/week</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="very_active">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Very Active</span>
                          <span className="text-xs text-gray-500">Hard exercise 6-7 days/week</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="extremely_active">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Extremely Active</span>
                          <span className="text-xs text-gray-500">Very hard exercise & physical job</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">This affects your daily calorie needs</p>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fitness_goal">Primary Fitness Goal</Label>
                  <Select
                    value={formData.fitness_goal}
                    onValueChange={(value) => updateFormData("fitness_goal", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="What's your main goal?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose_weight">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Lose Weight</span>
                          <span className="text-xs text-gray-500">Reduce body fat</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="maintain_weight">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Maintain Weight</span>
                          <span className="text-xs text-gray-500">Stay at current weight</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="build_muscle">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Build Muscle</span>
                          <span className="text-xs text-gray-500">Gain lean mass</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="recomposition">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Body Recomposition</span>
                          <span className="text-xs text-gray-500">Lose fat & build muscle</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Determines your calorie adjustment</p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">What happens next?</h4>
                  <p className="text-xs text-gray-700">
                    Based on your profile, we'll calculate your personalized daily targets:
                  </p>
                  <ul className="text-xs text-gray-700 mt-2 space-y-1">
                    <li>• Daily calorie goal</li>
                    <li>• Protein, carbs, and fat targets</li>
                    <li>• Estimated calorie burn (TDEE)</li>
                  </ul>
                  <p className="text-xs text-gray-700 mt-2">These will automatically adjust as you progress!</p>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                  Back
                </Button>
              )}
              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1"
                  disabled={
                    (step === 1 &&
                      (!formData.name || !formData.height || !formData.date_of_birth || !formData.gender)) ||
                    (step === 2 && (!formData.starting_weight || !formData.goal_weight)) ||
                    (step === 3 && !formData.activity_level)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !formData.fitness_goal} className="flex-1">
                  {loading ? "Setting up..." : "Let's do this!"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

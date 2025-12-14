"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ChevronRight, ChevronLeft, X, Loader2, Sparkles, Plus, XIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface PersonalizedPlansJourneyProps {
  userId: string
  profile: any
  isEditing?: boolean
  onClose: () => void
  onComplete: () => void
}

export function PersonalizedPlansJourney({
  userId,
  profile,
  isEditing = false,
  onClose,
  onComplete,
}: PersonalizedPlansJourneyProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [existingProfile, setExistingProfile] = useState<any>(null)
  const { toast } = useToast()

  // Step 1: Goals
  const [primaryGoals, setPrimaryGoals] = useState<string[]>([])

  // Step 2: Experience & Availability
  const [fitnessLevel, setFitnessLevel] = useState("")
  const [workoutDays, setWorkoutDays] = useState<string[]>([])
  const [restDays, setRestDays] = useState<string[]>([])
  const [workoutDuration, setWorkoutDuration] = useState(45)
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState("")
  const [customWorkoutTime, setCustomWorkoutTime] = useState("")

  // Step 3: Equipment & Location
  const [availableEquipment, setAvailableEquipment] = useState<string[]>([])
  const [customEquipment, setCustomEquipment] = useState("")
  const [workoutLocation, setWorkoutLocation] = useState("")

  // Step 4: Current Strength Levels
  const [dumbbellPress, setDumbbellPress] = useState("")
  const [legPress, setLegPress] = useState("")
  const [benchPress, setBenchPress] = useState("")
  const [squat, setSquat] = useState("")
  const [deadlift, setDeadlift] = useState("")
  const [overheadPress, setOverheadPress] = useState("")
  const [bicepCurl, setBicepCurl] = useState("")
  const [latPulldown, setLatPulldown] = useState("")

  // Step 5: Physical Considerations
  const [injuriesLimitations, setInjuriesLimitations] = useState("")
  const [dislikedExercises, setDislikedExercises] = useState<string[]>([])
  const [preferredActivities, setPreferredActivities] = useState<string[]>([])

  // Step 6: Dietary Preferences
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [foodAllergies, setFoodAllergies] = useState<string[]>([])
  const [dislikedFoods, setDislikedFoods] = useState<string[]>([])
  const [accessibleFoods, setAccessibleFoods] = useState<string[]>([])
  const [currentFoodInput, setCurrentFoodInput] = useState("")
  const [preferredFoods, setPreferredFoods] = useState<string[]>([])
  const [mealsPerDay, setMealsPerDay] = useState(3)
  const [cookingTime, setCookingTime] = useState(30)

  // Step 7: Additional Details
  const [additionalNotes, setAdditionalNotes] = useState("")

  const totalSteps = 7
  const progress = (step / totalSteps) * 100

  useEffect(() => {
    if (isEditing) {
      fetchExistingProfile()
    }
  }, [isEditing])

  const fetchExistingProfile = async () => {
    try {
      const response = await fetch("/api/personalized-plans/questionnaire")
      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const profile = await response.json()
      if (profile) {
        setExistingProfile(profile)
        setPrimaryGoals(profile.primary_goals || [])
        setFitnessLevel(profile.fitness_level || "")
        setWorkoutDays(profile.workout_days || [])
        setRestDays(profile.rest_days || [])
        setWorkoutDuration(profile.workout_duration || 45)
        setPreferredWorkoutTime(profile.preferred_workout_time || "")
        setAvailableEquipment(profile.available_equipment || [])
        setWorkoutLocation(profile.workout_location || "")
        setInjuriesLimitations(profile.injuries_limitations || "")
        setDislikedExercises(profile.disliked_exercises || [])
        setPreferredActivities(profile.preferred_activities || [])
        setDietaryRestrictions(profile.dietary_restrictions || [])
        setFoodAllergies(profile.food_allergies || [])
        setDislikedFoods(profile.disliked_foods || [])
        setAccessibleFoods(profile.accessible_foods || [])
        setPreferredFoods(profile.preferred_foods || [])
        setMealsPerDay(profile.meals_per_day || 3)
        setCookingTime(profile.cooking_time || 30)
        setAdditionalNotes(profile.additional_notes || "")

        if (profile.strength_levels) {
          setDumbbellPress(profile.strength_levels.dumbbellPress || "")
          setLegPress(profile.strength_levels.legPress || "")
          setBenchPress(profile.strength_levels.benchPress || "")
          setSquat(profile.strength_levels.squat || "")
          setDeadlift(profile.strength_levels.deadlift || "")
          setOverheadPress(profile.strength_levels.overheadPress || "")
          setBicepCurl(profile.strength_levels.bicepCurl || "")
          setLatPulldown(profile.strength_levels.latPulldown || "")
        }
      }
    } catch (error) {
      console.error("Error fetching existing profile:", error)
    }
  }

  const goalOptions = [
    "Lose Weight",
    "Build Muscle",
    "Build Strength",
    "Improve Endurance",
    "General Fitness",
    "Athletic Performance",
  ]

  const allEquipment = {
    "Resistance Training Machines": [
      "Leg Press Machine",
      "Chest Press Machine",
      "Shoulder Press Machine",
      "Lat Pulldown Machine",
    ],
    "Chest and Arms Training": [
      "Seated Dip Machine",
      "Chest Fly Machine",
      "Bench Press",
      "Incline Bench Press",
      "Decline Bench Press",
      "Adjustable Bench",
      "Olympic Weight Bench",
      "Preacher Curl Bench",
      "Arm Curl Machine",
      "Arm Extension Machine",
      "Triceps Press Machine",
      "Tricep Extension Machine",
    ],
    "Shoulder Training": ["Overhead Press Machine", "Lateral Raises Machine"],
    "Back Training": ["Back Extension Machine", "Cable Row Machine", "GHD Machine", "Front Pull Down Machine"],
    "Core Training": ["Abdominal Bench", "Ab Crunch Machine", "Leg Raise Tower", "Ab Roller", "Rotary Torso Machine"],
    "Leg Training": [
      "Leg Extension Machine",
      "Leg Curl Machine",
      "Leg Abduction Machine",
      "Seated Calf Machine",
      "Standing Calf Machine",
      "Calf Press Machine",
      "Butt Blaster Machine",
      "Hack Squat Machine",
      "Reverse Hyper Machine",
    ],
    "Free Weights": [
      "Kettlebells",
      "Dumbbells (Fixed)",
      "Dumbbells (Adjustable)",
      "Barbells",
      "Olympic Barbells",
      "Medicine Ball",
      "Stability Ball",
      "Wallball",
    ],
    "Cardio Machines": [
      "Treadmill",
      "Spin Bike",
      "Air Bike",
      "Upright Exercise Bike",
      "Recumbent Exercise Bike",
      "Under Desk Bike",
      "Ellipticals",
      "Ski Erg",
      "Vertical Climber",
      "Stair Climber",
      "Stepper",
      "Stepmill",
      "Aerobic Steps",
    ],
    "Home Gym Systems": ["Smith Machine", "Rowing Machine", "Cable Crossover Machine", "Functional Trainer"],
    Accessories: [
      "Resistance Bands",
      "Suspension Trainer (TRX)",
      "Punching Bag",
      "Climbing Rope",
      "Battle Rope",
      "Jump Rope",
      "Plyometric Box",
      "Pull Up Bar",
      "Push-Up Bars",
      "Gymnastic Rings",
      "Foam Roller",
      "Agility Ladder",
      "Swiss Ball",
      "Hand Grip Exerciser",
    ],
  }

  const activityOptions = [
    "Running",
    "Cycling",
    "Swimming",
    "Yoga",
    "Pilates",
    "Dancing",
    "Hiking",
    "Sports",
    "Martial Arts",
    "Rock Climbing",
  ]

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const workoutTimes = [
    "Early Morning (5-7 AM)",
    "Morning (7-10 AM)",
    "Midday (10 AM-2 PM)",
    "Afternoon (2-5 PM)",
    "Evening (5-8 PM)",
    "Night (8-11 PM)",
    "Custom",
  ]

  const toggleGoal = (goal: string) => {
    setPrimaryGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]))
  }

  const toggleEquipment = (equipment: string) => {
    setAvailableEquipment((prev) =>
      prev.includes(equipment) ? prev.filter((e) => e !== equipment) : [...prev, equipment],
    )
  }

  const toggleActivity = (activity: string) => {
    setPreferredActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity],
    )
  }

  const toggleWorkoutDay = (day: string) => {
    setWorkoutDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day)
      } else {
        setRestDays((rest) => rest.filter((d) => d !== day))
        return [...prev, day]
      }
    })
  }

  const toggleRestDay = (day: string) => {
    setRestDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day)
      } else {
        setWorkoutDays((workout) => workout.filter((d) => d !== day))
        return [...prev, day]
      }
    })
  }

  const addFood = () => {
    if (currentFoodInput.trim()) {
      setAccessibleFoods((prev) => [...prev, currentFoodInput.trim()])
      setCurrentFoodInput("")
    }
  }

  const removeFood = (food: string) => {
    setAccessibleFoods((prev) => prev.filter((f) => f !== food))
  }

  const addCustomEquipment = () => {
    if (customEquipment.trim() && !availableEquipment.includes(customEquipment.trim())) {
      setAvailableEquipment((prev) => [...prev, customEquipment.trim()])
      setCustomEquipment("")
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return primaryGoals.length > 0
      case 2:
        return (
          fitnessLevel &&
          workoutDays.length > 0 &&
          workoutDuration > 0 &&
          (preferredWorkoutTime !== "Custom" ? preferredWorkoutTime : customWorkoutTime)
        )
      case 3:
        return availableEquipment.length > 0 && workoutLocation
      case 4:
        return true
      case 5:
        return true
      case 6:
        return mealsPerDay > 0 && cookingTime > 0 && accessibleFoods.length > 0
      case 7:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const finalWorkoutTime = preferredWorkoutTime === "Custom" ? customWorkoutTime : preferredWorkoutTime

      console.log("Submitting questionnaire...")
      const questionnaireResponse = await fetch("/api/personalized-plans/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryGoals,
          fitnessLevel,
          workoutDays,
          restDays,
          workoutDuration,
          preferredWorkoutTime: finalWorkoutTime,
          availableEquipment,
          workoutLocation,
          strengthLevels: {
            dumbbellPress,
            legPress,
            benchPress,
            squat,
            deadlift,
            overheadPress,
            bicepCurl,
            latPulldown,
          },
          injuriesLimitations,
          dislikedExercises,
          preferredActivities,
          dietaryRestrictions,
          foodAllergies,
          dislikedFoods,
          accessibleFoods,
          preferredFoods,
          mealsPerDay,
          cookingTime,
          additionalNotes,
        }),
      })

      if (!questionnaireResponse.ok) {
        const errorText = await questionnaireResponse.text()
        console.error("Questionnaire save failed:", errorText)
        throw new Error("Failed to save questionnaire")
      }

      const profileData = await questionnaireResponse.json()
      console.log("Questionnaire saved:", profileData)

      if (!isEditing) {
        console.log("Generating plans...")
        const generateResponse = await fetch("/api/personalized-plans/generate", {
          method: "POST",
        })

        if (!generateResponse.ok) {
          const errorText = await generateResponse.text()
          console.error("Plan generation failed:", errorText)
          throw new Error("Failed to generate plans")
        }

        const generateData = await generateResponse.json()
        console.log("Plans generated:", generateData)
      }

      toast({
        title: "Success! 🎉",
        description: isEditing
          ? "Your profile has been updated successfully!"
          : "Your personalized plans have been created!",
      })

      onComplete()
    } catch (error: any) {
      console.error("Error saving questionnaire:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-orange-500" />
            {isEditing ? "Edit Your Plan" : "Create Your Personalized Plan"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your preferences and regenerate your plan"
              : "Complete this questionnaire to get a personalized workout and meal plan"}
          </DialogDescription>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                Step {step} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>What are your primary fitness goals?</CardTitle>
                <CardDescription>Select all that apply</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {goalOptions.map((goal) => (
                  <div key={goal} className="flex items-center space-x-3">
                    <Checkbox
                      id={goal}
                      checked={primaryGoals.includes(goal)}
                      onCheckedChange={() => toggleGoal(goal)}
                    />
                    <Label htmlFor={goal} className="cursor-pointer flex-1">
                      {goal}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Experience & Availability</CardTitle>
                <CardDescription>Help us understand your fitness background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Fitness Level</Label>
                  <RadioGroup value={fitnessLevel} onValueChange={setFitnessLevel}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner">Beginner - New to working out</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate">Intermediate - Regular exercise experience</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced">Advanced - Experienced athlete</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Select your workout days</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`workout-${day}`}
                          checked={workoutDays.includes(day)}
                          onCheckedChange={() => toggleWorkoutDay(day)}
                        />
                        <Label htmlFor={`workout-${day}`}>{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Select your rest days</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rest-${day}`}
                          checked={restDays.includes(day)}
                          onCheckedChange={() => toggleRestDay(day)}
                          disabled={workoutDays.includes(day)}
                        />
                        <Label htmlFor={`rest-${day}`} className={workoutDays.includes(day) ? "text-gray-400" : ""}>
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>How long can you work out? (minutes)</Label>
                  <Input
                    type="number"
                    min={15}
                    max={180}
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(Number.parseInt(e.target.value) || 45)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Preferred workout time</Label>
                  <RadioGroup value={preferredWorkoutTime} onValueChange={setPreferredWorkoutTime}>
                    {workoutTimes.map((time) => (
                      <div key={time} className="flex items-center space-x-2">
                        <RadioGroupItem value={time} id={time} />
                        <Label htmlFor={time}>{time}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {preferredWorkoutTime === "Custom" && (
                    <Input
                      type="time"
                      value={customWorkoutTime}
                      onChange={(e) => setCustomWorkoutTime(e.target.value)}
                      placeholder="Enter custom time"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Equipment & Location</CardTitle>
                <CardDescription>What equipment do you have access to?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Workout Location</Label>
                  <RadioGroup value={workoutLocation} onValueChange={setWorkoutLocation}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="home" id="home" />
                      <Label htmlFor="home">Home</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gym" id="gym" />
                      <Label htmlFor="gym">Gym</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outdoor" id="outdoor" />
                      <Label htmlFor="outdoor">Outdoor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed">Mixed</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Available Equipment</Label>
                  {Object.entries(allEquipment).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">{category}</h4>
                      <div className="grid grid-cols-2 gap-2 ml-4">
                        {items.map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={item}
                              checked={availableEquipment.includes(item)}
                              onCheckedChange={() => toggleEquipment(item)}
                            />
                            <Label htmlFor={item} className="text-sm">
                              {item}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2 pt-4 border-t">
                    <Label>Other Equipment</Label>
                    <div className="flex gap-2">
                      <Input
                        value={customEquipment}
                        onChange={(e) => setCustomEquipment(e.target.value)}
                        placeholder="Add custom equipment"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addCustomEquipment()
                          }
                        }}
                      />
                      <Button type="button" onClick={addCustomEquipment}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Current Strength Levels</CardTitle>
                <CardDescription>Help us understand your current strength (optional but recommended)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dumbbellPress">Dumbbell Press (kg per hand)</Label>
                    <Input
                      id="dumbbellPress"
                      type="number"
                      value={dumbbellPress}
                      onChange={(e) => setDumbbellPress(e.target.value)}
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="benchPress">Bench Press (total kg)</Label>
                    <Input
                      id="benchPress"
                      type="number"
                      value={benchPress}
                      onChange={(e) => setBenchPress(e.target.value)}
                      placeholder="e.g., 60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="squat">Squat (total kg)</Label>
                    <Input
                      id="squat"
                      type="number"
                      value={squat}
                      onChange={(e) => setSquat(e.target.value)}
                      placeholder="e.g., 80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadlift">Deadlift (total kg)</Label>
                    <Input
                      id="deadlift"
                      type="number"
                      value={deadlift}
                      onChange={(e) => setDeadlift(e.target.value)}
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legPress">Leg Press (total kg)</Label>
                    <Input
                      id="legPress"
                      type="number"
                      value={legPress}
                      onChange={(e) => setLegPress(e.target.value)}
                      placeholder="e.g., 150"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overheadPress">Overhead Press (total kg)</Label>
                    <Input
                      id="overheadPress"
                      type="number"
                      value={overheadPress}
                      onChange={(e) => setOverheadPress(e.target.value)}
                      placeholder="e.g., 40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bicepCurl">Bicep Curl (kg per hand)</Label>
                    <Input
                      id="bicepCurl"
                      type="number"
                      value={bicepCurl}
                      onChange={(e) => setBicepCurl(e.target.value)}
                      placeholder="e.g., 12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="latPulldown">Lat Pulldown (total kg)</Label>
                    <Input
                      id="latPulldown"
                      type="number"
                      value={latPulldown}
                      onChange={(e) => setLatPulldown(e.target.value)}
                      placeholder="e.g., 50"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  These values help us create a plan with appropriate starting weights and progressive overload.
                </p>
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Physical Considerations</CardTitle>
                <CardDescription>Help us create a safe and effective plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Do you have any injuries or physical limitations?</Label>
                  <Textarea
                    value={injuriesLimitations}
                    onChange={(e) => setInjuriesLimitations(e.target.value)}
                    placeholder="e.g., knee pain, lower back issues..."
                  />
                </div>

                <div className="space-y-3">
                  <Label>Preferred Activities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {activityOptions.map((activity) => (
                      <div key={activity} className="flex items-center space-x-2">
                        <Checkbox
                          id={activity}
                          checked={preferredActivities.includes(activity)}
                          onCheckedChange={() => toggleActivity(activity)}
                        />
                        <Label htmlFor={activity}>{activity}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Dietary Preferences</CardTitle>
                <CardDescription>Let's create a meal plan that works for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>How many meals do you want per day?</Label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(Number.parseInt(e.target.value) || 3)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>How much time can you spend cooking? (minutes)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={cookingTime}
                    onChange={(e) => setCookingTime(Number.parseInt(e.target.value) || 30)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Foods You Have Easy Access To (Required)</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentFoodInput}
                      onChange={(e) => setCurrentFoodInput(e.target.value)}
                      placeholder="Type a food and press Enter or click Add"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addFood()
                        }
                      }}
                    />
                    <Button type="button" onClick={addFood}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {accessibleFoods.map((food) => (
                      <Badge key={food} variant="secondary">
                        {food}
                        <button onClick={() => removeFood(food)} className="ml-2 hover:text-red-600">
                          <XIcon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    List foods you commonly buy or have access to (e.g., chicken, rice, eggs, vegetables)
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Dietary Restrictions (optional)</Label>
                  <Textarea
                    value={dietaryRestrictions.join(", ")}
                    onChange={(e) =>
                      setDietaryRestrictions(
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="e.g., vegetarian, vegan, gluten-free..."
                  />
                </div>

                <div className="space-y-3">
                  <Label>Food Allergies (optional)</Label>
                  <Textarea
                    value={foodAllergies.join(", ")}
                    onChange={(e) =>
                      setFoodAllergies(
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="e.g., nuts, dairy, shellfish..."
                  />
                </div>

                <div className="space-y-3">
                  <Label>Foods You Dislike (optional)</Label>
                  <Textarea
                    value={dislikedFoods.join(", ")}
                    onChange={(e) =>
                      setDislikedFoods(
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="e.g., mushrooms, fish, olives..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 7 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
                <CardDescription>Anything else we should know?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label>Additional Notes (optional)</Label>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Tell us anything else that might help us create the perfect plan for you..."
                  rows={6}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1 || loading}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {step < totalSteps ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !canProceed()}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? "Updating..." : "Generating Plans..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isEditing ? "Update Profile" : "Generate My Plans"}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

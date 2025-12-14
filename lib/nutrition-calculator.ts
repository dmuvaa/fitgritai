/**
 * Nutrition Calculator Utility
 * Centralized logic for calculating personalized nutrition goals
 */

export interface UserProfile {
  current_weight: number
  height: number
  date_of_birth: string
  gender: "male" | "female" | "other"
  activity_level: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active"
  fitness_goal: "lose_weight" | "maintain_weight" | "build_muscle" | "recomposition"
  goal_weight?: number
}

export interface NutritionGoals {
  bmr: number
  tdee: number
  daily_calories: number
  daily_protein: number
  daily_carbs: number
  daily_fat: number
  goal_intensity: "slow" | "moderate" | "aggressive"
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }

  return age
}

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 */
export function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  // Mifflin-St Jeor Equation
  // Male: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Female: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161

  const baseCalculation = 10 * weight + 6.25 * height - 5 * age

  if (gender === "male") {
    return Math.round(baseCalculation + 5)
  } else if (gender === "female") {
    return Math.round(baseCalculation - 161)
  } else {
    // For 'other', use average of male and female
    return Math.round((baseCalculation + 5 + baseCalculation - 161) / 2)
  }
}

/**
 * Get activity level multiplier
 */
export function getActivityMultiplier(activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2, // Little or no exercise
    lightly_active: 1.375, // Light exercise 1-3 days/week
    moderately_active: 1.55, // Moderate exercise 3-5 days/week
    very_active: 1.725, // Hard exercise 6-7 days/week
    extremely_active: 1.9, // Very hard exercise, physical job, or training twice per day
  }

  return multipliers[activityLevel] || 1.55
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier = getActivityMultiplier(activityLevel)
  return Math.round(bmr * multiplier)
}

/**
 * Calculate calorie goal based on fitness goal
 */
export function calculateCalorieGoal(
  tdee: number,
  fitnessGoal: string,
  intensity: "slow" | "moderate" | "aggressive" = "moderate",
): number {
  const adjustments: Record<string, Record<string, number>> = {
    lose_weight: {
      slow: -250,
      moderate: -500,
      aggressive: -750,
    },
    maintain_weight: {
      slow: 0,
      moderate: 0,
      aggressive: 0,
    },
    build_muscle: {
      slow: 200,
      moderate: 300,
      aggressive: 500,
    },
    recomposition: {
      slow: -200,
      moderate: -200,
      aggressive: -300,
    },
  }

  const adjustment = adjustments[fitnessGoal]?.[intensity] || 0
  const calorieGoal = tdee + adjustment

  // Safety limits: never go below 1200 for women, 1500 for men
  const minCalories = 1200
  const maxDeficit = tdee - 1000 // Never more than 1000 cal deficit

  return Math.max(minCalories, Math.min(calorieGoal, tdee + 500), maxDeficit)
}

/**
 * Calculate protein goal based on weight and fitness goal
 */
export function calculateProteinGoal(weight: number, fitnessGoal: string): number {
  // Protein targets (grams per kg of body weight)
  const proteinMultipliers: Record<string, number> = {
    lose_weight: 2.0, // High protein to preserve muscle during deficit
    maintain_weight: 1.6, // Moderate protein for maintenance
    build_muscle: 2.2, // High protein for muscle building
    recomposition: 2.0, // High protein for body recomposition
  }

  const multiplier = proteinMultipliers[fitnessGoal] || 1.6
  return Math.round(weight * multiplier)
}

/**
 * Calculate fat goal (25% of total calories is a healthy balance)
 */
export function calculateFatGoal(calorieGoal: number): number {
  // Fat provides 9 calories per gram
  // Aim for 25% of total calories from fat
  return Math.round((calorieGoal * 0.25) / 9)
}

/**
 * Calculate carbs goal (remaining calories after protein and fat)
 */
export function calculateCarbsGoal(calorieGoal: number, proteinGoal: number, fatGoal: number): number {
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  const proteinCalories = proteinGoal * 4
  const fatCalories = fatGoal * 9
  const remainingCalories = calorieGoal - proteinCalories - fatCalories

  // Convert remaining calories to grams of carbs
  return Math.round(remainingCalories / 4)
}

/**
 * Determine goal intensity based on current vs goal weight
 */
export function determineGoalIntensity(
  currentWeight: number,
  goalWeight: number | undefined,
  fitnessGoal: string,
): "slow" | "moderate" | "aggressive" {
  if (!goalWeight || fitnessGoal === "maintain_weight") {
    return "moderate"
  }

  const weightDifference = Math.abs(currentWeight - goalWeight)

  // For weight loss
  if (fitnessGoal === "lose_weight") {
    if (weightDifference > 20) return "aggressive" // More than 20kg to lose
    if (weightDifference > 10) return "moderate" // 10-20kg to lose
    return "slow" // Less than 10kg to lose
  }

  // For muscle building
  if (fitnessGoal === "build_muscle") {
    return "moderate" // Always moderate for muscle building to minimize fat gain
  }

  return "moderate"
}

/**
 * Master function: Calculate all nutrition goals
 */
export function calculateAllGoals(profile: UserProfile): NutritionGoals {
  // Calculate age from date of birth
  const age = calculateAge(profile.date_of_birth)

  // Calculate BMR
  const bmr = calculateBMR(profile.current_weight, profile.height, age, profile.gender)

  // Calculate TDEE
  const tdee = calculateTDEE(bmr, profile.activity_level)

  // Determine goal intensity
  const intensity = determineGoalIntensity(profile.current_weight, profile.goal_weight, profile.fitness_goal)

  // Calculate calorie goal
  const daily_calories = calculateCalorieGoal(tdee, profile.fitness_goal, intensity)

  // Calculate macros
  const daily_protein = calculateProteinGoal(profile.current_weight, profile.fitness_goal)
  const daily_fat = calculateFatGoal(daily_calories)
  const daily_carbs = calculateCarbsGoal(daily_calories, daily_protein, daily_fat)

  return {
    bmr,
    tdee,
    daily_calories,
    daily_protein,
    daily_carbs,
    daily_fat,
    goal_intensity: intensity,
  }
}

/**
 * Check if goals should be recalculated based on weight change
 */
export function shouldRecalculateGoals(
  currentWeight: number,
  lastCalculatedWeight: number,
  lastRecalculatedAt: string | null,
  autoRecalculate = true,
): boolean {
  if (!autoRecalculate) return false
  if (!lastRecalculatedAt) return true // Never calculated before

  // Calculate weight change percentage
  const weightChangePercent = Math.abs((currentWeight - lastCalculatedWeight) / lastCalculatedWeight) * 100

  // Recalculate if weight changed by more than 5%
  if (weightChangePercent >= 5) return true

  // Also recalculate if it's been more than 90 days
  const daysSinceLastCalc = Math.floor((Date.now() - new Date(lastRecalculatedAt).getTime()) / (1000 * 60 * 60 * 24))

  return daysSinceLastCalc > 90
}

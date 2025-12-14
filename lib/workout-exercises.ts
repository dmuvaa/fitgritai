// Exercise database with equipment requirements and muscle groups
export interface Exercise {
  name: string
  muscleGroups: string[]
  equipment: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  avoidWithInjuries?: string[]
}

export const exerciseDatabase: Exercise[] = [
  // Chest exercises
  {
    name: "Barbell Bench Press",
    muscleGroups: ["Chest"],
    equipment: ["Barbells", "Bench Press"],
    difficulty: "intermediate",
  },
  {
    name: "Dumbbell Bench Press",
    muscleGroups: ["Chest"],
    equipment: ["Dumbbells (Fixed)", "Adjustable Bench"],
    difficulty: "beginner",
  },
  {
    name: "Push-ups",
    muscleGroups: ["Chest"],
    equipment: [],
    difficulty: "beginner",
  },
  {
    name: "Incline Dumbbell Press",
    muscleGroups: ["Chest"],
    equipment: ["Dumbbells (Fixed)", "Incline Bench Press"],
    difficulty: "intermediate",
  },
  {
    name: "Cable Chest Fly",
    muscleGroups: ["Chest"],
    equipment: ["Cable Crossover Machine"],
    difficulty: "intermediate",
  },
  {
    name: "Chest Press Machine",
    muscleGroups: ["Chest"],
    equipment: ["Chest Press Machine"],
    difficulty: "beginner",
  },

  // Back exercises
  {
    name: "Pull-ups",
    muscleGroups: ["Back"],
    equipment: ["Pull Up Bar"],
    difficulty: "intermediate",
  },
  {
    name: "Lat Pulldown",
    muscleGroups: ["Back"],
    equipment: ["Lat Pulldown Machine"],
    difficulty: "beginner",
  },
  {
    name: "Barbell Rows",
    muscleGroups: ["Back"],
    equipment: ["Barbells"],
    difficulty: "intermediate",
    avoidWithInjuries: ["lower back"],
  },
  {
    name: "Dumbbell Rows",
    muscleGroups: ["Back"],
    equipment: ["Dumbbells (Fixed)"],
    difficulty: "beginner",
  },
  {
    name: "Cable Rows",
    muscleGroups: ["Back"],
    equipment: ["Cable Row Machine"],
    difficulty: "beginner",
  },
  {
    name: "Deadlifts",
    muscleGroups: ["Back", "Legs"],
    equipment: ["Barbells"],
    difficulty: "advanced",
    avoidWithInjuries: ["lower back"],
  },

  // Shoulders
  {
    name: "Overhead Press",
    muscleGroups: ["Shoulders"],
    equipment: ["Barbells"],
    difficulty: "intermediate",
  },
  {
    name: "Dumbbell Shoulder Press",
    muscleGroups: ["Shoulders"],
    equipment: ["Dumbbells (Fixed)"],
    difficulty: "beginner",
  },
  {
    name: "Lateral Raises",
    muscleGroups: ["Shoulders"],
    equipment: ["Dumbbells (Fixed)"],
    difficulty: "beginner",
  },
  {
    name: "Front Raises",
    muscleGroups: ["Shoulders"],
    equipment: ["Dumbbells (Fixed)"],
    difficulty: "beginner",
  },
  {
    name: "Shoulder Press Machine",
    muscleGroups: ["Shoulders"],
    equipment: ["Shoulder Press Machine"],
    difficulty: "beginner",
  },

  // Biceps
  {
    name: "Barbell Curls",
    muscleGroups: ["Biceps"],
    equipment: ["Barbells"],
    difficulty: "beginner",
  },
  {
    name: "Dumbbell Curls",
    muscleGroups: ["Biceps"],
    equipment: ["Dumbbells (Fixed)"],
    difficulty: "beginner",
  },
  {
    name: "Hammer Curls",
    muscleGroups: ["Biceps"],
    equipment: ["Dumbbells (Fixed)"],
    difficulty: "beginner",
  },
  {
    name: "Cable Curls",
    muscleGroups: ["Biceps"],
    equipment: ["Cable Crossover Machine"],
    difficulty: "beginner",
  },
  {
    name: "Preacher Curls",
    muscleGroups: ["Biceps"],
    equipment: ["Preacher Curl Bench", "Dumbbells (Fixed)"],
    difficulty: "intermediate",
  },

  // Triceps
  {
    name: "Tricep Dips",
    muscleGroups: ["Triceps"],
    equipment: ["Seated Dip Machine"],
    difficulty: "intermediate",
  },
  {
    name: "Overhead Tricep Extension",
    muscleGroups: ["Triceps"],
    equipment: ["Dumbbells (Fixed)"],
    difficulty: "beginner",
  },
  {
    name: "Tricep Pushdowns",
    muscleGroups: ["Triceps"],
    equipment: ["Cable Crossover Machine"],
    difficulty: "beginner",
  },
  {
    name: "Skull Crushers",
    muscleGroups: ["Triceps"],
    equipment: ["Barbells", "Bench Press"],
    difficulty: "intermediate",
  },

  // Legs/Quads
  {
    name: "Barbell Squats",
    muscleGroups: ["Legs"],
    equipment: ["Barbells"],
    difficulty: "intermediate",
    avoidWithInjuries: ["knee"],
  },
  {
    name: "Leg Press",
    muscleGroups: ["Legs"],
    equipment: ["Leg Press Machine"],
    difficulty: "beginner",
    avoidWithInjuries: ["knee"],
  },
  {
    name: "Leg Extensions",
    muscleGroups: ["Legs"],
    equipment: ["Leg Extension Machine"],
    difficulty: "beginner",
  },
  {
    name: "Lunges",
    muscleGroups: ["Legs"],
    equipment: [],
    difficulty: "beginner",
    avoidWithInjuries: ["knee"],
  },
  {
    name: "Bulgarian Split Squats",
    muscleGroups: ["Legs"],
    equipment: ["Dumbbells (Fixed)"],
    difficulty: "intermediate",
  },

  // Glutes/Hamstrings
  {
    name: "Romanian Deadlifts",
    muscleGroups: ["Glutes"],
    equipment: ["Barbells"],
    difficulty: "intermediate",
    avoidWithInjuries: ["lower back"],
  },
  {
    name: "Leg Curls",
    muscleGroups: ["Glutes"],
    equipment: ["Leg Curl Machine"],
    difficulty: "beginner",
  },
  {
    name: "Hip Thrusts",
    muscleGroups: ["Glutes"],
    equipment: ["Barbells", "Bench Press"],
    difficulty: "intermediate",
  },
  {
    name: "Glute Bridges",
    muscleGroups: ["Glutes"],
    equipment: [],
    difficulty: "beginner",
  },

  // Core
  {
    name: "Planks",
    muscleGroups: ["Core"],
    equipment: [],
    difficulty: "beginner",
  },
  {
    name: "Crunches",
    muscleGroups: ["Core"],
    equipment: [],
    difficulty: "beginner",
  },
  {
    name: "Russian Twists",
    muscleGroups: ["Core"],
    equipment: ["Medicine Ball"],
    difficulty: "beginner",
  },
  {
    name: "Leg Raises",
    muscleGroups: ["Core"],
    equipment: [],
    difficulty: "intermediate",
  },
  {
    name: "Ab Wheel Rollouts",
    muscleGroups: ["Core"],
    equipment: ["Ab Roller"],
    difficulty: "advanced",
  },
  {
    name: "Cable Crunches",
    muscleGroups: ["Core"],
    equipment: ["Cable Crossover Machine"],
    difficulty: "intermediate",
  },

  // Conditioning
  {
    name: "Treadmill Running",
    muscleGroups: ["Conditioning"],
    equipment: ["Treadmill"],
    difficulty: "beginner",
  },
  {
    name: "Cycling",
    muscleGroups: ["Conditioning"],
    equipment: ["Spin Bike"],
    difficulty: "beginner",
  },
  {
    name: "Rowing",
    muscleGroups: ["Conditioning"],
    equipment: ["Rowing Machine"],
    difficulty: "beginner",
  },
  {
    name: "Jump Rope",
    muscleGroups: ["Conditioning"],
    equipment: ["Jump Rope"],
    difficulty: "beginner",
  },
  {
    name: "Battle Ropes",
    muscleGroups: ["Conditioning"],
    equipment: ["Battle Rope"],
    difficulty: "intermediate",
  },
  {
    name: "Burpees",
    muscleGroups: ["Conditioning"],
    equipment: [],
    difficulty: "intermediate",
  },
]

export function getExercisesForMuscleGroup(
  muscleGroup: string,
  availableEquipment: string[],
  fitnessLevel: string,
  injuries: string[],
): Exercise[] {
  return exerciseDatabase.filter((exercise) => {
    // Must target the muscle group
    if (!exercise.muscleGroups.includes(muscleGroup)) return false

    // Check equipment availability (empty equipment array means bodyweight)
    if (exercise.equipment.length > 0) {
      const hasEquipment = exercise.equipment.some((eq) => availableEquipment.includes(eq))
      if (!hasEquipment) return false
    }

    // Check injury conflicts
    if (exercise.avoidWithInjuries && injuries.length > 0) {
      const hasConflict = exercise.avoidWithInjuries.some((injuryKeyword) =>
        injuries.some((userInjury) => userInjury.toLowerCase().includes(injuryKeyword)),
      )
      if (hasConflict) return false
    }

    // Filter by difficulty (beginners shouldn't get advanced exercises)
    if (fitnessLevel === "beginner" && exercise.difficulty === "advanced") return false

    return true
  })
}

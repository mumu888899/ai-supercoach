export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Exercise {
  id: string;
  name: string;
  instructions: string;
  imageUrl?: string;
  dataAiHint?: string;
  equipment: string[];
  targetMuscles: string[];
  difficulty: FitnessLevel;
}

export interface SetLog {
  reps: number;
  weight?: number; // Optional for bodyweight exercises
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface ExerciseLogEntry {
  exerciseId: string; // or Exercise object
  exerciseName: string; // for easy display
  sets: SetLog[];
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO string
  exercises: ExerciseLogEntry[];
  overallRPE?: number;
  durationMinutes?: number;
  notes?: string; // General workout notes
}

export interface Goal {
  id:string;
  description: string;
  targetMetric: 'weight' | 'lift_pr' | 'workout_frequency' | 'custom';
  targetValue: number | string;
  currentValue?: number | string;
  unit?: string; // e.g., 'kg', 'lbs', 'reps', 'workouts/week'
  deadline?: string; // ISO string
  isAchieved: boolean;
  createdAt: string; // ISO string
}

export interface WorkoutPlan {
  warmUp?: string[];
  mainWorkout: {
    exerciseName: string;
    setsAndReps: string;
    notes?: string;
  }[];
  coolDown?: string[];
}

// Example for storing preferences for workout generation
export interface UserPreferences {
  fitnessGoal: string;
  fitnessLevel: FitnessLevel;
  equipmentAvailable: string;
  preferredDuration: string; // e.g. "30 minutes"
}

// types/workout.ts
export type ViewMode = 'calendar' | 'list';

export interface Category {
  id: string;
  name: string;
}

export interface Exercise {
  id: string;         
  name: string;       
  category: string;   
  videoUrl?: string; 

  // Base configuration
  defaultSets?: number;
  defaultReps?: string;
  defaultRpe?: string;
  defaultNotes?: string;

  // Workout-specific overrides
  sets?: number;     
  reps?: string;     
  rpe?: string;      
  notes?: string;    
}

export interface WorkoutSection {
  name: string;
  exercises: Exercise[];
}

export interface WorkoutType {
  id: string;
  name: string;
  colorClass: string;
  description?: string;
  rpeRange?: string;
  notes?: string;
  sections: WorkoutSection[];
}

export interface Program {
  id: string;
  name: string;
  version: string;
  description: string;
  workoutTypes: Record<string, WorkoutType>;
  schedule: {
    length: number;
    unit: string;
    weeks: {
      id: string;
      days: string[];
    }[];
  };
}

export interface UserWorkout {
  id: string;
  userProgramId: string;
  date: Date;
  workoutType: string;
  userNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  exercises?: CompletedExercise[];
}

export interface DayWorkout {
  id?: string;
  userProgramId: string;
  date: Date;
  workout: string;
  completed: Record<string, boolean>;
  userNotes?: string;
  exercises?: CompletedExercise[];
}

export interface CompletedExercise {
  id: string;
  userWorkoutId: string;
  exerciseId: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Schedule = DayWorkout[][];

export interface WorkoutProgram {
  warmup: Exercise[];
  throwing: Exercise[];
  recovery: Exercise[];
  rpeRange?: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgram {
  id: string;
  userId: string;
  programId: string;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
  workouts?: UserWorkout[];
}

export interface WorkoutState {
  schedule: Schedule;
  expandedWorkoutId: string | null;
  viewMode: ViewMode;
  startDate: Date;
}

export interface WorkoutProgress {
  totalExercises: number;
  completedExercises: number;
  percentage: number;
}

export type WorkoutAction =
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_EXPANDED_WORKOUT'; payload: string | null }
  | { type: 'UPDATE_SCHEDULE'; payload: Schedule }
  | { type: 'SET_START_DATE'; payload: Date }
  | { type: 'COMPLETE_EXERCISE'; payload: { weekIndex: number; dayIndex: number; exerciseId: string } }
  | { type: 'UPDATE_NOTES'; payload: { weekIndex: number; dayIndex: number; notes: string } }
  | { type: 'BATCH_COMPLETE'; payload: { weekIndex: number; dayIndex: number; exerciseIds: string[]; completed: boolean } }
  | { type: 'CLEAR_SCHEDULE' };

// Program Configuration Types
export interface ProgramConfig {
  programData: Program;
  exerciseData: {
    categories: Record<string, Category>;
    exercises: Record<string, Exercise>;
  };
}

export interface ProgramState extends ProgramConfig {
  isInitialized: boolean;
  error?: Error;
}

export type ProgramAction =
  | { type: 'INITIALIZE'; payload: ProgramConfig }
  | { type: 'SET_ERROR'; payload: Error };
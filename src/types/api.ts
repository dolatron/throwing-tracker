// types/api.ts
import type { DayWorkout, Program, User, UserProgram } from '@/types';

// Error Types
export interface APIError extends Error {
  code: string;
  status: number;
}

// Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string | APIError;
  status: number;
}

export interface DbResult<T> {
  data: T | null;
  error: Error | null;
}

// Database Options
export interface DbOptions {
  select?: string[];
  where?: Record<string, unknown>;
  orderBy?: string;
  limit?: number;
}

// Request Types
export interface OnboardRequest {
  firstName?: string;
  email: string;
  programId: string;
}

export interface WorkoutSyncRequest {
  workoutId: string;
  date: string;
  exercises: {
    id: string;
    completed: boolean;
  }[];
  notes?: string;
}

// Response Types
export interface AuthResponse {
  user: {
    id: string;
    email: string;
  } | null;
  session: unknown | null;
}

export interface WorkoutSyncResponse {
  workoutId: string;
  synced: boolean;
  timestamp: string;
}

// Service API Interfaces
export interface WorkoutAPI {
  syncWorkout: (workout: DayWorkout, userId: string) => Promise<ApiResponse<void>>;
  fetchWorkouts: (userId: string, programId: string) => Promise<ApiResponse<DayWorkout[]>>;
  clearWorkouts: (programId: string) => Promise<ApiResponse<void>>;
  updateWorkoutNotes: (workoutId: string, notes: string) => Promise<ApiResponse<void>>;
  batchCompleteExercises: (workoutId: string, exerciseIds: string[], completed: boolean) => Promise<ApiResponse<void>>;
}

export interface AuthAPI {
  signIn: (email: string) => Promise<ApiResponse<void>>;
  signOut: () => Promise<ApiResponse<void>>;
  getUser: () => Promise<ApiResponse<User | null>>;
}

export interface ProgramAPI {
  fetchProgram: (programId: string) => Promise<ApiResponse<Program>>;
  fetchUserProgram: (userId: string) => Promise<ApiResponse<UserProgram>>;
  createUserProgram: (userId: string, programId: string) => Promise<ApiResponse<UserProgram>>;
}

export interface API {
  workouts: WorkoutAPI;
  auth: AuthAPI;
  programs: ProgramAPI;
}

export interface OnboardRequest {
  firstName?: string;
  email: string;
}
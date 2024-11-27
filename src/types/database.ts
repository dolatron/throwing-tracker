// types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbProgram {
  id: string;
  userId: string;
  programId: string;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbWorkout {
  id: string;
  userProgramId: string;
  date: Date;
  workoutType: string;
  userNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Add Supabase-specific types if needed
export interface Database {
  public: {
    Tables: {
      completed_exercises: {
        Row: {
          completed: boolean;
          created_at: string;
          exercise_id: string;
          id: string;
          updated_at: string;
          user_workout_id: string;
        };
        Insert: {
          completed?: boolean;
          created_at?: string;
          exercise_id: string;
          id?: string;
          updated_at?: string;
          user_workout_id: string;
        };
        Update: {
          completed?: boolean;
          created_at?: string;
          exercise_id?: string;
          id?: string;
          updated_at?: string;
          user_workout_id?: string;
        };
      };
      // Add other tables as needed
    };
  };
}
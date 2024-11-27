// lib/db.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database, DbUser, DbProgram, DbWorkout } from '@/types/database';
import type { ApiResponse, DbResult, WorkoutSyncRequest } from '@/types/api';

export const createClient = () => 
  createClientComponentClient<Database>();

// API response utilities
export const apiResponse = {
  success<T>(data: T, status = 200): ApiResponse<T> {
    return { data, status };
  },

  error(message: string, status = 500): ApiResponse<never> {
    return { error: message, status };
  }
};

// Database query utilities
export const dbQuery = {
  async getUser(userId: string): Promise<DbResult<DbUser>> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async getUserProgram(userId: string, programId: string): Promise<DbResult<DbProgram>> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('user_programs')
        .select()
        .eq('user_id', userId)
        .eq('program_id', programId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async syncWorkout(request: WorkoutSyncRequest): Promise<DbResult<DbWorkout>> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('user_workouts')
        .upsert({
          date: request.date,
          workout_type: request.workoutId,
          user_notes: request.notes,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
};
'use client';

import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { DayWorkout } from '@/types/workout';
import type { Database } from '@/types/database/supabase';

export function useWorkoutSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  const syncWorkoutToDb = useCallback(async (workout: DayWorkout, userId: string) => {
    try {
      setIsSyncing(true);
      setError(null);

      const workoutData = {
        user_id: userId,
        date: workout.date.toISOString(),
        workout_type: workout.workout,
        user_notes: workout.userNotes,
        updated_at: new Date().toISOString()
      };

      // Save workout
      const { data: savedWorkout, error: workoutError } = await supabase
        .from('user_workouts')
        .upsert(workoutData)
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Save completed exercises if any
      if (Object.keys(workout.completed).length > 0) {
        const exercises = Object.entries(workout.completed).map(([exerciseId, completed]) => ({
          user_workout_id: savedWorkout.id,
          exercise_id: exerciseId,
          completed,
          updated_at: new Date().toISOString()
        }));

        const { error: exercisesError } = await supabase
          .from('completed_exercises')
          .upsert(exercises);

        if (exercisesError) throw exercisesError;
      }

      return savedWorkout;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync workout';
      setError(message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [supabase]);

  const loadWorkouts = useCallback(async (userId: string, programId: string) => {
    try {
      setIsSyncing(true);
      setError(null);

      const { data: workouts, error } = await supabase
        .from('user_workouts')
        .select(`
          *,
          completed_exercises (
            exercise_id,
            completed
          )
        `)
        .eq('user_id', userId)
        .eq('program_id', programId);

      if (error) throw error;

      return workouts.map(w => ({
        date: new Date(w.date),
        workout: w.workout_type,
        completed: w.completed_exercises.reduce((acc: Record<string, boolean>, ex) => ({
          ...acc,
          [ex.exercise_id]: ex.completed
        }), {}),
        userNotes: w.user_notes || undefined,
        userProgramId: w.user_program_id
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load workouts';
      setError(message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [supabase]);

  const clearWorkouts = useCallback(async (programId: string) => {
    try {
      setIsSyncing(true);
      setError(null);

      const { error } = await supabase
        .from('user_workouts')
        .delete()
        .eq('program_id', programId);

      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear workouts';
      setError(message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [supabase]);

  return {
    syncWorkoutToDb,
    loadWorkouts,
    clearWorkouts,
    isSyncing,
    error
  };
}
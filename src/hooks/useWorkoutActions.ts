'use client';

import { useCallback } from 'react';
import type { Schedule, DayWorkout } from '@/types/workout';

interface UseWorkoutActionsProps {
  userId: string;
  schedule: Schedule;
  syncWorkoutToDb: (workout: DayWorkout, userId: string) => Promise<void>;
}

export function useWorkoutActions({
  userId,
  schedule,
  syncWorkoutToDb
}: UseWorkoutActionsProps) {
  const handleExerciseComplete = useCallback(async (
    weekIndex: number,
    dayIndex: number,
    exerciseId: string
  ) => {
    if (!userId) return;

    try {
      const workout = schedule[weekIndex][dayIndex];
      const updatedWorkout = {
        ...workout,
        completed: {
          ...workout.completed,
          [exerciseId]: !workout.completed[exerciseId]
        }
      };

      await syncWorkoutToDb(updatedWorkout, userId);
    } catch (error) {
      console.error('Failed to sync exercise completion:', error);
    }
  }, [userId, schedule, syncWorkoutToDb]);

  const handleBatchComplete = useCallback(async (
    weekIndex: number,
    dayIndex: number,
    exerciseIds: string[],
    completed: boolean
  ) => {
    if (!userId) return;

    try {
      const workout = schedule[weekIndex][dayIndex];
      const updatedWorkout = {
        ...workout,
        completed: {
          ...workout.completed,
          ...exerciseIds.reduce((acc, id) => ({
            ...acc,
            [id]: completed
          }), {})
        }
      };

      await syncWorkoutToDb(updatedWorkout, userId);
    } catch (error) {
      console.error('Failed to sync batch completion:', error);
    }
  }, [userId, schedule, syncWorkoutToDb]);

  const handleNotesUpdate = useCallback(async (
    weekIndex: number,
    dayIndex: number,
    notes: string
  ) => {
    if (!userId) return;

    try {
      const workout = schedule[weekIndex][dayIndex];
      const updatedWorkout = {
        ...workout,
        userNotes: notes
      };

      await syncWorkoutToDb(updatedWorkout, userId);
    } catch (error) {
      console.error('Failed to sync notes update:', error);
    }
  }, [userId, schedule, syncWorkoutToDb]);

  return {
    handleExerciseComplete,
    handleBatchComplete,
    handleNotesUpdate
  };
}
// hooks/useWorkout.ts
import { useContext } from 'react';
import { WorkoutContext } from '@/contexts/workout-context';
import type { Schedule, ViewMode } from '@/types';
import type { ApiResponse } from '@/types/api';

export function useWorkout() {
  const context = useContext(WorkoutContext);
  
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  
  return {
    schedule: context.schedule,
    expandedWorkoutId: context.expandedWorkoutId,
    viewMode: context.viewMode,
    isLoading: context.isLoading,
    setViewMode: context.setViewMode,
    setExpandedWorkout: context.setExpandedWorkout,
    setSchedule: context.setSchedule,
    fetchWorkouts: context.fetchWorkouts,
    handleExerciseComplete: context.handleExerciseComplete,
    handleBatchComplete: context.handleBatchComplete,
    handleNotesUpdate: context.handleNotesUpdate
  };
}
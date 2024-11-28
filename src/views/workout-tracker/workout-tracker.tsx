'use client';

import { useEffect, useState } from 'react';
import { useProgram } from '@/hooks/useProgram';
import { useWorkout } from '@/hooks/useWorkout';
import { generateSchedule } from '@/lib/workout';
import { LoadingSpinner } from '@/views/shared/components/status';
import { WorkoutHeader } from './components/workout-header';
import { WorkoutGrid } from './components/workout-grid';
import { WorkoutList } from './components/workout-list';
import type { Schedule } from '@/types/workout';
import type { ApiResponse } from '@/types/api';

export interface WorkoutTrackerProps {
  userId: string;
  programId: string;
}

interface SavedWorkout {
  id: string;
  completed: Record<string, boolean>;
  userNotes?: string;
}

export function WorkoutTracker({ userId, programId }: WorkoutTrackerProps) {
  const { programData } = useProgram();
  const { 
    schedule,
    expandedWorkoutId,
    viewMode,
    setViewMode,
    setExpandedWorkout,
    setSchedule,
    fetchWorkouts,
    handleExerciseComplete,
    handleBatchComplete,
    handleNotesUpdate,
    isLoading: isSyncing 
  } = useWorkout();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadWorkouts = async () => {
      if (!userId || !programId || !programData) return;

      try {
        // Generate base schedule - use today's date instead of startDate
        const baseSchedule = generateSchedule(new Date(), programData);
        
        // Fetch saved data
        const result = await fetchWorkouts(userId, programId);
        
        if (!mounted) return;
        
        if (result.error) {
          console.error('Failed to load workouts:', result.error);
          setSchedule(baseSchedule);
          return;
        }

        // Merge saved data with base schedule
        if (result.data?.length) {
          const workoutMap = new Map(
            result.data.map(w => [
              new Date(w.date).toISOString().split('T')[0],
              {
                id: w.id,
                completed: w.completed_exercises?.reduce((acc, ex) => ({
                  ...acc,
                  [ex.exercise_id]: ex.completed
                }), {}) || {},
                userNotes: w.user_notes
              }
            ])
          );

          const mergedSchedule = baseSchedule.map(week =>
            week.map(day => ({
              ...day,
              completed: workoutMap.get(day.date.toISOString().split('T')[0])?.completed || {},
              userNotes: workoutMap.get(day.date.toISOString().split('T')[0])?.userNotes
            }))
          );

          setSchedule(mergedSchedule);
        } else {
          setSchedule(baseSchedule);
        }
      } catch (error) {
        console.error('Failed to load workouts:', error);
        if (programData) {
          setSchedule(generateSchedule(new Date(), programData));
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    loadWorkouts();
    return () => { mounted = false; };
  }, [userId, programId, programData, fetchWorkouts, setSchedule]);

  if (!programData || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  const viewProps = {
    schedule,
    expandedWorkoutId,
    onExpandWorkout: setExpandedWorkout,
    onExerciseComplete: (weekIndex: number, dayIndex: number, exerciseId: string) =>
      handleExerciseComplete(weekIndex, dayIndex, exerciseId, userId),
    onBatchComplete: (weekIndex: number, dayIndex: number, exerciseIds: string[], completed: boolean) =>
      handleBatchComplete(weekIndex, dayIndex, exerciseIds, completed, userId),
    onNotesChange: (weekIndex: number, dayIndex: number, notes: string) =>
      handleNotesUpdate(weekIndex, dayIndex, notes, userId),
    userId
  };

  return (
    <div className="max-w-6xl mx-auto">
      <WorkoutHeader
        title={programData.name}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        startDate={new Date()} // Use current date for now
        onStartDateChange={() => {}}
      />

      {isSyncing && (
        <div className="mb-6 text-sm text-gray-600 flex items-center gap-2">
          <LoadingSpinner size="w-4 h-4" />
          Syncing changes...
        </div>
      )}

      {viewMode === 'calendar' ? (
        <WorkoutGrid {...viewProps} />
      ) : (
        <WorkoutList {...viewProps} />
      )}
    </div>
  );
}
// views/tracker/workout-tracker.tsx
'use client';

import { Alert } from '@/views/shared/components/elements/alert';
import { useProgram } from '@/hooks/useProgram';
import { useWorkoutState } from '@/hooks/useWorkoutState';
import { useWorkoutSync } from '@/hooks/useWorkoutSync';
import { TrackerHeader, WorkoutGrid, WorkoutList } from './components';

export interface WorkoutTrackerProps {
  userId: string;
  programId: string;
}

export function WorkoutTracker({ userId, programId }: WorkoutTrackerProps) {
  const { programData } = useProgram();
  const {
    schedule,
    expandedWorkoutId,
    viewMode,
    setViewMode,
    setExpandedWorkout,
    completeExercise,
    updateNotes,
    batchComplete,
  } = useWorkoutState(programId);

  const { syncWorkoutToDb, isSyncing, error } = useWorkoutSync();

  const handleExerciseComplete = async (weekIndex: number, dayIndex: number, exerciseId: string) => {
    if (!userId) return;

    completeExercise(weekIndex, dayIndex, exerciseId);

    try {
      await syncWorkoutToDb(schedule[weekIndex][dayIndex], userId);
    } catch (error) {
      console.error('Failed to sync workout:', error);
    }
  };

  const handleNotesUpdate = async (weekIndex: number, dayIndex: number, notes: string) => {
    if (!userId) return;

    updateNotes(weekIndex, dayIndex, notes);

    try {
      await syncWorkoutToDb(schedule[weekIndex][dayIndex], userId);
    } catch (error) {
      console.error('Failed to sync workout notes:', error);
    }
  };

  const handleBatchComplete = async (
    weekIndex: number,
    dayIndex: number,
    exerciseIds: string[],
    completed: boolean
  ) => {
    if (!userId) return;

    batchComplete(weekIndex, dayIndex, exerciseIds, completed);

    try {
      await syncWorkoutToDb(schedule[weekIndex][dayIndex], userId);
    } catch (error) {
      console.error('Failed to sync batch completion:', error);
    }
  };

  const sharedProps = {
    schedule,
    expandedWorkoutId,
    onExpandWorkout: setExpandedWorkout,
    onExerciseComplete: handleExerciseComplete,
    onBatchComplete: handleBatchComplete,
    onNotesChange: handleNotesUpdate,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <TrackerHeader
        title={programData.name}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Status indicators */}
      <div className="mb-6 space-y-4">
        {isSyncing && (
          <div className="text-sm text-gray-600">
            Syncing changes...
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}
      </div>

      {/* Workout view */}
      {viewMode === 'calendar' ? (
        <WorkoutGrid {...sharedProps} />
      ) : (
        <WorkoutList {...sharedProps} />
      )}
    </div>
  );
}
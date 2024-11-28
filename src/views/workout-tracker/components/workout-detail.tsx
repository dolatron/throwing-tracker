// views/workout-tracker/components/workout-detail.tsx
'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '@/views/shared/components/elements/card';
import { cn } from '@/lib/utils';
import { CompletionStats } from '@/views/shared/components/status/completion-stats';
import { useProgram } from '@/hooks/useProgram';
import { useWorkout } from '@/hooks/useWorkout';
import { getWorkoutProgram, calculateWorkoutStats } from '@/lib/workout';
import type { DayWorkout } from '@/types';
import { LoadingSpinner } from '@/views/shared/components/status';
import { WorkoutSection } from './workout-section';

// Internal Action Buttons Component
interface ActionButtonsProps {
  onComplete: () => void;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
  confirmOnClear?: boolean;
}

function ActionButtons({
  onComplete,
  onClear,
  disabled = false,
  className,
  confirmOnClear = true,
}: ActionButtonsProps) {
  const handleClear = () => {
    if (confirmOnClear) {
      const confirmed = window.confirm('Are you sure you want to clear all progress?');
      if (!confirmed) return;
    }
    onClear();
  };

  return (
    <div className={cn(
      "flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200",
      className
    )}>
      <button
        onClick={handleClear}
        disabled={disabled}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-colors",
          "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        Clear Progress
      </button>
      <button
        onClick={onComplete}
        disabled={disabled}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-colors",
          "text-white bg-indigo-600 hover:bg-indigo-700",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        Complete All
      </button>
    </div>
  );
}

// Internal Notes Component
interface NotesProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function WorkoutNotes({
  value = '',
  onChange,
  className
}: NotesProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-base sm:text-lg font-semibold text-indigo-900">
        Workout Notes
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add notes about your workout..."
        className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
      />
    </div>
  );
}

// Main WorkoutDetail Component
export interface WorkoutDetailProps {
  day: DayWorkout;
  weekIndex: number;
  dayIndex: number;
  onClose: () => void;
  userId: string;
}

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric'
} as const;

export function WorkoutDetail({
  day,
  weekIndex,
  dayIndex,
  onClose,
  userId
}: WorkoutDetailProps) {
  const { programData, exerciseData } = useProgram();
  const { 
    handleBatchComplete,
    handleNotesUpdate,
    isLoading 
  } = useWorkout();

  // Get workout program
  const workoutProgram = useMemo(() => {
    if (!programData || !exerciseData) {
      console.error('Missing program or exercise data:', { programData, exerciseData });
      return null;
    }
    return getWorkoutProgram(day.workout, { programData, exerciseData });
  }, [day.workout, programData, exerciseData]);

  // Calculate workout stats
  const stats = useMemo(() => {
    if (!programData) return { completedCount: 0, totalExercises: 0 };
    return calculateWorkoutStats(day, programData);
  }, [day, programData]);

  // Get workout type info
  const workoutType = useMemo(() => {
    if (!programData?.workoutTypes) {
      console.warn('Program data or workout types not available');
      return null;
    }
  
    const workoutConfig = programData.workoutTypes[day.workout];
    if (!workoutConfig) {
      console.warn(`Workout type ${day.workout} not found in program data`);
      return null;
    }
  
    return workoutConfig;
  }, [programData, day.workout]);

  // Calculate sections and exercise IDs
  const { sections, allExerciseIds } = useMemo(() => {
    if (!workoutProgram) return { sections: [], allExerciseIds: [] };

    const sections = [
      { title: 'Warm-up', exercises: workoutProgram.warmup },
      { title: 'Throwing', exercises: workoutProgram.throwing },
      { title: 'Recovery', exercises: workoutProgram.recovery }
    ].filter(section => section.exercises?.length > 0);

    const allExerciseIds = sections.flatMap(section =>
      section.exercises.map(exercise =>
        `week${weekIndex}-day${dayIndex}-${section.title.toLowerCase()}-${exercise.id}`
      )
    );

    return { sections, allExerciseIds };
  }, [workoutProgram, weekIndex, dayIndex]);

  const handleNotes = async (notes: string) => {
    await handleNotesUpdate(weekIndex, dayIndex, notes, userId);
  };

// Inside WorkoutDetail component

const [isCompleting, setIsCompleting] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleComplete = async () => {
  setIsCompleting(true);
  setError(null);
  
  try {
    const result = await handleBatchComplete(weekIndex, dayIndex, allExerciseIds, true, userId);
    
    if (result.error) {
      throw new Error(typeof result.error === 'string' ? result.error : 'Failed to complete workout');
    }
    
    onClose();
  } catch (err) {
    console.error('Failed to complete workout:', err);
    setError(err instanceof Error ? err.message : 'Failed to complete workout');
  } finally {
    setIsCompleting(false);
  }
};

const handleClear = async () => {
  if (!window.confirm('Are you sure you want to clear all progress?')) {
    return;
  }

  setIsCompleting(true);
  setError(null);

  try {
    const result = await handleBatchComplete(weekIndex, dayIndex, allExerciseIds, false, userId);
    
    if (result.error) {
      throw new Error(typeof result.error === 'string' ? result.error : 'Failed to clear workout');
    }
  } catch (err) {
    console.error('Failed to clear workout:', err);
    setError(err instanceof Error ? err.message : 'Failed to clear workout');
  } finally {
    setIsCompleting(false);
  }
};

  // Show loading state if program data isn't ready
  if (!workoutProgram || !programData) {
    return (
      <Card className="w-full bg-white p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Loading workout details...</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white p-3 sm:p-6 shadow-lg">
      {/* Header */}
      <header className="flex justify-between items-start pb-3 sm:pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-indigo-900">
            {workoutType?.name || day.workout}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            {day.date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)}
          </p>
          {workoutType?.rpeRange && (
            <p className="text-sm text-indigo-600 mt-1">
              Target Intensity: {workoutType.rpeRange}
            </p>
          )}
          {workoutType?.notes && (
            <p className="text-sm text-gray-600 mt-2">
              {workoutType.notes}
            </p>
          )}
          
          <div className="mt-4">
            <CompletionStats
              completed={stats.completedCount}
              total={stats.totalExercises}
            />
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Exercise Sections */}
      <div className="divide-y divide-gray-200">
        {sections.map((section) => (
          <WorkoutSection
            key={`${weekIndex}-${dayIndex}-${section.title}`}
            title={section.title}
            exercises={section.exercises}
            completed={day.completed}
            weekIndex={weekIndex}
            dayIndex={dayIndex}
            sectionId={`week${weekIndex}-day${dayIndex}-${section.title.toLowerCase()}`}
            userId={userId}
          />
        ))}
        
        {/* Notes Section */}
        <div className="rounded-lg p-3 sm:p-6">
          <WorkoutNotes
            value={day.userNotes || ''}
            onChange={handleNotes}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <ActionButtons
        onComplete={handleComplete}
        onClear={handleClear}
        disabled={isLoading}
      />
    </Card>
  );
}
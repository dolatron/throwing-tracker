// types/components.ts
import type { ReactNode } from 'react';
import type { DayWorkout, Exercise } from './workout';

export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

export interface WithId {
  id: string;
}

export interface WorkoutCardProps extends BaseProps {
  workout: DayWorkout;
  isExpanded: boolean;
  completed?: boolean;
  inProgress?: boolean;
  completionPercentage?: number;
  onClick: () => void;
}

export interface WorkoutSectionProps extends BaseProps {
  title: string;
  exercises: Exercise[];
  completed: Record<string, boolean>;
  onComplete: (id: string) => void;
}

export interface WorkoutDetailProps {
  day: DayWorkout;
  weekIndex: number;
  dayIndex: number;
  onClose: () => void;
  onExerciseComplete: (exerciseId: string) => void;
  onBatchComplete: (exerciseIds: string[], completed: boolean) => void;
  onNotesChange: (notes: string) => void;
}

export interface WorkoutTrackerProps {
  userId: string;
  programId: string;
}
// views/workout-tracker/components/workout-list.tsx
'use client';

import type { Schedule } from '@/types';
import type { ApiResponse } from '@/types/api';
import { WorkoutBase } from './workout-base';
import type { WeekRenderProps } from './workout-base';

export interface WorkoutListProps {
  schedule: Schedule;
  expandedWorkoutId: string | null;
  onExpandWorkout: (id: string | null) => void;
  onExerciseComplete: (weekIndex: number, dayIndex: number, exerciseId: string) => Promise<ApiResponse<void>>;
  onBatchComplete: (weekIndex: number, dayIndex: number, exerciseIds: string[], completed: boolean) => Promise<ApiResponse<void>>;
  onNotesChange: (weekIndex: number, dayIndex: number, notes: string) => Promise<ApiResponse<void>>;
  userId: string;
}

export function WorkoutList(props: WorkoutListProps) {
  const renderWeek = ({ week, weekIndex, renderDay }: WeekRenderProps) => (
    <div className="space-y-2">
      {week.map((day, dayIndex) => {
        const workoutId = `week${weekIndex}-day${dayIndex}`;
        const isExpanded = props.expandedWorkoutId === workoutId;
  
        return (
          <div key={workoutId} className="space-y-2">
            {renderDay({
              day,
              dayIndex,
              isExpanded,
              onCardClick: () => props.onExpandWorkout(isExpanded ? null : workoutId)
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <WorkoutBase
      {...props}
      viewMode="list"
      renderWeek={renderWeek}
    />
  );
}
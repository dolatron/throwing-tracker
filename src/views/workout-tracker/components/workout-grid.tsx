// views/workout-tracker/components/workout-grid.tsx
'use client';

import type { Schedule } from '@/types';
import type { ApiResponse } from '@/types/api';
import { WorkoutBase } from './workout-base';
import type { WeekRenderProps } from './workout-base';

export interface WorkoutGridProps {
  schedule: Schedule;
  expandedWorkoutId: string | null;
  onExpandWorkout: (id: string | null) => void;
  onExerciseComplete: (weekIndex: number, dayIndex: number, exerciseId: string) => Promise<ApiResponse<void>>;
  onBatchComplete: (weekIndex: number, dayIndex: number, exerciseIds: string[], completed: boolean) => Promise<ApiResponse<void>>;
  onNotesChange: (weekIndex: number, dayIndex: number, notes: string) => Promise<ApiResponse<void>>;
  userId: string;
}

export function WorkoutGrid(props: WorkoutGridProps) {
  const renderWeek = ({ week, weekIndex, renderDay }: WeekRenderProps) => (
    <div className="space-y-2 sm:space-y-4">
      <div className="grid gap-1 sm:gap-4 grid-cols-7 auto-rows-min">
        {week.map((day, dayIndex) => {
          const workoutId = `week${weekIndex}-day${dayIndex}`;
          const isExpanded = props.expandedWorkoutId === workoutId;
  
          return (
            <div key={workoutId}>
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
    </div>
  );

  return (
    <WorkoutBase
      {...props}
      viewMode="calendar"
      renderWeek={renderWeek}
    />
  );
}
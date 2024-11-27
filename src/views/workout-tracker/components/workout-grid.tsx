// views/workout-tracker/components/workout-grid.tsx
'use client';

import { WorkoutBase, type WeekRenderProps } from './workout-base';
import type { Schedule } from '@/types';

export interface WorkoutGridProps {
  schedule: Schedule;
  expandedWorkoutId: string | null;
  onExpandWorkout: (id: string | null) => void;
  onExerciseComplete: (weekIndex: number, dayIndex: number, exerciseId: string) => void;
  onBatchComplete: (weekIndex: number, dayIndex: number, exerciseIds: string[], completed: boolean) => void;
  onNotesChange: (weekIndex: number, dayIndex: number, notes: string) => void;
}

export function WorkoutGrid(props: WorkoutGridProps) {
  const renderWeek = ({ week, weekIndex, expandedDay, renderDay }: WeekRenderProps) => (
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
                onCardClick: () => props.onExpandWorkout(workoutId)
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
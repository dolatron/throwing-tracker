// views/workout-tracker/components/workout-list.tsx
'use client';

import { WorkoutBase, type WeekRenderProps } from './workout-base';
import type { Schedule } from '@/types';

export interface WorkoutListProps {
  schedule: Schedule;
  expandedWorkoutId: string | null;
  onExpandWorkout: (id: string | null) => void;
  onExerciseComplete: (weekIndex: number, dayIndex: number, exerciseId: string) => void;
  onBatchComplete: (weekIndex: number, dayIndex: number, exerciseIds: string[], completed: boolean) => void;
  onNotesChange: (weekIndex: number, dayIndex: number, notes: string) => void;
}

export function WorkoutList(props: WorkoutListProps) {
  const renderWeek = ({ week, weekIndex, expandedDay, renderDay }: WeekRenderProps) => (
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
              onCardClick: () => props.onExpandWorkout(workoutId)
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
'use client';

import { useRef, useCallback, useEffect } from 'react';
import { WorkoutDetail } from './workout-detail';
import { useProgram } from '@/hooks/useProgram';
import { WorkoutCard } from './workout-card'; // We'll create this next
import type { DayWorkout, Schedule, ViewMode } from '@/types';
import type { ApiResponse } from '@/types/api';

export interface DayRenderProps {
  day: DayWorkout;
  dayIndex: number;
  isExpanded: boolean;
  onCardClick: () => void;
}

export interface WeekRenderProps {
  week: DayWorkout[];
  weekIndex: number;
  renderDay: (props: DayRenderProps) => React.ReactNode;
}

export interface WorkoutBaseProps {
  schedule: Schedule;
  expandedWorkoutId: string | null;
  onExpandWorkout: (id: string | null) => void;
  userId: string;
  viewMode: ViewMode;
  renderWeek: (props: WeekRenderProps) => React.ReactNode;
  onExerciseComplete: (weekIndex: number, dayIndex: number, exerciseId: string) => Promise<ApiResponse<void>>;
  onBatchComplete: (weekIndex: number, dayIndex: number, exerciseIds: string[], completed: boolean) => Promise<ApiResponse<void>>;
  onNotesChange: (weekIndex: number, dayIndex: number, notes: string) => Promise<ApiResponse<void>>;
}

export function WorkoutBase({
  schedule,
  expandedWorkoutId,
  onExpandWorkout,
  userId,
  viewMode,
  renderWeek,
  onExerciseComplete,
  onBatchComplete,
  onNotesChange
}: WorkoutBaseProps) {
  const { programData } = useProgram();
  const weekRefs = useRef<Map<number, HTMLElement | null>>(new Map());
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    return () => {
      weekRefs.current.clear();
      cardRefs.current.clear();
    };
  }, [schedule]);

  const handleCardClick = useCallback((weekIndex: number, dayIndex: number, cardEl: HTMLDivElement) => {
    const workoutId = `week${weekIndex}-day${dayIndex}`;
    cardRefs.current.set(workoutId, cardEl);

    if (expandedWorkoutId === workoutId) {
      onExpandWorkout(null);
      return;
    }

    onExpandWorkout(workoutId);

    requestAnimationFrame(() => {
      if (viewMode === 'list' || window.innerWidth < 640) {
        cardEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const weekEl = weekRefs.current.get(weekIndex);
        if (weekEl) {
          const yOffset = -20;
          const y = weekEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ behavior: 'smooth', top: y });
        }
      }
    });
  }, [expandedWorkoutId, onExpandWorkout, viewMode]);

  const handleWorkoutClose = useCallback((weekIndex: number) => {
    onExpandWorkout(null);

    requestAnimationFrame(() => {
      const weekEl = weekRefs.current.get(weekIndex);
      if (weekEl) {
        const yOffset = -20;
        const y = weekEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ behavior: 'smooth', top: y });
      }
    });
  }, [onExpandWorkout]);

  const renderDay = useCallback(({ day, dayIndex, isExpanded, onCardClick }: DayRenderProps) => {
    if (!programData) return null;

    let weekIndex = -1;
    let activeDay: DayWorkout | null = null;

    if (expandedWorkoutId) {
      const [week, dayIdx] = expandedWorkoutId.match(/\d+/g)?.map(Number) || [];
      weekIndex = week;
      activeDay = schedule[weekIndex]?.[dayIdx];
    }

    return (
      <>
        <WorkoutCard
          workout={day}
          isExpanded={isExpanded}
          onClick={onCardClick}
          viewMode={viewMode}
        />
        {isExpanded && activeDay && (
          <WorkoutDetail
            day={activeDay}
            weekIndex={weekIndex}
            dayIndex={dayIndex}
            onClose={() => handleWorkoutClose(weekIndex)}
            userId={userId}
            onExerciseComplete={onExerciseComplete}
            onBatchComplete={onBatchComplete}
            onNotesChange={onNotesChange}
          />
        )}
      </>
    );
  }, [programData, expandedWorkoutId, schedule, viewMode, userId, handleWorkoutClose, onExerciseComplete, onBatchComplete, onNotesChange]);

  return (
    <div className="space-y-6 sm:space-y-12">
      {schedule.map((week, weekIndex) => (
        <section
          key={`week-${weekIndex}`}
          ref={el => weekRefs.current.set(weekIndex, el)}
          className="space-y-4"
        >
          {renderWeek({
            week,
            weekIndex,
            renderDay: (props) => renderDay({
              ...props,
              onCardClick: () => handleCardClick(weekIndex, props.dayIndex, cardRefs.current.get(`week${weekIndex}-day${props.dayIndex}`) || document.createElement('div'))
            })
          })}
        </section>
      ))}
    </div>
  );
}
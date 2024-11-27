// views/workout-tracker/components/workout-base.tsx
'use client';

import { useRef } from 'react';
import { StickyNote } from 'lucide-react';
import { Card } from '@/views/shared/components/elements';
import { cn } from '@/lib/utils';
import { useProgram } from '@/hooks/useProgram';
import { WorkoutDetail } from './workout-detail';
import type { DayWorkout, Schedule, ViewMode } from '@/types/workout';

// Utility functions
const getBaseWorkout = (workout: string): string => {
  const base = workout.split(' OR ')[0].trim().replace('*', '');
  if (base !== workout) {
    console.debug('getBaseWorkout transformation:', { input: workout, output: base });
  }
  return base;
};

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions): string => 
  date.toLocaleDateString('en-US', options);

// Internal WorkoutCard component
interface WorkoutCardProps {
  workout: DayWorkout;
  isExpanded: boolean;
  completionPercentage?: number;
  onClick: () => void;
  viewMode: ViewMode;
  ref?: React.RefObject<HTMLDivElement>;
}

const DATE_FORMAT_OPTIONS = {
  WEEKDAY: { weekday: 'short' } as const,
  DAY: { day: 'numeric' } as const,
  MONTH: { month: 'short' } as const
} as const;

function WorkoutCard({
  workout,
  isExpanded,
  completionPercentage,
  onClick,
  viewMode,
}: WorkoutCardProps) {
  const { programData } = useProgram();
  const baseWorkout = getBaseWorkout(workout.workout);
  const workoutInfo = programData.workoutTypes[baseWorkout];
  
  // Format date parts
  const formattedDate = {
    weekday: formatDate(workout.date, DATE_FORMAT_OPTIONS.WEEKDAY),
    day: formatDate(workout.date, DATE_FORMAT_OPTIONS.DAY),
    month: formatDate(workout.date, DATE_FORMAT_OPTIONS.MONTH)
  };

  // Dynamic classes
  const cardClasses = cn(
    "cursor-pointer transition-colors duration-200 w-full",
    viewMode === 'calendar' ? "h-[80px] sm:h-[150px]" : "min-h-[80px]",
    isExpanded && "ring-2 ring-indigo-500",
    workoutInfo?.colorClass
  );

  return (
    <Card 
      className={`${cardClasses} group relative overflow-hidden`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {completionPercentage !== undefined && completionPercentage > 0 && (
        <div className={cn(
          "absolute px-1.5 py-0.5 text-xs font-medium rounded-full bg-black/10",
          viewMode === 'calendar' 
            ? "top-1 right-1 sm:top-2 sm:right-2 text-[9px] sm:text-xs" 
            : "top-2 right-2 text-xs"
        )}>
          {Math.round(completionPercentage)}%
        </div>
      )}

      <div className="p-2 sm:p-3 space-y-0.5 sm:space-y-1">
        {/* Date Display */}
        <div className={cn(
          viewMode === 'calendar' ? "text-[9px] sm:text-xs" : "text-xs"
        )}>
          <span className="font-medium">{formattedDate.weekday}</span>
          {' '}
          <span className="font-normal">
            {formattedDate.month} {formattedDate.day}
          </span>
        </div>

        {/* Workout Name */}
        <div className={cn(
          "font-medium",
          viewMode === 'calendar'
            ? "text-[9px] sm:text-base mt-0.5 sm:mt-2 line-clamp-2"
            : "text-sm sm:text-base mt-1 sm:mt-2"
        )}>
          {workoutInfo?.name || workout.workout}
        </div>

        {/* Description */}
        {workoutInfo?.description && (
          <div className={cn(
            "text-xs mt-1.5 opacity-90 font-normal line-clamp-4",
            viewMode === 'calendar' ? "hidden sm:block" : "block"
          )}>
            {workoutInfo.description}
          </div>
        )}

        {/* RPE Range */}
        {workoutInfo?.rpeRange && (
          <div className={cn(
            "text-xs mt-1 opacity-90 font-medium italic",
            viewMode === 'calendar' ? "hidden sm:block" : "block"
          )}>
            {workoutInfo.rpeRange}
          </div>
        )}
      </div>

      {/* Notes Indicator */}
      {workout.userNotes && (
        <StickyNote className={cn(
          "absolute bottom-1 right-1 sm:bottom-2 sm:right-2 text-gray-400",
          viewMode === 'calendar' ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4"
        )} />
      )}
    </Card>
  );
}

// WorkoutBase interfaces
export interface WorkoutBaseProps {
  schedule: Schedule;
  expandedWorkoutId: string | null;
  onExpandWorkout: (id: string | null) => void;
  onExerciseComplete: (weekIndex: number, dayIndex: number, exerciseId: string) => void;
  onBatchComplete: (weekIndex: number, dayIndex: number, exerciseIds: string[], completed: boolean) => void;
  onNotesChange: (weekIndex: number, dayIndex: number, notes: string) => void;
  viewMode: ViewMode;
  renderWeek: (props: WeekRenderProps) => React.ReactNode;
}

export interface WeekRenderProps {
  week: DayWorkout[];
  weekIndex: number;
  expandedDay: number | null;
  renderDay: (props: DayRenderProps) => React.ReactNode;
}

export interface DayRenderProps {
  day: DayWorkout;
  dayIndex: number;
  isExpanded: boolean;
  onCardClick: () => void;
}

export function WorkoutBase({
  schedule,
  expandedWorkoutId,
  onExpandWorkout,
  onExerciseComplete,
  onBatchComplete,
  onNotesChange,
  viewMode,
  renderWeek,
}: WorkoutBaseProps) {
  const weekRefs = useRef<(HTMLElement | null)[]>([]);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleCardClick = (weekIndex: number, dayIndex: number, cardEl: HTMLDivElement) => {
    const workoutId = `week${weekIndex}-day${dayIndex}`;

    // If clicking the same workout, close it
    if (expandedWorkoutId === workoutId) {
      onExpandWorkout(null);
      return;
    }

    onExpandWorkout(workoutId);

    // Scroll after state update
    setTimeout(() => {
      if (viewMode === 'list' || window.innerWidth < 640) {
        cardEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const weekEl = weekRefs.current[weekIndex];
        if (weekEl) {
          const yOffset = -20;
          const y = weekEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const handleWorkoutClose = (weekIndex: number, dayIndex: number) => {
    onExpandWorkout(null);

    setTimeout(() => {
      const weekEl = weekRefs.current[weekIndex];
      if (weekEl) {
        const yOffset = -20;
        const y = weekEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="space-y-6 sm:space-y-12">
      {schedule.map((week, weekIndex) => {
        const expandedDay = expandedWorkoutId?.startsWith(`week${weekIndex}`)
          ? parseInt(expandedWorkoutId.split('-')[1].replace('day', ''))
          : null;

        return (
          <section
            key={`week-${weekIndex}`}
            ref={el => { weekRefs.current[weekIndex] = el; }}
            className="space-y-4"
          >
            <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4">
              Week {weekIndex + 1}
            </h2>

            {renderWeek({
              week,
              weekIndex,
              expandedDay,
              renderDay: ({ day, dayIndex, isExpanded, onCardClick }) => (
                <WorkoutCard
                  workout={day}
                  isExpanded={isExpanded}
                  onClick={onCardClick}
                  viewMode={viewMode}
                />
              ),
            })}

            {expandedDay !== null && (
              <div className={viewMode === 'calendar' ? "col-span-7 mt-2" : ""}>
                <WorkoutDetail
                  day={week[expandedDay]}
                  weekIndex={weekIndex}
                  dayIndex={expandedDay}
                  onClose={() => handleWorkoutClose(weekIndex, expandedDay)}
                  onExerciseComplete={(exerciseId) => {
                    onExerciseComplete(weekIndex, expandedDay, exerciseId);
                  }}
                  onBatchComplete={(exerciseIds, completed) => {
                    onBatchComplete(weekIndex, expandedDay, exerciseIds, completed);
                  }}
                  onNotesChange={(notes) => {
                    onNotesChange(weekIndex, expandedDay, notes);
                  }}
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
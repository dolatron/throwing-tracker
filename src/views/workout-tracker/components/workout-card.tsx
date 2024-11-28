'use client';

import { StickyNote } from 'lucide-react';
import { Card } from '@/views/shared/components/elements';
import { cn } from '@/lib/utils';
import { useProgram } from '@/hooks/useProgram';
import type { DayWorkout, ViewMode } from '@/types';

interface WorkoutCardProps {
  workout: DayWorkout;
  isExpanded: boolean;
  onClick: () => void;
  viewMode: ViewMode;
}

const DATE_FORMAT_OPTIONS = {
  WEEKDAY: { weekday: 'short' } as const,
  DAY: { day: 'numeric' } as const,
  MONTH: { month: 'short' } as const
} as const;

const formatDate = (date: Date, options: Intl.DateTimeFormatOptions): string => 
  date.toLocaleDateString('en-US', options);

export function WorkoutCard({
  workout,
  isExpanded,
  onClick,
  viewMode,
}: WorkoutCardProps) {
  const { programData } = useProgram();
  const workoutType = programData?.workoutTypes?.[workout.workout];
  
  const formattedDate = {
    weekday: formatDate(workout.date, DATE_FORMAT_OPTIONS.WEEKDAY),
    day: formatDate(workout.date, DATE_FORMAT_OPTIONS.DAY),
    month: formatDate(workout.date, DATE_FORMAT_OPTIONS.MONTH)
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors duration-200 w-full",
        viewMode === 'calendar' ? "h-[80px] sm:h-[150px]" : "min-h-[80px]",
        isExpanded && "ring-2 ring-indigo-500",
        workoutType?.colorClass,
        "group relative overflow-hidden"
      )}
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
      <div className="p-2 sm:p-3 space-y-0.5 sm:space-y-1">
        <div className={cn(
          viewMode === 'calendar' ? "text-[9px] sm:text-xs" : "text-xs"
        )}>
          <span className="font-medium">{formattedDate.weekday}</span>
          {' '}
          <span className="font-normal">
            {formattedDate.month} {formattedDate.day}
          </span>
        </div>

        <div className={cn(
          "font-medium",
          viewMode === 'calendar'
            ? "text-[9px] sm:text-base mt-0.5 sm:mt-2 line-clamp-2"
            : "text-sm sm:text-base mt-1 sm:mt-2"
        )}>
          {workoutType?.name || workout.workout}
        </div>

        {workoutType?.description && (
          <div className={cn(
            "text-xs mt-1.5 opacity-90 font-normal line-clamp-4",
            viewMode === 'calendar' ? "hidden sm:block" : "block"
          )}>
            {workoutType.description}
          </div>
        )}

        {workoutType?.rpeRange && (
          <div className={cn(
            "text-xs mt-1 opacity-90 font-medium italic",
            viewMode === 'calendar' ? "hidden sm:block" : "block"
          )}>
            {workoutType.rpeRange}
          </div>
        )}
      </div>

      {workout.userNotes && (
        <StickyNote 
          className={cn(
            "absolute bottom-1 right-1 sm:bottom-2 sm:right-2 text-gray-400",
            viewMode === 'calendar' ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4"
          )} 
        />
      )}
    </Card>
  );
}
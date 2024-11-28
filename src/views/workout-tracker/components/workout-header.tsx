// views/workout-tracker/components/workout-header.tsx
'use client';

import { LayoutGrid, LayoutList, Calendar } from 'lucide-react';
import type { ViewMode } from '@/types/workout';
import { formatDateForInput } from '@/lib/utils';

export interface WorkoutHeaderProps {
  title: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  startDate: Date;
  onStartDateChange: (date: Date) => void;
}

export function WorkoutHeader({
  title,
  viewMode,
  onViewModeChange,
  startDate,
  onStartDateChange
}: WorkoutHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-lg sm:text-2xl font-bold">
          {title}
        </h1>
        
        <div className="flex items-center gap-4">
          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={formatDateForInput(startDate)}
              onChange={(e) => onStartDateChange(new Date(e.target.value))}
              className="px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* View Mode Toggle */}
          <button
            onClick={() => onViewModeChange(viewMode === 'calendar' ? 'list' : 'calendar')}
            className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100"
          >
            {viewMode === 'calendar' ? (
              <>
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">Switch to List View</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Switch to Calendar View</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
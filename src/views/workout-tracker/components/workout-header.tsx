// views/tracker/components/workout-header.tsx
'use client';

import { LayoutGrid, LayoutList } from 'lucide-react';
import type { ViewMode } from '@/types/workout';

export interface WorkoutHeaderProps {
  title: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function WorkoutHeader({
  title,
  viewMode,
  onViewModeChange
}: WorkoutHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg sm:text-2xl font-bold">
          {title}
        </h1>
        <button
          onClick={() => onViewModeChange(viewMode === 'calendar' ? 'list' : 'calendar')}
          className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100"
        >
          {viewMode === 'calendar' ? (
            <>
              <LayoutList className="w-4 h-4" />
              Switch to List View
            </>
          ) : (
            <>
              <LayoutGrid className="w-4 h-4" />
              Switch to Calendar View
            </>
          )}
        </button>
      </div>
    </div>
  );
}
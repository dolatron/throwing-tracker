// views/shared/components/status/progress-bar.tsx
'use client';

import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  percentage: number;
  color?: string;
  className?: string;
}

export function ProgressBar({
  percentage,
  color = 'bg-indigo-600',
  className
}: ProgressBarProps) {
  return (
    <div className={cn("w-full h-2 bg-gray-200 rounded-full overflow-hidden", className)}>
      <div
        className={cn("h-full transition-all duration-300", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
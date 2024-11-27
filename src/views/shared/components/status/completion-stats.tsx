// views/shared/components/status/completion-stats.tsx
'use client';

import { cn } from "@/lib/utils";
import { ProgressBar } from './progress-bar';

export interface CompletionStatsProps {
  completed: number;
  total: number;
  className?: string;
}

export function CompletionStats({
  completed,
  total,
  className
}: CompletionStatsProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Progress</span>
        <span className="font-medium">
          {completed}/{total} ({Math.round(percentage)}%)
        </span>
      </div>
      <ProgressBar percentage={percentage} />
    </div>
  );
}
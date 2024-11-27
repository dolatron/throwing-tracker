// views/shared/components/status/loading-spinner.tsx
'use client';

import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps { 
  className?: string;
  size?: string;
}

export function LoadingSpinner({ 
  className,
  size = "w-6 h-6" 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600",
        size,
        className
      )}
      aria-label="Loading"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
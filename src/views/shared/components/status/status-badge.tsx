// views/shared/components/status/status-badge.tsx
'use client';

import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: 'completed' | 'in-progress' | 'not-started';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  
  const statusClasses = {
    'completed': 'bg-green-100 text-green-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    'not-started': 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={cn(baseClasses, statusClasses[status], className)}>
      {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}
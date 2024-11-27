// views/shared/components/elements/alert.tsx
'use client';

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  variant?: 'default' | 'destructive';
  className?: string;
}

export function Alert({ 
  children, 
  variant = 'default', 
  className 
}: AlertProps) {
  const variants = {
    default: 'bg-blue-50 text-blue-900',
    destructive: 'bg-red-50 text-red-900'
  };

  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
        variants[variant],
        className
      )}
      role="alert"
    >
      {variant === 'destructive' && (
        <AlertCircle className="h-4 w-4 text-red-600" />
      )}
      {children}
    </div>
  );
}
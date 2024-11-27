// views/shared/components/forms/form-message.tsx
'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormMessageProps {
  type: 'error' | 'success' | 'info';
  message: string;
  className?: string;
}

export function FormMessage({ type, message, className }: FormMessageProps) {
  const styles = {
    error: {
      container: "bg-red-50 text-red-900 border-red-200",
      icon: <AlertCircle className="w-5 h-5 text-red-500" />
    },
    success: {
      container: "bg-green-50 text-green-900 border-green-200",
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
    },
    info: {
      container: "bg-blue-50 text-blue-900 border-blue-200",
      icon: <AlertCircle className="w-5 h-5 text-blue-500" />
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-md border flex items-start gap-3",
      styles[type].container,
      className
    )}>
      {styles[type].icon}
      <span className="text-sm flex-1">{message}</span>
    </div>
  );
}
// views/shared/components/forms/form-field.tsx
'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: string;
  className?: string;
}

export function FormField({
  label,
  error,
  success,
  className,
  id,
  ...props
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            error && "border-red-300 text-red-900 placeholder-red-300",
            success && "border-green-300 text-green-900",
            className
          )}
          {...props}
        />
        {error && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
        )}
        {success && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600">{success}</p>
      )}
    </div>
  );
}




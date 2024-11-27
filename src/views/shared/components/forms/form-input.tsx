// views/shared/components/forms/form-input.tsx
'use client';

import { cn } from '@/lib/utils';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, className, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={props.id} 
        className="block text-sm font-medium"
      >
        {label}
      </label>
      <input
        className={cn(
          "w-full p-2 border rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
          error && "border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
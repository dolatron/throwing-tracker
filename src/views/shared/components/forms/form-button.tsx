// views/shared/components/forms/form-button.tsx
'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function FormButton({ 
  isLoading, 
  variant = 'primary', 
  children,
  className,
  disabled,
  ...props 
}: FormButtonProps) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "w-full px-4 py-2 text-sm font-medium rounded-md",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        variants[variant],
        (isLoading || disabled) && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </div>
      ) : children}
    </button>
  );
}
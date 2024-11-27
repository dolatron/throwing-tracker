// views/shared/components/forms/form.tsx
'use client';

import { cn } from '@/lib/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  subtitle?: string;
}

export function Form({ 
  title, 
  subtitle, 
  className, 
  children, 
  ...props 
}: FormProps) {
  return (
    <div className={cn("w-full max-w-md p-6 space-y-6 bg-white rounded-xl shadow", className)}>
      {(title || subtitle) && (
        <div className="space-y-2 text-center">
          {title && (
            <h1 className="text-2xl font-bold tracking-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <form {...props} className="space-y-4">
        {children}
      </form>
    </div>
  );
}
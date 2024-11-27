// views/shared/components/forms/form-card.tsx
'use client';

import { Card } from '@/views/shared/components/elements/card';
import { cn } from '@/lib/utils';

export interface FormCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormCard({ title, subtitle, children, className }: FormCardProps) {
  return (
    <Card className={cn("w-full max-w-md p-6 space-y-6", className)}>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </Card>
  );
}
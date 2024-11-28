'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { ProgramProvider } from '@/contexts/program-context';
import { WorkoutProvider } from '@/contexts/workout-context';

// app/providers.tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProgramProvider>
        <WorkoutProvider>
          {children}
        </WorkoutProvider>
      </ProgramProvider>
    </AuthProvider>
  );
}
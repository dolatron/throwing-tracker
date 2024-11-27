'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { ProgramProvider } from '@/contexts/program-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProgramProvider>
        {children}
      </ProgramProvider>
    </AuthProvider>
  );
}
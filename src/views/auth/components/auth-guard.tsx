// views/auth/components/auth-guard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/views/shared/components/status/loading-spinner';
import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';

export interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('No authenticated user found, redirecting to onboard');
      router.push('/onboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
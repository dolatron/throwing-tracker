// views/auth/components/auth-guard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/views/shared/components/status/loading-spinner';
import type { ReactNode } from 'react';

export interface AuthGuardProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function AuthGuard({ 
  children,
  requireOnboarding = true 
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/onboard');
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, authLoading, router]);

  // Show loading state until we've checked authorization
  if (authLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="w-8 h-8" />
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthorized) {
    return null;
  }

  // Only render children when fully authorized
  return <>{children}</>;
}
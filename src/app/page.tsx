'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/views/shared/components/status/loading-spinner';

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;

    const checkOnboardingStatus = async () => {
      try {
        // Don't proceed if component is unmounted or authentication is still loading
        if (!mounted || authLoading) return;

        // No user means we should redirect to onboarding
        if (!user) {
          console.log('No authenticated user, redirecting to onboard');
          router.push('/onboard');
          return;
        }

        console.log('Checking onboarding status for user:', user.id);

        // Check if user has completed onboarding
        const result = await supabase
          .from('users')
          .select('name, user_programs(id)')
          .eq('id', user.id)
          .single();

        if (!mounted) return;

        if (result.error) {
          console.error('Error fetching user data:', result.error);
          router.push('/onboard');
          return;
        }

        const userData = result.data;

        if (!userData?.name || !userData?.user_programs?.length) {
          console.log('User needs onboarding');
          router.push('/onboard');
        } else {
          console.log('User is onboarded, redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        if (mounted) {
          router.push('/onboard');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkOnboardingStatus();

    return () => {
      mounted = false;
    };
  }, [user, router, supabase, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return null;
}
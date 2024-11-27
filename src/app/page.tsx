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
    const checkOnboardingStatus = async () => {
      try {
        console.log('Checking onboarding status for user:', user?.id);
        
        if (!user) {
          console.log('No user found, redirecting to onboard');
          router.push('/onboard');
          return;
        }

        // Check if user has completed onboarding
        const { data: userData, error } = await supabase
          .from('users')
          .select('name, user_programs(id)')
          .eq('id', user.id)
          .single();

        console.log('User data:', userData);

        if (error) throw error;

        if (!userData?.name || !userData?.user_programs?.length) {
          // User needs onboarding
          console.log('User needs onboarding');
          router.push('/onboard');
        } else {
          // User is fully onboarded
          console.log('User is onboarded, redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to onboarding if there's any error
        router.push('/onboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      checkOnboardingStatus();
    }
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
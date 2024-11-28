'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { OnboardingForm } from '@/views/onboarding/components/onboarding-form';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/views/shared/components/status/loading-spinner';

export default function OnboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        if (!user) {
          console.log('No authenticated user in onboard page');
          setIsLoading(false);
          return;
        }
    
        console.log('Checking if user is already onboarded:', user.id);
        const result = await supabase
          .from('users')
          .select('name, user_programs(id)')
          .eq('id', user.id)
          .single();
    
        if (result.error) {
          if (result.error.code === 'PGRST116') {
            // Record not found
            setIsLoading(false);
            return;
          }
          throw result.error;
        }
    
        console.log('Onboarding check result:', result.data);
    
        if (result.data?.name && result.data?.user_programs?.length) {
          console.log('User already onboarded, redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        // Optionally handle error state
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <OnboardingForm />
    </div>
  );
}
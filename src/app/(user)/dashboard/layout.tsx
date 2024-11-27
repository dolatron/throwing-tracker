// app/(user)/dashboard/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AppHeader } from '@/views/shared/components/layout/app-header';
import { AuthGuard } from '@/views/auth/components/auth-guard';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/views/shared/components/status/loading-spinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUserAccess = async () => {
      if (!user) {
        router.push('/onboard');
        return;
      }

      try {
        // Check if user is properly onboarded
        const { data: userData, error } = await supabase
          .from('users')
          .select('name, user_programs(id)')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (!userData?.name || !userData?.user_programs?.length) {
          console.log('User not fully onboarded, redirecting');
          router.push('/onboard');
        }
      } catch (error) {
        console.error('Error checking user access:', error);
        router.push('/onboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      checkUserAccess();
    }
  }, [user, router, supabase, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AppHeader user={user} />
        {children}
      </div>
    </AuthGuard>
  );
}
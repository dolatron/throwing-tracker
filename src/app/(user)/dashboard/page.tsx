// app/(user)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LoadingSpinner } from '@/views/shared/components/status/loading-spinner';
import { WorkoutTracker } from '@/views/workout-tracker';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [programId, setProgramId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserProgram = async () => {
      if (!user) return;

      try {
        const { data: userProgram, error } = await supabase
          .from('user_programs')
          .select('id, program_id')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setProgramId(userProgram.program_id);
      } catch (error) {
        console.error('Error fetching user program:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserProgram();
    }
  }, [user, supabase, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !programId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No program found. Please complete onboarding.</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <WorkoutTracker userId={user.id} programId={programId} />
    </main>
  );
}
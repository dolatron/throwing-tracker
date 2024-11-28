'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { ApiResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  signIn: (email: string) => Promise<ApiResponse<void>>;
  signOut: () => Promise<ApiResponse<void>>;
  updateUserProfile: (profile: { name: string }) => Promise<ApiResponse<void>>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => ({ error: 'Not implemented', status: 500 }),
  signOut: async () => ({ error: 'Not implemented', status: 500 }),
  updateUserProfile: async () => ({ error: 'Not implemented', status: 500 }),
  isLoading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth state changed:', { event: _event, sessionUser: session?.user });
        
        if (session?.user) {
          try {
            // Check if user exists in database
            const { data: dbUser, error: userError } = await supabase
              .from('users')
              .select('id, email, name')
              .eq('id', session.user.id)
              .single();

            if (userError && userError.code !== 'PGRST116') {
              console.error('Error fetching user:', userError);
              return;
            }

            if (!dbUser) {
              console.log('Creating new database user:', {
                id: session.user.id,
                email: session.user.email
              });

              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .select()
                .single();

              if (createError) {
                console.error('Error creating user:', createError);
                return;
              }

              console.log('Successfully created database user:', newUser);
            }

            setUser(session.user);
          } catch (error) {
            console.error('Error in auth state change:', error);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
        router.refresh();
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signIn = async (email: string): Promise<ApiResponse<void>> => {
    try {
      const result = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
  
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return { status: 200 };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to sign in',
        status: 500
      };
    }
  };

  const signOut = async (): Promise<ApiResponse<void>> => {
    try {
      // Call server-side logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      // Clear local auth state
      setUser(null);
      
      // Redirect to onboard page
      router.push('/onboard');
      return { status: 200 };
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still try to redirect even if there was an error
      router.push('/onboard');
      return {
        error: error instanceof Error ? error.message : 'Failed to sign out',
        status: 500
      };
    }
  };

  const updateUserProfile = async (profile: { name: string }): Promise<ApiResponse<void>> => {
    try {
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('users')
        .update({ 
          name: profile.name,
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);

      if (error) throw error;
      
      return { status: 200 };
    } catch (error) {
      console.error('Failed to update profile:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to update profile',
        status: 500
      };
    }
  };

  const value = {
    user,
    signIn,
    signOut,
    updateUserProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
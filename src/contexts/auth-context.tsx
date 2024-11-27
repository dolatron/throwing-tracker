'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

// Export the context
export const AuthContext = createContext<AuthContextType>({
  user: null,
  signIn: async () => { throw new Error('Not implemented') },
  signOut: async () => { throw new Error('Not implemented') },
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
            } else {
              console.log('Found existing database user:', dbUser);
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

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
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
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still try to redirect even if there was an error
      router.push('/onboard');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        signIn, 
        signOut,
        isLoading
      }}
    >
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
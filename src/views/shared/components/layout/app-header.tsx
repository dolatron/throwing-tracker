// views/shared/components/layout/app-header.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/auth-helpers-nextjs';

interface AppHeaderProps {
  user: User;
  className?: string;
}

export function AppHeader({ user, className }: AppHeaderProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    } finally {
      setIsLoading(false);
      setIsMenuOpen(false);
    }
  };

  // Get first letter of email for avatar
  const avatarLetter = user.email?.[0]?.toUpperCase() || '?';

  return (
    <header className={cn("bg-white border-b border-gray-200", className)}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Workout Tracker
        </h1>

        <div className="relative">
          {/* Profile Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "flex items-center gap-2 p-2 rounded-full",
              "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500",
              "transition-colors duration-200"
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-full bg-indigo-600 text-white",
              "flex items-center justify-center font-medium"
            )}>
              {avatarLetter}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className={cn(
              "absolute right-0 mt-2 w-48 py-1 rounded-md shadow-lg",
              "bg-white ring-1 ring-black ring-opacity-5",
              "z-50"
            )}>
              {/* User Info */}
              <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                {user.email}
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm",
                    "text-gray-700 hover:bg-gray-100",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            </div>
          )}

          {/* Overlay to capture clicks outside when menu is open */}
          {isMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
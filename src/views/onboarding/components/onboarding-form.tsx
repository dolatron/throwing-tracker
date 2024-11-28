// views/onboarding/components/onboarding-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProgram } from '@/contexts/program-context';
import { FormCard, FormInput, FormButton, FormMessage } from '@/views/shared/components/forms';
import type { BaseProps } from '@/types';
import type { ApiResponse } from '@/types/api';

interface FormData {
  email: string;
  firstName: string;
  programId: string;
}

const DEFAULT_PROGRAM_ID = 'catcher-velo-program';

export function OnboardingForm({ className }: BaseProps) {
  const router = useRouter();
  const { user, signIn } = useAuth();
  const { createUserProgram } = useProgram();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    programId: DEFAULT_PROGRAM_ID
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // Create program using the program context
        const result = await createUserProgram(
          user.id, 
          formData.programId,
          formData.firstName
        );

        if (result.error) {
          throw new Error(typeof result.error === 'string' ? result.error : 'Failed to create program');
        }
        
        router.push('/dashboard');
      } else {
        // Start magic link flow for new users
        const result = await signIn(formData.email);
        
        if (result.error) {
          throw new Error(typeof result.error === 'string' ? result.error : 'Failed to sign in');
        }
        
        setSuccess(true);
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (success) {
    return (
      <FormCard
        title="Check your email"
        subtitle="We sent you a login link. Be sure to check your spam too."
      >
        {null}
      </FormCard>
    );
  }

  return (
    <FormCard
      title={user ? 'Complete Your Profile' : 'Welcome!'}
      subtitle={user
        ? 'Please enter your name to complete your profile'
        : 'Enter your email to get started'}
      className={className}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {user ? (
          <FormInput
            id="firstName"
            name="firstName"
            type="text"
            label="Name"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        ) : (
          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            autoComplete="email"
          />
        )}

        {error && (
          <FormMessage
            type="error"
            message={error}
          />
        )}

        <FormButton
          type="submit"
          isLoading={isLoading}
        >
          {isLoading 
            ? 'Loading...' 
            : user 
              ? 'Complete Setup' 
              : 'Get Started'
          }
        </FormButton>
      </form>
    </FormCard>
  );
}
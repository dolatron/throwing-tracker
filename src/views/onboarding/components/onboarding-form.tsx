'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/hooks/useAuth';
import { FormCard, FormInput, FormButton, FormMessage } from '@/views/shared/components/forms';
import type { BaseProps } from '@/types';

export function OnboardingForm({ className }: BaseProps) {
  const router = useRouter();
  const { user, signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // Update user profile
        const { error: updateError } = await supabase
          .from('users')
          .update({ name: formData.name })
          .eq('id', user.id);

        if (updateError) throw updateError;

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Start magic link flow
        await signIn(formData.email);
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
      />
    );
  }

  return (
    <FormCard
      title={user ? 'Complete Your Profile' : 'Welcome!'}
      subtitle={user
        ? 'Please enter your name to complete your profile'
        : 'Enter your email to get started'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {user ? (
          <FormInput
            id="name"
            name="name"
            type="text"
            label="Name"
            value={formData.name}
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
              ? 'Continue' 
              : 'Get Started'
          }
        </FormButton>
      </form>
    </FormCard>
  );
}
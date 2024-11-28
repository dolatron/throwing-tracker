// views/auth/components/auth-form.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  FormCard, 
  FormInput, 
  FormButton, 
  FormMessage 
} from '@/views/shared/components/forms';

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
}

export function AuthForm({ type }: AuthFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email);
      if (error) throw new Error(error);
      setSuccess(true);
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
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
      title={type === 'sign-in' ? 'Welcome back' : 'Create an account'}
      subtitle={type === 'sign-in' ? 
        'Enter your email to sign in' : 
        'Enter your email to get started'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          error={error}
        />

        <FormButton
          type="submit"
          isLoading={isLoading}
        >
          {type === 'sign-in' ? 'Sign in' : 'Get started'}
        </FormButton>

        {error && (
          <FormMessage
            type="error"
            message={error}
          />
        )}
      </form>
    </FormCard>
  );
}
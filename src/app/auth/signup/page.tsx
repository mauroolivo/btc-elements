'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/components/auth/useAuth';
import {
  FormAuthRegisterSchema,
  type FormAuthRegisterType,
} from '@/bitcoin-core/model/forms';
import { AuthButtonSpinner } from '../_components/AuthButtonSpinner';
import { AuthSessionPanel } from '../_components/AuthSessionPanel';
import { PasswordField } from '../_components/PasswordField';

function mapFirebaseError(message: string) {
  if (message.includes('auth/email-already-in-use')) {
    return 'This email is already in use.';
  }

  if (message.includes('auth/weak-password')) {
    return 'Password is too weak.';
  }

  if (message.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please try again later.';
  }

  return message;
}

export default function SignUpPage() {
  const { user, loading, register } = useAuth();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const registerForm = useForm<FormAuthRegisterType>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(FormAuthRegisterSchema),
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    setRegisterError(null);
    setIsAuthenticating(true);
    const startedAt = Date.now();

    try {
      await register(values.email, values.password);
      registerForm.reset();
    } catch (error) {
      setRegisterError(mapFirebaseError((error as Error).message));
    } finally {
      const elapsed = Date.now() - startedAt;

      if (elapsed < 400) {
        await new Promise((resolve) => setTimeout(resolve, 400 - elapsed));
      }

      setIsAuthenticating(false);
    }
  });

  return (
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold text-white">Sign Up</h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          Create a Firebase account for future user-specific features, then sign
          in anywhere in the app.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-gray-300">
          Checking your current session...
        </div>
      ) : user ? (
        <AuthSessionPanel />
      ) : (
        <section className="relative max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          {isAuthenticating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-[2px]">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white">
                <AuthButtonSpinner />
                <span>Creating your account...</span>
              </div>
            </div>
          )}
          <form noValidate onSubmit={onRegister} className="space-y-4">
            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                {...registerForm.register('email')}
                className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
              />
              {registerForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <PasswordField
              id="signup-password"
              label="Password"
              registration={registerForm.register('password')}
              error={registerForm.formState.errors.password?.message}
            />

            <PasswordField
              id="signup-confirm-password"
              label="Confirm password"
              registration={registerForm.register('confirmPassword')}
              error={registerForm.formState.errors.confirmPassword?.message}
            />

            {registerError && (
              <div className="rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
                {registerError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={
                  registerForm.formState.isSubmitting || isAuthenticating
                }
                className="inline-flex items-center rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <AuthButtonSpinner />
                    <span className="ml-2">Creating account...</span>
                  </>
                ) : (
                  'Sign up'
                )}
              </button>
              <Link
                href="/auth/signin"
                className="text-sm text-gray-300 underline underline-offset-4 transition-colors hover:text-white"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

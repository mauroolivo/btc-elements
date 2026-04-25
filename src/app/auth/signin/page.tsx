'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/components/auth/useAuth';
import {
  FormAuthLoginSchema,
  type FormAuthLoginType,
} from '@/bitcoin-core/model/forms';
import { AuthButtonSpinner } from '../_components/AuthButtonSpinner';
import { AuthGithubButton } from '../_components/AuthGithubButton';
import { AuthGoogleButton } from '../_components/AuthGoogleButton';
import { AuthSessionPanel } from '../_components/AuthSessionPanel';
import { PasswordField } from '../_components/PasswordField';

function mapFirebaseError(message: string) {
  if (message.includes('auth/invalid-credential')) {
    return 'Invalid email or password.';
  }

  if (message.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please try again later.';
  }

  if (message.includes('auth/popup-closed-by-user')) {
    return 'Google sign-in was cancelled.';
  }

  if (message.includes('auth/account-exists-with-different-credential')) {
    return 'An account already exists with a different sign-in method.';
  }

  return message;
}

export default function SignInPage() {
  const { user, loading, login, loginWithGithub, loginWithGoogle } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authAction, setAuthAction] = useState('Signing you in...');
  const loginForm = useForm<FormAuthLoginType>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(FormAuthLoginSchema),
  });

  const onLogin = loginForm.handleSubmit(async (values) => {
    setLoginError(null);
    setAuthAction('Signing you in...');
    setIsAuthenticating(true);
    const startedAt = Date.now();

    try {
      await login(values.email, values.password);
      loginForm.reset();
    } catch (error) {
      setLoginError(mapFirebaseError((error as Error).message));
    } finally {
      const elapsed = Date.now() - startedAt;

      if (elapsed < 400) {
        await new Promise((resolve) => setTimeout(resolve, 400 - elapsed));
      }

      setIsAuthenticating(false);
    }
  });

  async function onGoogleLogin() {
    setLoginError(null);
    setAuthAction('Connecting to Google...');
    setIsAuthenticating(true);
    const startedAt = Date.now();

    try {
      await loginWithGoogle();
    } catch (error) {
      setLoginError(mapFirebaseError((error as Error).message));
    } finally {
      const elapsed = Date.now() - startedAt;

      if (elapsed < 400) {
        await new Promise((resolve) => setTimeout(resolve, 400 - elapsed));
      }

      setIsAuthenticating(false);
    }
  }

  async function onGithubLogin() {
    setLoginError(null);
    setAuthAction('Connecting to GitHub...');
    setIsAuthenticating(true);
    const startedAt = Date.now();

    try {
      await loginWithGithub();
    } catch (error) {
      setLoginError(mapFirebaseError((error as Error).message));
    } finally {
      const elapsed = Date.now() - startedAt;

      if (elapsed < 400) {
        await new Promise((resolve) => setTimeout(resolve, 400 - elapsed));
      }

      setIsAuthenticating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold text-white">Sign In</h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          Access your Firebase account. If you do not have one yet, create it
          from the sign up page.
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
                <span>{authAction}</span>
              </div>
            </div>
          )}
          <form noValidate onSubmit={onLogin} className="space-y-4">
            <div>
              <label
                htmlFor="signin-email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                {...loginForm.register('email')}
                className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
              />
              {loginForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <PasswordField
              id="signin-password"
              label="Password"
              registration={loginForm.register('password')}
              error={loginForm.formState.errors.password?.message}
            />

            {loginError && (
              <div className="rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
                {loginError}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <AuthGoogleButton
                onClick={() => void onGoogleLogin()}
                disabled={isAuthenticating || loginForm.formState.isSubmitting}
                label="Continue with Google"
              />
              <AuthGithubButton
                onClick={() => void onGithubLogin()}
                disabled={isAuthenticating || loginForm.formState.isSubmitting}
                label="Continue with GitHub"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="h-px flex-1 bg-white/10" />
              <span>or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting || isAuthenticating}
                className="inline-flex items-center rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <AuthButtonSpinner />
                    <span className="ml-2">Please wait...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
              <Link
                href="/auth/signup"
                className="text-sm text-gray-300 underline underline-offset-4 transition-colors hover:text-white"
              >
                Need an account? Sign up
              </Link>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

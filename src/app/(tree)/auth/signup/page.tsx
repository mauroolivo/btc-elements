'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/components/auth/useAuth';
import {
  FormAuthRegisterSchema,
  type FormAuthRegisterType,
} from '@/bitcoin-core/model/forms';
import { AuthButtonSpinner } from '../_components/AuthButtonSpinner';
import { AuthGithubButton } from '../_components/AuthGithubButton';
import { AuthGoogleButton } from '../_components/AuthGoogleButton';
import { AuthSessionPanel } from '../_components/AuthSessionPanel';
import { PasswordField } from '../_components/PasswordField';
import { useDemoWalletAccess } from '@/components/auth/useDemoWalletAccess';

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

  if (message.includes('auth/popup-closed-by-user')) {
    return 'Google sign-up was cancelled.';
  }

  if (message.includes('auth/account-exists-with-different-credential')) {
    return 'An account already exists with a different sign-in method.';
  }

  return message;
}

export default function SignUpPage() {
  const { user, loading, loginWithGithub, loginWithGoogle, register } =
    useAuth();
  const router = useRouter();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authAction, setAuthAction] = useState('Creating your account...');
  const { demoError, isDemoOpening, openDemoWallet } = useDemoWalletAccess();
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
    setAuthAction('Creating your account...');
    setIsAuthenticating(true);
    const startedAt = Date.now();

    try {
      await register(values.email, values.password);
      registerForm.reset();
      router.replace('/my-wallets');
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

  async function onGoogleLogin() {
    setRegisterError(null);
    setAuthAction('Connecting to Google...');
    setIsAuthenticating(true);
    const startedAt = Date.now();

    try {
      await loginWithGoogle();
      router.replace('/my-wallets');
    } catch (error) {
      setRegisterError(mapFirebaseError((error as Error).message));
    } finally {
      const elapsed = Date.now() - startedAt;

      if (elapsed < 400) {
        await new Promise((resolve) => setTimeout(resolve, 400 - elapsed));
      }

      setIsAuthenticating(false);
    }
  }

  async function onGithubLogin() {
    setRegisterError(null);
    setAuthAction('Connecting to GitHub...');
    setIsAuthenticating(true);
    const startedAt = Date.now();

    try {
      await loginWithGithub();
      router.replace('/my-wallets');
    } catch (error) {
      setRegisterError(mapFirebaseError((error as Error).message));
    } finally {
      const elapsed = Date.now() - startedAt;

      if (elapsed < 400) {
        await new Promise((resolve) => setTimeout(resolve, 400 - elapsed));
      }

      setIsAuthenticating(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl flex-col items-center justify-center px-6 pt-24 pb-8">
      <div className="mb-8 max-w-2xl text-center">
        <h1 className="text-3xl font-semibold text-white">Sign Up</h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          Create an account for future user-specific features, then sign in
          anywhere in the app.
        </p>
      </div>

      {loading ? (
        <div className="core-surface w-full max-w-xl rounded-2xl p-6 text-sm text-gray-300">
          Checking your current session...
        </div>
      ) : user ? (
        <AuthSessionPanel />
      ) : (
        <section className="core-surface relative w-full max-w-xl rounded-2xl p-6">
          {isAuthenticating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-[2px]">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white">
                <AuthButtonSpinner />
                <span>{authAction}</span>
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
                className="core-input w-full rounded-xl p-2 text-white focus:outline-none"
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
              <div className="core-surface rounded-2xl p-3 text-sm text-red-200">
                {registerError}
              </div>
            )}

            {demoError && (
              <div className="core-surface rounded-2xl p-3 text-sm text-red-200">
                {demoError}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <AuthGoogleButton
                onClick={() => void onGoogleLogin()}
                disabled={
                  isAuthenticating || registerForm.formState.isSubmitting
                }
                label="Continue with Google"
              />
              <AuthGithubButton
                onClick={() => void onGithubLogin()}
                disabled={
                  isAuthenticating || registerForm.formState.isSubmitting
                }
                label="Continue with GitHub"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="h-px flex-1 bg-white/10" />
              <span>or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="rounded-2xl border border-amber-300/18 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(56,189,248,0.08),rgba(255,255,255,0.03))] p-4">
              <div className="text-sm font-semibold text-white">Not ready?</div>
              <p className="mt-1 text-sm leading-6 text-gray-300">
                Try the demo wallet and jump straight into the wallet view.
              </p>
              <button
                type="button"
                onClick={() => void openDemoWallet()}
                disabled={
                  isAuthenticating ||
                  registerForm.formState.isSubmitting ||
                  isDemoOpening
                }
                className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-amber-300/40 bg-[linear-gradient(180deg,rgba(245,158,11,0.92),rgba(251,146,60,0.82))] px-6 py-3 text-sm font-extrabold whitespace-nowrap text-slate-950 shadow-[0_16px_40px_rgba(245,158,11,0.28),inset_0_1px_0_rgba(255,255,255,0.34)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDemoOpening ? (
                  <>
                    <AuthButtonSpinner />
                    <span>Connecting...</span>
                  </>
                ) : (
                  '👉 One Click Demo Wallet'
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={
                  registerForm.formState.isSubmitting || isAuthenticating
                }
                className="core-button-primary"
              >
                {isAuthenticating ? (
                  <>
                    <AuthButtonSpinner />
                    <span className="ml-2">Please wait...</span>
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

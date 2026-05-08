'use client';

import Link from 'next/link';
import { useAuth } from '@features/auth';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="mx-auto max-w-5xl px-6 pt-24 pb-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold text-white">Profile</h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          Your account information and the current authenticated session state.
        </p>
      </div>

      {loading ? (
        <div className="core-surface rounded-2xl p-6 text-sm text-gray-300">
          Checking your current session...
        </div>
      ) : !user ? (
        <div className="core-surface max-w-2xl rounded-2xl p-6 text-white">
          <h2 className="text-xl font-semibold">No active session</h2>
          <p className="mt-3 text-sm leading-6 text-gray-300">
            Sign in or create an account to view your profile.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/auth/signin" className="core-button-primary">
              Sign in
            </Link>
            <Link href="/auth/signup" className="core-button-secondary">
              Sign up
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <section className="core-surface rounded-2xl p-6">
            <div className="mb-5">
              <div className="text-sm tracking-[0.2em] text-emerald-200/80 uppercase">
                Authenticated
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {user.displayName || user.email || 'Authenticated user'}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="core-panel-muted rounded-xl p-4">
                <div className="text-xs tracking-[0.16em] text-gray-400 uppercase">
                  Email
                </div>
                <div className="mt-2 text-sm break-all text-white">
                  {user.email || 'Not available'}
                </div>
              </div>
              <div className="core-panel-muted rounded-xl p-4">
                <div className="text-xs tracking-[0.16em] text-gray-400 uppercase">
                  Display name
                </div>
                <div className="mt-2 text-sm text-white">
                  {user.displayName || 'Not set'}
                </div>
              </div>
              <div className="core-panel-muted rounded-xl p-4">
                <div className="text-xs tracking-[0.16em] text-gray-400 uppercase">
                  UID
                </div>
                <div className="mt-2 font-mono text-xs break-all text-white">
                  {user.uid}
                </div>
              </div>
              <div className="core-panel-muted rounded-xl p-4">
                <div className="text-xs tracking-[0.16em] text-gray-400 uppercase">
                  Email verified
                </div>
                <div className="mt-2 text-sm text-white">
                  {user.emailVerified ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </section>

          <aside className="core-surface rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white">Providers</h2>
            <div className="mt-4 space-y-3">
              {user.providerData.map((provider) => (
                <div
                  key={`${provider.providerId}-${provider.uid}`}
                  className="core-panel-muted rounded-xl p-4"
                >
                  <div className="text-xs tracking-[0.16em] text-gray-400 uppercase">
                    {provider.providerId}
                  </div>
                  <div className="mt-2 text-sm break-all text-white">
                    {provider.email || provider.displayName || provider.uid}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void logout()}
                className="core-button-secondary"
              >
                Log out
              </button>
              <Link href="/" className="core-button-primary">
                Go home
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

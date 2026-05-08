'use client';

import Link from 'next/link';
import { useAuth } from '@features/auth/useAuth';

export function AuthSessionPanel() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="core-surface-hero max-w-2xl rounded-2xl p-6 text-white">
      <div className="text-sm tracking-[0.2em] text-emerald-200/80 uppercase">
        Signed In
      </div>
      <div className="mt-3 text-2xl font-semibold">
        {user.email ?? 'Authenticated user'}
      </div>
      <p className="mt-3 text-sm leading-6 text-emerald-100/80">
        Your session is active. Public routes remain accessible, and
        authenticated features can now rely on this state.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void logout()}
          className="core-button-secondary"
        >
          Log out
        </button>
        <Link href="/my-wallets" className="core-button-primary">
          Go to my wallets
        </Link>
      </div>
    </div>
  );
}

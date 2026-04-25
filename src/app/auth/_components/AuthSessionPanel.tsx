'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/useAuth';

export function AuthSessionPanel() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-white">
      <div className="text-sm tracking-[0.2em] text-emerald-200/80 uppercase">
        Signed In
      </div>
      <div className="mt-3 text-2xl font-semibold">
        {user.email ?? 'Authenticated user'}
      </div>
      <p className="mt-3 text-sm leading-6 text-emerald-100/80">
        Your Firebase session is active. Public routes remain accessible, and
        authenticated features can now rely on this state.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex rounded-md border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15"
        >
          Log out
        </button>
        <Link
          href="/status"
          className="inline-flex rounded-md border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/30"
        >
          Go to status
        </Link>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/useAuth';
import {
  addUserWallet,
  getUserWallets,
  MAX_WALLETS_PER_USER,
  type FirestoreWallet,
} from '@/lib/firebase/wallets';

export default function MyWalletsPage() {
  const { user, loading } = useAuth();
  const [wallets, setWallets] = useState<FirestoreWallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function loadWallets(userId: string) {
    setWalletsLoading(true);
    setError(null);

    try {
      const nextWallets = await getUserWallets(userId);
      setWallets(nextWallets);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Failed to load wallets.'
      );
    } finally {
      setWalletsLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      setWallets([]);
      setIsFormOpen(false);
      setWalletName('');
      setError(null);
      setSuccess(null);
      return;
    }

    void loadWallets(user.uid);
  }, [user]);

  async function handleSaveWallet() {
    if (!user) {
      setError('Sign in to save wallets.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await addUserWallet(user.uid, walletName);
      setWalletName('');
      setIsFormOpen(false);
      setSuccess('Wallet saved.');
      await loadWallets(user.uid);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Failed to save wallet.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pt-24 pb-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold text-white">My Wallets</h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          Manage the wallet names stored in Firestore for your account.
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
            Sign in to access your saved wallets.
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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
          <section className="core-surface rounded-2xl p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm tracking-[0.2em] text-emerald-200/80 uppercase">
                  Firestore wallets
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Saved wallet list
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  {wallets.length} of {MAX_WALLETS_PER_USER} wallet slots used.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsFormOpen((current) => !current);
                  setError(null);
                  setSuccess(null);
                }}
                disabled={wallets.length >= MAX_WALLETS_PER_USER}
                className="core-button-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add wallet
              </button>
            </div>

            {error ? (
              <p className="mb-4 text-sm text-red-400">{error}</p>
            ) : null}
            {success ? (
              <p className="mb-4 text-sm text-green-400">{success}</p>
            ) : null}

            {isFormOpen ? (
              <div className="core-panel-muted mb-6 rounded-2xl p-4">
                <label className="mb-2 block text-xs tracking-[0.16em] text-gray-400 uppercase">
                  Wallet name
                </label>
                <input
                  type="text"
                  value={walletName}
                  onChange={(event) => setWalletName(event.target.value)}
                  placeholder="Enter wallet name"
                  className="core-input w-full rounded-xl px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
                  disabled={isSaving}
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void handleSaveWallet()}
                    disabled={isSaving}
                    className="core-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setWalletName('');
                    }}
                    disabled={isSaving}
                    className="core-button-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {walletsLoading ? (
              <div className="core-panel-muted rounded-2xl p-4 text-sm text-gray-300">
                Loading your wallets...
              </div>
            ) : wallets.length === 0 ? (
              <div className="core-panel-muted rounded-2xl p-4 text-sm text-gray-300">
                No wallets saved yet.
              </div>
            ) : (
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.docId}
                    className="core-panel-muted flex items-center justify-between rounded-2xl p-4"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {wallet.name}
                      </div>
                      <div className="mt-1 font-mono text-xs text-gray-400">
                        {wallet.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="core-surface rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white">Rules</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-gray-300">
              <p>Wallets are loaded from Firestore when this page opens.</p>
              <p>
                Adding a wallet creates a new document under your user path.
              </p>
              <p>You can store up to {MAX_WALLETS_PER_USER} wallets.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

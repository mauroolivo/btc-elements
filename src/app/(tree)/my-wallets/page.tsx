'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/useAuth';
import {
  addUserWallet,
  deleteUserWalletById,
  getUserWallets,
  MAX_WALLETS_PER_USER,
  type FirestoreWallet,
} from '@/lib/firebase/wallets';
import { useCreateWallet } from '@/bitcoin-core/components/Wallet/hooks';

function WalletsLoadingView({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="core-surface rounded-3xl p-8">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-300 border-r-cyan-500" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm text-gray-400">{description}</p>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 pt-4 md:grid-cols-3">
          <div className="core-panel rounded-2xl p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-28 animate-pulse rounded bg-white/8" />
          </div>
          <div className="core-panel rounded-2xl p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-20 animate-pulse rounded bg-white/8" />
          </div>
          <div className="core-panel rounded-2xl p-4">
            <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-24 animate-pulse rounded bg-white/8" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyWalletsPage() {
  const { user, loading } = useAuth();
  const { create: createRpcWallet } = useCreateWallet();
  const [wallets, setWallets] = useState<FirestoreWallet[]>([]);
  const [walletsLoading, setWalletsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasWallets = wallets.length > 0;

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

  async function handleCreateWallet() {
    if (!user) {
      setError('Sign in to save wallets.');
      return;
    }

    let createdWalletId: string | null = null;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      createdWalletId = await addUserWallet(user.uid, walletName);
      await createRpcWallet(createdWalletId);
      setWalletName('');
      setIsFormOpen(false);
      setSuccess('Wallet saved.');
      await loadWallets(user.uid);
    } catch (nextError) {
      if (createdWalletId) {
        await deleteUserWalletById(user.uid, createdWalletId);
      }

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
        <WalletsLoadingView
          title="Loading my wallets"
          description="Checking your session and preparing wallet access..."
        />
      ) : !user ? (
        <div className="core-surface-hero max-w-3xl rounded-3xl p-8 text-white sm:p-10">
          <div className="text-sm tracking-[0.24em] text-cyan-100/70 uppercase">
            Authentication required
          </div>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Please authenticate to access your wallets
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-cyan-50/80 sm:text-base">
            Your saved wallets are tied to your account. Sign in or create one
            to view, create, and manage your wallet list in this workspace.
          </p>
          <div className="mt-8">
            <Link
              href="/auth/signin"
              className="core-button-primary px-6 py-3 text-sm font-semibold"
            >
              Authenticate
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
          <section className="core-surface rounded-2xl p-6">
            {walletsLoading ? (
              <WalletsLoadingView
                title="Loading my wallets"
                description="Syncing your saved wallets and preparing the dashboard..."
              />
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm tracking-[0.2em] text-emerald-200/80 uppercase">
                      Firestore wallets
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      {hasWallets
                        ? 'Saved wallet list'
                        : 'Create your first wallet'}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-gray-300">
                      {hasWallets
                        ? `${wallets.length} of ${MAX_WALLETS_PER_USER} wallet slots used.`
                        : 'Set up your first saved wallet to unlock the full My Wallets view.'}
                    </p>
                  </div>

                  {hasWallets ? (
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
                  ) : null}
                </div>

                {error ? (
                  <p className="mb-4 text-sm text-red-400">{error}</p>
                ) : null}
                {success && hasWallets ? (
                  <p className="mb-4 text-sm text-green-400">{success}</p>
                ) : null}

                {!hasWallets ? (
                  <div className="core-surface-hero relative overflow-hidden rounded-[28px] p-6 text-white sm:p-8">
                    {isSaving ? (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/68 backdrop-blur-sm">
                        <div className="relative h-24 w-24">
                          <div className="absolute inset-0 rounded-full border border-cyan-200/20" />
                          <div className="absolute inset-2 animate-ping rounded-full border border-emerald-300/30" />
                          <div className="absolute inset-4 animate-spin rounded-full border-2 border-transparent border-t-cyan-300 border-r-emerald-300" />
                          <div className="absolute inset-[1.65rem] rounded-full bg-white/10 shadow-[0_0_40px_rgba(34,211,238,0.18)]" />
                        </div>
                        <p className="mt-6 text-xl font-semibold text-white">
                          We&apos;re crafting your wallet
                        </p>
                        <p className="mt-2 max-w-sm text-center text-sm leading-6 text-cyan-50/80">
                          Preparing your first saved wallet and syncing the
                          workspace.
                        </p>
                      </div>
                    ) : null}

                    <div className="absolute -top-20 right-0 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />
                    <div className="absolute -bottom-24 left-10 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />

                    <div className="relative z-0 max-w-2xl">
                      <div className="text-sm tracking-[0.24em] text-cyan-100/75 uppercase">
                        First-time setup
                      </div>
                      <h3 className="mt-4 text-3xl leading-tight font-semibold text-white sm:text-4xl">
                        Create your first wallet
                      </h3>
                      <p className="mt-4 max-w-xl text-sm leading-6 text-cyan-50/80 sm:text-base">
                        Give your wallet a clear name and we&apos;ll create the
                        first entry for this account. Once it&apos;s ready, the
                        standard My Wallets screen loads unchanged.
                      </p>

                      <form
                        className="mt-8 max-w-xl space-y-4"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void handleCreateWallet();
                        }}
                      >
                        <div>
                          <label className="mb-2 block text-xs tracking-[0.16em] text-cyan-100/70 uppercase">
                            Wallet name
                          </label>
                          <input
                            type="text"
                            value={walletName}
                            onChange={(event) =>
                              setWalletName(event.target.value)
                            }
                            placeholder="My primary wallet"
                            className="core-input w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-400 focus:outline-none"
                            disabled={isSaving}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="submit"
                            disabled={isSaving || !walletName.trim()}
                            className="core-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Create
                          </button>
                          <span className="text-xs tracking-[0.12em] text-cyan-50/65 uppercase">
                            1 of {MAX_WALLETS_PER_USER} wallet slots
                          </span>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <>
                    {isFormOpen ? (
                      <div className="core-panel-muted mb-6 rounded-2xl p-4">
                        <label className="mb-2 block text-xs tracking-[0.16em] text-gray-400 uppercase">
                          Wallet name
                        </label>
                        <input
                          type="text"
                          value={walletName}
                          onChange={(event) =>
                            setWalletName(event.target.value)
                          }
                          placeholder="Enter wallet name"
                          className="core-input w-full rounded-xl px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
                          disabled={isSaving}
                        />
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => void handleCreateWallet()}
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
                  </>
                )}
              </>
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

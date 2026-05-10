'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useReducer } from 'react';
import { produce } from 'immer';
import { useAuth } from '@features/auth';
import { useWalletStore } from '@features/wallet/store';
import {
  addUserWallet,
  deleteUserWalletById,
  getUserWallets,
  MAX_WALLETS_PER_USER,
  type FirestoreWallet,
} from '@/lib/firebase/wallets';
import { useCreateWallet, useWalletsDir } from '@features/wallet/hooks';

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

function formatWalletCreatedAt(createdAt: FirestoreWallet['createdAt']) {
  if (!createdAt) {
    return 'Creation date pending';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(createdAt.toDate());
}

type MyWalletsState = {
  wallets: FirestoreWallet[];
  walletsLoading: boolean;
  form: {
    isOpen: boolean;
    walletName: string;
    isSaving: boolean;
  };
  feedback: {
    error: string | null;
    success: string | null;
    openWalletError: string | null;
  };
  openWallet: {
    isOpening: boolean;
    walletName: string | null;
  };
};

type MyWalletsAction =
  | { type: 'wallets/load-start' }
  | { type: 'wallets/load-success'; wallets: FirestoreWallet[] }
  | { type: 'wallets/load-error'; message: string }
  | { type: 'session/clear' }
  | { type: 'form/toggle' }
  | { type: 'form/close' }
  | { type: 'form/set-wallet-name'; walletName: string }
  | { type: 'create/start' }
  | { type: 'create/success' }
  | { type: 'create/error'; message: string }
  | { type: 'open-wallet/clear-error' }
  | { type: 'open-wallet/start'; walletName: string }
  | { type: 'open-wallet/error'; message: string };

const initialState: MyWalletsState = {
  wallets: [],
  walletsLoading: false,
  form: {
    isOpen: false,
    walletName: '',
    isSaving: false,
  },
  feedback: {
    error: null,
    success: null,
    openWalletError: null,
  },
  openWallet: {
    isOpening: false,
    walletName: null,
  },
};

const myWalletsReducer = produce(
  (draft: MyWalletsState, action: MyWalletsAction) => {
    switch (action.type) {
      case 'wallets/load-start':
        draft.walletsLoading = true;
        draft.feedback.error = null;
        return;
      case 'wallets/load-success':
        draft.wallets = action.wallets;
        draft.walletsLoading = false;
        return;
      case 'wallets/load-error':
        draft.walletsLoading = false;
        draft.feedback.error = action.message;
        return;
      case 'session/clear':
        draft.wallets = [];
        draft.form.isOpen = false;
        draft.form.walletName = '';
        draft.form.isSaving = false;
        draft.feedback.error = null;
        draft.feedback.success = null;
        draft.feedback.openWalletError = null;
        draft.openWallet.isOpening = false;
        draft.openWallet.walletName = null;
        return;
      case 'form/toggle':
        draft.form.isOpen = !draft.form.isOpen;
        draft.feedback.error = null;
        draft.feedback.success = null;
        return;
      case 'form/close':
        draft.form.isOpen = false;
        draft.form.walletName = '';
        return;
      case 'form/set-wallet-name':
        draft.form.walletName = action.walletName;
        return;
      case 'create/start':
        draft.form.isSaving = true;
        draft.feedback.error = null;
        draft.feedback.success = null;
        return;
      case 'create/success':
        draft.form.isSaving = false;
        draft.form.walletName = '';
        draft.form.isOpen = false;
        draft.feedback.success = 'Wallet saved.';
        return;
      case 'create/error':
        draft.form.isSaving = false;
        draft.feedback.error = action.message;
        return;
      case 'open-wallet/clear-error':
        draft.feedback.openWalletError = null;
        return;
      case 'open-wallet/start':
        draft.openWallet.isOpening = true;
        draft.openWallet.walletName = action.walletName;
        return;
      case 'open-wallet/error':
        draft.feedback.openWalletError = action.message;
        draft.openWallet.isOpening = false;
        draft.openWallet.walletName = null;
        return;
      default:
        return;
    }
  }
);

export default function MyWalletsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { create: createRpcWallet } = useCreateWallet();
  const { listwalletdir, refresh: refreshWalletDir } = useWalletsDir();
  const { setTargetWallet } = useWalletStore();
  const [state, dispatch] = useReducer(myWalletsReducer, initialState);
  const hasWallets = state.wallets.length > 0;

  async function loadWallets(userId: string) {
    dispatch({ type: 'wallets/load-start' });

    try {
      const nextWallets = await getUserWallets(userId);
      dispatch({ type: 'wallets/load-success', wallets: nextWallets });
    } catch (nextError) {
      dispatch({
        type: 'wallets/load-error',
        message:
          nextError instanceof Error
            ? nextError.message
            : 'Failed to load wallets.',
      });
    }
  }

  useEffect(() => {
    if (!user) {
      dispatch({ type: 'session/clear' });
      return;
    }

    void loadWallets(user.uid);
  }, [user]);

  async function handleCreateWallet() {
    if (!user) {
      dispatch({ type: 'create/error', message: 'Sign in to save wallets.' });
      return;
    }

    let createdWalletId: string | null = null;

    dispatch({ type: 'create/start' });

    try {
      createdWalletId = await addUserWallet(user.uid, state.form.walletName);
      await createRpcWallet(createdWalletId);
      dispatch({ type: 'create/success' });
      await loadWallets(user.uid);
    } catch (nextError) {
      if (createdWalletId) {
        await deleteUserWalletById(user.uid, createdWalletId);
      }

      dispatch({
        type: 'create/error',
        message:
          nextError instanceof Error
            ? nextError.message
            : 'Failed to save wallet.',
      });
    }
  }

  async function handleOpenWallet(walletId: string, walletLabel: string) {
    dispatch({ type: 'open-wallet/clear-error' });

    const walletExistsInCore = listwalletdir.result.wallets.some(
      (wallet) => wallet.name === walletId
    );

    if (!walletExistsInCore) {
      dispatch({ type: 'open-wallet/start', walletName: walletLabel });

      try {
        const created = await createRpcWallet(walletId);

        if (created?.error) {
          const rpcErrorText = JSON.stringify(created.error).toLowerCase();
          if (!rpcErrorText.includes('already exists')) {
            throw new Error('Failed to create wallet in Bitcoin Core.');
          }
        }

        await refreshWalletDir();
      } catch {
        dispatch({
          type: 'open-wallet/error',
          message: 'Cannnot open your wallet at this time, try later.',
        });
        return;
      }
    }

    setTargetWallet(walletId);
    router.push('/wallet');
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pt-24 pb-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold text-white">My Wallets</h1>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          Manage the wallet names saved for your account.
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
            {state.walletsLoading ? (
              <WalletsLoadingView
                title="Loading my wallets"
                description="Syncing your saved wallets and preparing the dashboard..."
              />
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm tracking-[0.2em] text-emerald-200/80 uppercase">
                      Wallets
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold text-white">
                      {hasWallets ? 'Wallet list' : 'Create your first wallet'}
                    </h2>
                    {!hasWallets ? (
                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        Set up your first wallet to unlock the full My Wallets
                        view.
                      </p>
                    ) : null}
                  </div>

                  {hasWallets ? (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'form/toggle' })}
                      disabled={state.wallets.length >= MAX_WALLETS_PER_USER}
                      className="core-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add wallet
                    </button>
                  ) : null}
                </div>

                {state.feedback.error ? (
                  <p className="mb-4 text-sm text-red-400">
                    {state.feedback.error}
                  </p>
                ) : null}
                {state.feedback.openWalletError ? (
                  <p className="mb-4 text-sm text-red-400">
                    {state.feedback.openWalletError}
                  </p>
                ) : null}
                {state.feedback.success && hasWallets ? (
                  <p className="mb-4 text-sm text-green-400">
                    {state.feedback.success}
                  </p>
                ) : null}

                {!hasWallets ? (
                  <div className="core-surface-hero relative overflow-hidden rounded-[28px] p-6 text-white sm:p-8">
                    {state.form.isSaving ? (
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
                            value={state.form.walletName}
                            onChange={(event) =>
                              dispatch({
                                type: 'form/set-wallet-name',
                                walletName: event.target.value,
                              })
                            }
                            placeholder="My primary wallet"
                            className="core-input w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-400 focus:outline-none"
                            disabled={state.form.isSaving}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="submit"
                            disabled={
                              state.form.isSaving ||
                              !state.form.walletName.trim()
                            }
                            className="core-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Create
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <>
                    {state.openWallet.isOpening ? (
                      <div className="core-panel-muted relative mb-6 overflow-hidden rounded-2xl p-6 text-white">
                        <div className="absolute -top-16 right-2 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
                        <div className="absolute -bottom-16 left-0 h-36 w-36 rounded-full bg-emerald-300/10 blur-3xl" />
                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                          <div className="relative h-20 w-20">
                            <div className="absolute inset-0 rounded-full border border-cyan-200/20" />
                            <div className="absolute inset-2 animate-ping rounded-full border border-emerald-300/30" />
                            <div className="absolute inset-4 animate-spin rounded-full border-2 border-transparent border-t-cyan-300 border-r-emerald-300" />
                            <div className="absolute inset-[1.35rem] rounded-full bg-white/10 shadow-[0_0_40px_rgba(34,211,238,0.18)]" />
                          </div>
                          <p className="mt-5 text-lg font-semibold text-white">
                            Preparing wallet in Bitcoin Core
                          </p>
                          <p className="mt-2 max-w-md text-sm leading-6 text-cyan-50/80">
                            {state.openWallet.walletName
                              ? `Creating ${state.openWallet.walletName} and connecting it to your workspace...`
                              : 'Creating the selected wallet and connecting it to your workspace...'}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {state.form.isOpen ? (
                      <div className="core-panel-muted mb-6 rounded-2xl p-4">
                        <label className="mb-2 block text-xs tracking-[0.16em] text-gray-400 uppercase">
                          Wallet name
                        </label>
                        <input
                          type="text"
                          value={state.form.walletName}
                          onChange={(event) =>
                            dispatch({
                              type: 'form/set-wallet-name',
                              walletName: event.target.value,
                            })
                          }
                          placeholder="Enter wallet name"
                          className="core-input w-full rounded-xl px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
                          disabled={state.form.isSaving}
                        />
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => void handleCreateWallet()}
                            disabled={state.form.isSaving}
                            className="core-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {state.form.isSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch({ type: 'form/close' })}
                            disabled={state.form.isSaving}
                            className="core-button-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      {state.wallets.map((wallet) => (
                        <div
                          key={wallet.docId}
                          className="core-panel-muted flex items-center justify-between rounded-2xl p-4"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {wallet.name}
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              Created {formatWalletCreatedAt(wallet.createdAt)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              void handleOpenWallet(wallet.id, wallet.name)
                            }
                            disabled={state.openWallet.isOpening}
                            className="core-button-primary px-4 py-2 text-xs font-semibold"
                          >
                            Open wallet
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </section>

          <aside className="core-surface rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white">About wallets</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-gray-300">
              <p>
                A wallet is the part of Bitcoin Core that tracks your addresses,
                balances, transaction history, and spendable coins.
              </p>
              <p>
                In this workspace, each saved wallet gives you a named entry you
                can reopen later, then inspect through receive, send, address,
                descriptor, and transaction flows.
              </p>
              <p>
                Each wallet can carry its own label so different operational
                contexts remain easy to recognize and reopen later.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

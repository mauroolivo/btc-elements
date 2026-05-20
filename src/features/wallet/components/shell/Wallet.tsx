'use client';
import { WalletHome } from '../home';
import { useReducer, useEffect, useRef } from 'react';
import { produce } from 'immer';
import { useRouter } from 'next/navigation';
import { useAuth } from '@features/auth';
import { WalletReceive } from '../receive';
import {
  useBalance,
  useLoadWallet,
  useWalletInfo,
  useWalletsList,
} from '@features/wallet/hooks';
import { WalletDescriptor } from '../descriptors';
import { useWalletStore } from '@features/wallet/store';
import { WalletSend } from '../send';
import { WalletAddress } from '../addresses';
import { Getwalletinfo } from '@features/wallet/types/wallet';
import { WalletSendAdvanced } from '../send-advanced';
import { getUserWalletById } from '@/lib/firebase/wallets';

const DEMO_ACCOUNT_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? '';

enum Tab {
  TRANSACTIONS,
  RECEIVE,
  SEND,
  SEND_ADVANCED,
  ADDRESSES,
  DESCRIPTORS,
}

type WalletViewState = {
  currentTab: Tab;
  isMoreOpen: boolean;
  isGuideCollapsed: boolean;
  autoConnectError: string | null;
  walletLabel: string | null;
  isWalletLabelLoading: boolean;
};

type WalletViewAction =
  | { type: 'tab/set'; tab: Tab }
  | { type: 'more/toggle' }
  | { type: 'more/close' }
  | { type: 'guide/toggle' }
  | { type: 'autoconnect/clear-error' }
  | { type: 'autoconnect/set-error'; message: string }
  | { type: 'label/reset' }
  | { type: 'label/loading' }
  | { type: 'label/set'; label: string };

const initialViewState: WalletViewState = {
  currentTab: Tab.TRANSACTIONS,
  isMoreOpen: false,
  isGuideCollapsed: true,
  autoConnectError: null,
  walletLabel: null,
  isWalletLabelLoading: false,
};

function applyViewPatch(
  draft: WalletViewState,
  patch: Partial<WalletViewState>
) {
  Object.assign(draft, patch);
}

const walletViewReducer = produce(
  (draft: WalletViewState, action: WalletViewAction) => {
    switch (action.type) {
      case 'tab/set':
        applyViewPatch(draft, {
          currentTab: action.tab,
          isMoreOpen: false,
        });
        return;
      case 'more/toggle':
        draft.isMoreOpen = !draft.isMoreOpen;
        return;
      case 'more/close':
        draft.isMoreOpen = false;
        return;
      case 'guide/toggle':
        draft.isGuideCollapsed = !draft.isGuideCollapsed;
        return;
      case 'autoconnect/clear-error':
        draft.autoConnectError = null;
        return;
      case 'autoconnect/set-error':
        draft.autoConnectError = action.message;
        return;
      case 'label/reset':
        applyViewPatch(draft, {
          walletLabel: null,
          isWalletLabelLoading: false,
        });
        return;
      case 'label/loading':
        applyViewPatch(draft, {
          walletLabel: null,
          isWalletLabelLoading: true,
        });
        return;
      case 'label/set':
        applyViewPatch(draft, {
          walletLabel: action.label,
          isWalletLabelLoading: false,
        });
        return;
      default:
        return;
    }
  }
);

function WalletRouteLoader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="core-surface mx-4 w-full max-w-2xl rounded-3xl p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-300 border-r-cyan-500" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-400">{description}</p>
          </div>

          <div className="grid w-full max-w-xl grid-cols-1 gap-4 pt-4 md:grid-cols-3">
            <div className="core-panel rounded-2xl p-4">
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-7 w-24 animate-pulse rounded bg-white/8" />
            </div>
            <div className="core-panel rounded-2xl p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-7 w-20 animate-pulse rounded bg-white/8" />
            </div>
            <div className="core-panel rounded-2xl p-4">
              <div className="h-3 w-18 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-7 w-28 animate-pulse rounded bg-white/8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Wallet() {
  const [viewState, dispatch] = useReducer(walletViewReducer, initialViewState);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const autoLoadAttemptRef = useRef<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { currentWallet, targetWallet, setCurrentWallet, setTargetWallet } =
    useWalletStore();
  const {
    listwallets,
    isLoading: walletsLoading,
    refresh: refreshWallets,
  } = useWalletsList();
  const { load: loadWallet, isLoading: loadLoading } = useLoadWallet();
  const { walletInfo, isLoading: infoLoading } = useWalletInfo();
  const { balanceInfo, isLoading: balanceLoading } = useBalance();

  useEffect(() => {
    if (targetWallet === null) {
      router.replace('/my-wallets');
    }
  }, [router, targetWallet]);

  useEffect(() => {
    if (!targetWallet) {
      dispatch({ type: 'autoconnect/clear-error' });
      autoLoadAttemptRef.current = null;
      return;
    }

    if (walletsLoading) {
      return;
    }

    if (listwallets.result.includes(targetWallet)) {
      if (currentWallet !== targetWallet) {
        setCurrentWallet(targetWallet);
      }
      dispatch({ type: 'autoconnect/clear-error' });
      autoLoadAttemptRef.current = null;
      return;
    }

    if (loadLoading || autoLoadAttemptRef.current === targetWallet) {
      return;
    }

    autoLoadAttemptRef.current = targetWallet;
    dispatch({ type: 'autoconnect/clear-error' });

    void (async () => {
      try {
        await loadWallet(targetWallet);
        setCurrentWallet(targetWallet);
      } catch (error) {
        dispatch({
          type: 'autoconnect/set-error',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to load the requested wallet.',
        });
      } finally {
        autoLoadAttemptRef.current = null;
      }
    })();
  }, [
    currentWallet,
    listwallets.result,
    loadLoading,
    loadWallet,
    refreshWallets,
    setCurrentWallet,
    setTargetWallet,
    targetWallet,
    walletsLoading,
  ]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!viewState.isMoreOpen) return;
      const el = moreRef.current;
      if (el && !el.contains(e.target as Node)) {
        dispatch({ type: 'more/close' });
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [viewState.isMoreOpen]);

  useEffect(() => {
    if (!user || !currentWallet) {
      dispatch({ type: 'label/reset' });
      return;
    }

    let cancelled = false;
    dispatch({ type: 'label/loading' });

    void (async () => {
      try {
        const savedWallet = await getUserWalletById(user.uid, currentWallet);

        if (!cancelled) {
          dispatch({
            type: 'label/set',
            label: savedWallet?.name?.trim() || 'Wallet',
          });
        }
      } catch {
        if (!cancelled) {
          dispatch({ type: 'label/set', label: 'Wallet' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentWallet, user]);

  const isTargetWalletReady =
    !targetWallet ||
    (currentWallet === targetWallet &&
      listwallets.result.includes(targetWallet));
  const walletTitle = viewState.isWalletLabelLoading
    ? null
    : viewState.walletLabel;
  const hasWalletInfoBalance =
    typeof walletInfo?.result?.balance === 'number' &&
    !Number.isNaN(walletInfo.result.balance);
  const displayedBalance =
    typeof balanceInfo?.result === 'number'
      ? balanceInfo.result
      : hasWalletInfoBalance
        ? walletInfo.result.balance
        : null;
  const isWalletCardReady =
    !infoLoading &&
    walletInfo !== null &&
    !viewState.isWalletLabelLoading &&
    !balanceLoading &&
    displayedBalance !== null;
  const isDemoAccount = user?.email?.toLowerCase() === DEMO_ACCOUNT_EMAIL;

  if (targetWallet && viewState.autoConnectError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="core-surface mx-4 w-full max-w-xl rounded-3xl p-6 text-center">
          <h2 className="text-lg font-semibold text-white">
            Could not open wallet
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            {viewState.autoConnectError}
          </p>
        </div>
      </div>
    );
  }

  if (targetWallet && (!isTargetWalletReady || infoLoading)) {
    return (
      <WalletRouteLoader
        title="Opening wallet"
        description="Loading and connecting the selected wallet before querying its data..."
      />
    );
  }

  if (targetWallet === null) {
    return (
      <WalletRouteLoader
        title="Redirecting to My Wallets"
        description="A wallet target is required before opening the wallet screen..."
      />
    );
  }

  if (currentWallet === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="core-surface mx-4 w-full max-w-md rounded-3xl p-6 text-center shadow-lg">
          <div className="core-panel-muted mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-300">
            {/* Wallet icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H6a3 3 0 01-3-3V7z"
              />
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 12h3"
              />
            </svg>
          </div>
          <h2 className="mb-1 text-lg font-semibold text-white">
            No wallet connected
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            Please open Connect Wallet and select a wallet to continue.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className={`relative ${isDemoAccount ? 'pb-32 sm:pb-0' : ''}`}>
      <div className="mb-6 flex w-full items-center justify-center">
        <div
          className="core-tab-strip inline-flex rounded-xl p-1 shadow-sm"
          role="tablist"
          aria-label="Wallet sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewState.currentTab === Tab.TRANSACTIONS}
            tabIndex={viewState.currentTab === Tab.TRANSACTIONS ? 0 : -1}
            onClick={() => dispatch({ type: 'tab/set', tab: Tab.TRANSACTIONS })}
            className={`rounded-lg px-3 py-1 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
              viewState.currentTab === Tab.TRANSACTIONS
                ? 'core-tab-active text-white shadow'
                : 'core-tab'
            }`}
          >
            TRANSACTIONS
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewState.currentTab === Tab.RECEIVE}
            tabIndex={viewState.currentTab === Tab.RECEIVE ? 0 : -1}
            onClick={() => dispatch({ type: 'tab/set', tab: Tab.RECEIVE })}
            className={`rounded-lg px-3 py-1 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
              viewState.currentTab === Tab.RECEIVE
                ? 'core-tab-active text-white shadow'
                : 'core-tab'
            }`}
          >
            RECEIVE
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewState.currentTab === Tab.SEND}
            tabIndex={viewState.currentTab === Tab.SEND ? 0 : -1}
            onClick={() => dispatch({ type: 'tab/set', tab: Tab.SEND })}
            className={`rounded-lg px-3 py-1 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
              viewState.currentTab === Tab.SEND
                ? 'core-tab-active text-white shadow'
                : 'core-tab'
            }`}
          >
            SEND
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewState.currentTab === Tab.SEND_ADVANCED}
            tabIndex={viewState.currentTab === Tab.SEND_ADVANCED ? 0 : -1}
            onClick={() =>
              dispatch({ type: 'tab/set', tab: Tab.SEND_ADVANCED })
            }
            className={`rounded-lg px-3 py-1 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
              viewState.currentTab === Tab.SEND_ADVANCED
                ? 'core-tab-active text-white shadow'
                : 'core-tab'
            }`}
          >
            SEND ADVANCED
          </button>
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              role="tab"
              aria-haspopup="menu"
              aria-expanded={viewState.isMoreOpen}
              onClick={() => dispatch({ type: 'more/toggle' })}
              className={`rounded-lg px-3 py-1 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
                [Tab.ADDRESSES, Tab.DESCRIPTORS].includes(viewState.currentTab)
                  ? 'core-tab-active text-white shadow'
                  : 'core-tab'
              }`}
            >
              <span className="inline-flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M10 3a2 2 0 110 4 2 2 0 010-4zM10 9a2 2 0 110 4 2 2 0 010-4zM10 15a2 2 0 110 4 2 2 0 010-4z" />
                </svg>
                <span className="sr-only">More options</span>
              </span>
            </button>
            {viewState.isMoreOpen && (
              <div className="core-surface absolute right-0 z-20 mt-2 w-44 rounded-2xl shadow-lg">
                <button
                  type="button"
                  className="core-tab block w-full rounded-t-2xl px-3 py-2 text-left text-sm text-gray-200"
                  onClick={() =>
                    dispatch({ type: 'tab/set', tab: Tab.ADDRESSES })
                  }
                >
                  ADDRESSES
                </button>
                <button
                  type="button"
                  className="core-tab block w-full rounded-b-2xl px-3 py-2 text-left text-sm text-gray-200"
                  onClick={() =>
                    dispatch({ type: 'tab/set', tab: Tab.DESCRIPTORS })
                  }
                >
                  DESCRIPTORS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="my-3 flex w-full items-center justify-center">
        <div className="core-surface w-full max-w-md rounded-3xl p-6 shadow-lg">
          {isWalletCardReady && (walletInfo as Getwalletinfo) ? (
            <div className="flex flex-col items-center">
              <div className="text-[11px] font-semibold tracking-[0.24em] text-cyan-200/75 uppercase">
                Wallet
              </div>
              <div className="mt-2 text-center text-lg font-semibold tracking-[-0.03em] text-white">
                {walletTitle}
              </div>
              <div className="text-[11px] font-semibold tracking-widest text-gray-300">
                <span className="sr-only">Wallet balance</span>
                BALANCE
              </div>
              <div className="mt-2 flex items-baseline justify-center gap-2">
                <span className="text-4xl font-extrabold text-white tabular-nums">
                  {displayedBalance.toFixed(8)}
                </span>
                <span className="text-sm font-semibold text-gray-300">BTC</span>
              </div>
              <div className="mt-3 grid w-full grid-cols-3 gap-2 text-center">
                <div className="core-panel-muted rounded-lg px-3 py-2">
                  <div className="text-[10px] tracking-wider text-gray-400">
                    UNCONF
                  </div>
                  <div className="text-sm font-medium text-gray-200 tabular-nums">
                    {(walletInfo.result.unconfirmed_balance ?? 0).toFixed(8)}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-800/40 px-3 py-2">
                  <div className="text-[10px] tracking-wider text-gray-400">
                    IMMATURE
                  </div>
                  <div className="text-sm font-medium text-gray-200 tabular-nums">
                    {(walletInfo.result.immature_balance ?? 0).toFixed(8)}
                  </div>
                </div>
                <div className="rounded-lg bg-gray-800/40 px-3 py-2">
                  <div className="text-[10px] tracking-wider text-gray-400">
                    TX COUNT
                  </div>
                  <div className="text-sm font-medium text-gray-200 tabular-nums">
                    {walletInfo.result.txcount}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-3 w-16 animate-pulse rounded bg-cyan-300/25" />
              <div className="mt-3 h-7 w-44 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-3 w-20 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-12 w-56 animate-pulse rounded bg-white/10" />
              <div className="mt-4 grid w-full grid-cols-3 gap-2">
                <div className="rounded-lg bg-gray-800/40 px-3 py-3">
                  <div className="h-3 w-14 animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-5 w-20 animate-pulse rounded bg-white/10" />
                </div>
                <div className="rounded-lg bg-gray-800/40 px-3 py-3">
                  <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-5 w-20 animate-pulse rounded bg-white/10" />
                </div>
                <div className="rounded-lg bg-gray-800/40 px-3 py-3">
                  <div className="h-3 w-14 animate-pulse rounded bg-white/10" />
                  <div className="mt-2 h-5 w-12 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {viewState.currentTab === Tab.TRANSACTIONS ? (
        <WalletHome />
      ) : viewState.currentTab === Tab.RECEIVE ? (
        <WalletReceive />
      ) : viewState.currentTab === Tab.SEND ? (
        <WalletSend
          showTxs={() => dispatch({ type: 'tab/set', tab: Tab.TRANSACTIONS })}
        />
      ) : viewState.currentTab === Tab.SEND_ADVANCED ? (
        <WalletSendAdvanced
          showTxs={() => dispatch({ type: 'tab/set', tab: Tab.TRANSACTIONS })}
        />
      ) : viewState.currentTab === Tab.ADDRESSES ? (
        <WalletAddress />
      ) : viewState.currentTab === Tab.DESCRIPTORS ? (
        <WalletDescriptor />
      ) : (
        <div>ERROR</div>
      )}

      {isDemoAccount ? (
        <div className="fixed right-4 bottom-4 z-30 w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:bottom-6">
          <div className="overflow-hidden rounded-3xl border border-amber-300/18 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.92))] shadow-[0_24px_70px_rgba(2,8,23,0.5)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.24em] text-amber-100/75 uppercase">
                  Guided next step
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  Fund this demo wallet with testnet4 coins
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'guide/toggle' })}
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10"
                aria-expanded={!viewState.isGuideCollapsed}
                aria-label={
                  viewState.isGuideCollapsed
                    ? 'Expand demo guide'
                    : 'Collapse demo guide'
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-5 w-5 transition-transform ${viewState.isGuideCollapsed ? '' : 'rotate-180'}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {!viewState.isGuideCollapsed ? (
              <div className="space-y-4 px-4 py-4 text-sm text-gray-200">
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/14 text-xs font-bold text-cyan-100">
                      1
                    </span>
                    <div>
                      <div>Click on Receive.</div>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({ type: 'tab/set', tab: Tab.RECEIVE })
                        }
                        className="mt-2 inline-flex items-center rounded-2xl border border-cyan-200/18 bg-cyan-400/10 px-3 py-2 text-xs font-semibold tracking-wide text-cyan-100 transition-colors hover:bg-cyan-400/16"
                      >
                        Open Receive
                      </button>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/14 text-xs font-bold text-cyan-100">
                      2
                    </span>
                    <span>
                      Copy the auto generated address (or create a new one).
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/14 text-xs font-bold text-cyan-100">
                      3
                    </span>
                    <div>
                      <div>
                        Open a testnet4 faucet such as{' '}
                        <span className="underline">coinfaucet.eu</span>, paste
                        the copied address, choose an amount, and send the
                        coins.
                      </div>
                      <a
                        href="https://coinfaucet.eu/en/btc-testnet4/"
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center rounded-2xl border border-amber-300/18 bg-amber-400/10 px-3 py-2 text-xs font-semibold tracking-wide text-amber-100 transition-colors hover:bg-amber-400/16"
                      >
                        Open Faucet
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/14 text-xs font-bold text-cyan-100">
                      4
                    </span>
                    <div>
                      <div>
                        Come back here, open Transactions, and you should soon
                        see the incoming payment as pending.
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({ type: 'tab/set', tab: Tab.TRANSACTIONS })
                        }
                        className="mt-2 inline-flex items-center rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-white/10"
                      >
                        Open Transactions
                      </button>
                    </div>
                  </li>
                </ol>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

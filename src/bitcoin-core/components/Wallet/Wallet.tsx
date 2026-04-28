'use client';
import { WalletHome } from './WalletHome/WalletHome';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/useAuth';
import WalletReceive from './WalletReceive';
import {
  useLoadWallet,
  useWalletInfo,
  useWalletsList,
} from '@/bitcoin-core/components/Wallet/hooks';
import WalletDescriptor from './WalletDescriptor';
import { useWalletStore } from '@/bitcoin-core/useWalletStore';
import WalletSend from './WalletSend';
import WaletAddress from './WalletAddress/WaletAddress';
import { Getwalletinfo } from '@/bitcoin-core/model/wallet';
import WalletSendAdvanced from './WalletSendAdvanced/WalletSendAdvanced';
import { getUserWalletById } from '@/lib/firebase/wallets';

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
  enum Tab {
    TRANSACTIONS,
    RECEIVE,
    SEND,
    SEND_ADVANCED,
    ADDRESSES,
    DESCRIPTORS,
  }
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.TRANSACTIONS);
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [autoConnectError, setAutoConnectError] = useState<string | null>(null);
  const [walletLabel, setWalletLabel] = useState<string | null>(null);
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

  useEffect(() => {
    if (targetWallet === null) {
      router.replace('/my-wallets');
    }
  }, [router, targetWallet]);

  useEffect(() => {
    if (!targetWallet) {
      setAutoConnectError(null);
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
      setAutoConnectError(null);
      autoLoadAttemptRef.current = null;
      return;
    }

    if (loadLoading || autoLoadAttemptRef.current === targetWallet) {
      return;
    }

    autoLoadAttemptRef.current = targetWallet;
    setAutoConnectError(null);

    void (async () => {
      try {
        await loadWallet(targetWallet);
        await refreshWallets();
        setCurrentWallet(targetWallet);
        setTargetWallet(targetWallet);
      } catch (error) {
        setAutoConnectError(
          error instanceof Error
            ? error.message
            : 'Failed to load the requested wallet.'
        );
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
      if (!isMoreOpen) return;
      const el = moreRef.current;
      if (el && !el.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreOpen]);

  useEffect(() => {
    if (!user || !currentWallet) {
      setWalletLabel(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const savedWallet = await getUserWalletById(user.uid, currentWallet);

        if (!cancelled) {
          setWalletLabel(savedWallet?.name?.trim() || null);
        }
      } catch {
        if (!cancelled) {
          setWalletLabel(null);
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
  const walletDisplayName = currentWallet === '' ? 'default' : currentWallet;
  const walletTitle = walletLabel || walletDisplayName;

  if (targetWallet && autoConnectError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="core-surface mx-4 w-full max-w-xl rounded-3xl p-6 text-center">
          <h2 className="text-lg font-semibold text-white">
            Could not open wallet
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            {autoConnectError}
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
    <div className="">
      <div className="mb-6 flex w-full items-center justify-center">
        <div
          className="core-tab-strip inline-flex rounded-xl p-1 shadow-sm"
          role="tablist"
          aria-label="Wallet sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={currentTab === Tab.TRANSACTIONS}
            tabIndex={currentTab === Tab.TRANSACTIONS ? 0 : -1}
            onClick={() => setCurrentTab(Tab.TRANSACTIONS)}
            className={`rounded-lg px-3 py-1 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
              currentTab === Tab.TRANSACTIONS
                ? 'core-tab-active text-white shadow'
                : 'core-tab'
            }`}
          >
            TRANSACTIONS
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentTab === Tab.RECEIVE}
            tabIndex={currentTab === Tab.RECEIVE ? 0 : -1}
            onClick={() => setCurrentTab(Tab.RECEIVE)}
            className={`rounded-lg px-3 py-1 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
              currentTab === Tab.RECEIVE
                ? 'core-tab-active text-white shadow'
                : 'core-tab'
            }`}
          >
            RECEIVE
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentTab === Tab.SEND}
            tabIndex={currentTab === Tab.SEND ? 0 : -1}
            onClick={() => setCurrentTab(Tab.SEND)}
            className={`rounded-lg px-3 py-1 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
              currentTab === Tab.SEND
                ? 'core-tab-active text-white shadow'
                : 'core-tab'
            }`}
          >
            SEND
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={currentTab === Tab.SEND_ADVANCED}
            tabIndex={currentTab === Tab.SEND_ADVANCED ? 0 : -1}
            onClick={() => setCurrentTab(Tab.SEND_ADVANCED)}
            className={`rounded-lg px-3 py-1 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
              currentTab === Tab.SEND_ADVANCED
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
              aria-expanded={isMoreOpen}
              onClick={() => setIsMoreOpen((v) => !v)}
              className={`rounded-lg px-3 py-1 text-sm font-semibold tracking-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
                [Tab.ADDRESSES, Tab.DESCRIPTORS].includes(currentTab)
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
            {isMoreOpen && (
              <div className="core-surface absolute right-0 z-20 mt-2 w-44 rounded-2xl shadow-lg">
                <button
                  type="button"
                  className="core-tab block w-full rounded-t-2xl px-3 py-2 text-left text-sm text-gray-200"
                  onClick={() => {
                    setCurrentTab(Tab.ADDRESSES);
                    setIsMoreOpen(false);
                  }}
                >
                  ADDRESSES
                </button>
                <button
                  type="button"
                  className="core-tab block w-full rounded-b-2xl px-3 py-2 text-left text-sm text-gray-200"
                  onClick={() => {
                    setCurrentTab(Tab.DESCRIPTORS);
                    setIsMoreOpen(false);
                  }}
                >
                  DESCRIPTORS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {(walletInfo as Getwalletinfo) && (
        <>
          {infoLoading || walletInfo === null ? (
            <div className="flex w-full items-center justify-center py-3 text-sm text-gray-300">
              Loading wallet info...
            </div>
          ) : (
            <div className="my-3 flex w-full items-center justify-center">
              <div className="core-surface w-full max-w-md rounded-3xl p-6 shadow-lg">
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
                      {(walletInfo.result.balance ?? 0).toFixed(8)}
                    </span>
                    <span className="text-sm font-semibold text-gray-300">
                      BTC
                    </span>
                  </div>
                  <div className="mt-3 grid w-full grid-cols-3 gap-2 text-center">
                    <div className="core-panel-muted rounded-lg px-3 py-2">
                      <div className="text-[10px] tracking-wider text-gray-400">
                        UNCONF
                      </div>
                      <div className="text-sm font-medium text-gray-200 tabular-nums">
                        {(walletInfo.result.unconfirmed_balance ?? 0).toFixed(
                          8
                        )}
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
              </div>
            </div>
          )}
        </>
      )}
      {currentTab === Tab.TRANSACTIONS ? (
        <WalletHome />
      ) : currentTab === Tab.RECEIVE ? (
        <WalletReceive />
      ) : currentTab === Tab.SEND ? (
        <WalletSend showTxs={() => setCurrentTab(Tab.TRANSACTIONS)} />
      ) : currentTab === Tab.SEND_ADVANCED ? (
        <WalletSendAdvanced showTxs={() => setCurrentTab(Tab.TRANSACTIONS)} />
      ) : currentTab === Tab.ADDRESSES ? (
        <WaletAddress />
      ) : currentTab === Tab.DESCRIPTORS ? (
        <WalletDescriptor />
      ) : (
        <div>ERROR</div>
      )}
    </div>
  );
}

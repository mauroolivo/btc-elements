'use client';
import { WalletHome } from './WalletHome';
import { useState, useEffect, useRef } from 'react';
import WalletReceive from './WalletReceive';
import { useWalletInfo } from '@/bitcoin-core/components/Wallet/hooks';
import WalletDescriptor from './WalletDescriptor';
import { useWalletStore } from '@/bitcoin-core/useWalletStore';
import WalletSend from './WalletSend';
import WaletAddress from './WalletAddress/WaletAddress';
import { Getwalletinfo } from '@/bitcoin-core/model/wallet';
import WalletSendAdvanced from './WalletSendAdvanced/WalletSendAdvanced';

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
  const moreRef = useRef<HTMLDivElement | null>(null);
  const { currentWallet } = useWalletStore();
  const { walletInfo, isLoading: infoLoading } = useWalletInfo();
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
  if (currentWallet === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950/50">
        <div className="mx-4 w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 text-center shadow-lg">
          <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-300">
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
          className="inline-flex rounded-xl bg-gray-800/60 p-1 shadow-sm ring-1 ring-gray-700/50"
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
                ? 'bg-orange-400 text-white shadow'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
                ? 'bg-orange-400 text-white shadow'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
                ? 'bg-orange-400 text-white shadow'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
                ? 'bg-orange-400 text-white shadow'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
                  ? 'bg-orange-400 text-white shadow'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-700"
                  onClick={() => {
                    setCurrentTab(Tab.ADDRESSES);
                    setIsMoreOpen(false);
                  }}
                >
                  ADDRESSES
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-700"
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
              <div className="w-full max-w-md rounded-2xl bg-gray-800 p-6 shadow-lg ring-1 ring-gray-600/30">
                <div className="flex flex-col items-center">
                  <div className="text-[11px] font-semibold tracking-widest text-gray-300">
                    BALANCE
                  </div>
                  <div className="mt-2 flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-extrabold text-white tabular-nums">
                      {walletInfo.result.balance.toFixed(8)}
                    </span>
                    <span className="text-sm font-semibold text-gray-300">
                      BTC
                    </span>
                  </div>
                  <div className="mt-3 grid w-full grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-gray-800/40 px-3 py-2">
                      <div className="text-[10px] tracking-wider text-gray-400">
                        UNCONF
                      </div>
                      <div className="text-sm font-medium text-gray-200 tabular-nums">
                        {walletInfo.result.unconfirmed_balance.toFixed(8)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-800/40 px-3 py-2">
                      <div className="text-[10px] tracking-wider text-gray-400">
                        IMMATURE
                      </div>
                      <div className="text-sm font-medium text-gray-200 tabular-nums">
                        {walletInfo.result.immature_balance.toFixed(8)}
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

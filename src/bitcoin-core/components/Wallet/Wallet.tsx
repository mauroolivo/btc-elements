'use client';
import { WalletHome } from './WalletHome';
import { useState } from 'react';
import WalletReceive from './WalletReceive';
import { useWalletInfo, useWalletStore } from '@/bitcoin-core/useWalletStore';
import WalletSend from './WalletSend';
import { Getwalletinfo } from '@/bitcoin-core/model/wallet';
import WalletSendAdvanced from './(WalletSendAdvanced)/WalletSendAdvanced';

export default function Wallet() {
  enum Tab {
    TRANSACTIONS,
    RECEIVE,
    SEND,
    SEND_ADVANCED,
  }
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.TRANSACTIONS);
  const { currentWallet } = useWalletStore();
  const { walletInfo, isLoading: infoLoading } = useWalletInfo();
  if (currentWallet === null) {
    return <div>Please connect a wallet to continue.</div>;
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
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
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
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
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
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
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
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 ${
              currentTab === Tab.SEND_ADVANCED
                ? 'bg-orange-400 text-white shadow'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            SEND ADVANCED
          </button>
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
      ) : (
        <div>ERROR</div>
      )}
    </div>
  );
}

'use client';
import { WalletHome } from './WalletHome';
import { useState } from 'react';
import WalletReceive from './WalletReceive';
import { useWalletStore } from '@/bitcoin-core/useWalletStore';
export default function Wallet() {
  enum Tab {
    TRANSACTIONS,
    RECEIVE,
    SEND,
  }
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.TRANSACTIONS);
  const { currentWallet } = useWalletStore();
  if (currentWallet === null) {
    return <div>Please connect a wallet to continue.</div>;
  }
  return (
    <div className="">
      <div className="mb-4 flex w-full items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setCurrentTab(Tab.TRANSACTIONS)}
          className={`rounded px-4 py-2 text-sm ${
            currentTab === Tab.TRANSACTIONS
              ? 'bg-gray-800 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          TRANSACTIONS
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab(Tab.RECEIVE)}
          className={`rounded px-4 py-2 text-sm ${
            currentTab === Tab.RECEIVE
              ? 'bg-gray-800 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          RECEIVE
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab(Tab.SEND)}
          className={`rounded px-4 py-2 text-sm ${
            currentTab === Tab.SEND
              ? 'bg-gray-800 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          SEND
        </button>
      </div>
      {currentTab === Tab.TRANSACTIONS ? (
        <WalletHome />
      ) : currentTab === Tab.RECEIVE ? (
        <WalletReceive />
      ) : currentTab === Tab.SEND ? (
        <div>Send Tab Content</div>
      ) : (
        <div>ERROR</div>
      )}
    </div>
  );
}

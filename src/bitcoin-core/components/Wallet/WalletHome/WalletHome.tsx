'use client';
import { useState } from 'react';
import {
  useWalletInfo,
  useTransactions,
} from '@/bitcoin-core/components/Wallet/hooks';
import {
  Getwalletinfo,
  ListtransactionsResult,
} from '@/bitcoin-core/model/wallet';
import WalletHomeTxList from './WalletHomeTxList';

export function WalletHome() {
  const [selectedTx, setSelectedTx] = useState<ListtransactionsResult | null>(
    null
  );
  const {
    transactions,
    isLoading: txLoading,
    isValidating: txValidating,
    hasMore,
    loadMore,
  } = useTransactions({ pageSize: 5 });
  const { walletInfo, isLoading: infoLoading } = useWalletInfo();

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 pb-8">
      {(walletInfo as Getwalletinfo) && (
        <>
          {infoLoading || walletInfo === null ? (
            <div>Loading wallet info...</div>
          ) : (
            <WalletHomeTxList
              transactions={transactions}
              txLoading={txLoading}
              txValidating={txValidating}
              hasMore={hasMore}
              loadMore={loadMore}
              selectedTx={selectedTx}
              setSelectedTx={setSelectedTx}
            />
          )}
        </>
      )}
    </div>
  );
}

import React from 'react';
import { ListtransactionsResult } from '@/bitcoin-core/model/wallet';
import WalletHomeTxDetail from './WalletHomeTxDetail';

type Props = {
  transactions: ListtransactionsResult[];
  txLoading: boolean;
  txValidating: boolean;
  hasMore: boolean;
  loadMore: () => void;
  selectedTx: ListtransactionsResult | null;
  setSelectedTx: (t: ListtransactionsResult | null) => void;
};

export default function WalletHomeTxList({
  transactions,
  txLoading,
  txValidating,
  hasMore,
  loadMore,
  selectedTx,
  setSelectedTx,
}: Props) {
    
  function date(blocktime: number): string {
    const res = new Date(blocktime * 1000).toLocaleString();
    return res.valueOf() === 'Invalid Date' ? 'mining ...' : res;
  }
  if (txLoading && transactions.length === 0) {
    return <div>Loading transactions...</div>;
  }
  if (transactions.length === 0) {
    return <div>No transactions available</div>;
  }

  const sorted = [...transactions].sort((a, b) => {
    const ta = a.confirmations ?? 0;
    const tb = b.confirmations ?? 0;
    return ta - tb;
  });

  return (
    <div>
      {sorted.map((tx, idx) => {
        const amountValue =
          typeof tx.amount === 'number' ? tx.amount : Number(tx.amount ?? 0);
        const isPositive = amountValue > 0;
        const amountColor = isPositive ? 'text-green-400' : 'text-red-400';
        const amountBg = 'bg-gray-800';
        const amountSign = isPositive ? '+' : '';
        const isExpanded = selectedTx && selectedTx.txid === tx.txid;
        return (
          <div key={`${tx.txid}-${idx}`} className="mx-auto max-w-3xl border-b">
            <div className="flex items-center justify-between gap-4 py-3">
              <div className={`flex-1 ${amountBg} rounded px-3 py-2`}>
                <div className={`text-2xl font-bold text-white`}>
                  <span className={amountColor}>
                    {amountSign}
                    {amountValue}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-200">
                  {date(tx.blocktime)}
                </div>
              </div>
              <div className="flex min-w-0 flex-2 flex-col">
                <div className="truncate text-sm font-medium">{tx.address}</div>
                <div className="text-xs text-gray-400">
                  {tx.category} · {tx.confirmations} confirmations
                </div>
                <div className="truncate text-xs text-gray-400">
                  <span className="break-all whitespace-break-spaces">
                    {tx.txid}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={
                    isExpanded
                      ? 'Hide transaction details'
                      : 'Show transaction details'
                  }
                  className={`inline-flex items-center rounded bg-gray-800 p-2 text-white hover:bg-gray-700 ${isExpanded ? 'ring-2 ring-yellow-500' : ''}`}
                  onClick={() => setSelectedTx(isExpanded ? null : tx)}
                >
                  {isExpanded ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 15l-7-7-7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {isExpanded && <WalletHomeTxDetail tx={tx} date={date} />}
          </div>
        );
      })}

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={txValidating}
            className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {txValidating ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

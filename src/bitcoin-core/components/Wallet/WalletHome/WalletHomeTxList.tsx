import React, { useState } from 'react';
import { ListTransaction } from '@/bitcoin-core/model/wallet';
import WalletHomeTxDetail from './WalletHomeTxDetail';
import WalletHomeBumpFee from './WalletHomeBumpFee';

type Props = {
  transactions: ListTransaction[];
  txLoading: boolean;
  txValidating: boolean;
  hasMore: boolean;
  loadMore: () => void;
  txRefresh?: () => void;
  selectedTx: ListTransaction | null;
  setSelectedTx: (t: ListTransaction | null) => void;
};

export default function WalletHomeTxList({
  transactions,
  txLoading,
  txValidating,
  hasMore,
  loadMore,
  txRefresh,
  selectedTx,
  setSelectedTx,
}: Props) {
  const [bumpingTx, setBumpingTx] = useState<ListTransaction | null>(null);
  const [tooltipTx, setTooltipTx] = useState<string | null>(null);

  function date(blocktime: number, confirmations?: number): string {
    if (typeof confirmations === 'number' && confirmations < 0)
      return 'conflicting';
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
                  {date(tx.blocktime, tx.confirmations)}
                </div>
              </div>
              <div className="flex min-w-0 flex-2 flex-col">
                <div className="truncate text-sm font-medium">{tx.address}</div>
                <div className="relative text-xs text-gray-400">
                  <div className="inline-flex items-center gap-2">
                    <span>
                      {tx.category} ·{' '}
                      {typeof tx.confirmations === 'number'
                        ? `${tx.confirmations} confirmations`
                        : '-'}
                    </span>
                    {typeof tx.confirmations === 'number' &&
                      tx.confirmations < 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setTooltipTx(tooltipTx === tx.txid ? null : tx.txid)
                          }
                          className="inline-flex h-5 w-5 items-center justify-center rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
                          aria-label="Explain negative confirmations"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-3 w-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.25 9h.008v.008H11.25V9zm.75 3.75h-.75v4.5h1.5v-4.5H12z M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                            />
                          </svg>
                        </button>
                      )}
                  </div>
                  {tooltipTx === tx.txid && (
                    <div className="absolute right-0 z-20 mt-2 w-80 rounded border border-gray-700 bg-gray-900 p-3 text-sm text-white shadow-lg">
                      In Bitcoin Core, a negative confirmation value indicates
                      that a transaction has conflicted with the main
                      blockchain.
                      <div className="mb-2 font-semibold">
                        Negative confirmations
                      </div>
                      <ul className="mb-2 list-inside list-disc space-y-1 pl-3 text-xs text-gray-300">
                        <li>
                          <span className="font-semibold">
                            Conflict Detection:
                          </span>{' '}
                          If a wallet transaction spends the same input as
                          another transaction that has already been confirmed,
                          this transaction will show a negative confirmation
                          count.
                        </li>
                        <li>
                          <span className="font-semibold">Conflict Depth:</span>{' '}
                          The negative number represents how many blocks deep
                          the conflict is buried (e.g. -5 means the conflicting
                          tx is 5 blocks deep).
                        </li>
                        <li>
                          <span className="font-semibold">Propagation:</span>{' '}
                          Dependent transactions inherit the negative
                          confirmation status.
                        </li>
                      </ul>
                      <div className="mb-2 font-semibold">Why This Happens</div>
                      <ul className="list-inside list-disc space-y-1 pl-3 text-xs text-gray-300">
                        <li>
                          <span className="font-semibold">Double Spends:</span>{' '}
                          Two transactions try to use the same funds; only one
                          can be accepted.
                        </li>
                        <li>
                          <span className="font-semibold">
                            Replace-By-Fee (RBF):
                          </span>{' '}
                          If you use RBF to replace a transaction, the original
                          may show as conflicting (negative) once the new one is
                          confirmed.
                        </li>
                      </ul>
                      <div className="mt-3 text-right">
                        <button
                          onClick={() => setTooltipTx(null)}
                          className="inline-flex items-center rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
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
                  onClick={() => {
                    if (isExpanded) {
                      setSelectedTx(null);
                      setBumpingTx(null);
                    } else {
                      setSelectedTx(tx);
                      setBumpingTx(null);
                    }
                  }}
                >
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {/* inline details removed — details are shown in a centered modal when a tx is selected */}
          </div>
        );
      })}

      {selectedTx && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold">Transaction Details</div>
              <div>
                <button
                  onClick={() => {
                    setSelectedTx(null);
                    setBumpingTx(null);
                    setTooltipTx(null);
                  }}
                  className="inline-flex items-center rounded bg-gray-800 px-3 py-1 text-sm text-white hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
            {bumpingTx && selectedTx && bumpingTx.txid === selectedTx.txid ? (
              <WalletHomeBumpFee
                tx={bumpingTx}
                onBack={() => setBumpingTx(null)}
                onSuccess={() => {
                  setBumpingTx(null);
                  setSelectedTx(null);
                  if (typeof txRefresh === 'function') txRefresh();
                }}
              />
            ) : (
              <WalletHomeTxDetail
                tx={selectedTx}
                date={(t) => date(t, selectedTx.confirmations)}
                onRBF={(t) => setBumpingTx(t)}
              />
            )}
          </div>
        </div>
      )}

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

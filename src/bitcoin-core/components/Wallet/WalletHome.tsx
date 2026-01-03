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

  function date(blocktime: number): string {
    const res = new Date(blocktime * 1000).toLocaleString();
    return res.valueOf() === 'Invalid Date' ? 'mining ...' : res;
  }

  function txsJSX(): React.JSX.Element {
    if (txLoading && transactions.length === 0) {
      return <div>Loading transactions...</div>;
    }
    if (transactions.length === 0) {
      return <div>No transactions available</div>;
    }

    const sorted = [...transactions].sort((a, b) => {
      const ta = a.confirmations;
      const tb = b.confirmations;
      // Newest first within each batch
      return ta - tb;
    });

    const list_items = sorted.map((tx, idx) => {
      const isPositive = Number(tx.amount) > 0;
      const amountColor = isPositive ? 'text-green-400' : 'text-red-400';
      const amountBg = 'bg-gray-800';
      const amountSign = isPositive ? '+' : '';
      return (
        <div
          key={`${tx.txid}-${idx}`}
          className="mx-auto flex max-w-xl items-center justify-between gap-4 border-b py-3"
        >
          <div className={`flex-1 ${amountBg} rounded px-3 py-2`}>
            <div className={`text-2xl font-bold text-white`}>
              <span className={amountColor}>
                {amountSign}
                {tx.amount}
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
            <div className="truncate text-xs text-gray-400">{tx.txid}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open full transaction"
              className="inline-flex items-center rounded bg-gray-800 p-2 text-white hover:bg-gray-700"
              onClick={() => setSelectedTx(tx)}
            >
              {/* Eye icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
                />
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      );
    });
    return (
      <div>
        {list_items}
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

  return (
    <div className="">
      {(walletInfo as Getwalletinfo) && (
        <>
          {infoLoading || walletInfo === null ? (
            <div>Loading wallet info...</div>
          ) : (
            <>{txsJSX()}</>
          )}
        </>
      )}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-xl rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-xl">
            <div className="mb-3 text-base font-semibold">
              Transaction details
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-start justify-between">
                <span className="text-gray-300">TxID</span>
                <span className="max-w-[70%] text-right font-mono break-all whitespace-normal">
                  {selectedTx.txid}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-300">WTxID</span>
                <span className="max-w-[70%] text-right font-mono break-all whitespace-normal">
                  {selectedTx.wtxid}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Address</span>
                <span className="max-w-[70%] text-right font-mono break-all whitespace-normal">
                  {selectedTx.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Category</span>
                <span className="text-right">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Amount</span>
                <span className="text-right">{selectedTx.amount}</span>
              </div>
              {typeof selectedTx.fee !== 'undefined' && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Fee</span>
                  <span className="text-right">{selectedTx.fee}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-300">Confirmations</span>
                <span className="text-right">{selectedTx.confirmations}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-300">Block Hash</span>
                <span className="max-w-[70%] text-right font-mono break-all whitespace-normal">
                  {selectedTx.blockhash}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Block Height</span>
                <span className="text-right">{selectedTx.blockheight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Block Index</span>
                <span className="text-right">{selectedTx.blockindex}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Block Time</span>
                <span className="text-right">{date(selectedTx.blocktime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Time</span>
                <span className="text-right">{date(selectedTx.time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Time Received</span>
                <span className="text-right">
                  {date(selectedTx.timereceived)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">BIP125 Replaceable</span>
                <span className="flex items-center gap-2 text-right">
                  {selectedTx['bip125-replaceable']}
                  {selectedTx['bip125-replaceable'] === 'yes' && (
                    <button
                      type="button"
                      title="Replace by Fee (RBF)"
                      className="ml-2 inline-flex items-center rounded bg-yellow-700 p-1 hover:bg-yellow-600"
                      onClick={() => {
                        /* TODO: Implement RBF action */
                      }}
                    >
                      {/* Lightning bolt SVG icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </button>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Abandoned</span>
                <span className="text-right">
                  {selectedTx.abandoned ? 'Yes' : 'No'}
                </span>
              </div>
              {selectedTx.label && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Label</span>
                  <span className="text-right">{selectedTx.label}</span>
                </div>
              )}
              {selectedTx.walletconflicts.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-gray-300">Wallet Conflicts</span>
                  <span className="max-w-[70%] text-right font-mono break-all whitespace-normal">
                    {selectedTx.walletconflicts.join(', ')}
                  </span>
                </div>
              )}
              {selectedTx.mempoolconflicts.length > 0 && (
                <div className="flex items-start justify-between">
                  <span className="text-gray-300">Mempool Conflicts</span>
                  <span className="max-w-[70%] text-right font-mono break-all whitespace-normal">
                    {selectedTx.mempoolconflicts.join(', ')}
                  </span>
                </div>
              )}
              {selectedTx.parent_descs &&
                selectedTx.parent_descs.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-gray-300">Parent Descriptors</span>
                    <span className="max-w-[70%] text-right font-mono break-all whitespace-normal">
                      {selectedTx.parent_descs.join(', ')}
                    </span>
                  </div>
                )}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="inline-flex items-center rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { type ExplorerTransactionSummary } from '@features/explorer/loadExplorerData';

type BlockTransactionsProps = {
  query: string;
  transactions: ExplorerTransactionSummary[];
  page: number;
  totalPages: number;
  totalTransactions: number;
};

export function BlockTransactions({
  query,
  transactions,
  page,
  totalPages,
  totalTransactions,
}: BlockTransactionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const previousHref = buildExplorerHref(query, page - 1);
  const nextHref = buildExplorerHref(query, page + 1);

  function navigateToPage(href: string) {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          Transactions ({totalTransactions})
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          {page > 1 ? (
            <button
              type="button"
              onClick={() => navigateToPage(previousHref)}
              disabled={isPending}
              className="core-button-secondary px-2 py-1"
            >
              Prev
            </button>
          ) : (
            <span className="core-button-secondary cursor-not-allowed px-2 py-1 opacity-50">
              Prev
            </span>
          )}
          <div>
            {isPending ? 'Loading page...' : `Page ${page} of ${totalPages}`}
          </div>
          {page < totalPages ? (
            <button
              type="button"
              onClick={() => navigateToPage(nextHref)}
              disabled={isPending}
              className="core-button-secondary px-2 py-1"
            >
              Next
            </button>
          ) : (
            <span className="core-button-secondary cursor-not-allowed px-2 py-1 opacity-50">
              Next
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {transactions.map((transaction) => (
          <TxSummary key={transaction.txid} transaction={transaction} />
        ))}
      </div>
    </div>
  );
}

function TxSummary({
  transaction,
}: {
  transaction: ExplorerTransactionSummary;
}) {
  if (transaction.error) {
    return (
      <div className="core-panel-muted rounded-xl p-3 text-xs text-red-300">
        Failed to load transaction
      </div>
    );
  }

  return (
    <div className="core-panel-muted rounded-xl p-3">
      <div className="text-xs text-gray-400">TxID</div>
      <div className="font-mono text-xs break-all">{transaction.txid}</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-400">Confirmations</div>
          <div className="font-mono">{transaction.confirmations}</div>
        </div>
        <div>
          <div className="text-gray-400">Size / vSize</div>
          <div className="font-mono">
            {transaction.size} / {transaction.vsize}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Outputs</div>
          <div className="font-mono">{transaction.outputCount}</div>
        </div>
        <div>
          <div className="text-gray-400">Total Out</div>
          <div className="font-mono">{transaction.totalOut} BTC</div>
        </div>
      </div>
    </div>
  );
}

function buildExplorerHref(query: string, page: number) {
  const params = new URLSearchParams({ ref: query, page: String(page) });
  return `/explorer?${params.toString()}`;
}

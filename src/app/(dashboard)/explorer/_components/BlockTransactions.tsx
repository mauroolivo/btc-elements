import { use } from 'react';

import {
  type ExplorerBlockTransactionsPage,
  type ExplorerTransactionSummary,
} from '@features/explorer/loadExplorerData';

import { BlockTransactionsPager } from './BlockTransactionsPager';

type BlockTransactionsProps = {
  query: string;
  transactionSummariesPromise: Promise<ExplorerBlockTransactionsPage>;
  totalTransactions: number;
};

export function BlockTransactions({
  query,
  transactionSummariesPromise,
  totalTransactions,
}: BlockTransactionsProps) {
  const { page, totalPages, transactionSummaries } = use(
    transactionSummariesPromise
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          Transactions ({totalTransactions})
        </div>
        <BlockTransactionsPager
          query={query}
          page={page}
          totalPages={totalPages}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {transactionSummaries.map((transaction) => (
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

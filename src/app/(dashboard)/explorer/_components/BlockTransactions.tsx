'use client';

import { useRawTransaction } from '@features/explorer';

type BlockTransactionsProps = {
  txids: string[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function BlockTransactions({
  txids,
  page,
  pageSize,
  onPageChange,
}: BlockTransactionsProps) {
  const total = txids.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, totalPages - 1);
  const start = current * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageTxids = txids.slice(start, end);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Transactions ({total})</div>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <button
            type="button"
            className="core-button-secondary px-2 py-1"
            onClick={() => onPageChange(Math.max(0, current - 1))}
            disabled={current === 0}
          >
            Prev
          </button>
          <div>
            Page {current + 1} of {totalPages}
          </div>
          <button
            type="button"
            className="core-button-secondary px-2 py-1"
            onClick={() => onPageChange(Math.min(totalPages - 1, current + 1))}
            disabled={current >= totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {pageTxids.map((txid) => (
          <TxSummary key={txid} txid={txid} />
        ))}
      </div>
    </div>
  );
}

function TxSummary({ txid }: { txid: string }) {
  const { raw, isLoading, error } = useRawTransaction(txid, {
    verbose: true,
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <div className="core-panel-muted rounded-xl p-3">
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-700" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-700" />
      </div>
    );
  }

  if (error || !raw || !raw.result) {
    return (
      <div className="core-panel-muted rounded-xl p-3 text-xs text-red-300">
        Failed to load transaction
      </div>
    );
  }

  const result = raw.result;
  const totalOut = Array.isArray(result.vout)
    ? result.vout.reduce((sum, value) => sum + (value.value || 0), 0)
    : 0;

  return (
    <div className="core-panel-muted rounded-xl p-3">
      <div className="text-xs text-gray-400">TxID</div>
      <div className="font-mono text-xs break-all">{result.txid}</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-400">Confirmations</div>
          <div className="font-mono">{result.confirmations ?? 0}</div>
        </div>
        <div>
          <div className="text-gray-400">Size / vSize</div>
          <div className="font-mono">
            {result.size} / {result.vsize}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Outputs</div>
          <div className="font-mono">{result.vout?.length ?? 0}</div>
        </div>
        <div>
          <div className="text-gray-400">Total Out</div>
          <div className="font-mono">{totalOut} BTC</div>
        </div>
      </div>
    </div>
  );
}

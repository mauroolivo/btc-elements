'use client';
import { useWalletInfo, useTransactions } from '@/bitcoin-core/useWalletStore';
import { Getwalletinfo } from '@/bitcoin-core/model/wallet';

export function WalletHome() {
  const {
    transactions,
    isLoading: txLoading,
    isValidating: txValidating,
    hasMore,
    loadMore,
  } = useTransactions({ pageSize: 5 });
  const { walletInfo, isLoading: infoLoading } = useWalletInfo();

  function txsJSX(): React.JSX.Element {
    if (txLoading && transactions.length === 0) {
      return <div>Loading transactions...</div>;
    }
    if (transactions.length === 0) {
      return <div>No transactions available</div>;
    }
    const list_items = transactions.map((tx, idx) => {
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
            <div className="mt-1 text-xs text-gray-500">
              {new Date(tx.blocktime * 1000).toLocaleString()}
            </div>
          </div>
          <div className="flex min-w-0 flex-2 flex-col">
            <div className="truncate text-sm font-medium">{tx.address}</div>
            <div className="text-xs text-gray-500">
              {tx.category} · {tx.confirmations} confirmations
            </div>
            <div className="truncate text-xs text-gray-400">{tx.txid}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open full transaction"
              className="inline-flex items-center rounded bg-gray-800 p-2 text-white hover:bg-gray-700"
              onClick={() => {
                console.log('Open full transaction', tx.txid);
              }}
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
            <button
              type="button"
              aria-label="Open minimal transaction"
              className="inline-flex items-center rounded bg-gray-800 p-2 text-white hover:bg-gray-700"
              onClick={() => {
                console.log('Open minimal transaction', tx.txid);
              }}
            >
              {/* List icon */}
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
                  d="M4 6h16M4 12h12M4 18h8"
                />
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
            <>
              <div className="text-xl font-bold">
                Balance: {walletInfo.result.balance}, total transactions:{' '}
                {walletInfo.result.txcount}
              </div>
              {txsJSX()}
            </>
          )}
        </>
      )}
      {walletInfo === null && (
        <div className="flex min-h-screen items-center justify-center bg-gray-950/50">
          <div
            id="pippo"
            className="mx-4 w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 text-center shadow-lg"
          >
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
      )}
    </div>
  );
}

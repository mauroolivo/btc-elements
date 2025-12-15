'use client';
import { useWalletStore } from '../useWalletStore';
import { Getwalletinfo } from '../model/wallet';

export function Wallet() {
  const { walletInfo, transactionList } = useWalletStore();

  function txsJSX(): React.JSX.Element {
    if (transactionList === null) {
      return <div>No transactions available</div>;
    }
    const list_items = transactionList?.result.map((tx, idx) => {
      const isPositive = Number(tx.amount) > 0;
      const amountColor = isPositive ? 'text-green-400' : 'text-red-400';
      const amountBg = 'bg-gray-800';
      const amountSign = isPositive ? '+' : '';
      return (
        <div
          key={idx}
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
    return <div>{list_items}</div>;
  }

  return (
    <div className="">
      {(walletInfo as Getwalletinfo) && (
        <>
          {walletInfo === null ? (
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
    </div>
  );
}

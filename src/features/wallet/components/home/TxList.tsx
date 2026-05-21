import React, { useState } from 'react';
import { ListTransaction } from '@features/wallet/types/wallet';
import WalletHomeTxDetail from './TxDetail';
import WalletHomeBumpFee from './BumpFee';
import WalletHomeCPFP from './CPFP';

type Props = {
  transactions: readonly ListTransaction[];
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
  const [isCPFP, setIsCPFP] = useState<boolean>(false);

  function closeDetailsModal() {
    setSelectedTx(null);
    setBumpingTx(null);
    setTooltipTx(null);
    setIsCPFP(false);
  }

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
    return (
      <div className="flex justify-center py-8 text-center text-sm text-gray-400">
        No transactions available
      </div>
    );
  }

  function handleCPFP(tx: ListTransaction) {
    setIsCPFP(true);
    console.log('CPFP selected for tx:', tx);
  }

  const sorted = [...transactions].sort((a, b) => {
    const ta = a.confirmations ?? 0;
    const tb = b.confirmations ?? 0;
    return ta - tb;
  });

  return (
    <div className="space-y-4">
      {sorted.map((tx, idx) => {
        const amountValue =
          typeof tx.amount === 'number' ? tx.amount : Number(tx.amount ?? 0);
        const isPositive = amountValue > 0;
        const amountColor = isPositive ? 'text-green-400' : 'text-red-400';
        const amountSign = isPositive ? '+' : '';
        const isExpanded = selectedTx && selectedTx.txid === tx.txid;
        const confirmationLabel =
          typeof tx.confirmations === 'number'
            ? `${tx.confirmations} confirmations`
            : 'Confirmation unavailable';
        return (
          <div
            key={`${tx.txid}-${idx}`}
            className="core-surface mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.82))] shadow-[0_18px_45px_rgba(2,8,23,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
              <div className="core-panel-muted shrink-0 rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(2,132,199,0.08),rgba(15,23,42,0.12))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_16px_32px_rgba(15,23,42,0.18)] lg:min-w-64">
                <div className="text-2xl font-bold tracking-[-0.04em] text-white sm:text-3xl">
                  <span className={amountColor}>
                    {amountSign}
                    {amountValue.toFixed(8)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-200">
                  {date(tx.blocktime, tx.confirmations)}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.22em] text-cyan-100/65 uppercase">
                        Address
                      </div>
                      <div className="mt-1 font-mono text-sm leading-6 break-all text-cyan-50 sm:text-base">
                        {tx.address || 'No address available'}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
                        <span className="inline-flex items-center rounded-full border border-cyan-300/16 bg-cyan-400/10 px-3 py-1 font-semibold tracking-wide text-cyan-100">
                          {tx.category}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 font-medium text-gray-200">
                          {confirmationLabel}
                        </span>
                      </div>

                      {typeof tx.confirmations === 'number' &&
                        tx.confirmations < 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setTooltipTx(
                                tooltipTx === tx.txid ? null : tx.txid
                              )
                            }
                            className="mt-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/6 text-gray-300 transition-colors hover:bg-white/10"
                            aria-label="Explain negative confirmations"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-3.5 w-3.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.25 9h.008v.008H11.25V9zm.75 3.75h-.75v4.5h1.5v-4.5H12z M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                              />
                            </svg>
                          </button>
                        )}

                      {tooltipTx === tx.txid && (
                        <div className="absolute left-0 z-20 mt-3 w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/96 p-4 text-sm text-white shadow-[0_20px_50px_rgba(2,8,23,0.55)] backdrop-blur-xl">
                          In Bitcoin Core, a negative confirmation value
                          indicates that a transaction has conflicted with the
                          main blockchain.
                          <div className="mb-2 font-semibold">
                            Negative confirmations
                          </div>
                          <ul className="mb-2 list-inside list-disc space-y-1 pl-3 text-xs text-gray-300">
                            <li>
                              <span className="font-semibold">
                                Conflict Detection:
                              </span>{' '}
                              If a wallet transaction spends the same input as
                              another transaction that has already been
                              confirmed, this transaction will show a negative
                              confirmation count.
                            </li>
                            <li>
                              <span className="font-semibold">
                                Conflict Depth:
                              </span>{' '}
                              The negative number represents how many blocks
                              deep the conflict is buried (e.g. -5 means the
                              conflicting tx is 5 blocks deep).
                            </li>
                            <li>
                              <span className="font-semibold">
                                Propagation:
                              </span>{' '}
                              Dependent transactions inherit the negative
                              confirmation status.
                            </li>
                          </ul>
                          <div className="mb-2 font-semibold">
                            Why This Happens
                          </div>
                          <ul className="list-inside list-disc space-y-1 pl-3 text-xs text-gray-300">
                            <li>
                              <span className="font-semibold">
                                Double Spends:
                              </span>{' '}
                              Two transactions try to use the same funds; only
                              one can be accepted.
                            </li>
                            <li>
                              <span className="font-semibold">
                                Replace-By-Fee (RBF):
                              </span>{' '}
                              If you use RBF to replace a transaction, the
                              original may show as conflicting (negative) once
                              the new one is confirmed.
                            </li>
                          </ul>
                          <div className="mt-3 text-right">
                            <button
                              onClick={() => setTooltipTx(null)}
                              className="inline-flex items-center rounded-xl border border-white/10 bg-white/6 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/10"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.22em] text-gray-400 uppercase">
                        Transaction ID
                      </div>
                      <div className="mt-1 font-mono text-xs leading-6 break-all text-gray-300 sm:text-sm">
                        {tx.txid}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-start sm:pl-4">
                    <button
                      type="button"
                      aria-label={
                        isExpanded
                          ? 'Hide transaction details'
                          : 'Show transaction details'
                      }
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10 ${isExpanded ? 'ring-2 ring-cyan-300/70' : ''}`}
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
                        className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25L12 15.75l-7.5-7.5"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* inline details removed — details are shown in a centered modal when a tx is selected */}
          </div>
        );
      })}

      {selectedTx && (
        <div
          className="fixed inset-0 z-40 overflow-hidden bg-slate-950/72 p-3 backdrop-blur-sm sm:p-6"
          onClick={closeDetailsModal}
        >
          <div className="flex min-h-full items-start justify-center sm:items-center">
            <div
              className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] text-white shadow-[0_32px_90px_rgba(2,8,23,0.58),inset_0_1px_0_rgba(255,255,255,0.06)] sm:max-h-[calc(100vh-3rem)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] px-4 py-4 backdrop-blur-xl sm:px-6">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.24em] text-cyan-100/65 uppercase">
                    Transaction details
                  </div>
                  <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white sm:text-xl">
                    Inspect wallet transaction state
                  </div>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10"
                  aria-label="Close transaction details"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="core-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                {isCPFP ? (
                  <WalletHomeCPFP
                    tx={selectedTx}
                    onBack={() => setIsCPFP(false)}
                    onSuccess={() => {
                      setIsCPFP(false);
                      setSelectedTx(null);
                      if (typeof txRefresh === 'function') txRefresh();
                    }}
                  />
                ) : bumpingTx && bumpingTx.txid === selectedTx.txid ? (
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
                    onCPFP={(t) => {
                      handleCPFP(t);
                    }}
                  />
                )}
              </div>
            </div>
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

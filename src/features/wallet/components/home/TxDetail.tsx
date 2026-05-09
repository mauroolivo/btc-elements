import React from 'react';
import { ListTransaction } from '@features/wallet/types/wallet';

type Props = {
  tx: ListTransaction;
  date: (t: number) => string;
  onRBF?: (tx: ListTransaction) => void;
  onCPFP?: (tx: ListTransaction) => void;
};

export default function WalletHomeTxDetail({ tx, date, onRBF, onCPFP }: Props) {
  const amountValue =
    typeof tx.amount === 'number' ? tx.amount : Number(tx.amount ?? 0);
  const feeValue = typeof tx.fee === 'number' ? tx.fee : null;
  const isIncoming = amountValue > 0;
  const amountTone = isIncoming ? 'text-emerald-300' : 'text-rose-300';
  const amountPrefix = isIncoming ? '+' : '';
  const confirmationLabel =
    typeof tx.confirmations === 'number'
      ? `${tx.confirmations} confirmations`
      : 'Confirmation unavailable';

  return (
    <div className="space-y-6 text-white">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="core-surface rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.72))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="text-[11px] font-semibold tracking-[0.24em] text-cyan-100/65 uppercase">
            Summary
          </div>
          <div
            className={`mt-3 text-4xl font-bold tracking-[-0.05em] ${amountTone}`}
          >
            {amountPrefix}
            {amountValue.toFixed(8)}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-300">
            <span className="inline-flex items-center rounded-full border border-cyan-300/16 bg-cyan-400/10 px-3 py-1 font-semibold tracking-wide text-cyan-100">
              {tx.category || 'unknown'}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 font-medium text-gray-200">
              {confirmationLabel}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <DetailStat
              label="Block time"
              value={tx.blocktime ? date(tx.blocktime) : '-'}
            />
            <DetailStat
              label="Received"
              value={tx.timereceived ? date(tx.timereceived) : '-'}
            />
            <DetailStat
              label="Fee"
              value={feeValue !== null ? feeValue.toFixed(8) : '-'}
              mono
            />
          </div>
        </section>

        <section className="core-panel-muted rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,47,73,0.28),rgba(15,23,42,0.38))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="text-[11px] font-semibold tracking-[0.24em] text-gray-400 uppercase">
            Network state
          </div>
          <div className="mt-4 space-y-3">
            <DetailLine
              label="BIP125 replaceable"
              value={tx['bip125-replaceable'] || '-'}
            />
            <DetailLine
              label="Abandoned"
              value={
                typeof tx.abandoned !== 'undefined'
                  ? tx.abandoned
                    ? 'Yes'
                    : 'No'
                  : '-'
              }
            />
            <DetailLine
              label="Block height"
              value={
                typeof tx.blockheight !== 'undefined'
                  ? String(tx.blockheight)
                  : '-'
              }
            />
            <DetailLine
              label="Block index"
              value={
                typeof tx.blockindex !== 'undefined'
                  ? String(tx.blockindex)
                  : '-'
              }
            />
            <DetailLine label="Wallet label" value={tx.label || '-'} />
            <DetailLine
              label="Event time"
              value={tx.time ? date(tx.time) : '-'}
            />
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {tx['bip125-replaceable'] === 'yes' &&
              Number(tx.amount) < 0 &&
              (typeof tx.confirmations !== 'number' ||
                tx.confirmations >= 0) && (
                <button
                  type="button"
                  title="Increase the fee for this unconfirmed transaction (Replace by Fee)"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/24 bg-[linear-gradient(180deg,rgba(245,158,11,0.88),rgba(251,146,60,0.76))] px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_34px_rgba(245,158,11,0.28)] transition-all hover:brightness-110"
                  onClick={() => {
                    onRBF?.(tx);
                  }}
                >
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
                  <span>Increase Fee (RBF)</span>
                </button>
              )}

            {Number(tx.amount) > 0 &&
              typeof tx.confirmations === 'number' &&
              tx.confirmations === 0 && (
                <button
                  type="button"
                  title="Create a child transaction to pay fee for parent (Child Pays For Parent - CPFP)"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/24 bg-[linear-gradient(180deg,rgba(34,211,238,0.3),rgba(14,165,233,0.18))] px-4 py-3 text-sm font-semibold text-cyan-50 shadow-[0_14px_34px_rgba(14,165,233,0.16)] transition-colors hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.38),rgba(14,165,233,0.24))]"
                  onClick={() => {
                    onCPFP?.(tx);
                  }}
                >
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
                      d="M12 8v8m0 0l3-3m-3 3l-3-3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Child pays for parent (CPFP)</span>
                </button>
              )}
          </div>
        </section>
      </div>

      <section className="core-surface rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.7))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="text-[11px] font-semibold tracking-[0.24em] text-gray-400 uppercase">
          Identifiers
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <DetailBlock label="Address" value={tx.address || '-'} mono />
          <DetailBlock label="Transaction ID" value={tx.txid} mono />
          <DetailBlock label="Block hash" value={tx.blockhash || '-'} mono />
          <DetailBlock
            label="Parent descriptors"
            value={
              tx.parent_descs && tx.parent_descs.length > 0
                ? tx.parent_descs.join(', ')
                : '-'
            }
            mono
          />
          <DetailBlock
            label="Wallet conflicts"
            value={
              tx.walletconflicts && tx.walletconflicts.length > 0
                ? tx.walletconflicts.join(', ')
                : '-'
            }
            mono
          />
          <DetailBlock
            label="Mempool conflicts"
            value={
              tx.mempoolconflicts && tx.mempoolconflicts.length > 0
                ? tx.mempoolconflicts.join(', ')
                : '-'
            }
            mono
          />
        </div>
      </section>
    </div>
  );
}

function DetailStat({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
      <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase">
        {label}
      </div>
      <div className={`mt-2 text-sm text-white ${mono ? 'font-mono' : ''}`}>
        {value}
      </div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="max-w-[60%] text-right text-sm font-medium text-white">
        {value}
      </div>
    </div>
  );
}

function DetailBlock({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4">
      <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase">
        {label}
      </div>
      <div
        className={`mt-2 text-sm leading-6 break-all text-white ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}

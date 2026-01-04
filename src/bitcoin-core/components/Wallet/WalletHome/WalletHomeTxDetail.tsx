import React from 'react';
import { ListtransactionsResult } from '@/bitcoin-core/model/wallet';

type Props = {
  tx: ListtransactionsResult;
  date: (t: number) => string;
  onRBF?: (txid: string) => void;
};

export default function WalletHomeTxDetail({ tx, date }: Props) {
  return (
    <div className="mb-2 px-3 pt-0 pb-2 text-[15px] text-white">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div>
          <div className="text-xs text-gray-400">Fee</div>
          <div className="text-white">
            {typeof tx.fee !== 'undefined' ? tx.fee : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Block Hash</div>
          <div className="font-mono break-all whitespace-break-spaces text-white">
            {tx.blockhash || '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Block Height</div>
          <div className="text-white">
            {typeof tx.blockheight !== 'undefined' ? tx.blockheight : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Block Index</div>
          <div className="text-white">
            {typeof tx.blockindex !== 'undefined' ? tx.blockindex : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Block Time</div>
          <div className="text-white">
            {tx.blocktime ? date(tx.blocktime) : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Time</div>
          <div className="text-white">{tx.time ? date(tx.time) : '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Time Received</div>
          <div className="text-white">
            {tx.timereceived ? date(tx.timereceived) : '-'}
          </div>
        </div>
        <div className="flex items-center justify-between text-white">
          <div>
            <div className="text-xs text-gray-400">BIP125 Replaceable</div>
            <div>{tx['bip125-replaceable'] || '-'}</div>
          </div>
          {tx['bip125-replaceable'] === 'yes' && (
            <button
              type="button"
              title="Increase the fee for this unconfirmed transaction (Replace by Fee)"
              className="inline-flex items-center gap-1 rounded bg-yellow-700 px-2 py-1 text-xs font-semibold hover:bg-yellow-600"
              onClick={() => {
                /* TODO: Implement RBF action */
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
        </div>
        <div>
          <div className="text-xs text-gray-400">Abandoned</div>
          <div className="text-white">
            {typeof tx.abandoned !== 'undefined'
              ? tx.abandoned
                ? 'Yes'
                : 'No'
              : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Label</div>
          <div className="text-white">{tx.label || '-'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Wallet Conflicts</div>
          <div className="font-mono break-all text-white">
            {tx.walletconflicts && tx.walletconflicts.length > 0
              ? tx.walletconflicts.join(', ')
              : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Mempool Conflicts</div>
          <div className="font-mono break-all text-white">
            {tx.mempoolconflicts && tx.mempoolconflicts.length > 0
              ? tx.mempoolconflicts.join(', ')
              : '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Parent Descriptors</div>
          <div className="font-mono break-all text-white">
            {tx.parent_descs && tx.parent_descs.length > 0
              ? tx.parent_descs.join(', ')
              : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

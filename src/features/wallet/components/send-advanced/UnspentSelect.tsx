import { useMemo, useState, useEffect } from 'react';
import { useUnspent } from '@features/wallet/hooks';
import { Utxo } from '@features/wallet/types/wallet';

export type WalletUnspentSelectProps = {
  onChange?: (selected: Utxo[]) => void;
  defaultSelected?: Array<{ txid: string; vout: number }>;
};

export default function WalletUnspentSelect({
  onChange,
  defaultSelected,
}: WalletUnspentSelectProps) {
  const { listunspent, isLoading, error, refresh } = useUnspent();
  const items = useMemo(() => listunspent?.result ?? [], [listunspent]);
  const defaultSet = useMemo(() => {
    const s = new Set<string>();
    (defaultSelected ?? []).forEach((d) => s.add(`${d.txid}:${d.vout}`));
    return s;
  }, [defaultSelected]);

  const [selected, setSelected] = useState<Set<string>>(defaultSet);

  const selectedItems = useMemo(() => {
    const map = new Map<string, Utxo>();
    items.forEach((i) => map.set(`${i.txid}:${i.vout}`, i));
    return Array.from(selected)
      .map((key) => map.get(key))
      .filter(Boolean) as Utxo[];
  }, [items, selected]);

  const totalSelectedAmount = useMemo(() => {
    return selectedItems.reduce((sum, u) => sum + (u?.amount ?? 0), 0);
  }, [selectedItems]);

  function toggle(txid: string, vout: number) {
    const key = `${txid}:${vout}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAll() {
    const next = new Set<string>();
    items.forEach((i) => next.add(`${i.txid}:${i.vout}`));
    setSelected(next);
  }

  function clearAll() {
    setSelected(new Set());
  }

  // notify parent when selection changes (post-render to avoid update during render warnings)
  useEffect(() => {
    if (onChange) {
      onChange(selectedItems);
    }
  }, [onChange, selectedItems]);

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-gray-200">Select UTXOs</div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refresh}
            className="rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={selectAll}
            className="rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded border border-gray-700 bg-gray-900 p-3 text-sm text-gray-300">
          Loading unspent outputs…
        </div>
      )}
      {error && (
        <div className="rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
          Failed to load UTXOs
        </div>
      )}

      {!isLoading && !error && (
        <ul className="divide-y divide-gray-800 rounded-lg border border-gray-700 bg-gray-900">
          {items.length === 0 && (
            <li className="p-3 text-sm text-gray-400">
              No unspent outputs found.
            </li>
          )}
          {items.map((u) => {
            const key = `${u.txid}:${u.vout}`;
            const checked = selected.has(key);
            return (
              <li key={key} className="flex items-start gap-3 p-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={`Select UTXO ${u.txid}:${u.vout}`}
                  onClick={() => toggle(u.txid, u.vout)}
                  className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                    checked
                      ? 'border-cyan-300/35 bg-[linear-gradient(180deg,rgba(34,211,238,0.22),rgba(34,197,94,0.14))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_10px_20px_rgba(8,47,73,0.18)]'
                      : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-cyan-200/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))]'
                  }`}
                >
                  <span
                    className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-md transition-all ${
                      checked
                        ? 'bg-cyan-300/90 text-slate-950 shadow-[0_1px_8px_rgba(34,211,238,0.35)]'
                        : 'bg-white/8 text-transparent'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      className={`h-2.5 w-2.5 transition-opacity ${checked ? 'opacity-100' : 'opacity-0'}`}
                      aria-hidden="true"
                    >
                      <path
                        d="M3.5 8.5l2.5 2.5 6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="min-w-0 font-mono text-xs break-all text-gray-300">
                      {u.txid.slice(0, 10)}…:{u.vout}
                    </span>
                    <span className="font-mono text-sm text-white sm:text-right">
                      {u.amount.toFixed(8)} BTC
                    </span>
                  </div>
                  <div className="mt-1 flex flex-col gap-1 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <span className="break-all">{u.address ?? '—'}</span>
                    <span className="sm:text-right">
                      {u.confirmations} conf •{' '}
                      {u.spendable ? 'spendable' : 'locked'} •{' '}
                      {u.safe ? 'safe' : 'unsafe'}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selectedItems.length > 0 && (
        <div className="mt-3 rounded border border-gray-700 bg-gray-900 p-3 text-xs text-gray-300">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>Selected: {selectedItems.length} UTXO(s)</span>
            <span className="font-mono text-white">
              Total: {totalSelectedAmount.toFixed(8)} BTC
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState, useEffect } from 'react';
import { useUnspent } from '@/bitcoin-core/components/Wallet/hooks';
import { Utxo } from '@/bitcoin-core/model/wallet';

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
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-200">Select UTXOs</div>
        <div className="flex items-center gap-2">
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
              <li key={key} className="flex items-center gap-3 p-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(u.txid, u.vout)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-orange-600 focus:ring-orange-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-300">
                      {u.txid.slice(0, 10)}…:{u.vout}
                    </span>
                    <span className="font-mono text-sm text-white">
                      {u.amount.toFixed(8)} BTC
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                    <span>{u.address ?? '—'}</span>
                    <span>
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
          <div className="flex items-center justify-between">
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

'use client';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRawmempool } from '@/bitcoin-core/components/Mempool/hooks';
import { RawMempoolTx } from '@/bitcoin-core/model/transaction';

type FormFields = { ref: string };
type Entry = [string, RawMempoolTx];

export default function Page() {
  const [filter, setFilter] = useState<string>('');
  const { register, handleSubmit, setValue } = useForm<FormFields>({
    defaultValues: { ref: '' },
  });

  const { mempool, isLoading, error, refresh } = useRawmempool({
    verbose: true,
    revalidateOnFocus: false,
  });

  const entries: Entry[] = useMemo(() => {
    const e = mempool?.result
      ? (Object.entries(mempool.result) as Entry[])
      : [];
    // Sort by time desc for a consistent order
    return e.sort((a, b) => b[1].time - a[1].time);
  }, [mempool]);

  const filtered: Entry[] = useMemo(() => {
    if (!filter) return entries;
    const q = filter.toLowerCase();
    return entries.filter(
      ([txid, info]) =>
        txid.toLowerCase().includes(q) ||
        (info.wtxid ?? '').toLowerCase().includes(q)
    );
  }, [entries, filter]);

  const onSubmit = handleSubmit(({ ref }) => {
    setFilter(ref.trim());
  });

  function onClear() {
    setValue('ref', '', { shouldDirty: false, shouldValidate: false });
    setFilter('');
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pt-24 pb-8 sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-screen-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-white">Mempool Explorer</h1>
        <p className="mt-1 text-sm text-gray-400">
          Browse unconfirmed transactions in the mempool.
        </p>
      </div>

      <form
        noValidate
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl"
      >
        <div className="flex items-center gap-3">
          <input
            {...register('ref')}
            placeholder="Filter by TxID or wtxid"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 p-4 font-mono text-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-500"
          >
            Search
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg bg-gray-700 px-4 py-3 text-white hover:bg-gray-600"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              refresh();
            }}
            className="rounded-lg bg-gray-700 px-4 py-3 text-white hover:bg-gray-600"
          >
            Refresh
          </button>
        </div>
      </form>

      <div className="mx-auto mt-6 w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        {isLoading && (
          <div className="rounded border border-gray-700 bg-gray-900 p-4 text-sm text-gray-200">
            Fetching mempool...
          </div>
        )}
        {error && !mempool && (
          <div className="rounded border border-red-700 bg-red-900/30 p-4 text-sm text-red-200">
            Failed to fetch mempool. Please try again.
          </div>
        )}

        {mempool && mempool.result && (
          <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-5 text-white">
            <div className="text-base font-medium">
              Unconfirmed Transactions ({filtered.length})
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filtered.map(([txid, info]) => (
                <MempoolTxCard key={txid} txid={txid} info={info} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MempoolTxCard({ txid, info }: { txid: string; info: RawMempoolTx }) {
  const satVb = info.vsize > 0 ? (info.fees.base * 1e8) / info.vsize : 0;
  const when = new Date((info.time || 0) * 1000);

  return (
    <div className="rounded border border-gray-700 bg-gray-800 p-3">
      <div className="text-xs text-gray-400">TxID</div>
      <div className="font-mono text-xs break-all">{txid}</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-400">vSize / Weight</div>
          <div className="font-mono">
            {info.vsize} / {info.weight}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Fee (BTC)</div>
          <div className="font-mono">{info.fees.base.toFixed(8)}</div>
        </div>
        <div>
          <div className="text-gray-400">Fee Rate (sat/vB)</div>
          <div className="font-mono">{satVb.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-400">Time</div>
          <div className="font-mono">{when.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-400">Height</div>
          <div className="font-mono">{info.height}</div>
        </div>
        <div>
          <div className="text-gray-400">Anc / Desc</div>
          <div className="font-mono">
            {info.ancestorcount} / {info.descendantcount}
          </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-400">Replaceable</div>
          <div className="font-mono">{String(info['bip125-replaceable'])}</div>
        </div>
        <div>
          <div className="text-gray-400">Unbroadcast</div>
          <div className="font-mono">{String(info.unbroadcast)}</div>
        </div>
      </div>
    </div>
  );
}

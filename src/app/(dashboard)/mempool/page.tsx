'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRawmempool } from '@features/mempool';
import { RawMempoolTx } from '@shared/types/transaction';

import { MempoolLoadingView } from './_components/MempoolLoadingView';
import { MempoolStatCard } from './_components/MempoolStatCard';
import { MempoolTxRow } from './_components/MempoolTxRow';

type FormFields = { ref: string };
type Entry = [string, RawMempoolTx];

function formatBtc(value: number) {
  return `${value.toFixed(8)} BTC`;
}

function formatCount(value: number) {
  return new Intl.NumberFormat().format(value);
}

function getFeeRate(info: RawMempoolTx) {
  return info.vsize > 0 ? (info.fees.base * 1e8) / info.vsize : 0;
}

export default function MempoolPage() {
  const [filter, setFilter] = useState<string>('');
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);
  const { register, handleSubmit, setValue } = useForm<FormFields>({
    defaultValues: { ref: '' },
  });

  const { mempool, isLoading, error, refresh } = useRawmempool({
    verbose: true,
    revalidateOnFocus: false,
  });

  async function triggerRefresh() {
    await refresh();
    setLastRefreshAt(Date.now());
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refresh().then(() => {
        setLastRefreshAt(Date.now());
      });
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  const lastRefreshLabel = useMemo(() => {
    if (!lastRefreshAt) {
      return null;
    }

    return new Date(lastRefreshAt).toLocaleTimeString();
  }, [lastRefreshAt]);

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

  const stats = useMemo(() => {
    if (filtered.length === 0) {
      return {
        txCount: 0,
        avgFeeRate: 0,
        totalFees: 0,
        replaceable: 0,
      };
    }

    const totalFees = filtered.reduce(
      (sum, [, info]) => sum + info.fees.base,
      0
    );
    const totalFeeRate = filtered.reduce(
      (sum, [, info]) => sum + getFeeRate(info),
      0
    );
    const replaceable = filtered.reduce(
      (sum, [, info]) => sum + (info['bip125-replaceable'] ? 1 : 0),
      0
    );

    return {
      txCount: filtered.length,
      avgFeeRate: totalFeeRate / filtered.length,
      totalFees,
      replaceable,
    };
  }, [filtered]);

  const onSubmit = handleSubmit(({ ref }) => {
    setFilter(ref.trim());
  });

  function onClear() {
    setValue('ref', '', { shouldDirty: false, shouldValidate: false });
    setFilter('');
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-white">Mempool Explorer</h1>
        <p className="mt-1 text-sm text-gray-400">
          Browse unconfirmed transactions in the mempool.
        </p>
      </div>

      <form noValidate onSubmit={onSubmit} className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            {...register('ref')}
            placeholder="Filter by TxID or wtxid"
            className="core-input w-full rounded-2xl px-4 py-3 font-mono text-sm text-white placeholder-gray-500 focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <button type="submit" className="core-button-primary px-4 py-3">
              Search
            </button>
            <button
              type="button"
              onClick={onClear}
              className="core-button-secondary px-4 py-3"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                void triggerRefresh();
              }}
              className="core-button-secondary px-4 py-3"
            >
              Refresh
            </button>
          </div>
        </div>
      </form>

      <div className="mx-auto mt-6 w-full max-w-6xl">
        {isLoading && (
          <MempoolLoadingView
            title="Fetching mempool data"
            description="Syncing unconfirmed transactions and fee activity from your node..."
          />
        )}
        {error && !mempool && (
          <div className="rounded border border-red-700 bg-red-900/30 p-4 text-sm text-red-200">
            Failed to fetch mempool. Please try again.
          </div>
        )}

        {mempool && mempool.result && (
          <div className="space-y-4 text-white">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MempoolStatCard
                label="Visible transactions"
                value={formatCount(stats.txCount)}
                hint={
                  filter ? 'Filtered result set' : 'Current mempool selection'
                }
              />
              <MempoolStatCard
                label="Average fee rate"
                value={`${stats.avgFeeRate.toFixed(2)} sat/vB`}
                hint="Across the visible transactions"
              />
              <MempoolStatCard
                label="Total base fees"
                value={formatBtc(stats.totalFees)}
                hint="Summed from visible transactions"
              />
              <MempoolStatCard
                label="Replaceable"
                value={formatCount(stats.replaceable)}
                hint="BIP125-enabled transactions"
              />
            </div>

            <div className="core-surface mempool-surface rounded-3xl p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-base font-medium">
                  {filtered.length > 0
                    ? `Unconfirmed Transactions (${filtered.length})`
                    : 'No transactions in the mempool'}
                </div>
                <div className="flex items-center gap-2 text-xs text-cyan-100/70">
                  <span className="mempool-live-dot" aria-hidden="true" />
                  <span>
                    Auto-refreshing every 10s
                    {lastRefreshLabel ? ` · Updated ${lastRefreshLabel}` : ''}
                  </span>
                </div>
              </div>
              {filtered.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {filtered.map(([txid, info], index) => {
                    const feeRate = getFeeRate(info);
                    return (
                      <MempoolTxRow
                        key={txid}
                        txid={txid}
                        info={info}
                        rank={index + 1}
                        feeRate={feeRate}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="core-panel-muted mt-4 rounded-2xl p-6 text-sm text-gray-300">
                  Your node is reporting an empty mempool right now.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

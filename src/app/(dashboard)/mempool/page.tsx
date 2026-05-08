'use client';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRawmempool } from '@features/mempool';
import { RawMempoolTx } from '@shared/types/transaction';

type FormFields = { ref: string };
type Entry = [string, RawMempoolTx];

function formatBtc(value: number) {
  return `${value.toFixed(8)} BTC`;
}

function formatCount(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatRelativeTime(timestamp: number) {
  const elapsed = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);

  if (elapsed < 60) return `${elapsed}s ago`;
  if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
  if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
  return `${Math.floor(elapsed / 86400)}d ago`;
}

function compactHash(value: string, head = 14, tail = 10) {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function getFeeRate(info: RawMempoolTx) {
  return info.vsize > 0 ? (info.fees.base * 1e8) / info.vsize : 0;
}

function getPackageFeeRate(info: RawMempoolTx) {
  return info.descendantsize > 0
    ? (info.fees.descendant * 1e8) / info.descendantsize
    : 0;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="core-panel rounded-2xl p-4">
      <div className="text-[11px] tracking-wide text-gray-500 uppercase">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-gray-400">{hint}</div>
    </div>
  );
}

function DataPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] tracking-wide text-gray-500 uppercase">
        {label}
      </div>
      <div className="mt-1 text-sm text-white">{value}</div>
    </div>
  );
}

function MempoolLoadingView({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="core-surface rounded-3xl p-8">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-300 border-r-cyan-500" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm text-gray-400">{description}</p>
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 pt-4 md:grid-cols-3">
          <div className="core-panel rounded-2xl p-4">
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-28 animate-pulse rounded bg-white/8" />
          </div>
          <div className="core-panel rounded-2xl p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-20 animate-pulse rounded bg-white/8" />
          </div>
          <div className="core-panel rounded-2xl p-4">
            <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-24 animate-pulse rounded bg-white/8" />
          </div>
        </div>
      </div>
    </div>
  );
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
              <StatCard
                label="Visible transactions"
                value={formatCount(stats.txCount)}
                hint={
                  filter ? 'Filtered result set' : 'Current mempool selection'
                }
              />
              <StatCard
                label="Average fee rate"
                value={`${stats.avgFeeRate.toFixed(2)} sat/vB`}
                hint="Across the visible transactions"
              />
              <StatCard
                label="Total base fees"
                value={formatBtc(stats.totalFees)}
                hint="Summed from visible transactions"
              />
              <StatCard
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

function MempoolTxRow({
  txid,
  info,
  rank,
  feeRate,
}: {
  txid: string;
  info: RawMempoolTx;
  rank: number;
  feeRate: number;
}) {
  const when = new Date((info.time || 0) * 1000);
  const packageFeeRate = getPackageFeeRate(info);
  const ancestorLabel = `${formatCount(info.ancestorcount)} / ${formatCount(info.ancestorsize)} vB`;
  const descendantLabel = `${formatCount(info.descendantcount)} / ${formatCount(info.descendantsize)} vB`;
  const dependsCount = info.depends.length;
  const spentByCount = info.spentby.length;

  return (
    <div className="core-panel-muted rounded-2xl p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] tracking-wide text-gray-300 uppercase">
              #{rank}
            </span>
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-200">
              {feeRate.toFixed(2)} sat/vB
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">
              {formatRelativeTime(info.time)}
            </span>
            {info['bip125-replaceable'] && (
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-200">
                Replaceable
              </span>
            )}
            {info.unbroadcast && (
              <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2.5 py-1 text-[11px] text-yellow-200">
                Unbroadcast
              </span>
            )}
          </div>

          <div className="mt-3">
            <div className="text-[11px] tracking-wide text-gray-500 uppercase">
              Transaction
            </div>
            <div className="mt-1 font-mono text-sm break-all text-white lg:hidden">
              {txid}
            </div>
            <div className="mt-1 hidden font-mono text-sm text-white lg:block">
              {compactHash(txid, 18, 14)}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              wtxid {compactHash(info.wtxid, 12, 10)}
            </div>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-4 lg:min-w-lg lg:grid-cols-4">
          <DataPair label="Base fee" value={formatBtc(info.fees.base)} />
          <DataPair
            label="Package fee rate"
            value={`${packageFeeRate.toFixed(2)} sat/vB`}
          />
          <DataPair
            label="vSize / Weight"
            value={`${formatCount(info.vsize)} / ${formatCount(info.weight)}`}
          />
          <DataPair label="Mempool height" value={formatCount(info.height)} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-white/5 pt-4 md:grid-cols-2 xl:grid-cols-4">
        <DataPair label="Seen at" value={when.toLocaleString()} />
        <DataPair label="Ancestors" value={ancestorLabel} />
        <DataPair label="Descendants" value={descendantLabel} />
        <DataPair
          label="Links"
          value={`${formatCount(dependsCount)} depends · ${formatCount(spentByCount)} spends`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-white/5 pt-4 md:grid-cols-3">
        <DataPair label="Modified fee" value={formatBtc(info.fees.modified)} />
        <DataPair label="Ancestor fee" value={formatBtc(info.fees.ancestor)} />
        <DataPair
          label="Descendant fee"
          value={formatBtc(info.fees.descendant)}
        />
      </div>
      <div className="mt-3 text-[11px] text-gray-500">
        Sorted by newest transactions first.
      </div>
    </div>
  );
}

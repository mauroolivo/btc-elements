import { RawMempoolTx } from '@shared/types/transaction';

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

function getPackageFeeRate(info: RawMempoolTx) {
  return info.descendantsize > 0
    ? (info.fees.descendant * 1e8) / info.descendantsize
    : 0;
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

type MempoolTxRowProps = {
  txid: string;
  info: RawMempoolTx;
  rank: number;
  feeRate: number;
};

export function MempoolTxRow({ txid, info, rank, feeRate }: MempoolTxRowProps) {
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

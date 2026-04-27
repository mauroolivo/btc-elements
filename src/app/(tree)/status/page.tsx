import type { ReactNode } from 'react';

import {
  getblockchaininfo,
  getmempoolinfo,
  getmininginfo,
  getnetworkinfo,
} from '@/bitcoin-core/api/api';

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(2)} ${units[i]}`;
}

function formatNumber(value?: number) {
  if (value === undefined || value === null) return '—';
  return new Intl.NumberFormat().format(value);
}

function formatPercent(p?: number) {
  if (p === undefined || p === null) return '0%';
  const pct = Math.max(0, Math.min(1, p)) * 100;
  return `${pct.toFixed(2)}%`;
}

function formatTime(ts?: number) {
  if (!ts) return '—';
  try {
    return new Date(ts * 1000).toLocaleString();
  } catch {
    return String(ts);
  }
}

function formatHashrate(hs?: number) {
  if (!hs || hs <= 0) return '0 H/s';
  const units = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s'];
  const i = Math.floor(Math.log(hs) / Math.log(1000));
  const val = hs / Math.pow(1000, i);
  return `${val.toFixed(2)} ${units[i]}`;
}

function compactHash(value?: string, head = 14, tail = 10) {
  if (!value) return '—';
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-white/5 py-2 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span
        className={
          mono
            ? 'max-w-[62%] text-right font-mono text-sm break-all text-white'
            : 'max-w-[62%] text-right text-sm text-white'
        }
      >
        {value}
      </span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="core-panel rounded-2xl p-4">
      <h2 className="mb-3 text-sm font-medium text-white">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export default async function Page() {
  let blockchainInfo;

  try {
    blockchainInfo = await getblockchaininfo();
  } catch (e) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-24 pb-8">
        <div className="core-surface rounded-2xl p-4 text-sm text-red-200">
          Unable to connect to the Bitcoin node. Please ensure that your node is
          running and that the application is properly configured to connect to
          it ({e instanceof Error ? e.message : String(e)}).
        </div>
      </div>
    );
  }

  const [mempoolInfo, miningInfo, networkInfo] = await Promise.all([
    getmempoolinfo(),
    getmininginfo(),
    getnetworkinfo(),
  ]);

  const r = blockchainInfo?.result;
  const m = mempoolInfo?.result;
  const mi = miningInfo?.result;
  const ni = networkInfo?.result;

  if (!r) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-24 pb-8">
        <div className="core-surface rounded-2xl p-4 text-sm text-red-200">
          Unable to fetch node status.
        </div>
      </div>
    );
  }

  const progress = r.verificationprogress ?? 0;
  const progressPct = Math.max(0, Math.min(1, progress)) * 100;
  const headersLag = Math.max((r.headers ?? 0) - (r.blocks ?? 0), 0);
  const warnings = [
    ...r.warnings,
    ...(mi?.warnings ?? []),
    ...(ni?.warnings ?? []),
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Node Status</h1>
          <p className="mt-1 text-sm text-gray-400">
            Compact overview of sync, peers, mempool, and chain health.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
          {r.chain} {r.initialblockdownload ? 'IBD' : 'synced'}
        </div>
      </div>

      <div className="space-y-4">
        <div className="core-surface rounded-2xl p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-white">Sync</div>
                <div className="font-mono text-sm text-gray-300">
                  {formatPercent(progress)}
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {headersLag > 0
                  ? `${formatNumber(headersLag)} headers behind`
                  : 'Headers aligned with blocks'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm lg:grid-cols-4">
              <div>
                <div className="text-[11px] tracking-wide text-gray-500 uppercase">
                  Blocks
                </div>
                <div className="font-mono text-white">
                  {formatNumber(r.blocks)}
                </div>
              </div>
              <div>
                <div className="text-[11px] tracking-wide text-gray-500 uppercase">
                  Headers
                </div>
                <div className="font-mono text-white">
                  {formatNumber(r.headers)}
                </div>
              </div>
              <div>
                <div className="text-[11px] tracking-wide text-gray-500 uppercase">
                  Peers
                </div>
                <div className="font-mono text-white">
                  {formatNumber(ni?.connections ?? 0)}
                </div>
              </div>
              <div>
                <div className="text-[11px] tracking-wide text-gray-500 uppercase">
                  Mempool
                </div>
                <div className="font-mono text-white">
                  {formatNumber(m?.size ?? 0)} tx
                </div>
              </div>
            </div>
          </div>

          <div className="core-progress-track mt-3 h-2 w-full overflow-hidden rounded-full">
            <div
              className="core-progress-fill h-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {r.initialblockdownload && (
            <div className="mt-2 text-xs text-yellow-300">
              Initial block download is still running.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-4">
            <DetailSection title="Chain">
              <DetailRow
                label="Best block"
                value={compactHash(r.bestblockhash)}
                mono
              />
              <DetailRow
                label="Difficulty"
                value={formatNumber(r.difficulty)}
                mono
              />
              <DetailRow
                label="Disk usage"
                value={formatBytes(r.size_on_disk)}
                mono
              />
              <DetailRow label="Pruned" value={r.pruned ? 'Yes' : 'No'} />
              <DetailRow label="Node time" value={formatTime(r.time)} mono />
              <DetailRow
                label="Median block time"
                value={formatTime(r.mediantime)}
                mono
              />
              <DetailRow
                label="Chain work"
                value={compactHash(r.chainwork, 12, 12)}
                mono
              />
            </DetailSection>

            {m && (
              <DetailSection title="Mempool">
                <DetailRow
                  label="Transactions"
                  value={formatNumber(m.size)}
                  mono
                />
                <DetailRow
                  label="Serialized size"
                  value={formatBytes(m.bytes)}
                  mono
                />
                <DetailRow
                  label="Memory usage"
                  value={formatBytes(m.usage)}
                  mono
                />
                <DetailRow
                  label="Total fees"
                  value={`${m.total_fee.toFixed(8)} BTC`}
                  mono
                />
                <DetailRow
                  label="Min fee"
                  value={`${m.mempoolminfee} BTC/kvB`}
                  mono
                />
                <DetailRow
                  label="Relay fee"
                  value={`${m.minrelaytxfee} BTC/kvB`}
                  mono
                />
                <DetailRow
                  label="Incremental relay"
                  value={`${m.incrementalrelayfee} BTC/kvB`}
                  mono
                />
                <DetailRow
                  label="Unbroadcast"
                  value={formatNumber(m.unbroadcastcount)}
                  mono
                />
                <DetailRow
                  label="Full RBF"
                  value={m.fullrbf ? 'Enabled' : 'Disabled'}
                />
                <DetailRow label="Loaded" value={m.loaded ? 'Yes' : 'No'} />
                <DetailRow
                  label="Max mempool"
                  value={formatBytes(m.maxmempool)}
                  mono
                />
              </DetailSection>
            )}
          </div>

          <div className="space-y-4">
            {ni && (
              <DetailSection title="Network">
                <DetailRow
                  label="Version"
                  value={formatNumber(ni.version)}
                  mono
                />
                <DetailRow
                  label="Protocol"
                  value={formatNumber(ni.protocolversion)}
                  mono
                />
                <DetailRow label="Subversion" value={ni.subversion} mono />
                <DetailRow
                  label="Connections"
                  value={formatNumber(ni.connections)}
                  mono
                />
                <DetailRow
                  label="Inbound"
                  value={formatNumber(ni.connections_in)}
                  mono
                />
                <DetailRow
                  label="Outbound"
                  value={formatNumber(ni.connections_out)}
                  mono
                />
                <DetailRow
                  label="Network active"
                  value={ni.networkactive ? 'Yes' : 'No'}
                />
                <DetailRow
                  label="Local relay"
                  value={ni.localrelay ? 'Yes' : 'No'}
                />
                <DetailRow
                  label="Time offset"
                  value={`${formatNumber(ni.timeoffset)} s`}
                  mono
                />
                <DetailRow
                  label="Relay fee"
                  value={`${ni.relayfee} BTC/kB`}
                  mono
                />
                <DetailRow
                  label="Incremental fee"
                  value={`${ni.incrementalfee} BTC/kB`}
                  mono
                />
                <DetailRow
                  label="Services"
                  value={
                    ni.localservicesnames.length > 0
                      ? ni.localservicesnames.join(', ')
                      : ni.localservices
                  }
                  mono
                />
              </DetailSection>
            )}

            {mi && (
              <DetailSection title="Mining">
                <DetailRow label="Chain" value={mi.chain} />
                <DetailRow
                  label="Current block"
                  value={formatNumber(mi.blocks)}
                  mono
                />
                <DetailRow
                  label="Difficulty"
                  value={formatNumber(mi.difficulty)}
                  mono
                />
                <DetailRow
                  label="Network hashrate"
                  value={formatHashrate(mi.networkhashps)}
                  mono
                />
                <DetailRow
                  label="Pooled tx"
                  value={formatNumber(mi.pooledtx)}
                  mono
                />
              </DetailSection>
            )}

            <section className="core-panel rounded-2xl p-4">
              <h2 className="mb-3 text-sm font-medium text-white">Warnings</h2>
              {warnings.length > 0 ? (
                <ul className="space-y-2 text-sm text-yellow-300">
                  {warnings.map((warning, index) => (
                    <li
                      key={`${warning}-${index}`}
                      className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2"
                    >
                      {warning}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-300">
                  No warnings reported.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

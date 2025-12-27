import { getblockchaininfo } from '@/bitcoin-core/api/api';

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(2)} ${units[i]}`;
}

function formatPercent(p?: number) {
  if (p === undefined || p === null) return '0%';
  // Bitcoin Core returns 0..1
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

export default async function Page() {
  const blockchainInfo = await getblockchaininfo();
  const r = blockchainInfo?.result;

  const progress = r?.verificationprogress ?? 0;
  const progressPct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div className="mx-auto max-w-5xl px-6 pt-24 pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">
          Bitcoin Node Status
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Overview of the connected node and sync state.
        </p>
      </div>

      {!r ? (
        <div className="rounded border border-red-700 bg-red-900/30 p-4 text-sm text-red-200">
          Unable to fetch node status.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sync Progress */}
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-base font-medium text-white">
                Synchronization Progress
              </div>
              <div className="font-mono text-sm text-gray-300">
                {formatPercent(progress)}
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-gray-800">
              <div
                className="h-full bg-green-600"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {r.initialblockdownload && (
              <div className="mt-2 text-xs text-yellow-300">
                Initial block download in progress.
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <div className="text-xs text-gray-400">Network</div>
              <div className="mt-1 text-lg text-white">{r.chain}</div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <div className="text-xs text-gray-400">Blocks</div>
              <div className="mt-1 font-mono text-lg text-white">
                {r.blocks}
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <div className="text-xs text-gray-400">Headers</div>
              <div className="mt-1 font-mono text-lg text-white">
                {r.headers}
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <div className="text-xs text-gray-400">Difficulty</div>
              <div className="mt-1 font-mono text-lg text-white">
                {r.difficulty}
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <div className="text-xs text-gray-400">Size on Disk</div>
              <div className="mt-1 font-mono text-lg text-white">
                {formatBytes(r.size_on_disk)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <div className="text-xs text-gray-400">Pruned</div>
              <div className="mt-1 text-lg text-white">
                {r.pruned ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <div className="text-xs text-gray-400">Best Block Hash</div>
              <div className="mt-1 font-mono text-sm break-all text-white">
                {r.bestblockhash}
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <div className="text-xs text-gray-400">Chain Work</div>
              <div className="mt-1 font-mono text-sm break-all text-white">
                {r.chainwork}
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <div className="text-xs text-gray-400">Node Time</div>
              <div className="mt-1 font-mono text-sm text-white">
                {formatTime(r.time)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <div className="text-xs text-gray-400">Median Block Time</div>
              <div className="mt-1 font-mono text-sm text-white">
                {formatTime(r.mediantime)}
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
            <div className="text-base font-medium text-white">Warnings</div>
            {r.warnings && r.warnings.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-yellow-300">
                {r.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 text-sm text-gray-300">No warnings.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

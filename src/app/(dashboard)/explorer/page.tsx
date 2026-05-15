import { Suspense } from 'react';

import { loadExplorerData } from '@features/explorer/loadExplorerData';

import { BlockTransactions } from './_components/BlockTransactions';
import { ExplorerSearchForm } from './_components/ExplorerSearchForm';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ExplorerPageProps = {
  searchParams?: Promise<{
    ref?: string | string[];
    page?: string | string[];
  }>;
};

export default async function ExplorerPage({
  searchParams,
}: ExplorerPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const explorerData = await loadExplorerData(resolvedSearchParams);
  const hasQuery = explorerData.query !== '';

  return (
    <div className="mx-auto max-w-3xl px-6 pt-24 pb-8 sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-screen-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-white">
          Transaction and Blocks Explorer
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Lookup a transaction by its TxID or a block by its hash or height.
        </p>
      </div>

      <ExplorerSearchForm initialQuery={explorerData.query} />

      <div className="mx-auto mt-6 w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        {explorerData.kind === 'not-found' && hasQuery && (
          <div className="rounded border border-red-700 bg-red-900/30 p-4 text-sm text-red-200">
            Failed to fetch data. Please ensure the TxID, block hash, or block
            height is correct.
          </div>
        )}
        {explorerData.kind === 'block' && (
          <div className="core-surface rounded-3xl p-5 text-white">
            <div className="text-base font-medium">Block Details</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-gray-400">Hash</div>
                <div className="font-mono text-sm break-all">
                  {explorerData.block.hash}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Height</div>
                <div className="font-mono text-sm">
                  {explorerData.block.height}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Confirmations</div>
                <div className="font-mono text-sm">
                  {explorerData.block.confirmations}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Time</div>
                <div className="font-mono text-sm">
                  {explorerData.block.time}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Merkleroot</div>
                <div className="font-mono text-sm break-all">
                  {explorerData.block.merkleroot}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Size / Weight</div>
                <div className="font-mono text-sm">
                  {explorerData.block.size} / {explorerData.block.weight}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Previous / Next</div>
                <div className="font-mono text-sm break-all">
                  {explorerData.block.previousblockhash} /{' '}
                  {explorerData.block.nextblockhash}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Transactions</div>
                <div className="font-mono text-sm">
                  {explorerData.block.nTx}
                </div>
              </div>
            </div>

            <Suspense
              key={`${explorerData.query}:${explorerData.page}`}
              fallback={
                <BlockTransactionsFallback
                  page={explorerData.page}
                  totalTransactions={explorerData.totalTransactions}
                />
              }
            >
              <BlockTransactions
                query={explorerData.query}
                transactionSummariesPromise={
                  explorerData.transactionSummariesPromise
                }
                totalTransactions={explorerData.totalTransactions}
              />
            </Suspense>
          </div>
        )}
        {explorerData.kind === 'transaction' && (
          <div className="core-surface rounded-3xl p-5 text-white">
            <div className="text-base font-medium">Transaction Details</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-gray-400">TxID</div>
                <div className="font-mono text-sm break-all">
                  {explorerData.transaction.txid}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Hash</div>
                <div className="font-mono text-sm break-all">
                  {explorerData.transaction.hash}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">
                  Size / vSize / Weight
                </div>
                <div className="font-mono text-sm">
                  {explorerData.transaction.size} /{' '}
                  {explorerData.transaction.vsize} /{' '}
                  {explorerData.transaction.weight}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Locktime</div>
                <div className="font-mono text-sm">
                  {explorerData.transaction.locktime}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Confirmations</div>
                <div className="font-mono text-sm">
                  {explorerData.transaction.confirmations}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Blockhash</div>
                <div className="font-mono text-sm break-all">
                  {explorerData.transaction.blockhash}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-semibold">
                  Inputs ({explorerData.transaction.vin.length})
                </div>
                <div className="mt-2 space-y-2">
                  {explorerData.transaction.vin.map((vin, i) => (
                    <div key={i} className="core-panel-muted rounded-xl p-3">
                      <div className="text-xs text-gray-400">
                        Prev TxID / vout
                      </div>
                      <div className="font-mono text-xs break-all">
                        {vin.txid}:{vin.vout}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">Sequence</div>
                      <div className="font-mono text-xs">{vin.sequence}</div>
                      {vin.scriptSig && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-400">
                            ScriptSig ASM
                          </div>
                          <div className="font-mono text-xs break-all">
                            {vin.scriptSig.asm}
                          </div>
                          <div className="mt-1 text-xs text-gray-400">
                            ScriptSig HEX
                          </div>
                          <div className="font-mono text-xs break-all">
                            {vin.scriptSig.hex}
                          </div>
                        </div>
                      )}
                      {vin.txinwitness && vin.txinwitness.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-400">Witness</div>
                          <div className="space-y-1">
                            {vin.txinwitness.map((w, wi) => (
                              <div
                                key={wi}
                                className="font-mono text-xs break-all"
                              >
                                {w}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold">
                  Outputs ({explorerData.transaction.vout.length})
                </div>
                <div className="mt-2 space-y-2">
                  {explorerData.transaction.vout.map((vout, i) => (
                    <div key={i} className="core-panel-muted rounded-xl p-3">
                      <div className="text-xs text-gray-400">Index / Value</div>
                      <div className="font-mono text-xs">
                        {vout.n} / {vout.value} BTC
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Address / Type
                      </div>
                      <div className="font-mono text-xs break-all">
                        {vout.scriptPubKey.address} / {vout.scriptPubKey.type}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        scriptPubKey ASM
                      </div>
                      <div className="font-mono text-xs break-all">
                        {vout.scriptPubKey.asm}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        scriptPubKey HEX
                      </div>
                      <div className="font-mono text-xs break-all">
                        {vout.scriptPubKey.hex}
                      </div>
                      {vout.scriptPubKey.desc && (
                        <>
                          <div className="mt-1 text-xs text-gray-400">
                            Descriptor
                          </div>
                          <div className="font-mono text-xs break-all">
                            {vout.scriptPubKey.desc}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BlockTransactionsFallback({
  page,
  totalTransactions,
}: {
  page: number;
  totalTransactions: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          Transactions ({totalTransactions})
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <span className="core-button-secondary cursor-wait px-2 py-1 opacity-70">
            Loading...
          </span>
          <div>Loading page {page}...</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="core-panel-muted rounded-xl p-3">
            <div className="h-3 w-12 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-white/8" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-14 animate-pulse rounded bg-white/8" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-18 animate-pulse rounded bg-white/8" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-14 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-12 animate-pulse rounded bg-white/8" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-18 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-16 animate-pulse rounded bg-white/8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

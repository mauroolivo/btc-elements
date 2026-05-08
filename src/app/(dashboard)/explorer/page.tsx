'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useBlock,
  useBlockByHeight,
  useRawTransaction,
} from '@features/explorer';

import { BlockTransactions } from './_components/BlockTransactions';
import { ExplorerLoadingView } from './_components/ExplorerLoadingView';

type FormFields = { ref: string };

export default function ExplorerPage() {
  const [ref, setRef] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const { register, handleSubmit, setValue } = useForm<FormFields>({
    defaultValues: { ref: '' },
  });

  const {
    raw,
    isLoading: isLoadingTx,
    error: txError,
  } = useRawTransaction(ref, {
    verbose: true,
    revalidateOnFocus: false,
  });
  const isNumeric = /^\d+$/.test(ref);
  const height = isNumeric ? Number(ref) : undefined;
  const {
    block: blockByHash,
    isLoading: isLoadingBlockHash,
    error: blockHashError,
  } = useBlock(isNumeric ? undefined : ref, {
    verbosity: 1,
    revalidateOnFocus: false,
  });
  const {
    block: blockByHeight,
    isLoading: isLoadingBlockHeight,
    error: blockHeightError,
  } = useBlockByHeight(height, {
    verbosity: 1,
    revalidateOnFocus: false,
  });
  const blockData = blockByHeight || blockByHash;
  const hasQuery = ref !== '';
  const isLoadingAny =
    isLoadingTx || isLoadingBlockHash || isLoadingBlockHeight;
  const hasFetchError = txError || blockHashError || blockHeightError;

  // Pagination resets handled on submit/clear

  const onSubmit = handleSubmit(({ ref }) => {
    setRef(ref.trim());
    setPage(0);
  });

  function onClear() {
    setValue('ref', '', { shouldDirty: false, shouldValidate: false });
    setRef('');
    setPage(0);
  }

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

      <form
        noValidate
        onSubmit={onSubmit}
        className="mx-auto w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            {...register('ref')}
            placeholder="Enter TxID, Blockhash, or Block Height"
            className="core-input w-full rounded-2xl p-4 font-mono text-lg text-white placeholder-gray-500 focus:outline-none"
          />
          <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-none">
            <button
              type="submit"
              className="core-button-primary w-full px-4 py-3"
            >
              Search
            </button>
            <button
              type="button"
              onClick={onClear}
              className="core-button-secondary w-full px-4 py-3"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      <div className="mx-auto mt-6 w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        {isLoadingAny && (
          <ExplorerLoadingView
            title="Fetching explorer data"
            description="Checking the transaction and block references against your node..."
          />
        )}
        {hasQuery && !isLoadingAny && hasFetchError && !raw && !blockData && (
          <div className="rounded border border-red-700 bg-red-900/30 p-4 text-sm text-red-200">
            Failed to fetch data. Please ensure the TxID, block hash, or block
            height is correct.
          </div>
        )}
        {blockData &&
          blockData.result &&
          !(isLoadingBlockHash || isLoadingBlockHeight) && (
            <div className="core-surface rounded-3xl p-5 text-white">
              <div className="text-base font-medium">Block Details</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <div className="text-xs text-gray-400">Hash</div>
                  <div className="font-mono text-sm break-all">
                    {blockData.result.hash}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Height</div>
                  <div className="font-mono text-sm">
                    {blockData.result.height}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Confirmations</div>
                  <div className="font-mono text-sm">
                    {blockData.result.confirmations}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Time</div>
                  <div className="font-mono text-sm">
                    {blockData.result.time}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Merkleroot</div>
                  <div className="font-mono text-sm break-all">
                    {blockData.result.merkleroot}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Size / Weight</div>
                  <div className="font-mono text-sm">
                    {blockData.result.size} / {blockData.result.weight}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Previous / Next</div>
                  <div className="font-mono text-sm break-all">
                    {blockData.result.previousblockhash} /{' '}
                    {blockData.result.nextblockhash}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Transactions</div>
                  <div className="font-mono text-sm">
                    {blockData.result.nTx}
                  </div>
                </div>
              </div>
              <BlockTransactions
                txids={blockData.result.tx}
                page={page}
                pageSize={10}
                onPageChange={setPage}
              />
            </div>
          )}
        {!blockData && raw && raw.result && !isLoadingTx && (
          <div className="core-surface rounded-3xl p-5 text-white">
            <div className="text-base font-medium">Transaction Details</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-gray-400">TxID</div>
                <div className="font-mono text-sm break-all">
                  {raw.result.txid}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Hash</div>
                <div className="font-mono text-sm break-all">
                  {raw.result.hash}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">
                  Size / vSize / Weight
                </div>
                <div className="font-mono text-sm">
                  {raw.result.size} / {raw.result.vsize} / {raw.result.weight}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Locktime</div>
                <div className="font-mono text-sm">{raw.result.locktime}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Confirmations</div>
                <div className="font-mono text-sm">
                  {raw.result.confirmations}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Blockhash</div>
                <div className="font-mono text-sm break-all">
                  {raw.result.blockhash}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-semibold">
                  Inputs ({raw.result.vin.length})
                </div>
                <div className="mt-2 space-y-2">
                  {raw.result.vin.map((vin, i) => (
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
                  Outputs ({raw.result.vout.length})
                </div>
                <div className="mt-2 space-y-2">
                  {raw.result.vout.map((vout, i) => (
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

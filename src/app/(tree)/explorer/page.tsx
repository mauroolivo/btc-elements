'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRawTransaction } from '@/bitcoin-core/components/Explorer/hooks';

type FormFields = { txid: string };

export default function Page() {
  const [txid, setTxid] = useState<string>('');
  const { register, handleSubmit, setValue } = useForm<FormFields>({
    defaultValues: { txid: '' },
  });

  const { raw, isLoading, error } = useRawTransaction(txid, {
    verbose: true,
    revalidateOnFocus: false,
  });

  const onSubmit = handleSubmit(({ txid }) => {
    setTxid(txid.trim());
  });

  function onClear() {
    setValue('txid', '', { shouldDirty: false, shouldValidate: false });
    setTxid('');
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
        <div className="flex items-center gap-3">
          <input
            {...register('txid')}
            placeholder="Enter transaction ID"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 p-4 text-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
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
        </div>
      </form>

      <div className="mx-auto mt-6 w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        {isLoading && (
          <div className="rounded border border-gray-700 bg-gray-900 p-4 text-sm text-gray-200">
            Fetching transaction…
          </div>
        )}
        {error && (
          <div className="rounded border border-red-700 bg-red-900/30 p-4 text-sm text-red-200">
            Failed to fetch transaction.
          </div>
        )}
        {raw && raw.result && !isLoading && !error && (
          <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-5 text-white">
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
                    <div
                      key={i}
                      className="rounded border border-gray-700 bg-gray-800 p-3"
                    >
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
                    <div
                      key={i}
                      className="rounded border border-gray-700 bg-gray-800 p-3"
                    >
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

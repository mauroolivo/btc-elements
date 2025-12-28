'use client';
import { useState } from 'react';
import { useDescriptorInfo } from '@/bitcoin-core/components/Wallet/hooks';

export default function WalletDescriptor() {
  const [descriptorInput, setDescriptorInput] = useState<string>('');
  const [queryDescriptor, setQueryDescriptor] = useState<string>('');
  const { descriptorInfo, error, isLoading, refresh } =
    useDescriptorInfo(queryDescriptor);
  const rpcError = descriptorInfo?.error ?? null;
  const result = descriptorInfo?.result ?? null;
  return (
    <div className="flex w-full items-center justify-center py-6">
      <div className="w-full max-w-2xl rounded-lg border border-gray-700 bg-gray-900 p-6">
        <div className="mb-3 text-lg font-semibold text-white">Descriptors</div>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setQueryDescriptor(descriptorInput.trim());
          }}
        >
          <div>
            <label className="text-xs text-gray-400">Descriptor</label>
            <input
              type="text"
              value={descriptorInput}
              onChange={(e) => setDescriptorInput(e.target.value)}
              placeholder="Enter a descriptor string"
              className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-400"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setDescriptorInput('');
                setQueryDescriptor('');
              }}
              className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
            >
              Clear
            </button>
            {queryDescriptor && (
              <button
                type="button"
                onClick={() => refresh()}
                className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
              >
                Refresh
              </button>
            )}
          </div>
        </form>

        <div className="mt-4">
          {!queryDescriptor ? (
            <div className="rounded border border-gray-700 bg-gray-800 p-3 text-sm text-gray-300">
              Enter a descriptor to view info.
            </div>
          ) : isLoading ? (
            <div className="rounded border border-gray-700 bg-gray-800 p-3 text-center text-sm text-gray-300">
              Loading descriptor info…
            </div>
          ) : rpcError ? (
            <div className="rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
              RPC Error: {rpcError.message} (code {rpcError.code})
            </div>
          ) : error ? (
            <div className="rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
              {(() => {
                try {
                  return JSON.stringify(error);
                } catch {
                  return String(error);
                }
              })()}
            </div>
          ) : result ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-gray-400">descriptor</div>
                <div className="font-mono text-[10px] break-all text-white">
                  {result.descriptor}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">checksum</div>
                <div className="font-mono text-xs text-white">
                  {result.checksum}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">isrange</div>
                <div className="font-mono text-xs text-white">
                  {String(result.isrange)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">issolvable</div>
                <div className="font-mono text-xs text-white">
                  {String(result.issolvable)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">hasprivatekeys</div>
                <div className="font-mono text-xs text-white">
                  {String(result.hasprivatekeys)}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded border border-gray-700 bg-gray-800 p-3 text-center text-sm text-gray-300">
              No data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

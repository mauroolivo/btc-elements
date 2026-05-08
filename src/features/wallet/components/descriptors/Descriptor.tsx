'use client';
import { useState } from 'react';
import { useDescriptorInfo } from '@features/wallet/hooks';

export default function WalletDescriptor() {
  const [descriptorInput, setDescriptorInput] = useState<string>('');
  const [queryDescriptor, setQueryDescriptor] = useState<string>('');
  const { descriptorInfo, error, isLoading, refresh } =
    useDescriptorInfo(queryDescriptor);
  const rpcError = descriptorInfo?.error ?? null;
  const result = descriptorInfo?.result ?? null;
  return (
    <div className="flex w-full items-center justify-center py-6">
      <div className="core-surface w-full max-w-2xl rounded-3xl p-6">
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
              className="core-input mt-1 w-full rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="core-button-primary px-3 py-1.5">
              Submit
            </button>
            <button
              type="button"
              onClick={() => {
                setDescriptorInput('');
                setQueryDescriptor('');
              }}
              className="core-button-secondary px-3 py-1.5"
            >
              Clear
            </button>
            {queryDescriptor && (
              <button
                type="button"
                onClick={() => refresh()}
                className="core-button-secondary px-3 py-1.5"
              >
                Refresh
              </button>
            )}
          </div>
        </form>

        <div className="mt-4">
          {!queryDescriptor ? (
            <div className="core-panel-muted rounded-xl p-3 text-sm text-gray-300">
              Enter a descriptor to view info.
            </div>
          ) : isLoading ? (
            <div className="core-panel-muted rounded-xl p-3 text-center text-sm text-gray-300">
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
            <div className="core-panel-muted rounded-xl p-3 text-center text-sm text-gray-300">
              No data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

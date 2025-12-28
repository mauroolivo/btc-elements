'use client';
import { useAddressInfo } from '@/bitcoin-core/components/Wallet/hooks';

export default function WalletAddressDetail({
  address,
  onClose,
}: {
  address: string;
  onClose: () => void;
}) {
  const { addressInfo, isLoading, error } = useAddressInfo(address);
  const info = addressInfo?.result;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-2xl rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Address Detail</div>
          <button
            type="button"
            aria-label="Close"
            className="rounded p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-400">Address</div>
            <div className="font-mono text-xs break-all text-white">
              {address}
            </div>
          </div>
          {isLoading ? (
            <div className="rounded border border-gray-700 bg-gray-800 p-3 text-center text-xs text-gray-300">
              Loading detail…
            </div>
          ) : error ? (
            <div className="rounded border border-red-700 bg-red-900/30 p-3 text-center text-xs text-red-200">
              Failed to load address info.
            </div>
          ) : info ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="text-xs text-gray-400">ismine</div>
                <div className="font-mono text-xs text-white">
                  {String(info.ismine)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">iswatchonly</div>
                <div className="font-mono text-xs text-white">
                  {String(info.iswatchonly)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">ischange</div>
                <div className="font-mono text-xs text-white">
                  {String(info.ischange)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">solvable</div>
                <div className="font-mono text-xs text-white">
                  {String(info.solvable)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">scriptPubKey</div>
                <div className="font-mono text-[10px] break-all text-white">
                  {info.scriptPubKey}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">pubkey</div>
                <div className="font-mono text-[10px] break-all text-white">
                  {info.pubkey}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">desc</div>
                <div className="font-mono text-[10px] break-all text-white">
                  {info.desc}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">hdkeypath</div>
                <div className="font-mono text-[10px] break-all text-white">
                  {info.hdkeypath}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">labels</div>
                <div className="font-mono text-[10px] break-all text-white">
                  {(() => {
                    try {
                      return JSON.stringify(info.labels);
                    } catch {
                      return String(info.labels);
                    }
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded border border-gray-700 bg-gray-800 p-3 text-center text-xs text-gray-300">
              No detail available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

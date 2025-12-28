'use client';
import { useState } from 'react';
import { useAddressGroupings } from '@/bitcoin-core/components/Wallet/hooks';
import WalletAddressDetail from './WalletAddressDetail';

export default function WalletAddress() {
  const { groupings, isLoading, error, refresh } = useAddressGroupings();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const detailOpen = !!selectedAddress;

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-6">
        <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 text-center">
          <div className="text-sm text-gray-300">Loading addresses…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full items-center justify-center py-6">
        <div className="w-full max-w-md rounded-lg border border-red-700 bg-red-900/30 p-6 text-center">
          <div className="text-sm text-red-200">
            Failed to load address groupings.
          </div>
        </div>
      </div>
    );
  }

  const groups = groupings?.result ?? [];
  const totalAddresses = groups.reduce(
    (sum, g) => sum + (Array.isArray(g) ? g.length : 0),
    0
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-semibold text-white">Addresses</div>
        <button
          type="button"
          onClick={refresh}
          className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>
      {groups.length === 0 ? (
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-gray-300">
          No addresses found.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-gray-400">
            Groups: {groups.length} · Addresses: {totalAddresses}
          </div>
          {groups.map((group, gi) => (
            <div
              key={gi}
              className="rounded-lg border border-gray-700 bg-gray-900 p-4"
            >
              <div className="mb-2 text-sm font-medium text-white">
                Group #{gi + 1}
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {Array.isArray(group) &&
                  group.map((entry, ei) => {
                    const addr = Array.isArray(entry)
                      ? String(entry[0])
                      : String(entry);
                    const amountVal = Array.isArray(entry)
                      ? typeof entry[1] === 'number'
                        ? entry[1]
                        : Number(entry[1])
                      : 0;
                    // label removed from list UI; shown in detail only
                    return (
                      <div
                        key={ei}
                        className="rounded border border-gray-700 bg-gray-800 p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xs text-gray-400">Address</div>
                            <div className="font-mono text-xs break-all text-white">
                              {addr}
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-label="Disclose detail"
                            className="ml-2 rounded p-1 text-gray-300 hover:bg-gray-700 hover:text-white"
                            onClick={() => setSelectedAddress(addr)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-5 w-5"
                            >
                              <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                              <circle cx="12" cy="12" r="2.5" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-2 text-xs">
                          <div>
                            <div className="text-gray-400">Balance</div>
                            <div className="font-mono text-white">
                              {amountVal}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
      {detailOpen && (
        <WalletAddressDetail
          address={selectedAddress as string}
          onClose={() => setSelectedAddress(null)}
        />
      )}
    </div>
  );
}

// Address detail modal moved to WalletAddressDetail.tsx

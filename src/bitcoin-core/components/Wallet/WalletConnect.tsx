'use client';
import { useEffect, useRef, useState } from 'react';
import {
  useWalletStore,
  useWalletsDir,
  useWalletsList,
  useLoadWallet,
  useUnloadWallet,
} from '../../useWalletStore';

export function WalletConnect() {
  const [open, setOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    name: string;
    type: 'load' | 'unload';
  } | null>(null);

  const { setCurrentWallet, currentWallet } = useWalletStore();
  const { load: loadWallet, isLoading: loadLoading } = useLoadWallet();
  const { unload: unloadWallet, isLoading: unloadLoading } = useUnloadWallet();

  const {
    listwalletdir,
    isLoading: dirLoading,
    refresh: refreshDir,
  } = useWalletsDir();
  const {
    listwallets,
    isLoading: walletsLoading,
    refresh: refreshWallets,
  } = useWalletsList();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      const target = e.target as Node;
      if (!dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  function toggleOpen() {
    if (!open) {
      // Revalidate SWR data when opening the menu
      refreshDir();
      refreshWallets();
    }
    setOpen(!open);
  }
  function handleConnect(wallet: string) {
    setCurrentWallet(wallet);
  }
  async function handleLoad(wallet: string) {
    setPendingAction({ name: wallet, type: 'load' });
    try {
      await loadWallet(wallet);
      await refreshWallets();
    } finally {
      setPendingAction(null);
    }
  }
  async function handleUnload(wallet: string) {
    setPendingAction({ name: wallet, type: 'unload' });
    try {
      await unloadWallet(wallet);
      await refreshWallets();
    } finally {
      setPendingAction(null);
    }
  }
  const names = listwalletdir.result.wallets.map((wallet) => wallet.name);
  function getStatus(name: string) {
    if (currentWallet === name) return 'connected';
    if (listwallets.result.includes(name)) return 'loaded';
    return 'unloaded';
  }
  function StatusIcon({
    status,
  }: {
    status: 'unloaded' | 'loaded' | 'connected';
  }) {
    const color =
      status === 'connected'
        ? 'bg-green-500'
        : status === 'loaded'
          ? 'bg-yellow-500'
          : 'bg-gray-400';
    const title = status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <span className="mr-2 inline-flex items-center" title={title}>
        <span className={`inline-block h-3 w-3 rounded-full ${color}`} />
      </span>
    );
  }
  function walletString() {
    if (currentWallet === null) {
      return <span>Connect Wallet</span>;
    }
    return (
      <span>
        Connected Wallet:
        {currentWallet === '' ? 'default' : currentWallet}{' '}
      </span>
    );
  }
  return (
    <div className="mx-auto mb-4 max-w-md pb-4">
      <div className="relative" ref={dropdownRef}>
        <div className="inline-block text-left">
          {open && (
            <div className="absolute right-0 z-20 mt-2 w-80 rounded-md border border-gray-700 bg-gray-900 text-white shadow-lg">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <span className="text-sm font-semibold">Wallets</span>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-xs text-gray-300 hover:bg-gray-800"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
              {/* Linear loader removed */}
              <div className="max-h-80 overflow-y-auto py-2">
                {names.map((name) => {
                  const status = getStatus(name);
                  const displayName = name === '' ? 'default' : name;
                  const itemLoading =
                    pendingAction?.name === name &&
                    ((pendingAction.type === 'load' && loadLoading) ||
                      (pendingAction.type === 'unload' && unloadLoading));

                  return (
                    <div
                      key={displayName}
                      className={`flex items-center justify-between px-3 py-2 hover:bg-gray-800 ${itemLoading ? 'opacity-75' : ''}`}
                      aria-busy={itemLoading}
                    >
                      <div className="flex items-center gap-2">
                        <StatusIcon
                          status={status as 'unloaded' | 'loaded' | 'connected'}
                        />
                        <span className="text-sm font-medium">
                          {displayName}
                        </span>
                        <span className="text-xs text-gray-400">{status}</span>
                      </div>

                      <div className="flex min-w-30 items-center justify-end gap-2">
                        {itemLoading ? (
                          <svg
                            className="h-4 w-4 animate-spin text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                        ) : status === 'connected' ? (
                          <span className="text-green-400">Connected</span>
                        ) : status === 'loaded' ? (
                          <>
                            <button
                              onClick={() => handleConnect(name)}
                              disabled={loadLoading || unloadLoading}
                              className="rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600 focus:ring-0 focus:outline-none"
                            >
                              Connect
                            </button>
                            <button
                              onClick={() => handleUnload(name)}
                              disabled={loadLoading || unloadLoading}
                              className="rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600 focus:ring-0 focus:outline-none"
                            >
                              Unload
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleLoad(name)}
                            disabled={loadLoading || unloadLoading}
                            className="rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600 focus:ring-0 focus:outline-none"
                          >
                            Load
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Keep the trigger always rendered to avoid layout shifts */}
      <>
        <button
          onClick={toggleOpen}
          type="button"
          disabled={
            dirLoading || walletsLoading || loadLoading || unloadLoading
          }
          className="inline-flex min-w-45 items-center justify-between rounded bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-700 focus:outline-none"
        >
          {walletString()}
          {dirLoading || walletsLoading || loadLoading || unloadLoading ? (
            // Spinner
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : open ? (
            // Chevron up icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 15l6-6 6 6"
              />
            </svg>
          ) : (
            // Chevron down icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 9l6 6 6-6"
              />
            </svg>
          )}
        </button>
        {/* Linear loader removed */}
      </>
    </div>
  );
}

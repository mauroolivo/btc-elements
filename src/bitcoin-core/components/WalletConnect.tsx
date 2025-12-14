'use client';
import { useState } from 'react';
import { useWalletStore } from '../useWalletStore';

export function WalletConnect() {
  const [open, setOpen] = useState(false);
  const {
    listwalletdir,
    listwallets,
    listwalletdirFetch,
    listwalletsFetch,
    loading,
    connectWallet,
    currentWallet,
    loadWallet,
    unloadWallet,
    walletInfo,
  } = useWalletStore();
  function toggleOpen() {
    if (!open) {
      console.log('Fetching wallet info');
      listwalletdirFetch();
      listwalletsFetch();
    }
    setOpen(!open);
  }
  function handleConnect(wallet: string) {
    connectWallet(wallet);
  }
  function handleLoad(wallet: string) {
    loadWallet(wallet);
  }
  function handleUnload(wallet: string) {
    unloadWallet(wallet);
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
  return (
    <div className="mx-auto mb-4 max-w-md border-b border-gray-300 pb-4">
      {open && (
        <>
          {' '}
          {names.map((name) => {
            const status = getStatus(name);
            const displayName = name === '' ? 'default' : name;
            return (
              <div
                key={displayName}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  <StatusIcon
                    status={status as 'unloaded' | 'loaded' | 'connected'}
                  />
                  <span className="text-lg font-semibold">{displayName}</span>
                  <span className="text-sm text-gray-500">{status}</span>
                </div>
                <div>
                  {status === 'connected' ? (
                    <span className="font-medium text-green-600">
                      Connected
                    </span>
                  ) : status === 'loaded' ? (
                    <>
                      <button
                        onClick={() => handleConnect(name)}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Connect
                      </button>
                      <button
                        onClick={() => handleUnload(name)}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Unload
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleLoad(name)}
                      className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                    >
                      Load
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {/* <pre>{JSON.stringify(listwalletdir, null, 2)}</pre> */}
          {/* <pre>{JSON.stringify(listwallets, null, 2)}</pre> */}
        </>
      )}
      {loading && <p>Loading...</p>}
      {!loading && (
        <>
          {currentWallet !== null && open === false && (
            <div className="mb-2 text-xl font-bold">
              <p>
                Current Wallet:{' '}
                {currentWallet === '' ? 'default' : currentWallet}{' '}
                {walletInfo?.result.balance}
              </p>
            </div>
          )}
          <button
            onClick={toggleOpen}
            type="button"
            className="inline-flex items-center rounded bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-700 focus:outline-none"
          >
            <span className="mr-2">Wallet Info</span>
            {open ? (
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
        </>
      )}
    </div>
  );
}

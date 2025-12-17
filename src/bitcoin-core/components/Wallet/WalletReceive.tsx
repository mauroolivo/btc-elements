import { useState } from 'react';
import { useNewAddress, useWalletStore } from '@/bitcoin-core/useWalletStore';
import QRCode from 'react-qr-code';

export default function WalletReceive() {
  const avail_items = ['legacy', 'p2sh-segwit', 'bech32', 'bech32m'];
  const [addressType, setAddressType] = useState('no-value');
  const currentWallet = useWalletStore((s) => s.currentWallet);

  const [enabled, setEnabled] = useState(false);
  const [requestId, setRequestId] = useState(0);
  const [copied, setCopied] = useState(false);
  const { address, isLoading, error, refresh } = useNewAddress(
    addressType !== 'no-value' ? addressType : undefined,
    enabled,
    requestId
  );

  function select(): React.JSX.Element {
    const list_items = avail_items.map((name, idx) => (
      <option key={idx + 1} value={name}>
        {name}
      </option>
    ));
    const list = [
      <option key={0} value="no-value">
        -- select address type --
      </option>,
    ].concat(list_items);
    return (
      <select
        onChange={(e) => {
          setAddressType(e.currentTarget.value);
        }}
        name={'address-type'}
      >
        {list}
      </select>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const walletType = formData.get('address-type');
    if (walletType === 'no-value') {
      alert('Please select an address type');
      return;
    }
    if (!enabled) setEnabled(true);
    setRequestId((n) => n + 1);
  }
  return (
    <div className="min-h-screen w-full bg-gray-950/30">
      <div className="mx-auto flex max-w-md items-center justify-center px-4 py-10">
        <div className="w-full rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-lg">
          <div className={'pb-3 text-base font-semibold'}>
            Generate a new receiving address
          </div>
          <form onSubmit={onSubmit}>
            <div className={'mt-2 mb-2'}>{select()}</div>
            <button
              type="submit"
              disabled={
                addressType === 'no-value' ||
                isLoading ||
                currentWallet === null
              }
              className="inline-flex items-center rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating…' : 'Generate'}
            </button>
          </form>

          {currentWallet === null && (
            <div className="mt-3 text-xs text-yellow-300">
              Connect or select a wallet to generate a receiving address.
            </div>
          )}

          {error && (
            <div className="mt-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
              Failed to generate address. {String(error.message)}
            </div>
          )}

          {address && (
            <div className="mt-5">
              <div className="mb-3 w-full rounded bg-gray-800 px-3 py-2 font-mono text-sm break-all text-gray-100">
                {address}
              </div>
              <div className="inline-block rounded bg-white p-3">
                <QRCode
                  value={address}
                  size={160}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  Copy
                </button>
                {copied && (
                  <span
                    className="ml-2 text-xs text-green-400"
                    aria-live="polite"
                  >
                    Address copied
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

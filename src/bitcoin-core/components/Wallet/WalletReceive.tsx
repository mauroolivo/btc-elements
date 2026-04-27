import { useState } from 'react';
import { useNewAddress } from '@/bitcoin-core/components/Wallet/hooks';
import { useWalletStore } from '@/bitcoin-core/useWalletStore';
import { ADDRESS_TYPES } from '@/bitcoin-core/constants';
import QRCode from 'react-qr-code';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormNewAddressSchema } from '@/bitcoin-core/model/forms';

export default function WalletReceive() {
  const currentWallet = useWalletStore((s) => s.currentWallet);

  type FormFields = z.infer<typeof FormNewAddressSchema>;

  const [copied, setCopied] = useState(false);
  const { response, isLoading, error: mutError, generate } = useNewAddress();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors /* isSubmitting */ },
  } = useForm<FormFields>({
    defaultValues: {
      addressType: 'no-value',
    },
    resolver: zodResolver(FormNewAddressSchema),
  });

  function select(): React.JSX.Element {
    const listItems = ADDRESS_TYPES.filter(
      ({ value }) => value !== 'invalid-vector'
    ).map(({ value, label }) => (
      <option key={value} value={value}>
        {label}
      </option>
    ));
    const list = [
      <option key={0} value="no-value">
        -- select address type --
      </option>,
    ].concat(listItems);

    return (
      <div className="relative">
        <select
          {...register('addressType')}
          className="core-input w-full appearance-none rounded-2xl px-4 py-3 pr-12 text-sm font-medium text-white focus:outline-none"
        >
          {list}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-cyan-100/75">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.512a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    );
  }

  const onSubmit = handleSubmit(async ({ addressType }) => {
    // if (addressType === 'no-value') {
    //   alert('Please select an address type');
    //   return;
    // }

    try {
      await generate(addressType);
      //throw new Error('Simulated sign-up error');
    } catch (error) {
      setError('root', {
        message: `${(error as Error).message}. Please try again.`,
      });
    }
  });

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto flex max-w-md items-center justify-center px-4 py-10">
        <div className="core-surface w-full rounded-3xl p-6 text-white shadow-lg">
          <div className={'pb-3 text-base font-semibold'}>
            Generate a new receiving address
          </div>
          <form noValidate onSubmit={onSubmit}>
            <div className="mt-2 mb-2">{select()}</div>
            {errors.addressType && (
              <div className="mb-2 text-xs text-red-300">
                {errors.addressType.message?.toString()}
              </div>
            )}
            {errors.root && (
              <div className="mb-2 text-xs text-red-300">
                {errors.root.message?.toString()}
              </div>
            )}
            <button
              type="submit"
              disabled={
                watch('addressType') === 'no-value' ||
                isLoading ||
                currentWallet === null
              }
              className="core-button-primary"
            >
              {isLoading ? 'Generating…' : 'Generate'}
            </button>
          </form>

          {currentWallet === null && (
            <div className="mt-3 text-xs text-yellow-300">
              Connect or select a wallet to generate a receiving address.
            </div>
          )}

          {mutError && (
            <div className="mt-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
              Failed to generate address. {String(mutError.message)}
            </div>
          )}
          {response !== null && response.error && (
            <div className="mt-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
              Failed to generate address.{' '}
              {String(response.error !== null ? response.error?.message : '')}
            </div>
          )}
          {response !== null && response.result && (
            <div className="mt-5">
              <div className="core-panel-muted mb-3 w-full rounded-xl px-3 py-2 font-mono text-sm break-all text-gray-100">
                {response.result}
              </div>
              <div className="inline-block rounded bg-white p-3">
                <QRCode
                  value={response.result}
                  size={160}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(response.result);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="core-button-secondary"
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

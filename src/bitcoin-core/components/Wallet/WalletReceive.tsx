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
    const list_items = ADDRESS_TYPES.map(({ value, label }) => (
      <option key={value} value={value}>
        {label}
      </option>
    ));
    const list = [
      <option key={0} value="no-value">
        -- select address type --
      </option>,
    ].concat(list_items);
    return <select {...register('addressType')}>{list}</select>;
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
    <div className="min-h-screen w-full bg-gray-950/30">
      <div className="mx-auto flex max-w-md items-center justify-center px-4 py-10">
        <div className="w-full rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-lg">
          <div className={'pb-3 text-base font-semibold'}>
            Generate a new receiving address
          </div>
          <form noValidate onSubmit={onSubmit}>
            <div className={'mt-2 mb-2'}>{select()}</div>
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
              <div className="mb-3 w-full rounded bg-gray-800 px-3 py-2 font-mono text-sm break-all text-gray-100">
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

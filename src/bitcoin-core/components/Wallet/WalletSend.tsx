import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Sendtoaddress } from '@/bitcoin-core/model/wallet';
import {
  useSendtoaddress,
  useWalletStore,
} from '@/bitcoin-core/useWalletStore';
import { FormSendSchema } from '@/bitcoin-core/model/forms';

type WalletSendProps = {
  showTxs?: () => void;
};

export default function WalletSend({ showTxs: showTxs }: WalletSendProps) {
  const currentWallet = useWalletStore((s) => s.currentWallet);
  type FormFields = z.infer<typeof FormSendSchema>;
  const {
    response,
    error: mutError,
    isLoading,
    send,
    clear,
  } = useSendtoaddress();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<FormFields | null>(null);
  const [successTxid, setSuccessTxid] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    // watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    mode: 'onChange', // validate on submit
    reValidateMode: 'onChange',
    defaultValues: {
      address: '',
      amount: undefined as unknown as number, // or omit to avoid early errors
      fee_rate: undefined as unknown as number, // or omit
      replaceable: false,
      subtractFeeFromAmount: false,
    },
    resolver: zodResolver(FormSendSchema),
  });

  const onSubmit = handleSubmit((data) => {
    setPending(data);
    setOpen(true);
  });

  async function confirmSend() {
    if (!pending) return;
    try {
      const sendResult: Sendtoaddress = await send({
        address: pending.address,
        amount: pending.amount,
        fee_rate: pending.fee_rate,
        replaceable: pending.replaceable,
        subtractfeefromamount: pending.subtractFeeFromAmount,
      });
      setOpen(false);
      setPending(null);
      if (sendResult?.result) {
        setSuccessTxid(sendResult.result);
      }
    } catch (error) {
      setError('root', {
        message: `${(error as Error).message}. Please try again.`,
      });
    }
  }

  return (
    <div className="min-h-screen w-full bg-gray-950/30">
      <div className="mx-auto flex max-w-md items-center justify-center px-4 py-10">
        <div className="w-full rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-lg">
          <div className={'pb-3 text-base font-semibold'}>Send Bitcoin</div>
          {!successTxid && (
            <form noValidate onSubmit={onSubmit} onChange={() => clear()}>
              <div className="mb-4">
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  {...register('address')}
                  className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="amount"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  step="any"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
                />
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.amount.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="fee_rate"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Fee Rate (sats/vB)
                </label>
                <input
                  id="fee_rate"
                  step="any"
                  {...register('fee_rate', { valueAsNumber: true })}
                  className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
                />
                {errors.fee_rate && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.fee_rate.message}
                  </p>
                )}
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="replaceable"
                  {...register('replaceable')}
                  className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="replaceable"
                  className="text-sm font-medium text-gray-300"
                >
                  Enable Replace-By-Fee (RBF)
                </label>
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="subtractFeeFromAmount"
                  {...register('subtractFeeFromAmount')}
                  className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="subtractFeeFromAmount"
                  className="text-sm font-medium text-gray-300"
                >
                  Subtract Fee From Amount
                </label>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || isLoading || currentWallet === null}
                className="inline-flex items-center rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Send'}
              </button>
            </form>
          )}

          {successTxid && (
            <div className="mt-4 rounded border border-green-700 bg-green-900/30 p-3 text-sm text-green-200">
              <div className="flex items-center justify-between">
                <div>
                  Transaction submitted. TxID:
                  <span className="ml-1 font-mono break-all">
                    {successTxid}
                  </span>
                </div>
                <button
                  onClick={() => {
                    showTxs?.();
                  }}
                  className="ml-4 inline-flex items-center rounded bg-green-800 px-3 py-1 text-xs text-white hover:bg-green-700"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {open && pending && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-xl">
                <div className="mb-3 text-base font-semibold">
                  Confirm Transaction
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start justify-between">
                    <span className="text-gray-300">Address</span>
                    <span className="max-w-[60%] text-right font-mono break-all whitespace-normal">
                      {pending.address}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amount</span>
                    <span className="font-mono">{pending.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Fee Rate (sats/vB)</span>
                    <span className="font-mono">{pending.fee_rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">RBF</span>
                    <span>{pending.replaceable ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      Subtract Fee From Amount
                    </span>
                    <span>{pending.subtractFeeFromAmount ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => {
                      setOpen(false);
                      setPending(null);
                    }}
                    className="inline-flex items-center rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSend}
                    disabled={isLoading || currentWallet === null}
                    className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Sending…' : 'Confirm & Send'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {mutError && (
            <div className="mt-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
              Failed to send transaction {String(mutError.message)}
            </div>
          )}
          {response !== null && response?.error && (
            <div className="mt-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
              Failed to send transaction.{' '}
              {String(response.error !== null ? response.error?.message : '')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

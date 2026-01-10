import React, { useState } from 'react';

import { ListTransaction } from '@/bitcoin-core/model/wallet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import {
  FormCPFPSendAdvancedSchema,
  FormCPFPSendAdvancedType,
} from '@/bitcoin-core/model/forms';
import { useSendAdvanced } from '@/bitcoin-core/components/Wallet/hooks';
import { ParamsDictionary } from '@/bitcoin-core/params';

type Props = {
  tx?: ListTransaction;
  onBack?: () => void;
  onSuccess?: () => void;
};

export default function WalletHomeCPFP({ tx, onBack, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormCPFPSendAdvancedType>({
    resolver: zodResolver(FormCPFPSendAdvancedSchema),
    mode: 'onChange',
    defaultValues: { address: '', amount: undefined as unknown as number },
  });

  const {
    run,
    error: sendError,
    errorMessage: sendErrorMessage,
    isLoading: sendLoading,
    clear,
  } = useSendAdvanced();

  const [pending, setPending] = useState<{
    address: string;
    amount: number;
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [successTxid, setSuccessTxid] = useState<string | null>(null);

  const onSubmit = handleSubmit((values) => {
    setPending(values);
    setOpen(true);
  });

  const amountWatch = useWatch({ control, name: 'amount' }) as
    | number
    | undefined;
  const calculatedFee = Number((tx?.amount ?? 0) - (amountWatch ?? 0));

  async function confirmSend() {
    if (!pending || !tx) return;
    try {
      const inputs: ParamsDictionary[] = [{ txid: tx.txid, vout: tx.vout }];
      const outputs: ParamsDictionary = {
        [pending.address]: pending.amount,
      } as ParamsDictionary;
      const payload: ParamsDictionary = { inputs, outputs };
      const res = await run(payload);
      setOpen(false);
      setPending(null);
      setSuccessTxid(res);
      onSuccess?.();
    } catch (error) {
      setOpen(false);
      setPending(null);
      setError('root', {
        message: `${(error as Error).message}. Please try again.`,
      });
    }
  }

  return (
    <div>
      <div className="mb-2 text-sm text-gray-300">CPFP</div>
      <div className="mb-3">
        <div className="text-xs text-gray-400">Respending amount</div>
        <div className="font-mono text-sm text-white">
          {typeof tx?.amount === 'number' ? `${tx.amount.toFixed(8)} BTC` : '-'}
        </div>
      </div>

      {!open && (
        <form
          onSubmit={onSubmit}
          onChange={() => clear()}
          noValidate
          className="space-y-3 text-sm text-gray-300"
        >
          <div>
            <label className="mb-1 block text-xs text-gray-400">Address</label>
            <input
              type="text"
              {...register('address')}
              className="w-full rounded border border-gray-600 bg-gray-800 p-2 text-white focus:border-blue-500 focus:outline-none"
            />

            {errors.address && (
              <p className="mt-1 text-xs text-red-400">
                {errors.address.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-400">Amount</label>
            <input
              // type="number"
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

          <div className="mt-3 rounded border border-gray-700 bg-gray-900 p-3 text-xs text-gray-300">
            <div className="flex items-center justify-between">
              <span>Calculated Fee</span>
              <span
                className={`font-mono ${calculatedFee < 0 ? 'text-red-400' : 'text-white'}`}
              >
                {calculatedFee.toFixed(8)} BTC
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onBack?.()}
              className="inline-flex items-center rounded bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-700"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isSubmitting || sendLoading}
              className="inline-flex items-center rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {sendLoading ? 'Sending…' : 'Create CPFP Transaction'}
            </button>
          </div>
          {(sendError || sendErrorMessage) && (
            <div className="mt-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
              Failed to send transaction.{' '}
              {sendErrorMessage ??
                (sendError instanceof Error
                  ? sendError.message
                  : String(sendError))}
            </div>
          )}
        </form>
      )}

      {open && pending && (
        <div className="mt-4 rounded border border-gray-700 bg-gray-900 p-4 text-sm text-gray-300">
          <div className="mb-2 font-semibold">Confirm CPFP Transaction</div>
          <div className="mb-2 flex justify-between">
            <span className="text-gray-300">Parent Tx</span>
            <span className="font-mono break-all">{tx?.txid}</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="text-gray-300">Vout</span>
            <span className="font-mono">{tx?.vout}</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="text-gray-300">Address</span>
            <span className="font-mono break-all">{pending.address}</span>
          </div>
          <div className="mb-3 flex justify-between">
            <span className="text-gray-300">Amount</span>
            <span className="font-mono">{pending.amount}</span>
          </div>
          <div className="mb-3 flex justify-between">
            <span className="text-gray-300">Fee</span>
            <span
              className={`font-mono ${calculatedFee < 0 ? 'text-red-400' : 'text-white'}`}
            >
              {calculatedFee.toFixed(8)} BTC
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setOpen(false);
                setPending(null);
              }}
              className="inline-flex items-center rounded bg-gray-800 px-3 py-2 text-sm text-white hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                confirmSend();
              }}
              disabled={sendLoading}
              className="inline-flex items-center rounded bg-blue-700 px-3 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {sendLoading ? 'Confirming…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {successTxid && (
        <div className="mt-4 rounded border border-green-700 bg-green-900/30 p-3 text-sm text-green-200">
          <div className="flex items-center justify-between">
            <div>
              Transaction submitted. TxID:
              <span className="ml-1 font-mono break-all">{successTxid}</span>
            </div>
            <button
              onClick={() => {
                onBack?.();
              }}
              className="ml-4 inline-flex items-center rounded bg-green-800 px-3 py-1 text-xs text-white hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

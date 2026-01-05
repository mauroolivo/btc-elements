import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ListTransaction, BumpfeeSchema } from '@/bitcoin-core/model/wallet';
import { FormBumpFeeSchema } from '@/bitcoin-core/model/forms';
import { useBumpfee } from '@/bitcoin-core/components/Wallet/hooks';
import { ParamsDictionary } from '@/bitcoin-core/params';

import { Bumpfee } from '@/bitcoin-core/model/wallet';

type Props = {
  tx?: ListTransaction | null;
  onBack?: () => void;
};

// Add optional onSuccess callback so parent can react to bump success
type PropsWithSuccess = Props & { onSuccess?: (res: Bumpfee) => void };

type FormFields = z.infer<typeof FormBumpFeeSchema>;

export default function WalletHomeBumpFee({
  tx,
  onBack,
  onSuccess,
}: PropsWithSuccess) {
  const { response, error: mutError, isLoading, bump, clear } = useBumpfee();
  const [successResponse, setSuccessResponse] = useState<Bumpfee | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { fee_rate: undefined as unknown as number },
    resolver: zodResolver(FormBumpFeeSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      clear();
      const payload: ParamsDictionary = {
        txid: tx?.txid ?? '',
        fee_rate: data.fee_rate,
      };
      const res = await bump(payload);
      // validate response shape
      const parsed = BumpfeeSchema.safeParse(res);
      if (!parsed.success) {
        setError('root', { message: 'Invalid response from bumpfee' });
        return;
      }
      // success - store parsed response and show success UI
      setSuccessResponse(parsed.data);
    } catch (err) {
      setError('root', { message: (err as Error).message ?? String(err) });
    }
  });

  return (
    <div className="mb-2 px-3 pt-0 pb-2 text-[15px] text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Bump Fee</div>
          <div className="text-xs text-gray-400">Transaction</div>
        </div>
        <div>
          <button
            type="button"
            onClick={onBack}
            className="rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      <div className="mt-2 font-mono break-all text-white">
        {tx?.txid ?? '-'}
      </div>

      {!successResponse && (
        <form
          noValidate
          onSubmit={onSubmit}
          onChange={() => clear()}
          className="mt-3"
        >
          <div className="mb-3">
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

          {errors.root && (
            <p className="mb-2 text-xs text-red-400">{errors.root.message}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="inline-flex items-center rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting || isLoading ? 'Bumping…' : 'Bump Fee'}
            </button>
            <button
              type="button"
              onClick={() => onBack?.()}
              className="inline-flex items-center rounded bg-gray-800 px-3 py-1 text-sm text-white hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mutError && (
        <div className="mt-3 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
          Failed to bump fee: {String((mutError as Error).message)}
        </div>
      )}

      {response !== null && response?.error && (
        <div className="mt-3 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
          Failed to bump fee.{' '}
          {String(response.error !== null ? response.error?.message : '')}
        </div>
      )}
      {successResponse && (
        <div className="mt-4 rounded border border-green-700 bg-green-900/30 p-3 text-sm text-green-200">
          <div className="">
            <div className="w-full sm:w-auto">
              <div className="font-semibold">Bump successful.</div>
              <div className="mt-1 font-mono text-xs wrap-break-word">
                {successResponse.result.txid ??
                  successResponse.result.psbt ??
                  '-'}
              </div>
            </div>
            <div className="ml-0 flex w-full flex-col items-start gap-2 pt-3 sm:mt-0 sm:w-auto sm:flex-row sm:items-center">
              <div className="text-xs">
                Orig Fee:{' '}
                <span className="font-mono">
                  {successResponse.result.origfee}
                </span>
              </div>
              <div className="text-xs">
                New Fee:{' '}
                <span className="font-mono">{successResponse.result.fee}</span>
              </div>
              <button
                onClick={() => {
                  // notify parent of success, then go back
                  onSuccess?.(successResponse as Bumpfee);
                  onBack?.();
                }}
                className="inline-flex items-center rounded bg-green-800 px-3 py-1 text-xs text-white hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
          {successResponse.result.errors &&
            successResponse.result.errors.length > 0 && (
              <div className="mt-2 text-xs text-yellow-200">
                Errors: {successResponse.result.errors.join(', ')}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

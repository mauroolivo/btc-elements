import { useEffect, useMemo, useState } from 'react';
import WalletUnspentSelect from './WalletUnspentSelect';
import { Utxo } from '@features/wallet/types/wallet';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { FormSendAdvancedSchema } from '@features/wallet/schemas/forms';
import { useChangeAddress, useSendAdvanced } from '@features/wallet/hooks';
import { useWalletStore } from '@features/wallet/store';
import { ParamsDictionary } from '@shared/types/params';
import { useAuth } from '@features/auth';

const DEMO_ACCOUNT_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? '';

export default function WalletSendAdvanced({
  showTxs,
}: {
  showTxs?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedUtxos, setSelectedUtxos] = useState<Utxo[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<FormFields | null>(null);
  const [successTxid, setSuccessTxid] = useState<string | null>(null);

  const totalSelectedAmount = useMemo(
    () => selectedUtxos.reduce((sum, u) => sum + (u?.amount ?? 0), 0),
    [selectedUtxos]
  );
  const currentWallet = useWalletStore((s) => s.currentWallet);
  const { user } = useAuth();
  type FormFields = z.infer<typeof FormSendAdvancedSchema>;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      utxos: [],
      address: '',
      amount: undefined as unknown as number,
      amountChange: undefined as unknown as number,
      addressChange: '',
    },
    resolver: zodResolver(FormSendAdvancedSchema),
  });

  const amountWatch = useWatch({ control, name: 'amount' });
  const changeWatch = useWatch({ control, name: 'amountChange' });
  const calculatedFee = useMemo(() => {
    const amt = amountWatch ?? 0;
    const chg = changeWatch ?? 0;
    const raw = (totalSelectedAmount || 0) - amt - chg;
    return Number.isFinite(raw) ? raw : 0;
  }, [totalSelectedAmount, amountWatch, changeWatch]);

  const { changeAddress, isLoading: changeLoading } = useChangeAddress();
  const {
    run,
    error: sendError,
    errorMessage: sendErrorMessage,
    isLoading: sendLoading,
    clear,
  } = useSendAdvanced();

  useEffect(() => {
    if (changeAddress) {
      setValue('addressChange', changeAddress, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [changeAddress, setValue]);

  useEffect(() => {
    setValue('utxos', selectedUtxos, { shouldValidate: true });
  }, [selectedUtxos, setValue]);

  const onSubmit = handleSubmit((data) => {
    setPending(data);
    setOpen(true);
  });

  function payload(): ParamsDictionary | undefined {
    if (!pending) return;
    const inputs = (pending.utxos ?? []).map((utxo) => {
      const input: ParamsDictionary = {};
      input['txid'] = utxo.txid;
      input['vout'] = utxo.vout;
      return input;
    });
    // I originally userd ParamsDictionary[] but found this example using an object and works
    // https://bitcoin.stackexchange.com/questions/80905/bitcoin-cli-createrawtransaction-with-3-outputs-example
    const outputs = {
      [pending.address]: pending.amount,
      [pending.addressChange]: pending.amountChange,
    } as ParamsDictionary;
    const payload: ParamsDictionary = {
      inputs,
      outputs,
    };
    return payload;
  }

  async function confirmSend() {
    if (!pending) return;

    if (user?.email?.toLowerCase() === DEMO_ACCOUNT_EMAIL) {
      setOpen(false);
      setPending(null);
      setError('root', {
        message:
          'You cannot send funds from the demo account. Please register a new account.',
      });
      return;
    }

    try {
      console.log('Preparing to send transaction...');
      const data = payload();
      console.log('Payload prepared:', data);
      console.log('Current wallet:', currentWallet);
      if (!data || currentWallet === null || currentWallet === undefined) {
        throw new Error('Missing payload or wallet');
      }
      console.log('Sending payload:', data);
      const res = await run(data);
      setOpen(false);
      setPending(null);
      setSuccessTxid(res);
      // clear();
    } catch (error) {
      // Dismiss confirm panel on error
      setOpen(false);
      setPending(null);
      setError('root', {
        message: `${(error as Error).message}. Please try again.`,
      });
    }
  }

  return (
    <div className="core-surface mx-auto w-full max-w-2xl rounded-3xl p-6 text-white shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-base font-semibold">Build Transaction</div>
        <div className="text-xs text-gray-400">Step {step} of 2</div>
      </div>
      {!successTxid && (
        <form noValidate onSubmit={onSubmit} onChange={() => clear()}>
          {step === 1 && (
            <div>
              <p className="mb-2 text-sm text-gray-300">
                Select unspent outputs to fund your transaction.
              </p>
              <WalletUnspentSelect
                onChange={(sel) => setSelectedUtxos(sel)}
                defaultSelected={selectedUtxos.map((u) => ({
                  txid: u.txid,
                  vout: u.vout,
                }))}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={selectedUtxos.length === 0}
                  className="core-button-primary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-sm text-gray-300">
              {selectedUtxos.length > 0 && (
                <div className="core-panel-muted mt-3 rounded-xl p-3 text-xs text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Selected: {selectedUtxos.length} UTXO(s)</span>
                    <span className="font-mono text-white">
                      Total: {totalSelectedAmount.toFixed(8)} BTC
                    </span>
                  </div>
                </div>
              )}
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
                  className="core-input w-full rounded-xl p-2 text-white focus:outline-none"
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
                  className="core-input w-full rounded-xl p-2 text-white focus:outline-none"
                />
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.amount.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="addressChange"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Address Change
                </label>
                <input
                  type="text"
                  id="addressChange"
                  {...register('addressChange')}
                  readOnly
                  disabled
                  placeholder={changeLoading ? 'Loading change address…' : ''}
                  className="core-input w-full rounded-xl p-2 text-white focus:outline-none disabled:opacity-60"
                />
                {errors.addressChange && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.addressChange.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="amountChange"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Amount Change
                </label>
                <input
                  id="amountChange"
                  step="any"
                  {...register('amountChange', { valueAsNumber: true })}
                  className="core-input w-full rounded-xl p-2 text-white focus:outline-none"
                />
                {errors.amountChange && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.amountChange.message}
                  </p>
                )}
              </div>
              <div className="core-panel-muted mt-3 rounded-xl p-3 text-xs text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Calculated Fee</span>
                  <span
                    className={`font-mono ${calculatedFee < 0 ? 'text-red-400' : 'text-white'}`}
                  >
                    {calculatedFee.toFixed(8)} BTC
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="core-button-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || currentWallet === null}
                  className="core-button-primary"
                >
                  {isSubmitting ? 'Reviewing…' : 'Review'}
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {errors.root && (
        <div className="mt-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
          {errors.root.message}
        </div>
      )}

      {open && pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="core-surface w-full max-w-md rounded-3xl p-6 text-white shadow-xl">
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
                <span className="font-mono">{pending.amount ?? 0}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-300">Change Address</span>
                <span className="max-w-[60%] text-right font-mono break-all whitespace-normal">
                  {pending.addressChange ?? ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Change Amount</span>
                <span className="font-mono">{pending.amountChange ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Selected UTXOs</span>
                <span className="font-mono">{pending.utxos?.length ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total Selected</span>
                <span className="font-mono">
                  {totalSelectedAmount.toFixed(8)} BTC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Calculated Fee</span>
                <span className="font-mono">
                  {calculatedFee.toFixed(8)} BTC
                </span>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setOpen(false);
                  setPending(null);
                }}
                className="core-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmSend();
                }}
                disabled={sendLoading}
                className="core-button-primary disabled:opacity-50"
              >
                {sendLoading ? 'Confirming…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {(sendError || sendErrorMessage) && (
        <div className="mt-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
          Failed to send transaction.{' '}
          {sendErrorMessage ??
            (sendError instanceof Error
              ? sendError.message
              : String(sendError))}
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
                showTxs?.();
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

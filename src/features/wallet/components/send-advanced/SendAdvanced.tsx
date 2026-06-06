import { useEffect, useMemo, useReducer } from 'react';
import WalletUnspentSelect from './UnspentSelect';
import { produce } from 'immer';
import { createPortal } from 'react-dom';
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

type FormFields = z.infer<typeof FormSendAdvancedSchema>;

type SendAdvancedState = {
  step: 1 | 2;
  selectedUtxos: Utxo[];
  isConfirmOpen: boolean;
  pendingForm: FormFields | null;
  successTxid: string | null;
};

type SendAdvancedAction =
  | { type: 'selection/set'; utxos: Utxo[] }
  | { type: 'step/set'; step: SendAdvancedState['step'] }
  | { type: 'confirm/open'; pendingForm: FormFields }
  | { type: 'confirm/close' }
  | { type: 'send/success'; txid: string }
  | { type: 'send/reset-success' };

const initialState: SendAdvancedState = {
  step: 1,
  selectedUtxos: [],
  isConfirmOpen: false,
  pendingForm: null,
  successTxid: null,
};

const sendAdvancedReducer = produce(
  (draft: SendAdvancedState, action: SendAdvancedAction) => {
    switch (action.type) {
      case 'selection/set':
        draft.selectedUtxos = action.utxos;
        return;
      case 'step/set':
        draft.step = action.step;
        return;
      case 'confirm/open':
        draft.pendingForm = action.pendingForm;
        draft.isConfirmOpen = true;
        return;
      case 'confirm/close':
        draft.pendingForm = null;
        draft.isConfirmOpen = false;
        return;
      case 'send/success':
        draft.successTxid = action.txid;
        draft.pendingForm = null;
        draft.isConfirmOpen = false;
        return;
      case 'send/reset-success':
        draft.successTxid = null;
        draft.step = 1;
        draft.selectedUtxos = [];
        return;
      default:
        return;
    }
  }
);

function ConfirmDetailLine({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
      <div className="text-sm text-gray-400">{label}</div>
      <div
        className={`max-w-[60%] text-right text-sm font-medium text-white ${mono ? 'font-mono break-all' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}

function ConfirmDetailBlock({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4">
      <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase">
        {label}
      </div>
      <div
        className={`mt-2 text-sm leading-6 break-all text-white ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </div>
    </div>
  );
}

export default function WalletSendAdvanced({
  showTxs,
}: {
  showTxs?: () => void;
}) {
  const [state, dispatch] = useReducer(sendAdvancedReducer, initialState);
  const portalTarget = typeof document === 'undefined' ? null : document.body;

  const totalSelectedAmount = useMemo(
    () => state.selectedUtxos.reduce((sum, u) => sum + (u?.amount ?? 0), 0),
    [state.selectedUtxos]
  );
  const currentWallet = useWalletStore((s) => s.currentWallet);
  const { user } = useAuth();

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
    setValue('utxos', state.selectedUtxos, { shouldValidate: true });
  }, [state.selectedUtxos, setValue]);

  const onSubmit = handleSubmit((data) => {
    dispatch({ type: 'confirm/open', pendingForm: data });
  });

  function payload(): ParamsDictionary | undefined {
    if (!state.pendingForm) return;
    const inputs = (state.pendingForm.utxos ?? []).map((utxo) => {
      const input: ParamsDictionary = {};
      input['txid'] = utxo.txid;
      input['vout'] = utxo.vout;
      return input;
    });
    // I originally userd ParamsDictionary[] but found this example using an object and works
    // https://bitcoin.stackexchange.com/questions/80905/bitcoin-cli-createrawtransaction-with-3-outputs-example
    const outputs = {
      [state.pendingForm.address]: state.pendingForm.amount,
      [state.pendingForm.addressChange]: state.pendingForm.amountChange,
    } as ParamsDictionary;
    const payload: ParamsDictionary = {
      inputs,
      outputs,
    };
    return payload;
  }

  async function confirmSend() {
    if (!state.pendingForm) return;

    if (user?.email?.toLowerCase() === DEMO_ACCOUNT_EMAIL) {
      dispatch({ type: 'confirm/close' });
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
      dispatch({ type: 'send/success', txid: res });
      // clear();
    } catch (error) {
      // Dismiss confirm panel on error
      dispatch({ type: 'confirm/close' });
      setError('root', {
        message: `${(error as Error).message}. Please try again.`,
      });
    }
  }

  return (
    <div className="core-surface mx-auto w-full max-w-2xl rounded-3xl p-6 text-white shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-base font-semibold">Build Transaction</div>
        <div className="text-xs text-gray-400">Step {state.step} of 2</div>
      </div>
      {!state.successTxid && (
        <form noValidate onSubmit={onSubmit} onChange={() => clear()}>
          {state.step === 1 && (
            <div>
              <p className="mb-2 text-sm text-gray-300">
                Select unspent outputs to fund your transaction.
              </p>
              <WalletUnspentSelect
                onChange={(sel) =>
                  dispatch({ type: 'selection/set', utxos: sel })
                }
                defaultSelected={state.selectedUtxos.map((u) => ({
                  txid: u.txid,
                  vout: u.vout,
                }))}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'step/set', step: 2 })}
                  disabled={state.selectedUtxos.length === 0}
                  className="core-button-primary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {state.step === 2 && (
            <div className="text-sm text-gray-300">
              {state.selectedUtxos.length > 0 && (
                <div className="core-panel-muted mt-3 rounded-xl p-3 text-xs text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Selected: {state.selectedUtxos.length} UTXO(s)</span>
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
                  onClick={() => dispatch({ type: 'step/set', step: 1 })}
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

      {portalTarget &&
        state.isConfirmOpen &&
        state.pendingForm &&
        createPortal(
          <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/72 p-3 backdrop-blur-sm sm:p-6">
            <button
              type="button"
              aria-label="Close confirmation dialog"
              onClick={() => {
                dispatch({ type: 'confirm/close' });
              }}
              className="absolute inset-0 z-0 cursor-default border-0 bg-transparent p-0"
            />
            <div className="pointer-events-none relative z-10 flex min-h-full items-start justify-center sm:items-center">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="send-advanced-confirmation-title"
                className="pointer-events-auto flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] text-white shadow-[0_32px_90px_rgba(2,8,23,0.58),inset_0_1px_0_rgba(255,255,255,0.06)] sm:max-h-[calc(100vh-3rem)]"
              >
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] px-4 py-4 backdrop-blur-xl sm:px-6">
                  <div>
                    <div className="text-[11px] font-semibold tracking-[0.24em] text-cyan-100/65 uppercase">
                      Transaction review
                    </div>
                    <div
                      id="send-advanced-confirmation-title"
                      className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white sm:text-xl"
                    >
                      Confirm advanced transaction
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      dispatch({ type: 'confirm/close' });
                    }}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white transition-colors hover:bg-white/10"
                    aria-label="Close confirmation dialog"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="core-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                  <div className="space-y-6 text-white">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                      <section className="core-surface rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.72))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                        <div className="text-[11px] font-semibold tracking-[0.24em] text-cyan-100/65 uppercase">
                          Summary
                        </div>
                        <div className="mt-3 text-4xl font-bold tracking-[-0.05em] text-white">
                          {state.pendingForm.amount.toFixed(8)}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                          <span className="inline-flex items-center rounded-full border border-cyan-300/16 bg-cyan-400/10 px-3 py-1 font-semibold tracking-wide text-cyan-100">
                            Advanced payment
                          </span>
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 font-medium text-gray-200">
                            {state.pendingForm.utxos?.length ?? 0} selected
                            inputs
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <ConfirmDetailBlock
                            label="Amount"
                            value={`${state.pendingForm.amount.toFixed(8)} BTC`}
                            mono
                          />
                          <ConfirmDetailBlock
                            label="Change"
                            value={`${(state.pendingForm.amountChange ?? 0).toFixed(8)} BTC`}
                            mono
                          />
                          <ConfirmDetailBlock
                            label="Fee"
                            value={`${calculatedFee.toFixed(8)} BTC`}
                            mono
                          />
                        </div>
                      </section>

                      <section className="core-panel-muted rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,47,73,0.28),rgba(15,23,42,0.38))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <div className="text-[11px] font-semibold tracking-[0.24em] text-gray-400 uppercase">
                          Broadcast settings
                        </div>
                        <div className="mt-4 space-y-3">
                          <ConfirmDetailLine
                            label="Recipient"
                            value={state.pendingForm.address}
                            mono
                          />
                          <ConfirmDetailLine
                            label="Change address"
                            value={state.pendingForm.addressChange ?? '-'}
                            mono
                          />
                          <ConfirmDetailLine
                            label="Selected UTXOs"
                            value={String(state.pendingForm.utxos?.length ?? 0)}
                          />
                          <ConfirmDetailLine
                            label="Total selected"
                            value={`${totalSelectedAmount.toFixed(8)} BTC`}
                            mono
                          />
                        </div>

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={() => {
                              dispatch({ type: 'confirm/close' });
                            }}
                            className="core-button-secondary w-full"
                          >
                            Back to edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              confirmSend();
                            }}
                            disabled={sendLoading}
                            className="core-button-primary w-full disabled:opacity-50"
                          >
                            {sendLoading ? 'Confirming…' : 'Confirm'}
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          portalTarget
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
      {state.successTxid && (
        <div className="mt-4 rounded border border-green-700 bg-green-900/30 p-3 text-sm text-green-200">
          <div className="flex items-center justify-between">
            <div>
              Transaction submitted. TxID:
              <span className="ml-1 font-mono break-all">
                {state.successTxid}
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
    </div>
  );
}

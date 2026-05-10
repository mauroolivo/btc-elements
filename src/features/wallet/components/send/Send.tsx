import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createPortal } from 'react-dom';
import { Sendtoaddress } from '@features/wallet/types/wallet';
import { useSendtoaddress } from '@features/wallet/hooks';
import { useWalletStore } from '@features/wallet/store';
import { FormSendSchema } from '@features/wallet/schemas/forms';
import { useAuth } from '@features/auth';

const DEMO_ACCOUNT_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? '';

type WalletSendProps = {
  showTxs?: () => void;
};

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

export default function WalletSend({ showTxs: showTxs }: WalletSendProps) {
  const currentWallet = useWalletStore((s) => s.currentWallet);
  const { user } = useAuth();
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
  const portalTarget = typeof document === 'undefined' ? null : document.body;

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
    <div className="min-h-screen w-full">
      <div className="mx-auto flex max-w-md items-center justify-center px-4 py-10">
        <div className="core-surface w-full rounded-3xl p-6 text-white shadow-lg">
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
                  htmlFor="fee_rate"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Fee Rate (sats/vB)
                </label>
                <input
                  id="fee_rate"
                  step="any"
                  {...register('fee_rate', { valueAsNumber: true })}
                  className="core-input w-full rounded-xl p-2 text-white focus:outline-none"
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
                className="core-button-primary"
              >
                {isSubmitting ? 'Sending…' : 'Review'}
              </button>
            </form>
          )}

          {errors.root && (
            <div className="mt-4 rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
              {errors.root.message}
            </div>
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

          {portalTarget &&
            open &&
            pending &&
            createPortal(
              <div
                className="fixed inset-0 z-50 overflow-hidden bg-slate-950/72 p-3 backdrop-blur-sm sm:p-6"
                onClick={() => {
                  setOpen(false);
                  setPending(null);
                }}
              >
                <div className="flex min-h-full items-start justify-center sm:items-center">
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="send-confirmation-title"
                    className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] text-white shadow-[0_32px_90px_rgba(2,8,23,0.58),inset_0_1px_0_rgba(255,255,255,0.06)] sm:max-h-[calc(100vh-3rem)]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] px-4 py-4 backdrop-blur-xl sm:px-6">
                      <div>
                        <div className="text-[11px] font-semibold tracking-[0.24em] text-cyan-100/65 uppercase">
                          Transaction review
                        </div>
                        <div
                          id="send-confirmation-title"
                          className="mt-1 text-lg font-semibold tracking-[-0.03em] text-white sm:text-xl"
                        >
                          Confirm outgoing payment
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setOpen(false);
                          setPending(null);
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
                              {pending.amount.toFixed(8)}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                              <span className="inline-flex items-center rounded-full border border-cyan-300/16 bg-cyan-400/10 px-3 py-1 font-semibold tracking-wide text-cyan-100">
                                Outgoing payment
                              </span>
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 font-medium text-gray-200">
                                Fee rate {pending.fee_rate} sats/vB
                              </span>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <ConfirmDetailBlock
                                label="Amount"
                                value={`${pending.amount.toFixed(8)} BTC`}
                                mono
                              />
                              <ConfirmDetailBlock
                                label="RBF"
                                value={
                                  pending.replaceable ? 'Enabled' : 'Disabled'
                                }
                              />
                              <ConfirmDetailBlock
                                label="Subtract fee"
                                value={
                                  pending.subtractFeeFromAmount ? 'Yes' : 'No'
                                }
                              />
                            </div>
                          </section>

                          <section className="core-panel-muted rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(8,47,73,0.28),rgba(15,23,42,0.38))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                            <div className="text-[11px] font-semibold tracking-[0.24em] text-gray-400 uppercase">
                              Broadcast settings
                            </div>
                            <div className="mt-4 space-y-3">
                              <ConfirmDetailLine
                                label="Address"
                                value={pending.address}
                                mono
                              />
                              <ConfirmDetailLine
                                label="Amount"
                                value={`${pending.amount.toFixed(8)} BTC`}
                                mono
                              />
                              <ConfirmDetailLine
                                label="Fee rate"
                                value={`${pending.fee_rate} sats/vB`}
                                mono
                              />
                              <ConfirmDetailLine
                                label="RBF"
                                value={
                                  pending.replaceable ? 'Enabled' : 'Disabled'
                                }
                              />
                              <ConfirmDetailLine
                                label="Subtract fee from amount"
                                value={
                                  pending.subtractFeeFromAmount ? 'Yes' : 'No'
                                }
                              />
                            </div>

                            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpen(false);
                                  setPending(null);
                                }}
                                className="core-button-secondary w-full"
                              >
                                Back to edit
                              </button>
                              <button
                                type="button"
                                onClick={confirmSend}
                                disabled={isLoading || currentWallet === null}
                                className="core-button-primary w-full disabled:opacity-50"
                              >
                                {isLoading ? 'Sending…' : 'Confirm & Send'}
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
